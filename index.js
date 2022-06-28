require('dotenv').config()
require('./mongo')

const express = require('express')
const cors = require('cors')
const Note = require('./models/Note')

const app = express()
const logger = require('./loggerMiddleware')

app.use(cors())
app.use(express.json())

app.use(logger)

let notes = []

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response) => {
  const { id } = request.params

  Note.findById(id)
    .then(note => {
      if (note) {
        return response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: note.important || false
  })

  newNote.save().then(savedNote => {
    response.json(savedNote)
  })

  response.status(201).json(newNote)
})

app.use((request, response) => {
  response.status(404).json({ error: 'Not found' })
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`)
})
