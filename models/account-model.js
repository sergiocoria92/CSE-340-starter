// models/account-model.js
const db = require("../database")

async function findByEmail(email) {
  const { rows } = await db.query(
    "SELECT account_id FROM public.account WHERE account_email = $1",
    [email]
  )
  return rows[0] || null
}

async function create({ firstname, lastname, email, passwordHash }) {
  const { rows } = await db.query(
    `INSERT INTO public.account
      (account_firstname, account_lastname, account_email, account_password)
     VALUES ($1, $2, $3, $4)
     RETURNING account_id, account_firstname, account_lastname, account_email, account_type`,
    [firstname, lastname, email, passwordHash]
  )
  return rows[0]
}

/* Traer cuenta por email con el hash (para login) */
async function getAccountByEmail(email) {
  const { rows } = await db.query(
    `SELECT account_id, account_firstname, account_lastname,
            account_email, account_type, account_password
     FROM public.account
     WHERE account_email = $1`,
    [email]
  )
  return rows[0] || null
}

module.exports = { findByEmail, create, getAccountByEmail }
