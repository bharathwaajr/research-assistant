export function validateNote(note){
    return{
        id: note.id || Date.now(),
        title: note.title?.toString() || 'Untitled',
        content: note.content?.toString() || '',
        tags: Array.isArray(note.tags) ? note.tags.filter (tag => typeoff(tag) ==='string'
        ):[]
    };
}