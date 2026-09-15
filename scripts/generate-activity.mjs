import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { loadConfig, root, contributionQuery, summarizeCalendar, activitySvg } from './lib.mjs';

const args = process.argv.slice(2);
const output = resolve(root, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'dist');
const config = await loadConfig();
let response;
if (args.includes('--input')) {
  response = JSON.parse(await readFile(resolve(args[args.indexOf('--input') + 1]), 'utf8'));
} else if (process.env.GITHUB_TOKEN) {
  const result = await fetch('https://api.github.com/graphql', {
    method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, 'Content-Type': 'application/json', 'User-Agent': 'rkdals0203-profile' },
    body: JSON.stringify({ query: contributionQuery, variables: { login: config.username } })
  });
  if (!result.ok) throw new Error('GitHub contribution request failed: HTTP ' + result.status);
  response = await result.json();
} else if (args.includes('--gh')) {
  // The CLI handles authentication. No token is written to disk or printed.
  response = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', 'query=' + contributionQuery, '-F', 'login=' + config.username], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
} else throw new Error('Set GITHUB_TOKEN in Actions, or use --gh with the signed-in GitHub CLI locally.');
if (response.errors?.length || !response.data?.user) throw new Error('GitHub returned an incomplete contribution response');
const summary = summarizeCalendar(response.data.user.contributionsCollection);
await mkdir(output, { recursive: true });
await Promise.all(['light', 'dark'].map(theme => writeFile(resolve(output, 'activity-' + theme + '.svg'), activitySvg(summary, theme, config.spotify))));
await writeFile(resolve(output, 'activity.json'), JSON.stringify(summary, null, 2) + '\n');
console.log('Activity generated: ' + summary.totalContributions + ' contributions, ' + summary.activeDays + ' active days, ' + summary.longestStreak + ' day longest streak.');
