// utilities/index.js
const invModel = require("../models/inventory-model")
const Util = {}

/* **************************************
 * Build main nav
 * ************************************ */
Util.getNav = async function () {
  const data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
 * Build the classification view HTML (grid)
 * ************************************ */
// utilities/index.js
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data && data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      const thumb = vehicle.inv_thumbnail || '/images/vehicles/no-image-tn.png'
      grid += `<li>
        <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${thumb}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>`
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* **************************************
 * Build the vehicle detail HTML
 * ************************************ */
Util.buildVehicleDetail = function (v) {
  if (!v) return '<p class="notice">Vehicle not found.</p>'

  const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
  const fmtNum = new Intl.NumberFormat("en-US")

  return `
  <article class="vehicle-detail">
    <div class="vehicle-media">
      <img src="${v.inv_image}" alt="Image of ${v.inv_make} ${v.inv_model}" />
    </div>
    <div class="vehicle-info">
      <h2>${v.inv_year} ${v.inv_make} ${v.inv_model}</h2>
      <p class="price">${fmtUSD.format(Number(v.inv_price || 0))}</p>
      <ul class="meta">
        <li><strong>Mileage:</strong> ${fmtNum.format(Number(v.inv_miles || 0))}</li>
        <li><strong>Color:</strong> ${v.inv_color || "—"}</li>
        <li><strong>Class:</strong> ${v.classification_name}</li>
      </ul>
      <p class="desc">${v.inv_description || ""}</p>
    </div>
  </article>
  `
}

module.exports = Util
