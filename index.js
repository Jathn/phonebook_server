require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

app.get('/info', (req, res) => {
    console.log('Get request at /info')
    Person.find({})
        .then(persons => {
            const time = new Date()
            const resText = `Phonebook has info for ${persons.length} people <br />${time} `
            res.send(resText)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'Internal server error' })
        })
})

app.get('/API/persons', (req, res) => {
    console.log('Get request at /API/persons')
    Person.find({})
        .then(persons => {
            res.json(persons)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'Internal server error' })
        })
})

app.get('/API/persons/:id', (req, res) => {
    console.log('Specific get request at /API/persons')
    const id = parseInt(req.params.id)
    Person.findById(id)
        .then(person => {
            if (!person) {
                return res.status(404).json({ message: 'person not found' })
            }
            res.json(person)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'Internal server error' })
        })
})

const checkValid = (name) => {
    return Person.findOne({ name })
        .then(person => {
            return !person
        })
        .catch(error => {
            console.log(error)
            throw new Error('Internal server error')
        })
}

app.post('/API/persons', (req, res) => {
    console.log('Post request')
    const generateID = () => {
        return Math.floor(Math.random() * 1e15)
    }

    const new_person = new Person({
        id: generateID(),
        name: req.body.name,
        number: req.body.number,
    })

    checkValid(req.body.name)
        .then(valid => {
            if (valid) {
                new_person.save()
                    .then(savedPerson => {
                        res.status(201).json(savedPerson)
                        console.log(JSON.stringify(savedPerson))
                    })
                    .catch(error => {
                        console.log(error)
                        res.status(500).json({ error: 'Internal server error' })
                    })
            } else {
                res.status(400).json({ error: 'name must be unique' })
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'Internal server error' })
        })
})

app.put('/API/persons/:id', (req, res) => {
    console.log('Put request')
    const id = parseInt(req.params.id)
    Person.findByIdAndUpdate(id, { name: req.body.name, number: req.body.number }, { new: true })
        .then(updatedPerson => {
            if (!updatedPerson) {
                return res.status(404).json({ message: 'person not found' })
            }
            res.json(updatedPerson)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'Internal server error' })
        })
})

app.delete('/API/persons/:id', (req, res) => {
    console.log('Delete request')
    const id = parseInt(req.params.id)
    
    Person.findByIdAndDelete(id)
        .then(() => {
            res.json({ message: 'person deleted successfully' })
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'Internal server error' })
        })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
