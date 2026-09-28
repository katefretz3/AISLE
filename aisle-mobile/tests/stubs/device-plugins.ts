// Camera, Share and Haptics stand-ins for the persistence tests. None of them is
// exercised; they exist so persistence.ts can be bundled for Node.
const unavailable = async () => {
  throw new Error('Not available under test');
};
export const Camera = {getPhoto: unavailable};
export const CameraResultType = {Uri: 'uri'};
export const CameraSource = {Prompt: 'PROMPT'};
export const Share = {share: unavailable};
export const Haptics = {impact: unavailable};
export const ImpactStyle = {Light: 'LIGHT'};
