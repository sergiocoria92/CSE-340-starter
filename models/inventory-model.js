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
  try {
    const data = await pool.query(
      `SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_thumbnail,
              c.classification_name
       FROM public.inventory AS i
       JOIN public.classification AS c
         ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1
       ORDER BY i.inv_make, i.inv_model, i.inv_year`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error('getInventoryByClassificationId error', error)
    return []
  }
}

/* ***************************
 *  Get one vehicle by id
 * ************************** */
async function getVehicleById(inv_id) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM public.inventory i
    JOIN public.classification c
      ON i.classification_id = c.classification_id
    WHERE i.inv_id = $1
  `
  const { rows } = await pool.query(sql, [inv_id])
  return rows[0] // una sola fila
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
}
