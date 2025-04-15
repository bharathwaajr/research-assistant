import React, { useState, useEffect } from 'react';
import { addPaper, getAllPapers } from './idb';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const quotes = [
    "Stay organized, stay ahead.",
    "Your ideas matter. Write them down.",
    "One small note today can spark big ideas tomorrow.",
    "A well-timed reminder can save your day.",
    "Information saved is memory earned."
  ];

  const [quoteofTheDay] = useState(quotes[Math.floor(Math.random() * quotes.length)]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const loadPapers = async () => {
      const storedPapers = await getAllPapers();
      setPapers(storedPapers);
    };
    loadPapers();
  }, []);

  const handleSaveNote = () => {
    if (noteText.trim() === '' && noteTitle.trim() === '') return;
    const newNote = { title: noteTitle, content: noteText };
    setNotes([...notes, newNote]);
    setNoteTitle('');
    setNoteText('');
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handelDeleteNote = (indexToDelete) => {
    const newNotes = notes.filter((_, index) => index !== indexToDelete);
    setNotes(newNotes);
  };

  const handleUploadPaper = async () => {
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const paper = {
          name: selectedFile.name,
          dataUrl: reader.result,
        };
        await addPaper(paper);
        setPapers(prev => [...prev, paper]);
        setSelectedFile(null);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleDeletePaper = (indexToDelete) => {
    const updatedPapers = papers.filter((_, index) => index !== indexToDelete);
    setPapers(updatedPapers);
    localStorage.setItem('papers', JSON.stringify(updatedPapers));
    if (selectedPaper === papers[indexToDelete]) setSelectedPaper(null);
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    const newReminder = { title: reminderTitle, date: reminderDate };
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    localStorage.setItem('reminders', JSON.stringify(updatedReminders));
    setReminderTitle('');
    setReminderDate('');
  };

  const handleDeleteReminder = (indexToDelete) => {
    const updatedReminders = reminders.filter((_, index) => index !== indexToDelete);
    setReminders(updatedReminders);
    localStorage.setItem('reminders', JSON.stringify(updatedReminders));
  };

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Research Assistant</h2>
        <ul className="space-y-4">
          <li onClick={() => setCurrentPage('dashboard')} className="cursor-pointer hover:text-gray-300">📌 Dashboard</li>
          <li onClick={() => setCurrentPage('notes')} className="cursor-pointer hover:text-gray-300">📝 Notes</li>
          <li onClick={() => setCurrentPage('papers')} className="cursor-pointer hover:text-gray-300">📄 Papers</li>
          <li onClick={() => setCurrentPage('reminders')} className="cursor-pointer hover:text-gray-300">📆 Reminders</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* DASHBOARD */}
        {currentPage === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded shadow text-center">
                <h3 className="text-lg font-medium">Notes</h3>
                <p className="text-3xl">{notes.length}</p>
              </div>
              <div className="bg-white p-6 rounded shadow text-center">
                <h3 className="text-lg font-medium">Papers</h3>
                <p className="text-3xl">{papers.length}</p>
              </div>
              <div className="bg-white p-6 rounded shadow text-center">
                <h3 className="text-lg font-medium">Reminders</h3>
                <p className="text-3xl">{reminders.length}</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button onClick={() => setCurrentPage('notes')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Add Note</button>
              <button onClick={() => setCurrentPage('papers')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Upload Paper</button>
              <button onClick={() => setCurrentPage('reminders')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">Add Reminder</button>
            </div>

            <div className="mt-8 italic border-t pt-4 text-gray-600">
              <strong>Tip:</strong> {quoteofTheDay}
            </div>
          </div>
        )}

        {/* NOTES */}
        {currentPage === 'notes' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add a New Note</h2>
            <input type="text" placeholder="Note Title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full mb-2 px-4 py-2 border rounded" />
            <textarea placeholder="Write your note..." value={noteText} onChange={(e) => setNoteText(e.target.value)}
              rows="4" className="w-full mb-4 px-4 py-2 border rounded"></textarea>
            <button onClick={handleSaveNote} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4 w-full">Save Note</button>

            <h3 className="text-xl font-semibold mb-2">Saved Notes</h3>
            <ul className="space-y-4">
              {filteredNotes.map((note, index) => (
                <li key={index} className="bg-white p-4 rounded shadow">
                  <h4 className="font-bold">{note.title}</h4>
                  <p>{note.content}</p>
                  <button onClick={() => handelDeleteNote(index)} className="mt-2 text-red-500">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* PAPERS */}
        {currentPage === 'papers' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Papers</h2>
            <input type="text" placeholder="Search papers..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="w-full mb-4 px-4 py-2 border rounded" />

            <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])}
              className="mb-2" />
            <button onClick={handleUploadPaper} className="ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Upload</button>

            <ul className="mt-6 space-y-4">
              {papers.filter(paper => paper.name.toLowerCase().includes(searchTerm.toLowerCase())).map((paper, index) => (
                <li key={index} className="bg-white p-4 rounded shadow flex justify-between items-center">
                  <span>{paper.name}</span>
                  <div>
                    <button onClick={() => setSelectedPaper(paper)} className="text-blue-500 mr-4">View</button>
                    <button onClick={() => handleDeletePaper(index)} className="text-red-500">Delete</button>
                  </div>
                </li>
              ))}
            </ul>

            {selectedPaper && (
              <div className="mt-8">
                <h3 className="font-semibold mb-2">Preview: {selectedPaper.name}</h3>
                <iframe src={selectedPaper.dataUrl} title="PDF Viewer" className="w-full h-[600px] border rounded"></iframe>
                <button onClick={() => setSelectedPaper(null)} className="mt-2 text-blue-500">Close Preview</button>
              </div>
            )}
          </div>
        )}

        {/* REMINDERS */}
        {currentPage === 'reminders' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Reminders</h2>
            <form onSubmit={handleAddReminder} className="mb-6 flex flex-wrap gap-4 items-center">
              <input type="text" placeholder="Reminder Title" value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)}
                required className="px-4 py-2 border rounded" />
              <input type="datetime-local" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)}
                required className="px-4 py-2 border rounded" />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">Add Reminder</button>
            </form>

            <ul className="space-y-4">
              {reminders.sort((a, b) => new Date(a.date) - new Date(b.date)).map((reminder, index) => (
                <li key={index} className="bg-white p-4 rounded shadow flex justify-between items-center">
                  <span><strong>{reminder.title}</strong> - {new Date(reminder.date).toLocaleString()}</span>
                  <button onClick={() => handleDeleteReminder(index)} className="text-red-500">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
