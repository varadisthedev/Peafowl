import type { Request, Response } from "express";
import { prisma } from "../config/prisma.ts";
import { Prisma, Role } from "../generated/prisma/client.ts";
import bcrypt from "bcrypt";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { username: true, email: true },
    });
    res.send(users);
  } catch (error) {
    res.status(500).json({ message: "Server error with the database" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params["id"] as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { username: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).json({ message: "Server error with the database" });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params["id"] as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    // P2025 = record not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error with the database" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params["id"] as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const role = req.body.role as Role;
    const validRoles: Role[] = ["user", "admin", "moderator"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { username: true, role: true },
    });

    res.json({
      message:
        "User role updated successfully for user: " +
        user.username +
        " to role: " +
        user.role,
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error with the database" });
  }
};

export const createAdminAccount = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email and password are required" });
    }

    // Check if username OR email already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "admin",
      },
      select: { email: true },
    });

    res.status(201).json({
      message: "Admin account created successfully",
      email: newAdmin.email,
    });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const field = (err.meta?.target as string[])?.join(", ") ?? "field";
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({
      message: "Server error with the database",
      "error message": err.message,
    });
  }
};
