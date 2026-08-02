import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.ts";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isLegacyAccount: true,
        contactNumber: true,
        avatar: true,
        bio: true,
        lastSeen: true,
        status: true,
        links: true,
        profileQRCode: true,
        accountRep: true,
        banReason: true,
        createdAt: true,
        updatedAt: true,
        // password deliberately excluded
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found in db" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", err: error.message });
  }
};

export const updateMail = async (req: Request, res: Response) => {
  try {
    const { currentMail, newMail } = req.body as { currentMail?: string; newMail?: string };
    if (!currentMail || !newMail) {
      return res.status(400).json({ message: "currentMail and newMail are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found in db" });
    }
    if (user.email !== currentMail) {
      return res.status(400).json({ message: "currentMail does not match our records" });
    }
    if (currentMail === newMail) {
      return res.status(400).json({ message: "newMail cannot be the same as currentMail" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMail)) {
      return res.status(400).json({ message: "newMail is not a valid email format" });
    }

    const emailTaken = await prisma.user.findUnique({ where: { email: newMail } });
    if (emailTaken) {
      return res.status(400).json({ message: "newMail already exists" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { email: newMail },
    });

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};
