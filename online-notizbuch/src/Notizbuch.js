import React, { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import Quill from 'quill';
import './App.css'; // Optional: Für benutzerdefinierte CSS

const Notizbuch = () => {
    const editorRef = useRef(null);
    const displayRef = useRef(null);
  
    useEffect(() => {
      
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Schreiben Sie Ihre Notiz...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // Textformatierungen
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }], // Überschriften
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],     // Hoch- und Tiefgestellt
            [{ 'indent': '-1' }, { 'indent': '+1' }],         // Einrückungen
            [{ 'direction': 'rtl' }],                        // Textausrichtung
            [{ 'size': ['small', false, 'large', 'huge'] }],  // Textgrößen
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],         // Farboptionen
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],                      // Medienoptionen
            ['clean']                                        // Formatierung entfernen
          ],
        },
      });
      document.getElementById('saveNoteButton').addEventListener('click', () => {
        const noteContent = quill.root.innerHTML;
        const currentDate = new Date().toLocaleDateString('de-DE', {
          day: '2-digit', month: '2-digit', year: 'numeric',
        });
  
        displayRef.current.innerHTML = `<p><strong>Datum: ${currentDate}</strong></p>` + noteContent;
      });
    }, []);

    return (
        <div>
          <h1>Online-Notizbuch-Web-App</h1>
          
          <div ref={editorRef} id="editorContainer" style={{ height: '300px' }}></div>
          <button id="saveNoteButton">Speichern</button>
          <button id="loadNoteButton">Laden</button>
          <button id="clearNoteButton">Löschen</button>
          <div ref={displayRef} id="noteDisplay" className="note-display"></div>
          <footer style={{ textAlign: 'center', position: 'fixed', bottom: 0, width: '100%', backgroundColor: '#f1f1f1', padding: '10px' }}>
            Made by Muditha und Fahrugh
          </footer>
        </div>
      );
    };
    
    export default Notizbuch;
    