import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

const adminAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).send("Access Denied");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY!);
    req.user = verified;

    if (req.user.role !== "admin") {
      return res.status(403).send("Forbidden");
    }

    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
};

export default adminAuthMiddleware;
