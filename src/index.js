import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
