// models/inventory-model.js
const pool = require('../database/')

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    'SELECT * FROM public.classification ORDER BY classification_name'
  )
}

/* **************************************
 *  Get inventory by classification id
 * ************************************* */
async function getInventoryByClassificationId(classification_id) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_thumbnail
    FROM public.inventory
    WHERE classification_id = $1
    ORDER BY inv_make, inv_model, inv_year
  `
  return await pool.query(sql, [classification_id])
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
}
