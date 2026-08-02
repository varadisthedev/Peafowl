import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  // expected header format: Bearer <token>
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
