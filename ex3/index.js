const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const getRandomId = () => {
  const max = 10000000
  return String(Math.floor(Math.random() * max))
}

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)

  if (person){
    response.json(person)
  }
  else {
    response.status(404).end()
  }
})

app.get("/info", (request, response) => {
  const date = new Date()
  response.send(`<p>Phonebook has info for 2 people</p><p>${date}</p>`)
})

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

app.post("/api/persons", (request, response) => {
  if (!request.body.number || !request.body.name){
    return response.status(400).json({
      error: "The name or number is missing"
    })
  }

  if (persons.filter(person => person.name === request.body.name).length > 0){
    return response.status(400).json({
      error: "The name already exists in the phonebook"
    })
  }

  const person = {...request.body, id: getRandomId()}
  
  persons = persons.concat(person)
  response.json(person)
})

app.put("/api/persons/:id", (request, response) => {
  const id = request.params.id
  
  if (!request.body.number){
    return response.status(400).json({
      error: "The new number is missing"
    })
  }

  const personIndex = persons.findIndex(person => person.id === id);
  if (personIndex === -1){
    return response.statusMessage(404).json({
      error: "Person not found"
    })
  }

  persons[personIndex].number = request.body.number
  response.json(persons[personIndex])
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
