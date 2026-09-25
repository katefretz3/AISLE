// Decisions about stored photographs, kept away from the filesystem so they can
// be tested.
//
// A receipt is one photo per shop. A shelf label can be one per price, and a
// household that captures diligently will have hundreds — so unlike the receipt
// path, these are downscaled before they are stored and swept when the price
// they belonged to goes away. An orphaned image is invisible: nothing in the
// interface references it, so nobody will ever notice it filling the device.

/** Longest edge kept. A shelf label stays readable well below a phone's full
 *  sensor resolution, and the difference is roughly ten times the bytes. At
 *  1200 a label filling a third of the frame still has ~400px across it, which
 *  is far more than is needed to read a price and a pack size. */
export const MAX_PHOTO_EDGE=1200;

/** A single stored photo should not exceed this; one that does is re-encoded
 *  harder rather than being allowed to sit on the device at full weight. */
export const TARGET_PHOTO_BYTES=900*1024;

/** Beyond this the capture is refused rather than silently truncated. */
export const MAX_PHOTO_BYTES=8*1024*1024;

export const PHOTO_TYPES=['image/jpeg','image/png','image/webp'];

/**
 * Target dimensions for a stored photo.
 *
 * Only ever scales down: enlarging a small photo adds bytes and no detail.
 */
export function scaledSize(width:number,height:number,maxEdge=MAX_PHOTO_EDGE){
 if(!(width>0)||!(height>0)||!(maxEdge>0))return {width:0,height:0};
 const factor=Math.min(1,maxEdge/Math.max(width,height));
 return {width:Math.max(1,Math.round(width*factor)),height:Math.max(1,Math.round(height*factor))};
}

/** `<id>.json` → `<id>`, ignoring anything that is not one of ours. */
export function photoIdFromFile(name:string):string|null{
 const m=name.match(/^([a-f0-9]{16,64})\.json$/);
 return m?m[1]:null;
}

/**
 * Stored photos no record points at any more.
 *
 * Every route that drops a price — deleting one, the year-old cutoff, the cap on
 * how many are kept — would otherwise leave its image behind. Rather than trying
 * to hook each of them, the set of live ids is reconciled against what is on
 * disk, which also cleans up after a write that succeeded when the save that
 * should have followed it did not.
 */
export function orphanPhotoIds(fileNames:string[],keep:Iterable<string>):string[]{
 const live=new Set(keep);
 const orphans:string[]=[];
 for(const name of fileNames){
  const id=photoIdFromFile(name);
  if(id&&!live.has(id))orphans.push(id);
 }
 return orphans;
}

/** Whether a file is worth accepting before any of it is read. */
export function photoRejection(size:number,type:string):string|null{
 if(!PHOTO_TYPES.includes(type))return 'Choose a JPEG, PNG or WebP image.';
 if(!(size>0))return 'That file is empty.';
 if(size>MAX_PHOTO_BYTES)return 'Choose an image under 8 MB.';
 return null;
}
