// indexedDBStorage.ts
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDatabase', 1)
    // @ts-expect-error
    request.onerror = event => reject((event.target as IDBOpenDBRequest).errorCode)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      db.createObjectStore('history', { keyPath: 'id', autoIncrement: true })
    }
    request.onsuccess = event => resolve((event.target as IDBOpenDBRequest).result)
  })
}

async function readFromDB(): Promise<any[]> {
  const db = await openDB()
  return new Promise((resolve) => {
    const transaction = db.transaction(['history'], 'readonly')
    const objectStore = transaction.objectStore('history')
    const request = objectStore.getAll()
    request.onsuccess = () => {
      resolve(request.result)
    }
  })
}

async function writeToDB(data: any): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(['history'], 'readwrite')
  const objectStore = transaction.objectStore('history')
  objectStore.add(data)
}

export const indexedDBStorage = {
  getItem: async (key: string): Promise<any> => {
    const data = await readFromDB()

    return data.filter(item => item.key === key)
  },
  setItem: async (key: string, value: any): Promise<void> => {
    await writeToDB({ key, value })
  },
  removeItem: async (key: string): Promise<void> => {
    // Implement delete logic if necessary
  },
}
