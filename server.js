// server.js
require('dotenv').config()
const path = require('path')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const utilities = require('./utilities')
const baseController = require('./controllers/baseController')

const app = express()

// Vistas + layouts
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/layout')

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

/* =========================================================
   RUTA DE REBUILD (solo dev) — crear tablas + semillas
   Debe ir ANTES del middleware que construye 'nav'
   ========================================================= */
if (process.env.NODE_ENV === 'development') {
  const db = require('./database') // exporta { query } en database/index.js

  app.get('/dev/rebuild', async (_req, res, next) => {
    try {
      await db.query('BEGIN')

      await db.query(`CREATE SCHEMA IF NOT EXISTS public;`)

      await db.query(`
        CREATE TABLE IF NOT EXISTS public.classification (
          classification_id SERIAL PRIMARY KEY,
          classification_name VARCHAR(50) UNIQUE NOT NULL
        );
      `)

      await db.query(`
        CREATE TABLE IF NOT EXISTS public.inventory (
          inv_id SERIAL PRIMARY KEY,
          inv_make VARCHAR(50) NOT NULL,
          inv_model VARCHAR(50) NOT NULL,
          inv_year INT NOT NULL,
          inv_description TEXT NOT NULL,
          inv_image VARCHAR(255),
          inv_thumbnail VARCHAR(255),
          inv_price NUMERIC(10,2) NOT NULL,
          inv_miles INT,
          inv_color VARCHAR(20),
          classification_id INT NOT NULL
            REFERENCES public.classification(classification_id)
        );
      `)

      await db.query(`
        INSERT INTO public.classification (classification_name)
        VALUES ('Custom'), ('Sedan'), ('SUV'), ('Truck'), ('Sport')
        ON CONFLICT (classification_name) DO NOTHING;
      `)

      await db.query('COMMIT')
      res.send('DB rebuild OK ✅ — Tablas y datos listos.')
    } catch (err) {
      await db.query('ROLLBACK')
      next(err)
    }
  })
}

/* =========================================================
   Middleware global: inyecta 'nav' para TODAS las vistas
   (pero NO en rutas /dev/* para evitar error antes del rebuild)
   ========================================================= */
app.use(async (req, res, next) => {
  if (req.path.startsWith('/dev/')) return next()
  try {
    res.locals.nav = await utilities.getNav()
    next()
  } catch (err) {
    // Fallback para que no se caiga la vista si la DB aún no está lista
    res.locals.nav = '<ul><li><a href="/">Home</a></li></ul>'
    next()
  }
})

/* ===================
   Rutas de la app
   =================== */
app.get('/', baseController.buildHome)
app.get('/health', (_req, res) => res.send('ok'))

const port = process.env.PORT || 5500
app.listen(port, () => console.log(`app listening on port ${port}`))


const invRoute = require('./routes/inventoryRoute')
app.use('/inv', invRoute)
