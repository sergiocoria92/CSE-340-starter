// server.js
require('dotenv').config()
const path = require('path')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const app = express()

// View engine + layouts
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/layout')

// Rutas estáticas
const staticRoutes = require('./routes/static')   // ← renómbralo si antes usabas 'static'
app.use(staticRoutes)

// Ruta de inicio "/"
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' })
})

// Ruta de salud opcional para probar rápido
app.get('/health', (_req, res) => res.send('ok'))

// Puerto: usar el que da Render
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`app listening on port ${port}`))


