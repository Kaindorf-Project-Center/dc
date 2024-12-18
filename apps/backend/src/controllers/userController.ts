import { Request, Response } from "express";

// Get user
export const getUser = (req: Request, res: Response) => {
  res.status(200).json({ message: "Get User" });
};

// Create user
export const createUser = (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  res.status(201).json({ message: `User ${name} created` });
};
