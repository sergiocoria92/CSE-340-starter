// server.js
require('dotenv').config()
const path = require('path')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const app = express()

// Vistas + layouts
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/layout')

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

// Home  ⬅️ aquí pasamos active: 'home'
app.get('/', (req, res) => {
  res.render('index', { title: 'CSE Motors', active: 'home' })
})

// Salud (opcional)
app.get('/health', (_req, res) => res.send('ok'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`app listening on port ${port}`))
