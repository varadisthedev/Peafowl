import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import chalk from "chalk";
const log = console.log;
const mongoURL = process.env.MONGO_URI;
if (!mongoURL) {
  console.error(
    chalk.red("Error: MONGO_URI not defined in environment variables"),
  );
  process.exit(1); // return a 1, clears mem, and exit process entirely
}
const connectMongo = async () => {
  try {
    await mongoose.connect(mongoURL);
    log(chalk.green("[MongoDB] Connected successfully!"));
  } catch (error) {
    log(chalk.red("Error connecting to MongoDB:", error));
    process.exit(1);
  }
};

export default connectMongo;
