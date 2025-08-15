import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { TokenService } from "../services/tokenService.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    // check if token is blacklist
    var isBlacklisted = await TokenService.checkIfBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify the token
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const authenticateSession = (req, res, next) => {
  if (!req.session?.user) {
    res.redirect("/auth/login");
    return;
  }
  next();
};
