// database/index.js
const { Pool } = require('pg')

const isProd = process.env.NODE_ENV === 'production'
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({
  connectionString,
  // Render/Heroku necesitan TLS. Evita error de CA self-signed.
  ssl: isProd ? { rejectUnauthorized: false } : false,
})

module.exports = pool
