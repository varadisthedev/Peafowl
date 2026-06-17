import exprss from "express";
import { Resend } from "resend";
import redis from "../config/redis";
import bcrypt from "bcrypt";


const router = exprss.Router();
const ResendKey = process.env.RESEND_API_KEY;
if (!ResendKey) {
    throw new Error("Resend API key is not defined in environment variables");
}
const resend = new Resend(ResendKey);


router.post("/get_otp", async (req, res) => {
    // Handle OTP login logic here
    const { userMail } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    // hash otp and store in redis with an expiry of 5 minutes
    const hashedOtp = await bcrypt.hash(otp, 10);
    // storing otp in redis with an expiry of 5 minutes
    await redis.set(
        `otp:${userMail}`,
        hashedOtp,
        {
            EX: 300
        }
    );
    await resend.emails.send({
        from: "varadisthedev@gmail.com",
        to: userMail,
        subject: "OTP From peafowl app",
        html: `<h2>Your OTP is ${otp}</h2>`
    });
    res.status(200).json({ success: true, message: "OTP sent successfully" });
});

router.post("/verify_otp", async (req, res) => {
    const { userMail, otp } = req.body;
    const storedOtp = await redis.get(`otp:${userMail}`);

    if (!storedOtp) {
        return res.status(400).json({
            message: "OTP expired"
        });
    }

    if (!(await bcrypt.compare(otp, storedOtp))) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }
    res.status(200).json({ success: true, message: "OTP verified successfully" });
});
export default router;