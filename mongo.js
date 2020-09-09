const mongoose = require('mongoose')
require('dotenv').config()

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstackuser:${password}@cluster0.b90nd.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length<4){
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}

if (process.argv.length === 5){
  const newName = process.argv[3]
  const newNumber = process.argv[4]

  const person = new Person({
    name: newName,
    number: newNumber,
    id: Math.floor(Math.random()*10000),
  })
  person.save().then( () => {
    console.log(`added ${newName} number ${newNumber} to phonebook`)
    mongoose.connection.close()
  })
}




