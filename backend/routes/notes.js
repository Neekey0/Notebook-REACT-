const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');

//Route 1:::Get all the notes :GET "/api/auth/getnotes" ... doesnot requie auth  //  login required

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

//Route 2::: Add a new Note using POST  "/api/auth/addnote" ... doesnot requie auth  // login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a title name').isLength({ min: 3 }),
    body('description', 'Description must be greater than 5').isLength({ min: 5 })], async (req, res) => {
        try {
            const { title, description, tag, date } = req.body;
            //If there are errors return bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()
            res.json(savedNote)
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send("Some error occured");
        }
    })
//ROUTE 3 : Update an existing notes
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {

        //create a newnote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find the note to be updated and update it

        // const note= Note.findByIdAndUpdate()
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (!note.user.toString() == req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})
//ROUTE 4 : Delete an existing notes
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    //find the note to be deleted and delete it
    // const note= Note.findByIdAndUpdate()
    try {
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (!note.user.toString() == req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success ": " Note has been deleted", note: note });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})
module.exports = router

