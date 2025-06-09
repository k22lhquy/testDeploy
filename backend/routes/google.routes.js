import express from "express";
import passport from "passport";
import { authMiddleware } from "../middleware/protectRoute.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/auth/failure",
  })
);

router.get(
  "/protected",
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user;

      let existingUser = await User.findOne({ email: user.emails[0].value });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.id, 10);
        existingUser = new User({
          username: user.emails[0].value.split("@")[0] + user.id,
          fullname: user.displayName,
          password: hashedPassword,
          email: user.emails[0].value,
        });
        await existingUser.save();
      }

      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "72h" }
      );

      res.redirect(`https://xx-m8te.onrender.com/oauth-success?token=${token}`);
      // res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("https://xx-m8te.onrender.com/login?error=oauth_failed");
      // es.redirect("http://localhost:3000/login?error=oauth_failed");
    }
  }
);

router.get("/auth/failure", (req, res) => {
  res.send("Failed to authenticate..");
});

export default router;
