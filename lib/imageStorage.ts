/**
 * Utility for resizing and compressing images before storage,
 * and managing IndexedDB for large media persistence without localStorage quota errors.
 */

const DB_NAME = 'jm_funilaria_db_v1';
const DB_VERSION = 1;
const STORE_PHOTOS = 'vehicle_photos';
const STORE_BUDGETS = 'budgets_store';

// Open IndexedDB database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BUDGETS)) {
        db.createObjectStore(STORE_BUDGETS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Resizes an image (file or dataURL) to a maximum dimension (e.g. 800x800)
 * and compresses it to JPEG at 0.65 quality.
 * This shrinks photos from ~5MB to ~40KB while preserving visual detail of avarias.
 */
export async function compressImage(
  source: File | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const processImage = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof source === 'string' ? source : '');
        return;
      }

      // Draw with smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onload = processImage;
    img.onerror = (err) => {
      console.warn('Failed to load image for compression:', err);
      // If error loading image, fallback to raw source if string
      if (typeof source === 'string') {
        resolve(source);
      } else {
        reject(err);
      }
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Saves photo to IndexedDB
 */
export async function savePhotoToIndexedDb(id: string, dataUrl: string, caption?: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readwrite');
      const store = tx.objectStore(STORE_PHOTOS);
      const req = store.put({ id, dataUrl, caption, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB savePhoto error:', err);
  }
}

/**
 * Loads photo from IndexedDB
 */
export async function getPhotoFromIndexedDb(id: string): Promise<string | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly');
      const store = tx.objectStore(STORE_PHOTOS);
      const req = store.get(id);
      req.onsuccess = () => {
        resolve(req.result?.dataUrl || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Saves all budgets in IndexedDB as a reliable secondary persistent storage
 */
export async function saveBudgetsToIndexedDb(budgets: unknown[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_BUDGETS, 'readwrite');
    const store = tx.objectStore(STORE_BUDGETS);
    store.clear();
    for (const b of budgets) {
      store.put(b);
    }
  } catch (err) {
    console.warn('IndexedDB saveBudgets error:', err);
  }
}

/**
 * Loads budgets from IndexedDB if needed
 */
export async function getBudgetsFromIndexedDb(): Promise<unknown[] | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_BUDGETS, 'readonly');
      const store = tx.objectStore(STORE_BUDGETS);
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
