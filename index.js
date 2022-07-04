require('dotenv').config()
require('./mongo')

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const express = require('express')
const cors = require('cors')
const Note = require('./models/Note')

const app = express()
const logger = require('./loggerMiddleware')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')

app.use(cors())
app.use(express.json())
app.use('/images', express.static('images'))

app.use(logger)

Sentry.init({
  dsn: 'https://5d0776a2ad194437844c2eba46f67451@o1305779.ingest.sentry.io/6547599',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

app.get('/', (request, response) => {
  response.send('<h1>This is the Motes API 🚀 </h1>')
})

// obtenemos todas las notas
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

// obtener una nota por id
app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findById(id)
    .then(note => {
      if (note) return response.json(note)
      response.status(404).end()
    })
    .catch(next)
})

// actualizar una nota
app.put('/api/notes/:id', (request, response, next) => {
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
app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  console.log(id)
  Note.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// crear una nota
app.post('/api/notes', (request, response, next) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: note.important || false
  })

  newNote
    .save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})
app.use(notFound)
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler())

app.use(handleErrors)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`)
})
