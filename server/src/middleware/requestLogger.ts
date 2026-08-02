import fs from "fs";
import { type NextFunction } from "express";
import type { Request, Response } from "express";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");
const logFile = path.join(logsDir, "access.log");
// create folder if it doesnt exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    fs.appendFileSync(logFile, "Timestamp,IP,Method,URL,Status,Time\n");
    // using csv is better for future usage in pandas or data analysis
}
// addign header on top
try {
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, "Timestamp,IP,Method,URL,Status,Time\n");
    }
    else if (fs.statSync(logFile).size === 0) {
        // using csv is better for future usage in pandas or data analysis
        fs.appendFileSync(logFile, "Timestamp,IP,Method,URL,Status,Time\n");
    }
} catch (error) {
    console.error("[ERROR] Error checking log file size, or file doenst exists: ", error);
}

export const logger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on("finish", () => {
        const log = `${new Date().toISOString()},${req.ip},${req.method},"${req.originalUrl}",${res.statusCode},${Date.now() - start}ms\n`;
        fs.appendFile(
            logFile,
            log,
            error => {
                if (error) {
                    console.error("Error writing to log file:", error);
                }
            }
        );
    });

    next();
};