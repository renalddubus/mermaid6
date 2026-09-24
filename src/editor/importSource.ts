import { MAX_SOURCE_LENGTH } from './render';

export async function importSource(file: File) {
  if (!/\.mmd$/i.test(file.name))
    throw new Error('Choose a Mermaid file in .mmd format.');
  if (file.size > MAX_SOURCE_LENGTH * 4)
    throw new Error('This file is too large (200 KB maximum).');
  let source: string;
  try {
    source = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(
      await file.arrayBuffer(),
    );
  } catch {
    throw new Error('The file must contain UTF-8 text.');
  }
  if (!source.trim() || source.includes('\0'))
    throw new Error('This file is empty or does not contain Mermaid text.');
  if (source.length > MAX_SOURCE_LENGTH)
    throw new Error('This file exceeds the 50,000-character limit.');
  return { source, name: file.name };
}
