import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.redirect("/auth/login");
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.redirect("/auth/login");
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.redirect("/auth/login");
  }
};

export const authenticateSession = (req, res, next) => {
  if (!req.session?.user) {
    res.redirect("/auth/login");
    return;
  }
  next();
};
