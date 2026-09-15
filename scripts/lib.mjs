import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const escapeXml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

export async function loadConfig() {
  const config = JSON.parse(await readFile(new URL('../profile.config.json', import.meta.url), 'utf8'));
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(config.username)) throw new Error('Invalid GitHub username');
  if (!/^[a-f\d]{6}$/i.test(config.snake.color)) throw new Error('Invalid snake color');
  if (config.spotify.uid !== null && !/^[a-z\d_-]{1,100}$/i.test(config.spotify.uid)) throw new Error('Invalid Spotify user ID');
  if (!/^[a-f\d]{6}$/i.test(config.spotify.backgroundColor)) throw new Error('Invalid card background color');
  if (!Number.isInteger(config.spotify.borderRadius) || config.spotify.borderRadius < 0 || config.spotify.borderRadius > 40) throw new Error('Invalid card corner radius');
  for (const link of Object.values(config.links)) if (new URL(link).protocol !== 'https:') throw new Error('Profile links must use HTTPS');
  return config;
}

export const contributionQuery = 'query($login: String!) { user(login: $login) { contributionsCollection { startedAt endedAt contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }';

export function summarizeCalendar(collection, generatedAt = new Date()) {
  const calendar = collection?.contributionCalendar;
  if (!calendar || !Array.isArray(calendar.weeks)) throw new Error('Missing contribution calendar');
  if (!Number.isInteger(calendar.totalContributions) || calendar.totalContributions < 0) throw new Error('Invalid contribution total');
  const days = calendar.weeks.flatMap(week => week.contributionDays).sort((a, b) => a.date.localeCompare(b.date));
  if (days.length === 0) throw new Error('Empty calendar response; keep the previous assets');
  let total = 0, activeDays = 0, longestStreak = 0, currentStreak = 0, previousDate = null;
  for (const day of days) {
    const date = new Date(day.date + 'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== day.date) throw new Error('Invalid calendar date');
    if (!Number.isInteger(day.contributionCount) || day.contributionCount < 0) throw new Error('Invalid daily contribution count');
    if (previousDate !== null && date.valueOf() - previousDate !== 86400000) throw new Error('Incomplete or duplicate contribution dates');
    previousDate = date.valueOf();
    total += day.contributionCount;
    if (day.contributionCount > 0) {
      activeDays++;
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else currentStreak = 0;
  }
  if (total !== calendar.totalContributions) throw new Error('Calendar sum does not match GitHub total');
  return { totalContributions: total, activeDays, longestStreak, from: days[0].date, to: days.at(-1).date, generatedAt: new Date(generatedAt).toISOString() };
}

// Render both 320 × 445 SVGs at the same width; never stretch their height.
export const cardLayout = { width: 300 };

function cardSurface(spotify = {}) {
  return '<rect width="320" height="445" rx="' + (spotify.borderRadius ?? 10) + '" fill="#' + (spotify.backgroundColor ?? '161b22') + '"/>';
}

export function activitySvg(summary, theme, spotify) {
  // Both theme assets intentionally share Spotify's dark surface and dimensions.
  // The surrounding README, typing image, and snake still follow the GitHub theme.
  const colors = { text: '#ffffff', muted: '#b3b3b3', accent: '#70a5fd', divider: '#30363d' };
  const updated = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(summary.generatedAt));
  const rows = [ ['Contributions', summary.totalContributions.toLocaleString('en-US')], ['Active days', String(summary.activeDays)], ['Longest streak', summary.longestStreak + ' days'] ];
  return '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="445" viewBox="0 0 320 445" role="img" aria-labelledby="title desc">\n' +
    '<title id="title">Activity · last year</title><desc id="desc">' + escapeXml(rows.map(r => r.join(': ')).join('. ') + '. Includes anonymized private contributions. ' + summary.from + ' to ' + summary.to + '.') + '</desc>\n' +
    cardSurface(spotify) + '\n' +
    '<g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif">' +
    '<g text-anchor="middle"><text x="160" y="33" font-size="17" font-weight="700" fill="' + colors.accent + '">Activity on GitHub</text>' +
    '<text x="160" y="67" font-size="20" font-weight="700" fill="' + colors.text + '">Last year in code</text>' +
    '<text x="160" y="93" font-size="13" fill="' + colors.muted + '">' + escapeXml(summary.from + ' — ' + summary.to) + '</text></g>' +
    '<rect x="10" y="122" width="300" height="300" rx="5" fill="#0d1117"/>' +
    '<text x="32" y="160" font-size="13" fill="' + colors.muted + '">Contributions</text>' +
    '<path d="M264 154h5l4-8 6 17 5-9h4" fill="none" stroke="' + colors.accent + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<text x="30" y="227" font-size="60" font-weight="700" letter-spacing="-2" fill="' + colors.text + '">' + escapeXml(rows[0][1]) + '</text>' +
    '<text x="32" y="252" font-size="12" fill="' + colors.muted + '">Includes private contributions</text>' +
    '<path d="M32 277H288" stroke="' + colors.divider + '"/>' +
    '<text x="32" y="325" font-size="32" font-weight="600" fill="' + colors.accent + '">' + summary.activeDays + '</text>' +
    '<text x="178" y="325" font-size="32" font-weight="600" fill="' + colors.accent + '">' + summary.longestStreak + '<tspan font-size="12" font-weight="400" fill="' + colors.muted + '"> days</tspan></text>' +
    '<text x="32" y="349" font-size="12" fill="' + colors.muted + '">Active days</text>' +
    '<text x="178" y="349" font-size="12" fill="' + colors.muted + '">Longest streak</text>' +
    '<text x="32" y="397" font-size="10" fill="' + colors.muted + '">Updated ' + escapeXml(updated) + ' KST</text></g></svg>\n';
}

export function spotifyPendingSvg(spotify) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="445" viewBox="0 0 320 445" role="img" aria-labelledby="title desc">
  <title id="title">Spotify — account connection pending</title>
  <desc id="desc">A preview placeholder. No listening data has been connected.</desc>
  ${cardSurface(spotify)}
  <g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" text-anchor="middle">
    <text x="160" y="33" font-size="17" font-weight="700" fill="#53b14f">Listening on Spotify</text>
    <text x="160" y="67" font-size="20" font-weight="700" fill="#ffffff">Your soundtrack</text>
    <text x="160" y="93" font-size="13" fill="#b3b3b3">Account connection pending</text>
  </g>
  <rect x="10" y="122" width="300" height="300" rx="5" fill="#0d1117"/>
  <circle cx="160" cy="272" r="110" fill="#121a1b" stroke="#26332e"/>
  <g fill="none" stroke="#26332e">
    <circle cx="160" cy="272" r="98"/>
    <circle cx="160" cy="272" r="85"/>
    <circle cx="160" cy="272" r="72"/>
    <circle cx="160" cy="272" r="59"/>
  </g>
  <circle cx="160" cy="272" r="40" fill="#183a28"/>
  <circle cx="160" cy="272" r="8" fill="#53b14f"/>
</svg>\n`;
}
