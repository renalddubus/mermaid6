export type Draft = {
  source: string;
  name: string;
  origin: string;
  updatedAt: number;
};
const DATABASE = 'mermaid6';
let database: Promise<IDBDatabase> | undefined;

function openDatabase() {
  if (!database)
    database = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore('drafts');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () =>
        reject(new Error('Storage is busy in another tab.'));
    }).catch((error) => {
      database = undefined;
      throw error;
    });
  return database;
}

export async function readDraft(): Promise<Draft | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('drafts', 'readonly');
    const request = transaction.objectStore('drafts').get('current');
    transaction.oncomplete = () => {
      const value: unknown = request.result;
      if (value === undefined) return resolve(null);
      if (
        !value ||
        typeof value !== 'object' ||
        !('source' in value) ||
        typeof value.source !== 'string' ||
        !('name' in value) ||
        typeof value.name !== 'string' ||
        !('origin' in value) ||
        typeof value.origin !== 'string' ||
        !('updatedAt' in value) ||
        typeof value.updatedAt !== 'number'
      )
        return reject(new Error('The draft cannot be read.'));
      resolve(value as Draft);
    };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function writeDraft(draft: Draft) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('drafts', 'readwrite');
    transaction.objectStore('drafts').put(draft, 'current');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
