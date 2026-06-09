import client from "../config/redis.js";

export default async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;

  try {
    const cache = await client.get(key);

    if (cache) {
      return res.json(JSON.parse(cache));
    }

    res.jsonResponse = res.json;

    res.json = async (body) => {
      try {
        await client.setEx(key, 60, JSON.stringify(body));
      } catch (err) {
        console.error("Erro ao salvar cache:", err);
      }
      return res.jsonResponse.call(res, body);
    };
    next();
  } catch (error) {
    console.error("Erro no Redis ", error);
    next();
  }
};
