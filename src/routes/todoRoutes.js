import { Router } from "express";
import { TodoController } from "../controllers/TodoController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();
router.get("/", authenticateToken, TodoController.getAllTodos);
router.get("/:id", authenticateToken, TodoController.getTodoById);
router.post("/", authenticateToken, TodoController.create);
router.put("/:id", authenticateToken, TodoController.update);
router.delete("/:id", authenticateToken, TodoController.delete);

export default router;
