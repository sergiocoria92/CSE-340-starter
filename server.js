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

      // Dentro de /dev/rebuild, reemplaza SOLO el bloque de "semillas" por este:

      // Limpia inventario (y reinicia secuencia id)
await db.query(`TRUNCATE public.inventory RESTART IDENTITY CASCADE;`)

// Semillas usando archivos que SÍ existen en /public/images/vehicles
await db.query(`
  INSERT INTO public.inventory
  (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
  VALUES
  -- SPORT
  ('Chevrolet','Camaro',2018,'Sport coupe',
    '/images/vehicles/camaro.jpg','/images/vehicles/camaro-tn.jpg',28900,22000,'Black',
    (SELECT classification_id FROM public.classification WHERE classification_name='Sport')),
  ('DeLorean','DMC-12',1982,'Time-travel ready (almost)',
    '/images/vehicles/delorean.jpg','/images/vehicles/delorean-tn.jpg',45000,88000,'Silver',
    (SELECT classification_id FROM public.classification WHERE classification_name='Sport')),

  -- SEDAN
  ('Ford','Crown Vic',2011,'Full-size sedan',
    '/images/vehicles/crwn-vic.jpg','/images/vehicles/crwn-vic-tn.jpg',9900,120000,'White',
    (SELECT classification_id FROM public.classification WHERE classification_name='Sedan')),

  -- SUV
  ('Jeep','Wrangler',2016,'Trail-rated SUV',
    '/images/vehicles/wrangler.jpg','/images/vehicles/wrangler-tn.jpg',27900,56000,'Red',
    (SELECT classification_id FROM public.classification WHERE classification_name='SUV')),
  ('Cadillac','Escalade',2019,'Luxury SUV',
    '/images/vehicles/escalade.jpg','/images/vehicles/escalade-tn.jpg',55900,34000,'Black',
    (SELECT classification_id FROM public.classification WHERE classification_name='SUV')),
  ('Hummer','H2',2008,'Big and bold',
    '/images/vehicles/hummer.jpg','/images/vehicles/hummer-tn.jpg',32900,78000,'Yellow',
    (SELECT classification_id FROM public.classification WHERE classification_name='SUV')),

  -- TRUCK
  ('Monster','Truck',2015,'Ridiculous but fun',
    '/images/vehicles/monster-truck.jpg','/images/vehicles/monster-truck-tn.jpg',38900,28000,'Blue',
    (SELECT classification_id FROM public.classification WHERE classification_name='Truck')),
  ('Fire','Truck',2012,'Sirens included (maybe)',
    '/images/vehicles/fire-truck.jpg','/images/vehicles/fire-truck-tn.jpg',49900,45000,'Red',
    (SELECT classification_id FROM public.classification WHERE classification_name='Truck')),

  -- CUSTOM
  ('Ford','Model T',1926,'Classic custom ride',
    '/images/vehicles/model-t.jpg','/images/vehicles/model-t-tn.jpg',15000,99999,'Black',
    (SELECT classification_id FROM public.classification WHERE classification_name='Custom'));
`)



      await db.query('COMMIT')
      res.send('DB rebuild OK ✅ — Tablas y datos de ejemplo listos.')
    } catch (err) {
      await db.query('ROLLBACK')
      next(err)
    }
  })
}



// Diagnóstico: ver conteos de clasificaciones e inventario
if (process.env.NODE_ENV === 'development') {
  const db = require('./database')

  app.get('/dev/stats', async (_req, res, next) => {
    try {
      const { rows: classes } = await db.query(
        'SELECT classification_id, classification_name FROM public.classification ORDER BY classification_id'
      )
      const { rows: counts } = await db.query(
        'SELECT classification_id, COUNT(*) AS n FROM public.inventory GROUP BY classification_id ORDER BY classification_id'
      )
      res.json({ classifications: classes, inventory_counts: counts })
    } catch (e) {
      next(e)
    }
  })
}

// Peek inventario por nombre de clasificación (dev)
if (process.env.NODE_ENV === 'development') {
  const db = require('./database')
  app.get('/dev/peek/:name', async (req, res, next) => {
    try {
      const { rows } = await db.query(`
        SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year,
               i.inv_price, i.inv_thumbnail, i.inv_image,
               c.classification_name, i.classification_id
        FROM public.inventory i
        JOIN public.classification c USING (classification_id)
        WHERE LOWER(c.classification_name) = LOWER($1)
        ORDER BY i.inv_id
      `, [req.params.name])
      res.json(rows)
    } catch (e) { next(e) }
  })
}



/* =========================================================
   Middleware global: inyecta 'nav' para TODAS las vistas
   (pero NO en rutas /dev/* para evitar error antes del rebuild)
   ========================================================= */
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav()
    next()
  } catch (err) {
    res.locals.nav = '<ul><li><a href="/">Home</a></li></ul>'
    next()
  }
})

/* ===================
   Rutas de la app
   =================== */
app.get('/', baseController.buildHome)
app.get('/health', (_req, res) => res.send('ok'))

const invRoute = require('./routes/inventoryRoute')
app.use('/inv', invRoute)

const port = process.env.PORT || 5500
app.listen(port, () => console.log(`app listening on port ${port}`))





// 404
app.use((req, res) => {
  res.status(404)
  res.render("errors/404", { title: "404 - Not Found", nav: res.locals.nav })
})

// 500
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500)
  res.render("errors/500", {
    title: "Server Error",
    nav: res.locals.nav,
    message: process.env.NODE_ENV === "development" ? err.message : "Unexpected error",
  })
})
