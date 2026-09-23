import { readFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function releaseInfo(tag, repository, version, lockVersion) {
  const match =
    /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(
      tag,
    );
  if (!match || match[4]?.split('.').some((part) => /^0\d+$/.test(part)))
    throw new Error(
      'Tag attendu : vX.Y.Z ou vX.Y.Z-rc.1 (sans zéros initiaux).',
    );
  if (tag.slice(1) !== version || version !== lockVersion)
    throw new Error(
      'Le tag, package.json et package-lock.json doivent avoir la même version.',
    );
  if (!/^[\w-]+\/[\w.-]+$/.test(repository))
    throw new Error('Dépôt attendu : propriétaire/nom.');
  return {
    tag,
    version,
    image: `ghcr.io/${repository.toLowerCase()}`,
    prerelease: Boolean(match[4]),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  const info = releaseInfo(
    process.env.RELEASE_TAG,
    process.env.GITHUB_REPOSITORY,
    pkg.version,
    lock.version,
  );
  if (lock.packages[''].version !== pkg.version)
    throw new Error('La version racine du lockfile est incohérente.');
  const output =
    Object.entries(info)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n';
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, output);
  process.stdout.write(output);
}
