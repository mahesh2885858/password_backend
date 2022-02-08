import express from "express";
import userController from "../controller/userController.js";
import checkAuth from "../middleware/checkAuth.js";
const router = express.Router();
// Routes related to login,register,logout and retain the user login between page reloads
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/", checkAuth, userController.retainLogin);
router.get("/logout", checkAuth, userController.logout);

export default router;
