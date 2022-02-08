import express from "express";
import userController from "../controller/userController.js";
import checkAuth from "../middleware/checkAuth.js";
const router = express.Router();

// All routes relating to add,edit,delete entries
router.post("/additem", checkAuth, userController.addItem);
router.put("/updateitem", checkAuth, userController.update);
router.put("/deleteitem", checkAuth, userController.delete);
export default router;
