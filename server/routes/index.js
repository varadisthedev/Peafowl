import express from "express";
import userRouter from "./userRoute.js";
import adminRouter from "./adminRoute.js";

const router = express.Router();

// Mount routes
router.use("/api/users", userRouter); // Routes: /api/users/register, /api/users/login etc.
router.use("/api/admin", adminRouter); // Routes: /api/admin/users, /api/admin/dashboard etc.
//router.use("/api/gemini", require("./geminiRoute")); // Routes: /api/gemini/analyse, /api/gemini/analyse-graph
export default router;
// import in server.js and use as: app.use("/", router);
