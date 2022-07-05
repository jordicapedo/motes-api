const notesRouter = require('express').Router()
const Note = require('../models/Note')

// obtenemos todas las notas
notesRouter.get('/', async (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

// obtener una nota por id
notesRouter.get('/:id', async (request, response, next) => {
  const { id } = request.params
  Note.findById(id)
    .then(note => {
      if (note) return response.json(note)
      response.status(404).end()
    })
    .catch(next)
})

// actualizar una nota
notesRouter.put('/:id', async (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNowInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNowInfo)
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

// eliminar una nota
notesRouter.delete('/:id', async (request, response, next) => {
  const { id } = request.params
  Note.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// crear una nota
notesRouter.post('/', async (request, response, next) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: note.important
  })

  newNote
    .save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})

module.exports = notesRouter
