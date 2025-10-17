// IndexedDB Storage Adapter for Supabase Auth
// Provides persistent session storage using IndexedDB

class IndexedDBStorage {
    constructor(dbName = 'supabase-auth', storeName = 'auth-store') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
        this.fallbackStorage = window.localStorage;
        this.useIndexedDB = true;
        this.initPromise = this.init();
    }

    async init() {
        try {
            console.log('Initializing IndexedDB storage...');
            await new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, 1);

                request.onerror = () => {
                    console.error('IndexedDB open error:', request.error);
                    reject(request.error);
                };
                request.onsuccess = () => {
                    this.db = request.result;
                    console.log('IndexedDB initialized successfully');
                    resolve();
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        console.log('Creating IndexedDB object store:', this.storeName);
                        db.createObjectStore(this.storeName);
                    }
                };

                // Timeout after 5 seconds
                setTimeout(() => reject(new Error('IndexedDB init timeout')), 5000);
            });
        } catch (error) {
            console.warn('IndexedDB not available, falling back to localStorage:', error);
            this.useIndexedDB = false;
        }
    }

    async getItem(key) {
        await this.initPromise;
        if (!this.useIndexedDB) {
            const value = this.fallbackStorage.getItem(key);
            console.log(`IndexedDB fallback getItem(${key}):`, value);
            return value;
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                console.log(`IndexedDB getItem(${key}):`, request.result);
                resolve(request.result || null);
            };
        });
    }

    async setItem(key, value) {
        await this.initPromise;
        if (!this.useIndexedDB) {
            console.log(`IndexedDB fallback setItem(${key}):`, value);
            this.fallbackStorage.setItem(key, value);
            return;
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                console.log(`IndexedDB setItem(${key}):`, value);
                resolve();
            };
        });
    }

    async removeItem(key) {
        await this.initPromise;
        if (!this.useIndexedDB) {
            this.fallbackStorage.removeItem(key);
            return;
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

// Create and export a singleton instance
const indexedDBStorage = new IndexedDBStorage();
export { indexedDBStorage };