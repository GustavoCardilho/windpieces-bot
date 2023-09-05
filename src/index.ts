import { redisPort, startRedis } from "./databases/redis";
import "dotenv/config";
export * from "colors";
import { ExtendedClient } from "./structs/ExtendedClient";
import config from "./config.json";
import { env } from "./env";
import { startMongoDB } from "./databases/mongoose";

export const tokenDiscord = env.TOKEN_TEST || env.TOKEN;

console.log("URL: ", redisPort);
const client = new ExtendedClient();

client.on("error", (err) => console.log("Redis Client Error", err));

client.start().then((tag) => {
  console.log(`Logged in as ${tag}`.green);
  startRedis();
  startMongoDB();
});

export { client, config };
