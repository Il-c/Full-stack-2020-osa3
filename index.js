const express = require('express')
require('dotenv').config()
const morgan = require('morgan') 
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('body', (req, res) =>
     JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))


app.get('/', (request, response) => {
  response.send('<h1>Person database</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
 //   mongoose.connection.close()
  })
})

app.get('/info', (request, response) => {
    Person.countDocuments({}).then(count=>{
      response.send(`<div>
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
      </div>`)
    })
})

const generateId = () => {
  const id = Math.floor(Math.random()*10000000)
  return  id
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name||!body.number) {
    response.status(400).send({ error: 'Name or number missing' })
  }else{
    Person.exists({ name: body.name}).then( exists =>{
      if (exists) {
        response.status(409).send({ error: 'Person is alreaydy in database' })
      }else{
        const person = new Person ({
          name: body.name,
          number: body.number,
          id: generateId(),
        })
        person.save().then(savedPerson =>{
          response.json(savedPerson)
        })
      }
    })
    .catch(error => next(error))
  }
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person){
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(request.params.id, person, {new:true})
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result =>{
      response.status(204).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name ==='Conflict'){
    return response.status(409).send({ error: 'Person is alreaydy in database' })
  }

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})