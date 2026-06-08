import expressRedisCache from "express-redis-cache";

export default expressRedisCache({
  client: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  expire: 60,
});
