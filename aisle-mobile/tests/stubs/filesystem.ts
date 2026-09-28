// In-memory stand-in for @capacitor/filesystem, for the persistence tests.
// It keeps the plugin's observable behaviour that persistence.ts relies on:
// missing files throw "File does not exist", mkdir on an existing folder
// throws "exists", rename replaces the target, and readdir returns FileInfo
// objects with an mtime.
export const Directory = {Data: 'DATA', Cache: 'CACHE'} as const;
export const Encoding = {UTF8: 'utf8'} as const;

type Entry = {data: string; mtime: number};
const files = new Map<string, Entry>();
const folders = new Set<string>();
let clock = () => Date.now();

const key = (directory: string, path: string) => `${directory}:${path.replace(/^\/+/, '')}`;
const parentsOf = (path: string) => {
  const parts = path.split('/');
  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('/'));
};

export const fsStub = {
  reset() {
    files.clear();
    folders.clear();
    clock = () => Date.now();
  },
  setClock(now: () => number) {
    clock = now;
  },
  put(path: string, data: string, mtime = clock(), directory: string = Directory.Data) {
    files.set(key(directory, path), {data, mtime});
    for (const p of parentsOf(path)) folders.add(key(directory, p));
  },
  has(path: string, directory: string = Directory.Data) {
    return files.has(key(directory, path));
  },
  read(path: string, directory: string = Directory.Data) {
    return files.get(key(directory, path))?.data ?? null;
  },
  list(prefix: string, directory: string = Directory.Data) {
    const start = key(directory, prefix.endsWith('/') ? prefix : `${prefix}/`);
    return [...files.keys()].filter(k => k.startsWith(start)).map(k => k.slice(start.length));
  },
};

type Opts = {path: string; directory?: string};

export const Filesystem = {
  async readFile({path, directory = Directory.Data}: Opts & {encoding?: string}) {
    const hit = files.get(key(directory, path));
    if (!hit) throw new Error('File does not exist.');
    return {data: hit.data};
  },
  async writeFile({
    path,
    directory = Directory.Data,
    data,
    recursive,
  }: Opts & {data: string; encoding?: string; recursive?: boolean}) {
    const parents = parentsOf(path);
    if (!recursive && parents.length && !folders.has(key(directory, parents.at(-1)!)))
      throw new Error('Parent directory must exist');
    fsStub.put(path, data, clock(), directory);
    return {uri: `${directory}/${path}`};
  },
  async deleteFile({path, directory = Directory.Data}: Opts) {
    if (!files.delete(key(directory, path))) throw new Error('File does not exist.');
  },
  async mkdir({path, directory = Directory.Data, recursive}: Opts & {recursive?: boolean}) {
    const k = key(directory, path);
    if (folders.has(k)) throw new Error('Directory exists');
    if (recursive) for (const p of parentsOf(path)) folders.add(key(directory, p));
    folders.add(k);
  },
  async readdir({path, directory = Directory.Data}: Opts) {
    const start = key(directory, `${path}/`);
    if (!folders.has(key(directory, path))) throw new Error('Folder does not exist.');
    const names = new Map<string, Entry | null>();
    for (const [k, v] of files)
      if (k.startsWith(start)) {
        const rest = k.slice(start.length);
        const [head, ...tail] = rest.split('/');
        names.set(head, tail.length ? null : v);
      }
    for (const k of folders)
      if (k.startsWith(start)) names.set(k.slice(start.length).split('/')[0], null);
    return {
      files: [...names].map(([name, v]) => ({
        name,
        type: v ? 'file' : 'directory',
        size: v?.data.length ?? 0,
        mtime: v?.mtime ?? clock(),
        uri: `${directory}/${path}/${name}`,
      })),
    };
  },
  async rename({
    from,
    to,
    directory = Directory.Data,
    toDirectory = directory,
  }: {
    from: string;
    to: string;
    directory?: string;
    toDirectory?: string;
  }) {
    const hit = files.get(key(directory, from));
    if (!hit) throw new Error('File does not exist.');
    files.delete(key(directory, from));
    fsStub.put(to, hit.data, hit.mtime, toDirectory);
  },
};
