import { mkdir, readFile, readdir, writeFile, copyFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { types } from '../server/web-response.mjs';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const web = resolve(root, 'web');
const names = (await readdir(web, { recursive: true })).filter(file => Object.hasOwn(types, extname(file))).sort();
const assets = Object.fromEntries(await Promise.all(names.map(async file => [
  `/${file.replaceAll('\\', '/')}`, [types[extname(file)], (await readFile(resolve(web, file))).toString('base64')]
])));

const { outputFiles } = await build({
  stdin: { contents: `import { createHostedWorker } from './worker/index.mjs';\nexport default createHostedWorker(${JSON.stringify(assets)});`, resolveDir: root },
  bundle: true, format: 'esm', platform: 'neutral', target: 'es2022', write: false
});
const output = resolve(root, 'dist');
await Promise.all(['server', '.openai'].map(folder => mkdir(resolve(output, folder), { recursive: true })));
await Promise.all([
  writeFile(resolve(output, 'server/index.js'), outputFiles[0].contents),
  copyFile(resolve(root, '.openai/hosting.json'), resolve(output, '.openai/hosting.json'))
]);
console.log(`Built hosted dashboard with ${names.length} assets.`);
