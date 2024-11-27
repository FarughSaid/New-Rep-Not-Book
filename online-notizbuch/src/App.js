import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import axios from 'axios';
import './App.css';

function App() {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null); // Track editing note ID

  // Initialize Quill Editor
  useEffect(() => {
    if (!quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Schreiben Sie Ihre Notiz...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean'],
          ],
        },
      });
    }
  }, []);

  // Fetch notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/notes');
        setNotes(response.data);
      } catch (error) {
        console.error('Error fetching notes:', error);
        alert('Fehler beim Laden der Notizen. Bitte versuchen Sie es erneut.');
      }
    };

    fetchNotes();
  }, []);

  // Save or Update Note
  const handleSave = async () => {
    const content = quillInstance.current.root.innerHTML.trim();
    if (!content || content === '<p><br></p>') {
      alert('Notizinhalt darf nicht leer sein!');
      return;
    }

    try {
      if (editingNoteId) {
        // Update existing note
        const response = await axios.put(`http://localhost:4000/api/notes/${editingNoteId}`, { content });
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === editingNoteId ? { ...note, content: response.data.content } : note
          )
        );
        alert('Notiz erfolgreich aktualisiert!');
        setEditingNoteId(null); // Reset editing state
      } else {
        // Create new note
        const response = await axios.post('http://localhost:4000/api/notes', { content });
        setNotes((prevNotes) => [...prevNotes, response.data]);
        alert('Notiz erfolgreich gespeichert!');
      }

      quillInstance.current.root.innerHTML = ''; // Clear editor
    } catch (error) {
      console.error('Fehler beim Speichern der Notiz:', error);
      alert('Fehler beim Speichern der Notiz. Bitte versuchen Sie es erneut.');
    }
  };

  // Delete a note
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/notes/${id}`);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      alert('Notiz erfolgreich gelöscht!');
    } catch (error) {
      console.error('Fehler beim Löschen der Notiz:', error);
      alert('Fehler beim Löschen der Notiz. Bitte versuchen Sie es erneut.');
    }
  };

  // Edit a note
  const handleEdit = (note) => {
    quillInstance.current.root.innerHTML = note.content; // Load note content into editor
    setEditingNoteId(note.id); // Set the note ID being edited
    alert('Sie bearbeiten jetzt diese Notiz.');
  };

  // Send note via email
  const handleEmail = (note) => {
    const recipientEmail = prompt('Bitte geben Sie die E-Mail-Adresse des Empfängers ein:');
    if (!recipientEmail) {
      alert('E-Mail-Adresse ist erforderlich, um die Notiz zu senden.');
      return;
    }

    const subject = encodeURIComponent('Ihre Notiz');
    const body = encodeURIComponent(`Hier ist die Notiz:\n\n${note.content}`);
    const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  // Load all notes
  const handleLoad = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/notes');
      setNotes(response.data);
      alert('Alle Notizen erfolgreich geladen!');
    } catch (error) {
      console.error('Fehler beim Laden der Notizen:', error);
      alert('Fehler beim Laden der Notizen. Bitte versuchen Sie es erneut.');
    }
  };

  // Delete all notes
  const handleDeleteAll = async () => {
    try {
      await axios.delete('http://localhost:4000/api/notes');
      setNotes([]);
      alert('Alle Notizen erfolgreich gelöscht!');
    } catch (error) {
      console.error('Fehler beim Löschen aller Notizen:', error);
      alert('Fehler beim Löschen aller Notizen. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="App">
      <a href="index.html">
        <img
          src="/NoteBook.png"
          alt="Klick hier, um die Notizbuch-Seite zu öffnen"
          style={{ width: '1700px', cursor: 'pointer' }}
        />
      </a>

      <h1>Online-Notizbuch-Web-App</h1>

      <div ref={editorRef} id="editorContainer" style={{ height: '300px' }}></div>

      <div>
        <button onClick={handleSave} className="action-button">Speichern</button>
        <button onClick={handleLoad} className="action-button">Laden</button>
        <button onClick={handleDeleteAll} className="action-button">Alle Notizen Löschen</button>
      </div>

      <div>
        <h2>Gespeicherte Notizen</h2>
        <ul>
          {notes.map((note) => (
            <li key={note.id} className="note-item">
              <div dangerouslySetInnerHTML={{ __html: note.content }} />
              <button onClick={() => handleEdit(note)} className="action-button">Bearbeiten</button>
              <button onClick={() => handleDelete(note.id)} className="action-button">Löschen</button>
              <button onClick={() => handleEmail(note)} className="action-button">Per E-Mail senden</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default App;