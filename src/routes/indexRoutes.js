import { Router } from "express";
import { authenticateSession } from "../middlewares/auth.js";
import { Todo } from "../models/Todo.js";

const router = Router();

router.get("/", authenticateSession, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      50
    );
    const skip = (page - 1) * limit;

    const { todos, totalCount } = await Todo.findAll({
      take: limit,
      skip,
      isPublish: true,
    });

    res.render("index", {
      title: "Home",
      user: req.session?.user || null,
      todos,
      totalCount,
      page,
      limit,
      routeName: "home",
    });
  } catch (err) {
    console.error("Error loading home:", err);
    res.status(500).send("Failed to load todos");
  }
});

// My Todos - current user's todos
router.get("/my-todo", authenticateSession, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      50
    );
    const skip = (page - 1) * limit;

    const userId = req.session.user.id;
    const { todos, totalCount } = await Todo.findAll({
      take: limit,
      skip,
      authorId: userId,
    });

    res.render("myTodo", {
      title: "My Todos",
      user: req.session?.user || null,
      todos,
      totalCount,
      page,
      limit,
      routeName: "my",
      error: req.query.error || null,
      success: req.query.success || null,
    });
  } catch (err) {
    console.error("Error loading my todos:", err);
    res.status(500).send("Failed to load my todos");
  }
});

// Create a new todo
router.post("/my-todo", authenticateSession, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const title = (req.body.title || "").trim();
    const content = (req.body.content || "").trim();
    const from = new Date(req.body.from);
    const to = new Date(req.body.to);
    const isPublish = Boolean(req.body.isPublish);

    if (!title) {
      return res.redirect(
        `/my-todo?error=${encodeURIComponent("Title is required")}`
      );
    }

    if (!from || !to || isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.redirect(
        `/my-todo?error=${encodeURIComponent("Invalid date range")}`
      );
    }

    await Todo.create({
      title,
      content,
      isPublish,
      from,
      to,
      authorId: userId,
    });
    return res.redirect(
      `/my-todo?success=${encodeURIComponent("Todo created")}`
    );
  } catch (err) {
    console.error("Create todo error:", err);
    return res.redirect(
      `/my-todo?error=${encodeURIComponent("Failed to create todo")}`
    );
  }
});

// Update an existing todo (title, content, isPublish)
router.post("/my-todo/:id/update", authenticateSession, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;
    const title = (req.body.title || "").trim();
    const content = (req.body.content || "").trim();
    const from = new Date(req.body.from);
    const to = new Date(req.body.to);
    const isPublish = Boolean(req.body.isPublish);

    const todo = await Todo.findById(id);
    if (!todo || todo.authorId !== userId) {
      return res.redirect(
        `/my-todo?error=${encodeURIComponent("Todo not found")}`
      );
    }
    if (!title) {
      return res.redirect(
        `/my-todo?error=${encodeURIComponent("Title is required")}`
      );
    }
    if (!from || !to || isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.redirect(
        `/my-todo?error=${encodeURIComponent("Invalid date range")}`
      );
    }

    await Todo.update(id, { title, content, isPublish, from, to });
    return res.redirect(
      `/my-todo?success=${encodeURIComponent("Todo updated")}`
    );
  } catch (err) {
    console.error("Update todo error:", err);
    return res.redirect(
      `/my-todo?error=${encodeURIComponent("Failed to update todo")}`
    );
  }
});

// Delete a todo
router.post("/my-todo/:id/delete", authenticateSession, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;
    const todo = await Todo.findById(id);
    if (!todo || todo.authorId !== userId) {
      return res.redirect(
        `/my-todo?error=${encodeURIComponent("Todo not found")}`
      );
    }
    await Todo.delete(id);
    return res.redirect(
      `/my-todo?success=${encodeURIComponent("Todo deleted")}`
    );
  } catch (err) {
    console.error("Delete todo error:", err);
    return res.redirect(
      `/my-todo?error=${encodeURIComponent("Failed to delete todo")}`
    );
  }
});

// Toggle isDone
router.post(
  "/my-todo/:id/toggle-done",
  authenticateSession,
  async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { id } = req.params;
      const todo = await Todo.findById(id);
      if (!todo || todo.authorId !== userId) {
        return res.redirect(
          `/my-todo?error=${encodeURIComponent("Todo not found")}`
        );
      }
      await Todo.update(id, { isDone: !todo.isDone });
      return res.redirect(
        `/my-todo?success=${encodeURIComponent("Status updated")}`
      );
    } catch (err) {
      console.error("Toggle done error:", err);
      return res.redirect(
        `/my-todo?error=${encodeURIComponent("Failed to change status")}`
      );
    }
  }
);

// Toggle isPublish
router.post(
  "/my-todo/:id/toggle-publish",
  authenticateSession,
  async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { id } = req.params;
      const todo = await Todo.findById(id);
      if (!todo || todo.authorId !== userId) {
        return res.redirect(
          `/my-todo?error=${encodeURIComponent("Todo not found")}`
        );
      }
      await Todo.update(id, { isPublish: !todo.isPublish });
      return res.redirect(
        `/my-todo?success=${encodeURIComponent("Publish updated")}`
      );
    } catch (err) {
      console.error("Toggle publish error:", err);
      return res.redirect(
        `/my-todo?error=${encodeURIComponent("Failed to change publish")}`
      );
    }
  }
);

export default router;
