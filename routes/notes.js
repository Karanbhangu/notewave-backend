const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");

// Notes fetching:
router.get("/getnotes", fetchuser, async (req, res) => {
  const fetchedNotes = await Notes.find({ user: req.user.id });
  res.status(200).json({
    notes: fetchedNotes,
  });
});

// Notes addition:
router.post("/addnote", fetchuser, async (req, res) => {
  try {
    const { notetitle, notebody, notetag } = req.body;
    if (!notetitle || !notebody) {
      return res.status(400).json({
        message: "Enter a valid note",
      });
    }
    if (notebody.length < 5) {
      return res.status(400).json({
        message: "Note should be atleast 5 character long.",
      });
    }
    if (!notetag) {
      const notetag = "General";
    }
    const note = new Notes({
      user: req.user.id,
      title: notetitle,
      description: notebody,
      tag: notetag,
    });
    const savedNote = await note.save();
    res.status(200).json({
      message: "Note created Successfully.",
      note: savedNote
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Notes Updation:
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { notetitle, notebody, notetag } = req.body;
  // Creating a new note object
  const newNote = {};
  if (notetitle) {
    newNote.title = notetitle;
  }
  if (notebody) {
    newNote.description = notebody;
  }
  if (notetag) {
    newNote.tag = notetag;
  }

  // Authentication for note updation:
  const noteId = await Notes.findById(req.params.id);
  if (!noteId) {
    return res.status(404).json({
      message: "Note not found.",
    });
  }
  if (noteId.user.toString() !== req.user.id) {
    return res.status(401).json({
      message: "Unauthorised Access.",
    });
  }
  note = await Notes.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.status(200).json({
    message: "Note updated successfully",
    updatedNote: note,
  });
});

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Check if note exists:
    const findNote = await Notes.findById(req.params.id);
    if (!findNote) {
        return res.status(404).json({
          message: "Note not found.",
        });
    }
    // Proceed further if note exists
    const userId = req.user.id;
    // Check if right user is deleting the note
    const verifyUser = findNote.user.toString() === userId;
    if (!verifyUser) {
      return res.status(401).json({
        message: "Unauthorised Access.",
      });
    }
    // Note deletion
    const noteDeletion = await Notes.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Note deleted successfully.",
    });
  } catch (err) {
    // Server side error handling:
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
