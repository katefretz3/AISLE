import {Capacitor} from '@capacitor/core';
import {Filesystem,Directory,Encoding} from '@capacitor/filesystem';
import {Camera,CameraResultType,CameraSource} from '@capacitor/camera';
import {Share} from '@capacitor/share';
import {initialState,normalizeState,type UserState} from './catalog';
import {MAX_PHOTO_EDGE,TARGET_PHOTO_BYTES,orphanPhotoIds,photoRejection,scaledSize} from './photo';
export const isDevice=Capacitor.isNativePlatform();
const directory=Directory.Data;
const statePath='aisle/household.json';
const id=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
async function ensureFolder(){
 for(const path of ['aisle/receipts','aisle/shelf'])
  try{await Filesystem.mkdir({path,directory,recursive:true});}
  catch(e){if(!String(e).toLowerCase().includes('exist'))throw e;}
}
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

// ---- shelf label photographs -------------------------------------------------
//
// Stored apart from receipts and downscaled first. One of these exists per
// captured price rather than per shop, so the volume is an order of magnitude
// higher and the full-resolution original buys nothing: the only thing anyone
// reads back is the number on the label.

const SHELF_DIR='aisle/shelf';

/** Redraw at a sane size and re-encode. Falls back to the original bytes if the
 *  browser will not give us a canvas, which is better than refusing the save. */
async function downscale(file:File):Promise<string>{
 const original=await new Promise<string>((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(String(reader.result));
  reader.onerror=()=>reject(new Error('Could not read that photo.'));
  reader.readAsDataURL(file);
 });
 try{
  const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
   const img=new Image();
   img.onload=()=>resolve(img);
   img.onerror=()=>reject(new Error('decode failed'));
   img.src=original;
  });
  const {width,height}=scaledSize(image.naturalWidth,image.naturalHeight,MAX_PHOTO_EDGE);
  if(!width||!height)return original;
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d');
  if(!context)return original;
  context.drawImage(image,0,0,width,height);
  const shrunk=canvas.toDataURL('image/jpeg',0.72);
  // When the source is over the cap the resized copy is used even if it encodes
  // larger. The cap is about the pixels as much as the bytes: a 4032 × 3024
  // photo has to be decoded in full every time a thumbnail is drawn, however
  // well it happens to compress. Only where no resize was needed is the smaller
  // of the two kept.
  const oversized=Math.max(image.naturalWidth,image.naturalHeight)>MAX_PHOTO_EDGE;
  if(oversized){
   // A few hundred of these accumulate over a year of shopping, so one that is
   // still heavy after the resize is encoded again rather than left as it is.
   return shrunk.length>TARGET_PHOTO_BYTES?canvas.toDataURL('image/jpeg',0.5):shrunk;
  }
  return shrunk.length<original.length?shrunk:original;
 }catch{return original;}
}

/** Store one shelf photograph and return the id to keep on the price. */
export async function saveShelfPhoto(file:File):Promise<string>{
 const refusal=photoRejection(file.size,file.type);
 if(refusal)throw new Error(refusal);
 await ensureFolder();
 const photoId=id();
 const data=await downscale(file);
 await Filesystem.writeFile({path:`${SHELF_DIR}/${photoId}.json`,directory,
  data:JSON.stringify({data}),encoding:Encoding.UTF8,recursive:true});
 return photoId;
}

/** The stored image as a data URL, or null when it is no longer on disk. A
 *  dangling id is not an error: the record still holds the price, which is the
 *  part that matters. */
export async function readShelfPhoto(photoId:string):Promise<string|null>{
 if(!/^[a-f0-9]{16,64}$/.test(photoId))return null;
 try{
  const r=await Filesystem.readFile({path:`${SHELF_DIR}/${photoId}.json`,directory,encoding:Encoding.UTF8});
  const raw=typeof r.data==='string'?r.data:await r.data.text();
  return (JSON.parse(raw) as {data:string}).data??null;
 }catch{return null;}
}

export async function deleteShelfPhoto(photoId:string):Promise<void>{
 if(!/^[a-f0-9]{16,64}$/.test(photoId))return;
 try{await Filesystem.deleteFile({path:`${SHELF_DIR}/${photoId}.json`,directory});}catch{/* already gone */}
}

/**
 * Delete stored photos nothing points at any more.
 *
 * Run after the state loads. Prices are dropped by several routes — removed by
 * hand, aged out after a year, pushed past the cap — and hooking each one would
 * eventually miss a path. Reconciling against what is actually referenced cannot.
 */
export async function sweepShelfPhotos(keepIds:Iterable<string>):Promise<number>{
 try{
  await ensureFolder();
  const {files}=await Filesystem.readdir({path:SHELF_DIR,directory});
  const names=files.map(f=>typeof f==='string'?f:f.name);
  const orphans=orphanPhotoIds(names,keepIds);
  for(const photoId of orphans)await deleteShelfPhoto(photoId);
  return orphans.length;
 }catch{return 0;}
}

/** Take a photo of a shelf label. Returns null when the person backs out. */
export async function captureShelfPhoto():Promise<File|null>{
 try{
  const photo=await Camera.getPhoto({quality:80,allowEditing:false,resultType:CameraResultType.Uri,
   source:CameraSource.Prompt,width:MAX_PHOTO_EDGE,correctOrientation:true,saveToGallery:false,
   promptLabelHeader:'Photograph the label',promptLabelPhoto:'Choose a photo',promptLabelPicture:'Take a photo'});
  if(!photo.webPath)return null;
  const blob=await (await fetch(photo.webPath)).blob();
  return new File([blob],`shelf-${new Date().toISOString().slice(0,10)}.jpg`,{type:blob.type||'image/jpeg'});
 }catch(e){if(/cancel/i.test(String(e)))return null;throw e;}
}
