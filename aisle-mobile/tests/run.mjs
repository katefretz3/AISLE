// Bundles the agent tests with Vite, then runs them on Node's test runner.
// Vite is already a dependency, so this needs no extra tooling.
import {build} from 'vite';
import {fileURLToPath,URL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';

const root=fileURLToPath(new URL('..',import.meta.url));
// Emitted inside the project so bare imports (zod) still resolve at run time.
const out=mkdtempSync(join(root,'node_modules','.aisle-test-'));

await build({
 root,
 logLevel:'error',
 resolve:{alias:{
  '@':fileURLToPath(new URL('../src',import.meta.url)),
  '@capacitor/core':fileURLToPath(new URL('./stubs/capacitor.ts',import.meta.url)),
 }},
 build:{
  outDir:out,emptyOutDir:true,ssr:true,target:'node22',minify:false,
  rollupOptions:{
   input:{
    agentic:fileURLToPath(new URL('./agentic.test.ts',import.meta.url)),
    catalogue:fileURLToPath(new URL('./catalogue.test.ts',import.meta.url)),
    pages:fileURLToPath(new URL('./pages.test.ts',import.meta.url)),
   },
   output:{entryFileNames:'[name].test.mjs',format:'es'},
  },
 },
});

const result=spawnSync(process.execPath,['--test',join(out,'agentic.test.mjs'),join(out,'catalogue.test.mjs'),join(out,'pages.test.mjs')],{stdio:'inherit',cwd:root});
rmSync(out,{recursive:true,force:true});
process.exit(result.status??1);
