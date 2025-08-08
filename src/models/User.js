import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

class User {
  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: { ...userData, password: hashedPassword },
      });
      return this.#userWithoutPassword(user);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      return user ? this.#userWithoutPassword(user) : null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user ? this.#userWithoutPassword(user) : null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async findByEmailWithPassword(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const users = await prisma.user.findMany();
      return users.map(this.#userWithoutPassword);
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  static async update(id, updateData) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      return this.#userWithoutPassword(user);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const user = await prisma.user.delete({
        where: { id },
      });
      return this.#userWithoutPassword(user);
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  static async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  static #userWithoutPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default User;
