const express = require('express')
const morgan = require('morgan')

const app = express()
const port = 3001

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

app.use(express.json())
app.use(morgan('tiny'))

app.get('/info', (req, res) => {
    console.log('Get request at /info')
    const time = new Date()
    const resText = `Phonebook has info for ${persons.length} people <br />${time} `
    res.send(resText)
})

app.get('/API/persons', (req, res) => {
    console.log('Get request at /API/persons')
    res.json(persons)
})

app.get('/API/persons/:id', (req, res) => {
    console.log('Specific get request at /API/persons')
    const id = parseInt(req.params.id)
    const person = persons.find((person) => person.id === id)

    if (!person) {
    return res.status(404).json({ message: 'person not found' })
    }

    res.json(person)
})

const checkValid = (name) => {
    const personWithName = persons.find((person) => person.name === name)

    return !personWithName
}

app.post('/API/persons', (req, res) => {
    console.log('Post request')
    const generateID = () => {
        return Math.floor(Math.random()*1e15)  
    }

    const new_person = {
        id: generateID(),
        name: req.body.name,
        number: req.body.number,
    }

    if (checkValid(req.body.name)) {
        persons.push(new_person)
        res.status(201).json(new_person)
        console.log(JSON.stringify(new_person))
    } else {
        res.status(400).json({ error: 'name must be unique' })
    }
})

app.put('/API/persons/:id', (req, res) => {
    console.log('Put request')
    const id = parseInt(req.params.id)
    const person = persons.find((person) => person.id === id)

    if (!person) {
    return res.status(404).json({ message: 'person not found' })
    }

    person.name = req.body.name
    person.number = req.body.number
    res.json(person)
})

app.delete('/API/persons/:id', (req, res) => {
    console.log('Delete request')
    const id = parseInt(req.params.id)
    persons = persons.filter((person) => person.id !== id)
    res.json({ message: 'person deleted successfully' })
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
