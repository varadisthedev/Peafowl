import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    // with select false pass wont show up in default queries
    contactNumber: { type: String, default: "", unique: true, sparse: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    lastSeen: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["online", "offline", "away", "busy", "invisible"], // discord inspired
      default: "offline",
    },
    links: {
      // user may add: social media, portfolio, etc to their profile
      type: Map,
      of: String,
      default: new Map(),
    },
    profileQRCode: { type: String, default: "" }, // for sharing profile easily
    accountRep: {
      type: Number,
      default: 1000, // starting rep, can be increased/dec
      // 0 rep bans the account
    },
    banReason: { type: String, default: "" },
  },
  { timestamps: true },
);
export default mongoose.model("UserModel", userSchema);
//converting schema (rules) to model (collection) and exporting it
