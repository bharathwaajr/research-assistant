import React, { useState, useEffect } from 'react';
import { addPaper, getAllPapers } from './idb';
import './App.css';
import { useLocalStorage } from './hooks/useLocalStorage';
import SidebarItem from './components/SidebarItem';

function App() {
  // State management
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Notes system
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [filterTag, setFilterTag] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [notes, setNotes] = useLocalStorage('research-notes', []);

  // Papers system
  const [papers, setPapers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);

  // Reminders system
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminders, setReminders] = useLocalStorage('research-reminders', []);

  // Quotes
  const quotes = [
    "Stay organized, stay ahead.",
    "Your ideas matter. Write them down.",
    "One small note today can spark big ideas tomorrow.",
    "A well-timed reminder can save your day.",
    "Information saved is memory earned."
  ];
  const [quoteofTheDay] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  // Load papers on mount
  useEffect(() => {
    const loadPapers = async () => {
      try {
        const storedPapers = await getAllPapers();
        setPapers(storedPapers);
      } catch (error) {
        console.error("Failed to load papers:", error);
      }
    };
    loadPapers();
  }, []);

  // Update tag suggestions
  useEffect(() => {
    if (tagInput.length > 0) {
      const matchingTags = getAllUniqueTags().filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase())
      );
      setSuggestions(matchingTags);
    } else {
      setSuggestions([]);
    }
  }, [tagInput, notes]);

  // Helper functions
  const getAllUniqueTags = () => {
    const allTags = notes.flatMap(note => note.tags || []);
    return [...new Set(allTags)];
  };

  // Note handling
  const handleSaveNote = () => {
    try {
      if (!noteTitle.trim() && !noteText.trim()) return;

      const tagsArray = noteTags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      setNotes(prevNotes => {
        const newNote = {
          id: Date.now(),
          title: noteTitle,
          content: noteText,
          tags: tagsArray,
          createdAt: new Date().toISOString()
        };

        return editingIndex !== null
          ? prevNotes.map((note, i) => i === editingIndex ? newNote : note)
          : [...prevNotes, newNote];
      });

      setNoteTitle('');
      setNoteText('');
      setNoteTags('');
      setEditingIndex(null);
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleEditNote = (index) => {
    const note = notes[index];
    setNoteTitle(note.title);
    setNoteText(note.content);
    setNoteTags(note.tags?.join(',') || '');
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setNoteTitle('');
    setNoteText('');
    setNoteTags('');
    setEditingIndex(null);
  };

  const handleDeleteNote = (indexToDelete) => {
    setNotes(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  // Paper handling
  const handleUploadPaper = async () => {
    if (selectedFile?.name?.toLowerCase().endsWith('.pdf')) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const paper = {
            name: selectedFile.name,
            dataUrl: reader.result,
            uploadedAt: new Date().toISOString()
          };
          await addPaper(paper);
          setPapers(prev => [...prev, paper]);
          setSelectedFile(null);
        };
        reader.readAsDataURL(selectedFile);
      } catch (error) {
        console.error("Failed to upload paper:", error);
        alert("Failed to upload paper. Check console for details.");
      }
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleDeletePaper = async (indexToDelete) => {
    const updatedPapers = papers.filter((_, index) => index !== indexToDelete);
    setPapers(updatedPapers);
    if (selectedPaper === papers[indexToDelete]) {
      setSelectedPaper(null);
    }
  };

  // Reminder handling
  const handleAddReminder = (e) => {
    e.preventDefault();
    try {
      const newReminder = {
        id: Date.now(),
        title: reminderTitle,
        date: reminderDate,
        createdAt: new Date().toISOString()
      };
      setReminders(prev => [...prev, newReminder]);
      setReminderTitle('');
      setReminderDate('');
    } catch (error) {
      console.error("Failed to add reminder:", error);
    }
  };

  const handleDeleteReminder = (indexToDelete) => {
    setReminders(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  // Filtered data
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || 
                      (note.tags && note.tags.some(tag => 
                        tag.toLowerCase().includes(filterTag.toLowerCase())));
    return matchesSearch && matchesTag;
  });

  const filteredPapers = papers.filter(paper => 
    paper.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedReminders = [...reminders].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white fixed h-full overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold-mb-6">Research Assistant</h2>
          <ul className="space-y-4">
            <SidebarItem
              icon="📌"
              text="Dashboard"
              active={currentPage === 'dashboard'}
              onClick={() => setCurrentPage('dashboard')}
            />
            <SidebarItem
              icon="📝"
              text= "Notes"
              active= {currentPage === 'notes'}
              onClick= {() => setCurrentPage('notes')}
            />
            <SidebarItem
              icon= "📄"
              text= "Papers"
              active= {currentPage === 'papers'}
              onClick= {() => setCurrentPage('papers')}
            />
            <SidebarItem
              icon= "📆"
              text= "Reminders"
              active= {currentPage === 'reminders'}
              onClick= {() => setCurrentPage('reminders')}
            />
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="Max-w-6xl mx-auto">
        {currentPage === 'dashboard' && (
          <Dashboard 
            notesCount={notes.length}
            papersCount={papers.length}
            remindersCount={reminders.length}
            quote={quoteofTheDay}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'notes' && (
          <NotesSection
            // Form state
            noteTitle={noteTitle}
            noteText={noteText}
            noteTags={noteTags}
            tagInput={tagInput}
            editingIndex={editingIndex}
            suggestions={suggestions}
            filterTag={filterTag}
            
            // Handlers
            setNoteTitle={setNoteTitle}
            setNoteText={setNoteText}
            setNoteTags={setNoteTags}
            setTagInput={setTagInput}
            setFilterTag={setFilterTag}
            handleSaveNote={handleSaveNote}
            handleEditNote={handleEditNote}
            handleCancelEdit={handleCancelEdit}
            handleDeleteNote={handleDeleteNote}
            
            // Data
            filteredNotes={filteredNotes}
          />
        )}

        {currentPage === 'papers' && (
          <PapersSection
            papers={filteredPapers}
            selectedPaper={selectedPaper}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setSelectedFile={setSelectedFile}
            setSelectedPaper={setSelectedPaper}
            handleUploadPaper={handleUploadPaper}
            handleDeletePaper={handleDeletePaper}
          />
        )}

        {currentPage === 'reminders' && (
          <RemindersSection
            reminders={sortedReminders}
            reminderTitle={reminderTitle}
            reminderDate={reminderDate}
            setReminderTitle={setReminderTitle}
            setReminderDate={setReminderDate}
            handleAddReminder={handleAddReminder}
            handleDeleteReminder={handleDeleteReminder}
          />
        )}
        </div>
      </main>
    </div>
  );
}

// Sub-components for better organization
function Dashboard({ notesCount, papersCount, remindersCount, quote, setCurrentPage }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Notes" value={notesCount} />
        <StatCard title="Papers" value={papersCount} />
        <StatCard title="Reminders" value={remindersCount} />
      </div>
      <div className="flex space-x-4">
        <button onClick={() => setCurrentPage('notes')} className="btn-primary bg-blue-600">Add Note</button>
        <button onClick={() => setCurrentPage('papers')} className="btn-primary bg-green-600">Upload Paper</button>
        <button onClick={() => setCurrentPage('reminders')} className="btn-primary bg-purple-600">Add Reminder</button>
      </div>
      <div className="mt-8 italic border-t pt-4 text-gray-600">
        <strong>Tip:</strong> {quote}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded shadow text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-3xl">{value}</p>
    </div>
  );
}

function NotesSection({
  noteTitle, noteText, noteTags, tagInput, editingIndex, suggestions, filterTag,
  setNoteTitle, setNoteText, setNoteTags, setTagInput, setFilterTag,
  handleSaveNote, handleEditNote, handleCancelEdit, handleDeleteNote,
  filteredNotes
}) {
  return (
    <div className="app">
      <h2>{editingIndex !== null ? 'Edit Note' : 'Add New Note'}</h2>
      <input 
        type="text" 
        placeholder="Note Title" 
        value={noteTitle} 
        onChange={(e) => setNoteTitle(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <textarea 
        placeholder="Write your note..." 
        value={noteText} 
        onChange={(e) => setNoteText(e.target.value)}
        rows="4"
        className="w-full mb-2 p-2 border rounded"
      />
      <div className="tags-input-container mb-4">
        <input
          type="text"
          placeholder="Add tags (comma separated)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === ',' || e.key === 'Enter') {
              e.preventDefault();
              setNoteTags(prev => prev ? `${prev},${tagInput}` : tagInput);
              setTagInput('');
            }
          }}
          className="w-full p-2 border rounded"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map(tag => (
              <li 
                key={tag}
                onClick={() => {
                  setNoteTags(prev => prev ? `${prev},${tag}` : tag);
                  setTagInput('');
                }}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      {noteTags && (
        <div className="current-tags mb-4">
          {noteTags.split(',').filter(tag => tag.trim()).map((tag, index) => (
            <span key={index} className="tag">
              {tag.trim()}
              <button 
                onClick={() => {
                  const updatedTags = noteTags.split(',')
                    .filter((_, i) => i !== index)
                    .join(',');
                  setNoteTags(updatedTags);
                }}
                className="ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="button-group mb-6">
        <button 
          onClick={handleSaveNote}
          className="btn-primary bg-blue-600"
        >
          {editingIndex !== null ? 'Update Note' : 'Save Note'}
        </button>
        {editingIndex !== null && (
          <button 
            onClick={handleCancelEdit}
            className="btn-secondary ml-2"
          >
            Cancel
          </button>
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Saved Notes</h3>
      <input
        type="text"
        placeholder="Filter by tag"
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <ul className="notes-list">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note, index) => (
            <li key={note.id || index} className="note-card">
              <h4 className="note-title">{note.title}</h4>
              <p className="note-content">{note.content}</p>
              {note.tags?.length > 0 && (
                <div className="tags">
                  {note.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="note-actions">
                <button 
                  onClick={() => handleEditNote(index)}
                  className="btn-edit"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteNote(index)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No notes found. Create your first note above!</p>
        )}
      </ul>
    </div>
  );
}

function PapersSection({
  papers, selectedPaper, searchTerm,
  setSearchTerm, setSelectedFile, setSelectedPaper,
  handleUploadPaper, handleDeletePaper
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Papers</h2>
      <input 
        type="text" 
        placeholder="Search papers..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <div className="flex items-center mb-4">
        <input 
          type="file" 
          accept=".pdf" 
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="flex-1"
        />
        <button 
          onClick={handleUploadPaper}
          className="btn-primary bg-green-600 ml-2"
        >
          Upload
        </button>
      </div>
      <ul className="papers-list">
        {papers.length > 0 ? (
          papers.map((paper, index) => (
            <li key={index} className="paper-item">
              <span className="paper-name">{paper.name}</span>
              <div>
                <button 
                  onClick={() => setSelectedPaper(paper)}
                  className="btn-view"
                >
                  View
                </button>
                <button 
                  onClick={() => handleDeletePaper(index)}
                  className="btn-delete ml-2"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No papers uploaded yet.</p>
        )}
      </ul>
      {selectedPaper && (
        <div className="paper-preview">
          <h3 className="text-lg font-semibold mb-2">Preview: {selectedPaper.name}</h3>
          <iframe 
            src={selectedPaper.dataUrl} 
            title="PDF Viewer" 
            className="w-full h-[600px] border rounded"
          />
          <button 
            onClick={() => setSelectedPaper(null)}
            className="btn-secondary mt-2"
          >
            Close Preview
          </button>
        </div>
      )}
    </div>
  );
}

function RemindersSection({
  reminders, reminderTitle, reminderDate,
  setReminderTitle, setReminderDate,
  handleAddReminder, handleDeleteReminder
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reminders</h2>
      <form onSubmit={handleAddReminder} className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Reminder Title"
            value={reminderTitle}
            onChange={(e) => setReminderTitle(e.target.value)}
            required
            className="flex-1 p-2 border rounded"
          />
          <input
            type="datetime-local"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            required
            className="flex-1 p-2 border rounded"
          />
          <button 
            type="submit"
            className="btn-primary bg-purple-600"
          >
            Add Reminder
          </button>
        </div>
      </form>
      <ul className="reminders-list">
        {reminders.length > 0 ? (
          reminders.map((reminder, index) => (
            <li key={reminder.id || index} className="reminder-item">
              <div>
                <strong>{reminder.title}</strong>
                <span> - {new Date(reminder.date).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => handleDeleteReminder(index)}
                className="btn-delete"
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No reminders set. Add one above!</p>
        )}
      </ul>
    </div>
  );
}

export default App;