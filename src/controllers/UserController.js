import User from "../models/User.js";

export class UserController {
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createUser(req, res) {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        return res
          .status(400)
          .json({ error: "Email, name, and password are required" });
      }

      const user = await User.create({ email, name, password });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await User.update(id, updateData);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await User.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
