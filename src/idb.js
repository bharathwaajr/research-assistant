export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ResearchAssistantDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("papers")){
                db.createObjectStore("papers", {keyPath: "name" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function addPaper(paper){
    const db = await openDB();
    const tx = db.transaction("papers", "readwrite");
    const store = tx.objectStore("papers");
    store.put(paper);
    return tx.complete;
}

export async function getAllPapers(){
    const db = await openDB();
    const tx = db.transaction("papers", "readonly");
    const store = tx.objectStore("papers");
    return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
    });
}