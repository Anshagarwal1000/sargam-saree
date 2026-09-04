
const router = require("express").Router()
const authRegister = require("../controllers/authController")
const authMiddleware = require("../middlewares/authMiddleware")

router.post("/register", authRegister.registerUser)
router.post("/login", authRegister.loginUser)

router.get("/profile", authMiddleware, authRegister.getProfile)

module.exports = router
