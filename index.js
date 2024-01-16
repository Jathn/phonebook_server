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

app.get('/info', (req, res, next) => {
    console.log('Get request at /info')
    Person.find({})
        .then(persons => {
            const time = new Date()
            const resText = `Phonebook has info for ${persons.length} people <br />${time} `
            res.send(resText)
        })
        .catch(error => next(error))
})

app.get('/API/persons', (req, res, next) => {
    console.log('Get request at /API/persons')
    Person.find({})
        .then(persons => {
            res.json(persons)
        })
        .catch(error => next(error))
})

app.get('/API/persons/:id', (req, res, next) => {
    console.log('Specific get request at /API/persons')
    const id = req.params.id
    Person.findById(id)
        .then(person => {
            if (!person) {
                return res.status(404).json({ message: 'person not found' })
            }
            res.json(person)
        })
        .catch(error => next(error))
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

app.post('/API/persons', (req, res, next) => {
    console.log('Post request')

    const new_person = new Person({
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
                    .catch(error => next(error))
            } else {
                res.status(400).json({ error: 'name must be unique' })
            }
        })
        .catch(error => next(error))
})

app.put('/API/persons/:id', (req, res, next) => {
    // END: be15d9bcejpp
    console.log('Put request')
    const id = req.params.id
    Person.findByIdAndUpdate(id, { name: req.body.name, number: req.body.number }, { new: true })
        .then(updatedPerson => {
            if (!updatedPerson) {
                return res.status(404).json({ message: 'person not found' })
            }
            res.json(updatedPerson)
        })
        .catch(error => {
            next(error)
        })
})

app.delete('/API/persons/:id', (req, res, next) => {
    console.log('Delete request')
    const id = req.params.id
    
    Person.findByIdAndDelete(id)
        .then(() => {
            res.json({ message: 'person deleted successfully' })
        })
        .catch(error => {
            console.log(error)
            next(error)
        })
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    } else if (error.name === 'MongoError') {
        return response.status(400).send({ error: 'name must be unique' })
    } else if (error.name === 'TypeError') {
        return response.status(400).send({ error: 'missing content' })
    }
  
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
