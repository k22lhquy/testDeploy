import jwt from "jsonwebtoken";

const protectRoute = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    req.user = user;
    next();
  });
};

const authMiddleware = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

const checkAdmin = (req, res, next) => {
  try {
    if (req.user.role === "admin" || req.user.role === "super-admin") {
      return next();
    }
    return res.status(403).json({ message: "Access denied, not an admin." });
  } catch (error) {
    return res.status(500).json({ message: "Server error while checking admin privileges." });
  }
};

export { protectRoute, authMiddleware, checkAdmin };
