import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
      const token = this.#generateToken(user);

      req.session.user = this.#generateSession(user);

      res.cookie("auth_token", token, this.#cookieOptions());

      res.status(201).json({ user, token });
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

      const user = await User.findByEmail(email);
      if (!user || !(await User.verifyPassword(user, password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = this.#generateToken(user);

      req.session.user = this.#generateSession(user);

      res.cookie("auth_token", token, this.#cookieOptions());

      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    try {
      req.session.destroy();
      res.clearCookie("auth_token");
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const token = this.#getTokenFromHeader(req);
      if (!token) {
        if (req.session?.user) {
          const user = await User.findById(req.session.user.id);
          if (user) {
            return res.json(user);
          }
        }
        return res.status(401).json({ error: "Not authorized" });
      }

      const decoded = this.#decodeToken(token);
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
      const token = this.#getTokenFromHeader(req);
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const decoded = this.#decodeToken(token);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const newToken = this.#generateToken(user);
      res.cookie("auth_token", newToken, this.#cookieOptions());
      res.json({ user, token: newToken });
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

  static #generateToken(user) {
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const secret = process.env.JWT_SECRET || "secret";
    return jwt.sign(jwtPayload, secret, { expiresIn: "1h" });
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
