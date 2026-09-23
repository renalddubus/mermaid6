import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { releaseInfo } from './release-info.js';

test('version stable et préversion, nom GHCR en minuscules', () => {
  assert.deepEqual(releaseInfo('v1.2.3', 'Owner/Mermaid6', '1.2.3', '1.2.3'), {
    tag: 'v1.2.3',
    version: '1.2.3',
    image: 'ghcr.io/owner/mermaid6',
    prerelease: false,
  });
  assert.equal(
    releaseInfo('v1.2.3-rc.1', 'owner/repo', '1.2.3-rc.1', '1.2.3-rc.1')
      .prerelease,
    true,
  );
});

test('tags invalides et versions incohérentes refusés', () => {
  for (const tag of [
    '1.2.3',
    'v01.2.3',
    'v1.2.3-01',
    'v1.2',
    'v1.2.3+build',
    'v1.2.3\nimage=evil',
    'v1.2.3-',
  ])
    assert.throws(() =>
      releaseInfo(tag, 'owner/repo', tag.slice(1), tag.slice(1)),
    );
  assert.throws(() => releaseInfo('v1.2.3', 'owner/repo', '1.2.4', '1.2.4'));
  assert.throws(() => releaseInfo('v1.2.3', 'owner/repo', '1.2.3', '1.2.4'));
  assert.throws(() => releaseInfo('v1.2.3', 'invalid\nrepo', '1.2.3', '1.2.3'));
});

test('archives du commit uniquement, licence et empreintes vérifiables', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mermaid6-release-'));
  const script = resolve('scripts/release-assets.js');
  const git = (...args) =>
    execFileSync('git', args, { cwd: directory, encoding: 'utf8' }).trim();
  try {
    git('init', '-q');
    writeFileSync(
      join(directory, 'package.json'),
      JSON.stringify({ version: '1.2.3' }),
    );
    writeFileSync(
      join(directory, 'package-lock.json'),
      JSON.stringify({
        version: '1.2.3',
        packages: { '': { version: '1.2.3' } },
      }),
    );
    writeFileSync(join(directory, 'LICENSE'), 'MIT\n');
    git('add', '.');
    git(
      '-c',
      'user.name=Release test',
      '-c',
      'user.email=test@example.invalid',
      'commit',
      '-qm',
      'fixture',
    );
    writeFileSync(join(directory, 'LICENSE'), 'uncommitted');
    writeFileSync(join(directory, 'secret.env'), 'not tracked');
    const output = join(directory, 'output');
    const env = {
      ...process.env,
      GITHUB_REPOSITORY: 'Owner/Repo',
      IMAGE_DIGEST: `sha256:${'a'.repeat(64)}`,
    };
    execFileSync(process.execPath, [script, 'v1.2.3', output], {
      cwd: directory,
      env,
    });
    const sums = readFileSync(join(output, 'SHA256SUMS'), 'utf8');
    for (const line of sums.trim().split('\n')) {
      const [expected, name] = line.split('  ');
      assert.equal(
        createHash('sha256')
          .update(readFileSync(join(output, name)))
          .digest('hex'),
        expected,
      );
    }
    const archive = join(output, 'mermaid6-v1.2.3-source.tar.gz');
    const contents = execFileSync('tar', ['-tzf', archive], {
      encoding: 'utf8',
    });
    assert.match(contents, /mermaid6-v1.2.3\/LICENSE/);
    assert.doesNotMatch(contents, /secret.env|\.git\//);
    assert.equal(
      execFileSync('tar', ['-xOzf', archive, 'mermaid6-v1.2.3/LICENSE'], {
        encoding: 'utf8',
      }),
      'MIT\n',
    );
    const metadata = JSON.parse(readFileSync(join(output, 'release.json')));
    assert.equal(metadata.commit, git('rev-parse', 'HEAD'));
    assert.equal(
      metadata.imageReference,
      `ghcr.io/owner/repo@${env.IMAGE_DIGEST}`,
    );
    execFileSync(process.execPath, [script, 'v1.2.3', output], {
      cwd: directory,
      env,
    });
    assert.equal(readFileSync(join(output, 'SHA256SUMS'), 'utf8'), sums);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
