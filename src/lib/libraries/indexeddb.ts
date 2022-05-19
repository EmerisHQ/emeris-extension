// file sets up the indexedDB used to store the CryptoKey (encrypted non extractable password)
// the CryptoKey can not be stored in the session. The object returned is empty.

export function indexedDbExecute(fn_: (store: IDBObjectStore) => void) {
  // Open (or create) the database
  const open = indexedDB.open('EmerisDb', 1);

  // Create the schema
  open.onupgradeneeded = function () {
    const db = open.result;
    db.createObjectStore('EmerisDbStore', { keyPath: 'id' });
  };

  open.onsuccess = function () {
    // Start a new transaction
    const db = open.result;
    const tx = db.transaction('EmerisDbStore', 'readwrite');
    const store = tx.objectStore('EmerisDbStore');

    fn_(store);

    // Close the db when the transaction is done
    tx.oncomplete = function () {
      db.close();
    };
  };
}
