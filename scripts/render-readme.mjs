import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadConfig, root, escapeXml as esc, spotifyPendingSvg, cardLayout } from './lib.mjs';

function badge(name, color, { logo, logoColor = 'white', style = 'flat-square' } = {}) {
  const url = new URL('https://img.shields.io/static/v1');
  for (const [key, value] of Object.entries({ label: '', message: name, color, style, logo, logoColor })) if (value !== undefined) url.searchParams.set(key, value);
  return '<img src="' + esc(url.href) + '" alt="' + esc(name) + '" height="20">';
}

function typingUrl(config, theme) {
  const url = new URL('https://readme-typing-svg.herokuapp.com');
  for (const [key, value] of Object.entries({ font: 'Fira Code', size: config.typing.fontSize, duration: 3000, pause: config.typing.pause, color: config.typing[theme + 'Color'], center: true, vCenter: true, width: config.typing.width, height: 42, lines: config.typing.lines.join(';') })) url.searchParams.set(key, value);
  return url.href;
}

function picture(light, dark, alt, width, alignment) {
  return '<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="' + esc(dark) + '">\n  <source media="(prefers-color-scheme: light)" srcset="' + esc(light) + '">\n  <img src="' + esc(light) + '" alt="' + esc(alt) + '" width="' + width + '"' + (alignment ? ' align="' + alignment + '"' : '') + '>\n</picture>';
}

export function spotifyUrls(config) {
  if (!config.spotify.uid) return null;
  const card = new URL('https://spotify-github-profile.kittinanx.com/api/view');
  for (const [key, value] of Object.entries({ uid: config.spotify.uid, theme: config.spotify.theme, cover_image: true, show_offline: false, background_color: config.spotify.backgroundColor, border_radius: config.spotify.borderRadius, interchange: true, bar_color: '53b14f', bar_color_cover: true })) card.searchParams.set(key, value);
  return { card: card.href, profile: 'https://open.spotify.com/user/' + encodeURIComponent(config.spotify.uid) };
}

export function renderReadme(config) {
  const profile = 'https://github.com/' + config.username;
  const assetBase = 'https://raw.githubusercontent.com/' + config.username + '/' + config.username + '/output/';
  const spotify = spotifyUrls(config);
  return [
    '<!-- Generated from profile.config.json with npm run readme. -->',
    '<h1 align="center">' + esc(config.greeting).replace(/-/g, '&#8209;') + '</h1>',
    '<p align="center">\n' + picture(typingUrl(config, 'light'), typingUrl(config, 'dark'), config.typing.lines.join(' '), config.typing.width) + '\n</p>',
    '<p align="center">\n  <a href="' + profile + '?tab=followers"><img src="https://img.shields.io/github/followers/' + config.username + '?style=for-the-badge&amp;logo=github&amp;label=Followers&amp;color=0891B2&amp;labelColor=1C1917" alt="GitHub followers" height="28"></a>\n  <img src="https://komarev.com/ghpvc/?username=' + config.username + '&amp;style=for-the-badge&amp;color=8b5cf6&amp;label=PROFILE+VIEWS" alt="Profile views" height="28">\n</p>',
    '<p align="center">\n  <a href="' + esc(config.links.blog) + '">' + badge('Blog', 'E11D74', { logo: 'readme' }) + '</a>\n  <a href="' + esc(config.links.linkedin) + '">' + badge('LinkedIn', '0A66C2') + '</a>\n</p>',
    '<p align="center">' + config.intro.map(esc).join(' &nbsp;·&nbsp; ') + '</p>',
    '## 🛠️ Skills',
    ...config.skills.map(group => '<p><strong>' + esc(group.label) + '</strong></p>\n<p>\n  ' + group.badges.map(item => badge(item.name, item.color, item)).join('\n  ') + '\n</p>'),
    '<p><strong>AI Tools</strong></p>\n<p>\n  ' + config.aiTools.map(item => badge(item.name, item.color, item)).join('\n  ') + '\n</p>',
    '<p><em>' + esc(config.signature) + '</em></p>',
    '---',
    '<p align="center">\n  <a href="' + profile + '#contributions">\n' + picture(assetBase + 'activity-light.svg', assetBase + 'activity-dark.svg', 'Activity in the last year: contributions, active days, and longest streak. Includes anonymized private contributions.', cardLayout.width, 'middle') + '\n  </a>\n  &nbsp;&nbsp;\n  <a href="' + esc(spotify?.profile || 'https://open.spotify.com') + '"><img src="' + esc(spotify?.card || 'assets/spotify-pending.svg') + '" alt="' + (spotify ? 'Currently playing or recently played on Spotify' : 'Spotify card — account connection pending') + '" width="' + cardLayout.width + '" align="middle"></a>\n</p>',
    '<p align="center"><a href="' + esc(spotify?.profile || 'https://open.spotify.com') + '">Listen on Spotify ↗</a></p>',
    '<p align="center">\n' + picture(assetBase + 'snake-light.svg', assetBase + 'snake-dark.svg', 'A purple snake moving through my GitHub contribution calendar', '100%') + '\n</p>',
    ''
  ].join('\n\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const config = await loadConfig();
  const result = renderReadme(config);
  const pending = spotifyPendingSvg(config.spotify);
  if (process.argv.includes('--check')) {
    if (await readFile(resolve(root, 'README.md'), 'utf8') !== result) throw new Error('README is out of date. Run npm run readme.');
    if (await readFile(resolve(root, 'assets/spotify-pending.svg'), 'utf8') !== pending) throw new Error('Spotify placeholder is out of date. Run npm run readme.');
    console.log('README matches profile.config.json.');
  } else {
    await writeFile(resolve(root, 'README.md'), result);
    await writeFile(resolve(root, 'assets/spotify-pending.svg'), pending);
    console.log('README generated.');
  }
}
