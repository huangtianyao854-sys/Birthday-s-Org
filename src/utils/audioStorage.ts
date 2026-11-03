/**
 * Audio Storage Manager using IndexedDB
 * Safely persists custom song audio files (up to 50MB+) locally in the browser
 * without hitting localStorage 5MB quota limitations.
 */

const DB_NAME = 'hny_birthday_audio_db';
const STORE_NAME = 'audio_files';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredSongData {
  id: string;
  blob: Blob;
  name: string;
  type: string;
  size: number;
  updatedAt: number;
}

/**
 * Save an uploaded audio file into IndexedDB and return an Object URL
 */
export async function saveSongToIndexedDB(file: File): Promise<{ url: string; name: string; size: number }> {
  try {
    const db = await openDB();
    const songData: StoredSongData = {
      id: 'active_custom_song',
      blob: file,
      name: file.name,
      type: file.type || 'audio/mpeg',
      size: file.size,
      updatedAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(songData);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const objectUrl = URL.createObjectURL(file);
    return { url: objectUrl, name: file.name, size: file.size };
  } catch (err) {
    console.warn('[audioStorage] IndexedDB save failed, falling back to blob URL:', err);
    return { url: URL.createObjectURL(file), name: file.name, size: file.size };
  }
}

/**
 * Retrieve the active song from IndexedDB and return an active Object URL
 */
export async function getSongFromIndexedDB(): Promise<{ url: string; name: string; size: number } | null> {
  try {
    const db = await openDB();
    const songData = await new Promise<StoredSongData | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('active_custom_song');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (!songData || !songData.blob) return null;

    const objectUrl = URL.createObjectURL(songData.blob);
    return {
      url: objectUrl,
      name: songData.name,
      size: songData.size,
    };
  } catch (err) {
    console.warn('[audioStorage] Failed to retrieve song from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete any saved custom song from IndexedDB
 */
export async function clearSongFromIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete('active_custom_song');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[audioStorage] Failed to clear song from IndexedDB:', err);
  }
}
