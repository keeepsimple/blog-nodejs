import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Token } from "../models/Token.js";

export class TokenService {
  static async createRefreshToken(user) {
    try {
      const token = TokenService.#generateToken(user);
      const refreshToken = await TokenService.#generateRefreshToken(user);

      await Token.create({
        userId: user.id,
        token,
        refreshToken,
        status: true,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        type: "refresh-token",
      });
      return { token, refreshToken };
    } catch (error) {
      console.error("Error creating refresh token:", error);
      throw new Error("Could not create refresh token");
    }
  }

  static async createToken(user) {
    const token = TokenService.#generateToken(user);
    await Token.create({
      userId: user.id,
      token,
      status: true,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      type: "access-token",
    });
    return token;
  }

  static async findByRefreshToken(refreshToken) {
    const token = await Token.findByRefreshToken(refreshToken);
    return token;
  }

  static async addTokenToBlacklist(token) {
    await Token.addTokenToBlacklist(token);
  }

  static async revokeRefreshToken(refreshToken) {
    await Token.revokeRefreshToken(refreshToken);
  }

  static async checkIfBlacklisted(token) {
    const isBlacklisted = await Token.checkIfBlacklisted(token);
    return isBlacklisted;
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

  static async #generateRefreshToken(user) {
    const textToHash = `${user.id}-${user.email}-${Date.now()}`;
    return await bcrypt.hash(textToHash, 10);
  }
}
