// Types for the art kit, so the catalogue tests can assert that every template
// a taxonomy item names actually exists.
export type ArtTemplate = (colour:string,accent:string)=>string;
export declare const TEMPLATES:Record<string,ArtTemplate>;
export declare function renderSvg(template:string,colour:string,accent:string):string;
