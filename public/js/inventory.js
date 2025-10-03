// public/js/inventory.js
(() => {
  const select = document.getElementById("classificationList")
  const table  = document.getElementById("inventoryDisplay")

  if (!select || !table) return

  async function loadInventory() {
    const classId = select.value
    table.innerHTML = ""

    if (!classId) return

    try {
      const res = await fetch(`/inv/getInventory/${encodeURIComponent(classId)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const rows = await res.json()

      if (!Array.isArray(rows) || rows.length === 0) {
        table.innerHTML = `<tbody><tr><td>No inventory found.</td></tr></tbody>`
        return
      }

      let html = `
        <thead>
          <tr>
            <th>Make</th>
            <th>Model</th>
            <th>Year</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>`
      for (const r of rows) {
        html += `
          <tr>
            <td>${r.inv_make}</td>
            <td>${r.inv_model}</td>
            <td>${r.inv_year ?? ""}</td>
            <td>${r.inv_price ?? ""}</td>
            <td><a href="/inv/edit/${r.inv_id}">Edit</a></td>
          </tr>`
      }
      html += `</tbody>`
      table.innerHTML = html
    } catch (err) {
      console.error(err)
      table.innerHTML = `<tbody><tr><td>Error loading inventory.</td></tr></tbody>`
    }
  }

  // Cargar al cambiar y si ya hay algo seleccionado
  select.addEventListener("change", loadInventory)
  if (select.value) loadInventory()
})()
