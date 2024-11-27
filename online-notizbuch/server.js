const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to notes file
const notesFilePath = path.join(__dirname, 'notes.json');

// Helper function to read notes from file
const readNotesFromFile = () => {
  try {
    if (!fs.existsSync(notesFilePath)) {
      fs.writeFileSync(notesFilePath, JSON.stringify([])); // Create file if not exists
    }

    const data = fs.readFileSync(notesFilePath, 'utf-8');
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading notes:', error.message);
    return [];
  }
};

// Helper function to write notes to file
const writeNotesToFile = (notes) => {
  try {
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
  } catch (error) {
    console.error('Error writing notes:', error.message);
  }
};

// GET endpoint to fetch all notes
app.get('/api/notes', (req, res) => {
  try {
    const notes = readNotesFromFile();
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error in GET /api/notes:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint to create a new note
app.post('/api/notes', (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const notes = readNotesFromFile();
    const newNote = {
      id: Date.now(),
      content,
    };

    notes.push(newNote);
    writeNotesToFile(notes);

    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error in POST /api/notes:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT endpoint to update a note by ID
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const notes = readNotesFromFile();
    const noteIndex = notes.findIndex((note) => note.id === parseInt(id, 10));

    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    notes[noteIndex].content = content; // Update content
    writeNotesToFile(notes);

    res.status(200).json(notes[noteIndex]);
  } catch (error) {
    console.error('Error in PUT /api/notes/:id:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE endpoint to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  try {
    const notes = readNotesFromFile();
    const filteredNotes = notes.filter((note) => note.id !== parseInt(id, 10));

    if (notes.length === filteredNotes.length) {
      return res.status(404).json({ error: 'Note not found' });
    }

    writeNotesToFile(filteredNotes);

    res.status(200).json({ message: 'Note successfully deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/notes/:id:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE endpoint to delete all notes
app.delete('/api/notes', (req, res) => {
  try {
    writeNotesToFile([]); // Delete all notes
    res.status(200).json({ message: 'All notes successfully deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/notes:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from React frontend
app.use(express.static(path.join(__dirname, 'build')));

// Fallback route to serve React app for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});