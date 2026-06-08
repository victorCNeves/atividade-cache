import express from "express";
import postController from "../controller/postController.js";
import idValidator from "../middleware/idValidator.js";
import queryValidator from "../middleware/queryValidator.js";
import bodyValidator from "../middleware/bodyValidator.js";
import cache from "../config/cache.js";

const router = express.Router();

router.get(
  "/posts",
  queryValidator,
  cache.route({ name: "/posts" }),
  postController.getAll,
);
router.get("/posts/:id", idValidator, postController.getById);
router.post("/posts", bodyValidator, postController.create);

export default router;
