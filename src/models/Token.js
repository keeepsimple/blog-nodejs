import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class Token {
  static async create(data) {
    try {
      await prisma.token.create({
        data,
      });
    } catch (error) {
      console.error("Error creating token:", error);
      throw new Error("Error creating token");
    }
  }

  static async findByRefreshToken(refreshToken) {
    try {
      return await prisma.token.findFirst({
        where: { refreshToken },
      });
    } catch (error) {
      console.error("Error finding token by refresh token:", error);
      throw new Error("Error finding token by refresh token");
    }
  }

  static async addTokenToBlacklist(token) {
    try {
      await prisma.token.update({
        where: { token },
        data: { status: false },
      });
    } catch (error) {
      throw new Error("Error adding token to blacklist");
    }
  }

  static async revokeRefreshToken(refreshToken) {
    try {
      const token = await prisma.token.findFirst({
        where: { refreshToken },
      });
      if (!token) {
        throw new Error("Refresh token not found");
      }
      await prisma.token.update({
        where: { id: token.id },
        data: { status: false },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Error revoking refresh token");
    }
  }

  static async checkIfBlacklisted(token) {
    try {
      const tokenRecord = await prisma.token.findUnique({
        where: { token },
      });
      return tokenRecord?.status === false;
    } catch (error) {
      throw new Error("Error checking if token is blacklisted");
    }
  }
}
