import express from "express";
import authRouter from "../features/auth/auth.routes.ts";
import usersRouter from "../features/users/users.routes.ts";
import adminRouter from "../features/admin/admin.routes.ts";
import messagesRouter from "../features/messages/messages.routes.ts";

const router = express.Router();

// Routes: /api/users/register/*, /api/users/login, /api/users/logout
router.use("/api/users", authRouter);
// Routes: /api/users/profile, /api/users/mailUpdate
router.use("/api/users", usersRouter);
// Routes: /api/admin/users, /api/admin/createAccount etc.
router.use("/api/admin", adminRouter);
// Routes: /api/messages/room/:roomId, /api/messages/:messageId
router.use("/api/messages", messagesRouter);

router.use("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Welcome to the Peafowl API" });
});
export default router;
