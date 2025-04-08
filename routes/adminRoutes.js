const express = require("express");

const {
  getDonarsListController,
  getHospitalListController,
  getOrgListController,
  deleteDonarController,
} = require("../controllers/adminController");
const adminMiddleware = require("../middlewares/adminMiddleware");

//router object
const router = express.Router();

//Routes

//GET || DONAR LIST
router.get("/donar-list", adminMiddleware, getDonarsListController);
//GET || HOSPITAL LIST
router.get("/hospital-list", adminMiddleware, getHospitalListController);
//GET || ORG LIST
router.get("/org-list", adminMiddleware, getOrgListController);
// =========================

// DELETE Donar || GET
router.delete("/delete-donar/:id", deleteDonarController);

//EXPORT
module.exports = router;
