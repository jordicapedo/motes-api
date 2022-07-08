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

process.on('uncaughtException', error => {
  console.error(error)
  mongoose.disconnect()
})
