import { Todo } from "../models/Todo.js";
export class TodoController {
  static async create(req, res) {
    try {
      const { title } = req.body;
      const { user } = req;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const todo = await Todo.create({
        title,
        authorId: user.id,
        ...req.body,
      });
      res.status(200).json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllTodos(req, res) {
    try {
      const params = req.query;
      const take = params?.take;
      const skip = params?.skip;
      const isPublish = params?.isPublish;
      const user = req.user;
      const filter = {};
      if (!isPublish) {
        filter.authorId = user.id;
      }
      const todos = await Todo.findAll({
        ...filter,
        take: parseInt(take),
        skip: parseInt(skip),
      });
      res.status(200).json(todos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTodoById(req, res) {
    try {
      const { id } = req.params;
      const todo = await Todo.findById(id);
      if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.status(200).json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, isDone, isPublish, from, to, content } = req.body;
      const todo = await Todo.findById(id);
      if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
      }

      if (todo.authorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const data = {
        title: title !== undefined ? title : todo.title,
        content: content !== undefined ? content : todo.content,
        isDone: isDone !== undefined ? isDone : todo.isDone,
        isPublish: isPublish !== undefined ? isPublish : todo.isPublish,
        from: from !== undefined ? from : todo.from,
        to: to !== undefined ? to : todo.to,
      };

      await Todo.update(id, data);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const todo = await Todo.findById(id);
      if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
      }

      if (todo.authorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await Todo.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
