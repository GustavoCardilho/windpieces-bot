import "dotenv/config";
import { createClient } from "redis";
export * from "colors";
import { ExtendedClient } from "./structs/ExtendedClient";
import config from "./config.json";

const redisPort = process.env.REDIS_URL_DEPLOY || process.env.REDIS_URL;
export const tokenDiscord = process.env.TOKEN_TEST || process.env.TOKEN;

console.log("URL: ", redisPort);
const client = new ExtendedClient();
export const clientRedis = createClient({
  url: redisPort,
});
client.on("error", (err) => console.log("Redis Client Error", err));

const startRedis = async () => {
  await clientRedis
    .connect()
    .then(async () => {
      console.log("Redis Connected".green);
      const value = await clientRedis.get("key");
      console.log("Redis Value", value);
    })
    .catch((err) => {
      console.log("Redis Error".red, err);
    });
};

client.start().then((tag) => {
  console.log(`Logged in as ${tag}`.green);
  startRedis();
});

export { client, config };
