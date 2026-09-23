import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { releaseInfo } from './release-info.js';

const [tag, directory] = process.argv.slice(2);
if (!directory)
  throw new Error('Usage : node scripts/release-assets.js TAG DOSSIER');
const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const pkg = JSON.parse(
  execFileSync('git', ['show', `${commit}:package.json`], { encoding: 'utf8' }),
);
const lock = JSON.parse(
  execFileSync('git', ['show', `${commit}:package-lock.json`], {
    encoding: 'utf8',
  }),
);
const info = releaseInfo(
  tag,
  process.env.GITHUB_REPOSITORY,
  pkg.version,
  lock.version,
);
if (lock.packages[''].version !== pkg.version)
  throw new Error('Lockfile incohérent.');
const digest = process.env.IMAGE_DIGEST;
if (!/^sha256:[a-f0-9]{64}$/.test(digest ?? ''))
  throw new Error('Digest Docker invalide.');
const output = resolve(directory);
mkdirSync(output, { recursive: true });
const prefix = `mermaid6-${tag}/`;
const files = [];
for (const format of ['tar.gz', 'zip']) {
  const name = `mermaid6-${tag}-source.${format}`;
  execFileSync('git', [
    'archive',
    `--format=${format}`,
    `--prefix=${prefix}`,
    '-o',
    join(output, name),
    commit,
  ]);
  files.push(name);
}
const metadata = 'release.json';
writeFileSync(
  join(output, metadata),
  JSON.stringify(
    {
      ...info,
      commit,
      imageDigest: digest,
      imageReference: `${info.image}@${digest}`,
      platforms: ['linux/amd64', 'linux/arm64'],
      license: 'MIT',
    },
    null,
    2,
  ) + '\n',
);
files.push(metadata);
writeFileSync(
  join(output, 'SHA256SUMS'),
  files
    .map(
      (file) =>
        `${createHash('sha256')
          .update(readFileSync(join(output, file)))
          .digest('hex')}  ${file}`,
    )
    .join('\n') + '\n',
);
