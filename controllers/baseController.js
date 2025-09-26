const baseController = {}

baseController.buildHome = async function (req, res) {
  // Remove test flash after verifying it worked
  return res.render("index", { title: "CSE Motors" })
}

module.exports = baseController
