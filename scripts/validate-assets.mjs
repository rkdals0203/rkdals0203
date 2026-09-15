import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root } from './lib.mjs';

export const assetNames = ['activity-light.svg', 'activity-dark.svg', 'snake-light.svg', 'snake-dark.svg', 'activity.json'];

export async function validateAssets(directory) {
  for (const name of assetNames.filter(name => name.endsWith('.svg'))) {
    const svg = await readFile(resolve(directory, name), 'utf8');
    if (!/<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(svg) || !/<\/svg>\s*$/.test(svg)) throw new Error('Incomplete SVG: ' + name);
    if (/<script\b|<foreignObject\b|\bon\w+\s*=|(?:gh[pousr]_|github_pat_)[a-z\d_]+/i.test(svg)) throw new Error('Unexpected active content or credential in ' + name);
    if (name.startsWith('snake') && !/@keyframes|<animate\b/.test(svg)) throw new Error('Snake animation missing: ' + name);
  }
  const summary = JSON.parse(await readFile(resolve(directory, 'activity.json'), 'utf8'));
  const expectedKeys = ['activeDays', 'from', 'generatedAt', 'longestStreak', 'to', 'totalContributions'];
  if (JSON.stringify(Object.keys(summary).sort()) !== JSON.stringify(expectedKeys)) throw new Error('Unexpected activity metadata');
  for (const key of ['totalContributions', 'activeDays', 'longestStreak']) if (!Number.isInteger(summary[key]) || summary[key] < 0) throw new Error('Invalid ' + key);
  if (summary.longestStreak > summary.activeDays || summary.activeDays > summary.totalContributions) throw new Error('Inconsistent activity totals');
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const directory = resolve(root, process.argv[2] || 'dist');
  await validateAssets(directory);
  console.log('Both activity cards, both snake animations, and public metadata are valid.');
}
