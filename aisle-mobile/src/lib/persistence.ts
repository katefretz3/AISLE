import {Capacitor} from '@capacitor/core';
import {Filesystem,Directory,Encoding} from '@capacitor/filesystem';
import {Camera,CameraResultType,CameraSource} from '@capacitor/camera';
import {Share} from '@capacitor/share';
import {initialState,normalizeState,type UserState} from './catalog';
export const isDevice=Capacitor.isNativePlatform();
const directory=Directory.Data;
const statePath='aisle/household.json';
const id=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
async function ensureFolder(){try{await Filesystem.mkdir({path:'aisle/receipts',directory,recursive:true});}catch(e){if(!String(e).toLowerCase().includes('exist'))throw e;}}
export async function loadState():Promise<{state:UserState;revision:number}>{
 await ensureFolder();
 try{const {data}=await Filesystem.readFile({path:statePath,directory,encoding:Encoding.UTF8});const content=typeof data==='string'?data:await data.text();const record=JSON.parse(content) as {state:UserState;revision:number};return {...record,state:normalizeState(record.state)};}
 catch(e){if(!/not exist|not found|enoent|could not be found|no such file/i.test(String(e)))throw new Error('Your saved list could not be read. Your files have been kept.');const state=initialState();await Filesystem.writeFile({path:statePath,directory,encoding:Encoding.UTF8,data:JSON.stringify({state,revision:0}),recursive:true});return {state,revision:0};}
}
export async function saveState(state:UserState,revision:number){
 const current=await loadState();if(current.revision!==revision)throw new Error('This list has changed. Reopen the app to load the latest copy.');
 const next=revision+1;
 await Filesystem.writeFile({path:'aisle/household.pending.json',directory,encoding:Encoding.UTF8,data:JSON.stringify({state,revision:next}),recursive:true});
 await Filesystem.rename({from:'aisle/household.pending.json',to:statePath,directory,toDirectory:directory});return {revision:next};
}
export async function uploadReceipt(file:File){
 if(file.size>5*1024*1024)throw new Error('Choose a receipt image under 5 MB.');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPEG, PNG, or WebP image.');
 const receiptId=id();
 const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not read the photo.'));reader.readAsDataURL(file);});
 await Filesystem.writeFile({path:`aisle/receipts/${receiptId}.json`,directory,data:JSON.stringify({name:file.name,data}),encoding:Encoding.UTF8,recursive:true});return {id:receiptId,name:file.name};
}
export async function openReceiptFile(receiptId:string){
 if(!/^[a-f0-9]{32}$/.test(receiptId))throw new Error('Invalid receipt');
 const r=await Filesystem.readFile({path:`aisle/receipts/${receiptId}.json`,directory,encoding:Encoding.UTF8});
 const raw=typeof r.data==='string'?r.data:await r.data.text();const photo=JSON.parse(raw) as {name:string;data:string};
 const ext=photo.data.startsWith('data:image/png')?'png':photo.data.startsWith('data:image/webp')?'webp':'jpg';
 const file=await Filesystem.writeFile({path:`aisle-receipt-${receiptId}.${ext}`,data:photo.data.split(',')[1],directory:Directory.Cache});
 await Share.share({title:'Your Aisle receipt',url:file.uri,dialogTitle:'Open or share your receipt'});
}
export async function captureReceipt():Promise<File|null>{
 try{
  const photo=await Camera.getPhoto({quality:80,allowEditing:false,resultType:CameraResultType.Uri,source:CameraSource.Prompt,width:1800,correctOrientation:true,saveToGallery:false,promptLabelHeader:'Add your receipt',promptLabelPhoto:'Choose a photo',promptLabelPicture:'Take a photo'});
  if(!photo.webPath)return null;
  const r=await fetch(photo.webPath);const blob=await r.blob();
  return new File([blob],`receipt-${new Date().toISOString().slice(0,10)}.jpg`,{type:blob.type||'image/jpeg'});
 }catch(e){if(/cancel/i.test(String(e)))return null;throw e;}
}
export async function shareList(content:string){await Share.share({title:'My Aisle grocery list',text:content,dialogTitle:'Share your grocery list'});}
