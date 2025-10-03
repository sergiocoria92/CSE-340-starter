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

async function getAccountById(id) {
  const { rows } = await db.query(
    `SELECT account_id, account_firstname, account_lastname,
            account_email, account_type
     FROM public.account
     WHERE account_id = $1`,
    [id]
  )
  return rows[0] || null
}

async function updateAccount({ account_id, account_firstname, account_lastname, account_email }) {
  const { rowCount } = await db.query(
    `UPDATE public.account
        SET account_firstname = $1,
            account_lastname  = $2,
            account_email     = $3,
            account_updated   = NOW()
      WHERE account_id = $4`,
    [account_firstname, account_lastname, account_email, account_id]
  )
  return rowCount === 1
}

async function updatePassword(account_id, passwordHash) {
  const { rowCount } = await db.query(
    `UPDATE public.account
        SET account_password = $1,
            account_updated   = NOW()
      WHERE account_id = $2`,
    [passwordHash, account_id]
  )
  return rowCount === 1
}

module.exports = {
  findByEmail,
  create,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
}
