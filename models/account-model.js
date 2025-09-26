// models/account-model.js
const db = require("../database")

module.exports = {
  /** Return minimal row if email exists (for uniqueness checks) */
  async findByEmail(email) {
    const { rows } = await db.query(
      "SELECT account_id FROM public.account WHERE account_email = $1",
      [email]
    )
    return rows[0] || null
  },

  /** Create a new account and return basic info */
  async create({ firstname, lastname, email, passwordHash }) {
    const { rows } = await db.query(
      `INSERT INTO public.account
        (account_firstname, account_lastname, account_email, account_password)
       VALUES ($1, $2, $3, $4)
       RETURNING account_id, account_firstname, account_lastname, account_email, account_type`,
      [firstname, lastname, email, passwordHash]
    )
    return rows[0]
  },
}
