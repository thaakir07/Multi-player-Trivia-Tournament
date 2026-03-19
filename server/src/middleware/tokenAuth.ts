import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function tokenAuthenticate(req: Request, res: Response, next: NextFunction) {
  console.log(req);
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(401).json({ error: "Invalid token" });
    }
    (req as any).user = user;
    next();
  });
}
