import mongoose from "mongoose";
import { env } from "../env";

const mongodbUrl = env.MONGODB_URL || env.MONGODB_URL_TEST;

export async function startMongoDB() {
  try {
    await mongoose.connect(mongodbUrl!, {});
    console.log("Mongoose Connected".green);
  } catch (err) {
    console.log("Mongoose Error".red, err);
  }
}
