import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadConfig, root } from './lib.mjs';
import { renderReadme, spotifyUrls } from './render-readme.mjs';
import { validateAssets } from './validate-assets.mjs';

const config = await loadConfig();
const issues = [];
if (!config.spotify.uid) issues.push('Spotify account is not connected. Complete the connection, then run npm run spotify -- "PUBLIC_CARD_URL".');
if (await readFile(resolve(root, 'README.md'), 'utf8') !== renderReadme(config)) issues.push('README is out of date; run npm run readme.');
try { await validateAssets(resolve(root, 'assets')); } catch (error) { issues.push(error.message); }
if (process.argv.includes('--remote')) {
  const base = 'https://raw.githubusercontent.com/' + config.username + '/' + config.username + '/output/';
  const urls = ['activity-light.svg', 'activity-dark.svg', 'snake-light.svg', 'snake-dark.svg'].map(name => base + name);
  if (config.spotify.uid) urls.push(spotifyUrls(config).card);
  for (const url of urls) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const content = await response.text();
      if (!response.ok || !content.includes('<svg')) issues.push('Published SVG is unavailable: ' + new URL(url).pathname);
    } catch { issues.push('Cannot verify published SVG: ' + new URL(url).pathname); }
  }
}
if (issues.length) {
  console.error(issues.map(issue => '- ' + issue).join('\n'));
  process.exitCode = 1;
} else console.log('Profile files are ready' + (process.argv.includes('--remote') ? ' and published image endpoints are valid.' : '. Publishing still requires an explicit user request.'));
