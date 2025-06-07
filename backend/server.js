import "dotenv/config";
import express from "express";
import authRouters from "./routes/auth.routes.js";
import adminRouters from "./routes/admin.routes.js";
import userRouters from "./routes/user.routes.js";
import postRouters from "./routes/post.routes.js";
import notificationRouters from "./routes/notification.routes.js";
import messageRouters from "./routes/message.router.js";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import session from "express-session";
import searchRouters from "./routes/search.router.js";
import ggRouters from "./routes/google.routes.js";
import path from "path";
import { fileURLToPath } from "url";

import "./lib/connectGG.js";

import { io, app, server } from "./lib/socket.js";
import passport from "passport";
import { authMiddleware } from "./middleware/protectRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: "cats",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({}));

app.use("/api/auth", authRouters);
app.use("/api/admin", adminRouters);
app.use("/api/users", userRouters);
app.use("/api/posts", postRouters);
app.use("/api/notifications", notificationRouters);
app.use("/api/messages", messageRouters);
app.use("/api/search", searchRouters);
app.use("/", ggRouters);

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  connectMongoDB();
});
