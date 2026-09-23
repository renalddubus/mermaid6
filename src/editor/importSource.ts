import { MAX_SOURCE_LENGTH } from './render';

export async function importSource(file: File) {
  if (!/\.mmd$/i.test(file.name))
    throw new Error('Choisissez un fichier Mermaid au format .mmd.');
  if (file.size > MAX_SOURCE_LENGTH * 4)
    throw new Error('Ce fichier est trop volumineux (200 Ko maximum).');
  let source: string;
  try {
    source = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(
      await file.arrayBuffer(),
    );
  } catch {
    throw new Error('Le fichier doit contenir du texte UTF-8.');
  }
  if (!source.trim() || source.includes('\0'))
    throw new Error('Ce fichier est vide ou ne contient pas du texte Mermaid.');
  if (source.length > MAX_SOURCE_LENGTH)
    throw new Error('Ce fichier dépasse la limite de 50 000 caractères.');
  return { source, name: file.name };
}
