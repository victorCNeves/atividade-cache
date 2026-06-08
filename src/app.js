import express from "express";
import connectDB from "./config/db.js";
import routes from "./routes/routes.js";
import errors from "./middleware/errors.js";

const app = express();

try {
  await connectDB();
} catch (error) {
  console.error("Erro ao conectar no banco ", error);
}

app.use(express.json());

app.use(routes);

app.use(errors);

app.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT}`);
});
