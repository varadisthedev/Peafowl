import fs from "fs";
import { type NextFunction } from "express";
import type { Request, Response } from "express";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

export const logger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on("finish", () => {
        const log = `${new Date().toISOString()} | ${req.ip} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${Date.now() - start}ms\n`;

        fs.appendFile(
            path.join(logsDir, "access.log"),
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