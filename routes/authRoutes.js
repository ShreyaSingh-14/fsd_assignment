const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/authController");
const validateLogin = require("../middleware/authMiddleware");

router.post("/login", validateLogin, loginUser);

module.exports = router;
