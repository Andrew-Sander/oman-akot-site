import express from "express";
import adminAuthMiddleware from "../middleware/auth";

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/dashboard", (req, res) => {
  res.send("Welcome to Admin Dashboard");
});

export default router;
