import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadConfig, root } from './lib.mjs';
import { renderReadme } from './render-readme.mjs';

const supplied = process.argv[2];
if (!supplied) throw new Error('Usage: npm run spotify -- "PUBLIC_CARD_URL_OR_SPOTIFY_PROFILE_URL"');
const url = new URL(supplied);
let uid;
if (url.protocol === 'https:' && url.hostname === 'spotify-github-profile.kittinanx.com' && url.pathname === '/api/view') uid = url.searchParams.get('uid');
else if (url.protocol === 'https:' && url.hostname === 'open.spotify.com' && url.pathname.startsWith('/user/')) uid = decodeURIComponent(url.pathname.split('/')[2]);
else throw new Error('Use the public card or Spotify profile URL, not an authorization callback.');
if (!uid || !/^[a-z\d_-]{1,100}$/i.test(uid)) throw new Error('Invalid Spotify user ID');
const config = await loadConfig();
config.spotify.uid = uid;
await writeFile(resolve(root, 'profile.config.json'), JSON.stringify(config, null, 2) + '\n');
await writeFile(resolve(root, 'README.md'), renderReadme(config));
console.log('Spotify public user ID saved; README updated.');
