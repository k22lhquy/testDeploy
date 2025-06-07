import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  ForgotPassword,
  newPassword
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgotPassword", ForgotPassword);
router.post("/newPassword", newPassword);

export default router;
