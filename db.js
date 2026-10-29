/**
 * IronPulse IndexedDB Storage Manager
 * Armazenamento de alta performance para fotos de evolução e múltiplos perfis
 */

const DB_NAME = 'IronPulseDB';
const DB_VERSION = 1;
let dbInstance = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('photos')) {
        const store = db.createObjectStore('photos', { keyPath: 'id' });
        store.createIndex('profileId', 'profileId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error('Erro ao abrir IndexedDB:', e);
      reject(e);
    };
  });
}

// Salvar Foto com compressão automática via Canvas
async function savePhoto(photoObj) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const req = store.put(photoObj);
    req.onsuccess = () => resolve(photoObj);
    req.onerror = (e) => reject(e);
  });
}

// Obter fotos de um perfil
async function getPhotosByProfile(profileId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const store = tx.objectStore('photos');
    const index = store.index('profileId');
    const req = index.getAll(profileId);
    req.onsuccess = () => {
      const results = req.result || [];
      results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      resolve(results);
    };
    req.onerror = (e) => reject(e);
  });
}

// Deletar Foto
async function deletePhoto(photoId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const req = store.delete(photoId);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

// Utilitário de alta performance para comprimir imagem antes de salvar
function compressImage(file, maxDimension = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

window.IronDB = {
  savePhoto,
  getPhotosByProfile,
  deletePhoto,
  compressImage
};
