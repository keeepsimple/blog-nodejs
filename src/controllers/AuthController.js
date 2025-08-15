import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { TokenService } from "../services/tokenService.js";

export class AuthController {
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ error: "Email, name, and password are required" });
      }
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }
      const user = await User.create({ email, password, name });
      const createdToken = await TokenService.createRefreshToken(user);

      req.session.user = AuthController.#generateSession(user);

      res.cookie(
        "auth_token",
        createdToken.token,
        AuthController.#cookieOptions()
      );
      res.cookie(
        "refresh_token",
        createdToken.refreshToken,
        AuthController.#cookieOptions()
      );

      const userWithoutPassword = { ...user, password: undefined };
      res.status(200).json({
        user: userWithoutPassword,
        token: createdToken.token,
        refreshToken: createdToken.refreshToken,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const user = await User.findByEmailWithPassword(email);
      if (!user || !(await User.verifyPassword(user, password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const createdToken = await TokenService.createRefreshToken(user);

      req.session.user = AuthController.#generateSession(user);

      res.cookie(
        "auth_token",
        createdToken.token,
        AuthController.#cookieOptions()
      );
      res.cookie(
        "refresh_token",
        createdToken.refreshToken,
        AuthController.#cookieOptions()
      );

      res.json({
        token: createdToken.token,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    try {
      req.session.destroy();
      const token = req.cookies.auth_token;
      const refreshToken = req.cookies.refresh_token;

      await TokenService.revokeRefreshToken(refreshToken);
      await TokenService.addTokenToBlacklist(token);

      res.clearCookie("auth_token");
      res.clearCookie("refresh_token");
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const token = AuthController.#getTokenFromHeader(req);
      if (!token) {
        if (req.session?.user) {
          const user = await User.findById(req.session.user.id);
          if (user) {
            return res.json(user);
          }
        }
        return res.status(401).json({ error: "Not authorized" });
      }

      const decoded = AuthController.#decodeToken(token);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "Not authorized" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refresh_token;
      const existRefreshToken = await TokenService.findByRefreshToken(
        refreshToken
      );
      if (!existRefreshToken || existRefreshToken.status === false) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      const user = await User.findById(existRefreshToken.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newToken = await TokenService.createToken(user);
      res.cookie("auth_token", newToken, AuthController.#cookieOptions());
      res.json({ token: newToken });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static #getTokenFromHeader(req) {
    const authHeader = req.headers["authorization"];
    return authHeader && authHeader.split(" ")[1];
  }

  static #decodeToken(token) {
    const secret = process.env.JWT_SECRET || "secret";
    return jwt.verify(token, secret);
  }

  static #generateSession(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  static #cookieOptions() {
    return {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    };
  }
}
