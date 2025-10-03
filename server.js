// server.js
require("dotenv").config()

const path = require("path")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const flash = require("connect-flash")
const expressMessages = require("express-messages")
const PgSession = require("connect-pg-simple")(session)

const app = express()
const NODE_ENV = process.env.NODE_ENV || "development"

// --- DB pool (tu módulo ya debe exportar un Pool/config correcto) ---
const pool = require("./database")

// En producción, si hay proxy (Railway/Render/etc.) para cookies `secure`
if (NODE_ENV === "production") app.set("trust proxy", 1)

// ------------ Cookies + JWT (DEBE ir antes que los routers) ------------
const cookieParser = require("cookie-parser")
app.use(cookieParser(process.env.COOKIE_SECRET))

const jwt = require("jsonwebtoken")
app.use((req, res, next) => {
  const token = req.cookies?.jwt
  if (!token) {
    res.locals.loggedin = false
    return next()
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      // token inválido/expirado -> limpiar y seguir como no logueado
      res.clearCookie("jwt")
      res.locals.loggedin = false
      return next()
    }
    // ok
    res.locals.loggedin = true
    res.locals.accountData = payload
    req.account = payload
    next()
  })
})

// --------------------------- Views & Layouts ---------------------------
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// ---------------------- Static & Body Parsers -------------------------
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// ------------------------- Session & Flash ----------------------------
app.use(
  session({
    store: new PgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: NODE_ENV === "production",
      maxAge: 1000 * 60 * 30, // 30 min
    },
  })
)
app.use(flash())

// Locals globales (NO sobreescribir loggedin puesto por el middleware JWT)
app.use((req, res, next) => {
  res.locals.messages = expressMessages(req, res)
  if (typeof res.locals.loggedin !== "boolean") {
    res.locals.loggedin = false
  }
  next()
})

