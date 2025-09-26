// database/index.js
const { Pool } = require("pg")
require("dotenv").config()

// Use SSL only for Render (or production)
const isRender = /render\.com/.test(process.env.DATABASE_URL || "")
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRender ? { rejectUnauthorized: false } : false,
})

// Export the actual Pool instance
module.exports = pool
