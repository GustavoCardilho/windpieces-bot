import { createClient } from "redis";
import { env } from "../env";

export const redisPort = env.REDIS_URL_DEPLOY || env.REDIS_URL;

export const clientRedis = createClient({
  url: redisPort,
});

export const startRedis = async () => {
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