// ---------------------- Bootstrap mínimo de DB ------------------------
async function ensureCoreSchema() {
  try {
    await pool.query("BEGIN")

    await pool.query(`CREATE SCHEMA IF NOT EXISTS public;`)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.classification (
        classification_id SERIAL PRIMARY KEY,
        classification_name VARCHAR(50) UNIQUE NOT NULL
      );
    `)

    await pool.query(`
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.account (
        account_id         SERIAL PRIMARY KEY,
        account_firstname  VARCHAR(50) NOT NULL,
        account_lastname   VARCHAR(50) NOT NULL,
        account_email      VARCHAR(255) UNIQUE NOT NULL,
        account_password   TEXT NOT NULL,
        account_type       VARCHAR(10) NOT NULL DEFAULT 'Client',
        account_created    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        account_updated    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query("COMMIT")
    console.log("✓ Core DB schema ensured (classification, inventory, account)")
  } catch (err) {
    try { await pool.query("ROLLBACK") } catch {}
    console.error("DB bootstrap error:", err.message)
  }
}
ensureCoreSchema()

// ---------------------- Ruta dev opcional (seed) ----------------------
if (NODE_ENV !== "production") {
  app.get("/dev/rebuild", async (_req, res, next) => {
    try {
      await pool.query("BEGIN")

      await pool.query(`CREATE SCHEMA IF NOT EXISTS public;`)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.classification (
          classification_id SERIAL PRIMARY KEY,
          classification_name VARCHAR(50) UNIQUE NOT NULL
        );
      `)

      await pool.query(`
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

      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.account (
          account_id         SERIAL PRIMARY KEY,
          account_firstname  VARCHAR(50) NOT NULL,
          account_lastname   VARCHAR(50) NOT NULL,
          account_email      VARCHAR(255) UNIQUE NOT NULL,
          account_password   TEXT NOT NULL,
          account_type       VARCHAR(10) NOT NULL DEFAULT 'Client',
          account_created    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          account_updated    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `)

      await pool.query(`
        INSERT INTO public.classification (classification_name)
        VALUES ('Custom'), ('Sedan'), ('SUV'), ('Truck'), ('Sport')
        ON CONFLICT (classification_name) DO NOTHING;
      `)

      await pool.query(`TRUNCATE public.inventory RESTART IDENTITY CASCADE;`)

      await pool.query(`
        INSERT INTO public.inventory
          (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
        VALUES
          ('Chevrolet','Camaro',2018,'Sport coupe',
            '/images/vehicles/camaro.jpg','/images/vehicles/camaro-tn.jpg',28900,22000,'Black',
            (SELECT classification_id FROM public.classification WHERE classification_name='Sport')),
          ('DeLorean','DMC-12',1982,'Time-travel ready (almost)',
            '/images/vehicles/delorean.jpg','/images/vehicles/delorean-tn.jpg',45000,88000,'Silver',
            (SELECT classification_id FROM public.classification WHERE classification_name='Sport')),
          ('Ford','Crown Vic',2011,'Full-size sedan',
            '/images/vehicles/crwn-vic.jpg','/images/vehicles/crwn-vic-tn.jpg',9900,120000,'White',
            (SELECT classification_id FROM public.classification WHERE classification_name='Sedan')),
          ('Jeep','Wrangler',2016,'Trail-rated SUV',
            '/images/vehicles/wrangler.jpg','/images/vehicles/wrangler-tn.jpg',27900,56000,'Red',
            (SELECT classification_id FROM public.classification WHERE classification_name='SUV')),
          ('Cadillac','Escalade',2019,'Luxury SUV',
            '/images/vehicles/escalade.jpg','/images/vehicles/escalade-tn.jpg',55900,34000,'Black',
            (SELECT classification_id FROM public.classification WHERE classification_name='SUV')),
          ('Hummer','H2',2008,'Big and bold',
            '/images/vehicles/hummer.jpg','/images/vehicles/hummer-tn.jpg',32900,78000,'Yellow',
            (SELECT classification_id FROM public.classification WHERE classification_name='SUV')),
          ('Monster','Truck',2015,'Ridiculous but fun',
            '/images/vehicles/monster-truck.jpg','/images/vehicles/monster-truck-tn.jpg',38900,28000,'Blue',
            (SELECT classification_id FROM public.classification WHERE classification_name='Truck')),
          ('Fire','Truck',2012,'Sirens included (maybe)',
            '/images/vehicles/fire-truck.jpg','/images/vehicles/fire-truck-tn.jpg',49900,45000,'Red',
            (SELECT classification_id FROM public.classification WHERE classification_name='Truck')),
          ('Ford','Model T',1926,'Classic custom ride',
            '/images/vehicles/model-t.jpg','/images/vehicles/model-t-tn.jpg',15000,99999,'Black',
            (SELECT classification_id FROM public.classification WHERE classification_name='Custom'));
      `)

      await pool.query("COMMIT")
      res.send("DB rebuild OK ✅ — Tables and sample data are ready.")
    } catch (err) {
      try { await pool.query("ROLLBACK") } catch {}
      next(err)
    }
  })
}

// --------------------- Global nav (except /dev/*) ---------------------
const utilities = require("./utilities")
app.use(async (req, res, next) => {
  if (req.path.startsWith("/dev/")) return next()
  try {
    res.locals.nav = await utilities.getNav()
  } catch {
    res.locals.nav = '<ul><li><a href="/">Home</a></li></ul>'
  }
  next()
})

// ------------------------------ Routes --------------------------------
const baseController = require("./controllers/baseController")
app.get("/", baseController.buildHome)
app.get("/health", (_req, res) => res.send("ok"))

app.use("/inv", require("./routes/inventoryRoute"))
app.use("/account", require("./routes/accountRoute"))

// --------------------------- 404 & 500 --------------------------------
app.use((req, res) => {
  res.status(404)
  res.render("errors/404", { title: "404 - Not Found", nav: res.locals.nav })
})

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500)
  res.render("errors/500", {
    title: "Server Error",
    nav: res.locals.nav,
    message: NODE_ENV === "development" ? err.message : "Unexpected error",
  })
})

// ------------------------------ Start ---------------------------------
const port = process.env.PORT || 5500
app.listen(port, () => console.log(`App listening on port ${port} (${NODE_ENV})`))

