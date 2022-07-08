const notesRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

// obtenemos todas las notas
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(notes)
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

// crear una nota
notesRouter.post('/', async (request, response, next) => {
  const { content, important = false } = request.body

  const authorization = request.get('authorization')
  let token = ''
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring(7)
  }

  let decodedToken = {}

  try {
    decodedToken = jwt.verify(token, process.env.SECRET_JWT_KEY)
  } catch (e) {
    console.log(e)
  }

  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const { id: userId } = decodedToken

  const user = await User.findById(userId)

  if (!content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const newNote = new Note({
    content,
    date: new Date(),
    important,
    user: user._id
  })

  try {
    const savedNote = await newNote.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.json(savedNote)
  } catch (error) {
    next(error)
  }
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

module.exports = notesRouter
