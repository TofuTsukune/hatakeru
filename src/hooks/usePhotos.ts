import { useState, useEffect, useCallback } from 'react';
import type { Photo } from '../types';
import { uid } from '../utils/uid';

const DB_NAME = 'hatake_photos';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(): Promise<Photo[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as Photo[]);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(photo: Photo): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(photo);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function usePhotos(fieldId: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const load = useCallback(async () => {
    const all = await dbGetAll();
    setPhotos(all.filter((p) => p.fieldId === fieldId));
  }, [fieldId]);

  useEffect(() => {
    load();
  }, [load]);

  const addPhoto = useCallback(
    async (partial: Omit<Photo, 'id' | 'fieldId'>) => {
      const photo: Photo = { id: uid(), fieldId, ...partial };
      await dbPut(photo);
      setPhotos((prev) => [photo, ...prev]);
    },
    [fieldId]
  );

  const deletePhoto = useCallback(async (id: string) => {
    await dbDelete(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { photos, addPhoto, deletePhoto, reload: load };
}
