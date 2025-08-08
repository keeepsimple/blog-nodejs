import { Router } from "express";
import User from "../models/User.js";

const router = Router();

router.get("/login", (req, res) => {
  if (req.session?.user) {
    return res.redirect("/");
  }
  res.render("login", {
    title: "Login",
    error: req.query.error || null,
    success: req.query.success || null,
    formData: {},
  });
});

router.get("/register", (req, res) => {
  if (req.session?.user) {
    return res.redirect("/");
  }
  res.render("register", {
    title: "Register",
    error: req.query.error || null,
    success: req.query.success || null,
    formData: {},
  });
});

router.post("/login", async (req, res) => {
  try {
    let { email, password, remember } = req.body;
    email = (email || "").trim();
    password = password || "";

    // Find user and validate password
    const user = await User.findByEmailWithPassword(email);

    if (!user) {
      return res.render("login", {
        title: "Login",
        error: "Invalid email or password",
        success: null,
        formData: { email },
      });
    }

    const isValidPassword = await User.verifyPassword(user, password);
    if (!isValidPassword) {
      return res.render("login", {
        title: "Login",
        error: "Invalid email or password",
        success: null,
        formData: { email },
      });
    }

    // Set session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    // Set session expiry based on remember me
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
    }

    // Redirect to home page
    res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", {
      title: "Login",
      error: "An error occurred during login. Please try again.",
      success: null,
      formData: { email: (req.body?.email || "").trim() },
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    let { email, password, confirmPassword, name } = req.body;
    email = (email || "").trim();
    name = (name || "").trim();
    password = password || "";
    confirmPassword = confirmPassword || "";

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.render("register", {
        title: "Register",
        error: "Passwords do not match",
        success: null,
        formData: { email, name },
      });
    }

    if (!name) {
      return res.render("register", {
        title: "Register",
        error: "Name is required",
        success: null,
        formData: { email, name },
      });
    }

    if (!email) {
      return res.render("register", {
        title: "Register",
        error: "Email is required",
        success: null,
        formData: { email, name },
      });
    }

    if (!password) {
      return res.render("register", {
        title: "Register",
        error: "Password is required",
        success: null,
        formData: { email, name },
      });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.render("register", {
        title: "Register",
        error: "User with this email already exists",
        success: null,
        formData: { email, name },
      });
    }

    const userData = { email, password, name };

    const user = await User.create(userData);

    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    // Redirect to home page
    res.redirect("/");
  } catch (error) {
    console.error("Registration error:", error);
    res.render("register", {
      title: "Register",
      error: "An error occurred during registration. Please try again.",
      success: null,
      formData: {
        email: (req.body?.email || "").trim(),
        name: (req.body?.name || "").trim(),
      },
    });
  }
});

// Logout Route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/");
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

export default router;
