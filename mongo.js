const mongoose = require('mongoose')
const connnectionString = process.env.MONGODB_URI

// conexion a la base de datos
mongoose
  .connect(connnectionString)
  .then(() => {
    console.log('Database is connected')
  })
  .catch(err => {
    console.log('Error connecting to database: ' + err)
  })

/*
Note.find({}).then(notes => {
  console.log(notes)
  mongoose.connection.close()
})
*/

/*
const note = new Note({
  content: 'MongoDB is fun',
  date: new Date(),
  important: true
})

note
  .save()
  .then(result => {
    console.log(result)
    mongoose.connection.close()
  })
  .catch(error => {
    console.log(error)
  })
  */
