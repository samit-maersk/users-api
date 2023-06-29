const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const e = require('express');
const app = express()
const port = process.env.PORT || 3000
const pgp = require('pg-promise')(/* options */)
const dbHost = process.env.DB_URL || 'postgres://postgres:postgres@127.0.0.1:5432/postgres'
const db = pgp(dbHost)

const userNamePassword = () => {
    const regex = /\/\/([^:]+):([^@]+)@/;
    const matches = dbHost.match(regex);
    if (matches) {
        const username = matches[1];
        const password = matches[2];
        return { username, password }
    } else {
        return { username: null, password: null }
    }
}

db.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255))')
    .then(() => {
        console.log('DB Connection success')
        console.log(`Initial Table creation if not exists success`)
    })
    .catch((error) => {
        console.log(error)
    })
    
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

//TODO fix this
function validateToken (req, res, next) {
    console.log(`${req.method} ${req.originalUrl}`)
    const authHeader = req.headers.authorization
    if (authHeader) {
        const {password} = userNamePassword();
        const token = authHeader.split(' ')[1]
        jwt.verify(token, password, (err, user) => {
            if (err) {
                return res.sendStatus(403)
            } 
            next()
        })
    } else {
        res.sendStatus(401)
    }
}

app.post('/login', async (req, res) => {
    const { username, password } = userNamePassword();
    if (username && password) {
        if (req.body.username === username && req.body.password === password) {
            const token = jwt.sign({data: 'db user'}, password, { expiresIn: '1h' })
            res.json({ token  })
        } else {
            res.status(401).json({ message: 'Invalid login' })
        }
    } else {
        res.status(401).json({ message: 'Invalid login' })
    }
})

app.get('/users', async (req, res) => {
    const users = await db.any('SELECT * FROM users')
    res.json(users)
})

app.get('/users/:id', async (req, res) => {
    const user = await db.one('SELECT * FROM users WHERE id = $1', [req.params.id])
    res.json(user)
})

app.get('/users/search/name/:name', async (req, res) => {
    const users = await db.any('SELECT * FROM users WHERE name LIKE $1', [`%${req.params.name}%`])
    res.json(users)
})

app.get('/users/search/email/:email', async (req, res) => {
    const users = await db.any('SELECT * FROM users WHERE email LIKE $1', [`%${req.params.email}%`])
    res.json(users)
})

app.post('/users', async (req, res) => {
    const user = await db.one('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [req.body.name, req.body.email])
    res.json(user)
})

app.put('/users/:id', async (req, res) => {
    const user = await db.one('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [req.body.name, req.body.email, req.params.id])
    res.json(user)
})

app.delete('/users/:id', async (req, res) => {
    const user = await db.one('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id])
    res.json(user)
})

app.listen(port, () => {
  console.log(`users-api listening on port ${port}`)
})