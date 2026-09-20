// Capacitor stand-in for the Node test run.
// The agent core never calls these: tests inject their own reader and place
// fetcher. This exists only so bundling does not pull a device runtime in.
export const Capacitor={isNativePlatform:()=>false,getPlatform:()=>'web'};
export const CapacitorHttp={
 get:async()=>{throw new Error('CapacitorHttp is not available under test');},
 post:async()=>{throw new Error('CapacitorHttp is not available under test');},
};
