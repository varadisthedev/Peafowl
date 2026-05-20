import express from "express";
import userRouter from "./userRoute.js";
import adminRouter from "./adminRoute.js";
import messageRouter from "./messageRoute.js";

const router = express.Router();

// Mount routes
router.use("/api/users", userRouter); // Routes: /api/users/register, /api/users/login etc.
router.use("/api/admin", adminRouter); // Routes: /api/admin/users, /api/admin/dashboard etc.
router.use("/api/messages", messageRouter); // Routes: /api/messages/room/:roomId, /api/messages/:messageId
//router.use("/api/gemini", require("./geminiRoute")); // Routes: /api/gemini/analyse, /api/gemini/analyse-graph
router.use("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Welcome to the Peafowl API" });
});
export default router;
// import in server.js and use as: app.use("/", router);
