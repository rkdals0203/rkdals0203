import { mkdtemp, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from './lib.mjs';
import { assetNames, validateAssets } from './validate-assets.mjs';

const directory = resolve(root, 'dist');
await validateAssets(directory);
if (process.argv.includes('--dry-run')) {
  console.log('Dry run: all assets validated. No Git commands or publishing performed.');
  process.exit(0);
}
if (process.env.GITHUB_ACTIONS !== 'true' || process.env.GITHUB_REF !== 'refs/heads/main' || !['push', 'schedule', 'workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME)) {
  throw new Error('Publishing is restricted to the authorized main-branch GitHub Actions workflow.');
}

function git(args, cwd = root, allow = [0]) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error || !allow.includes(result.status)) throw new Error('Git ' + args[0] + ' failed; output assets were not published.');
  return result;
}

const exists = git(['ls-remote', '--exit-code', '--heads', 'origin', 'refs/heads/output'], root, [0, 2]).status === 0;
const temporary = await mkdtemp(join(process.env.RUNNER_TEMP || tmpdir(), 'profile-output-'));
const checkout = join(temporary, 'checkout');
let worktreeAdded = false;
try {
  if (exists) git(['fetch', '--no-tags', 'origin', 'refs/heads/output']);
  git(['worktree', 'add', '--detach', checkout, exists ? 'FETCH_HEAD' : 'HEAD']);
  worktreeAdded = true;
  if (!exists) {
    git(['checkout', '--orphan', 'generated-output'], checkout);
    git(['rm', '-rf', '.'], checkout);
  }
  for (const name of assetNames) await copyFile(join(directory, name), join(checkout, name));
  git(['add', '--', ...assetNames], checkout);
  if (git(['diff', '--cached', '--quiet'], checkout, [0, 1]).status === 0) console.log('Assets unchanged; no commit needed.');
  else {
    git(['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-m', 'chore(profile): 활동 요약과 잔디 뱀 갱신'], checkout);
    // Fast-forward only. A racing external change must fail, never overwrite it.
    git(['push', 'origin', 'HEAD:refs/heads/output'], checkout);
    console.log('Published the complete asset set to output.');
  }
} finally {
  if (worktreeAdded) git(['worktree', 'remove', '--force', checkout]);
  await rm(temporary, { recursive: true, force: true });
}
