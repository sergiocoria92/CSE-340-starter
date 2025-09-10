require('dotenv').config()

const express = require('express')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')

const app = express()

// Vistas y layout
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', 'layouts/layout')

// Archivos estáticos (sirve /public)
app.use(express.static(path.join(__dirname, 'public')))

// Ruta Home
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`app listening on port ${port}`))

