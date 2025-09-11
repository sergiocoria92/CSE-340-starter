// server.js
require('dotenv').config()
const path = require('path')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const app = express()

// Motor de vistas
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/layout') // relativo a /views

// Archivos estáticos (CSS/imagenes)
app.use(express.static(path.join(__dirname, 'public')))

// Home
app.get('/', (req, res) => {
  res.render('index', { title: 'CSE Motors' })
})

// Salud (opcional)
app.get('/health', (_req, res) => res.send('ok'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`app listening on port ${port}`))
