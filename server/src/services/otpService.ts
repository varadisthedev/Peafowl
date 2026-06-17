
import { Resend } from "resend";
import redis from "../config/redis";
import bcrypt from "bcrypt";


const ResendKey = process.env.RESEND_API_KEY;
if (!ResendKey) {
    throw new Error("Resend API key is not defined in environment variables");
}
const resend = new Resend(ResendKey);


export const sendOtp = async (userMail: string) => {
    try {

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        // hash otp and store in redis with an expiry of 5 minutes
        const hashedOtp = await bcrypt.hash(otp, 10);
        // storing otp in redis with an expiry of 5 minutes
        await redis.set(`otp:${userMail}`, hashedOtp, "EX", 300);
        await resend.emails.send({
            from: "varadisthedev@gmail.com",
            to: userMail,
            subject: "OTP From peafowl app",
            html: `<h2>Your OTP is ${otp}</h2>`
        });
        return { success: true, message: "OTP sent successfully" };
    }
    catch (err: any) {
        console.log(err.message)
        return { success: false, message: "Failed to send OTP" }
    }
}

export const verifyOtp = async (userMail: string, otp: string) => {
    try {

    }
    catch (err: any) {
        console.log(err.message)
        return { status: 500, success: false, message: "Failed to verify OTP" }
    }


    const storedOtp = await redis.get(`otp:${userMail}`);

    if (!storedOtp) {
        return {
            status: 400,
            message: "OTP expired"
        };
    }

    if (!(await bcrypt.compare(otp, storedOtp))) {
        return {
            status: 400,
            message: "Invalid OTP"
        };
    }
    return { success: true, status: 200, message: "OTP verified successfully" };
};
