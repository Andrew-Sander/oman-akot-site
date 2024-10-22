import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(400).send("Invalid Credentials");
    }

    const validPassword = await user.validPassword(password);
    if (!validPassword) {
      return res.status(400).send("Invalid Credentials");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET_KEY!,
      {
        expiresIn: "12h",
      }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

export default router;
