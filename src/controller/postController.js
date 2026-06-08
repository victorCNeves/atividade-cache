import Post from "../model/Post";

export default {
  create: async (req, res, next) => {
    try {
      const post = await Post.create(req.body);
      res.json(post);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const { title, author } = req.query;
      const query = {};

      if (title) {
        query.title = { $regex: title, $options: "i" };
      }

      if (author) {
        query.author = { $regex: author, $options: "i" };
      }

      const posts = await Post.find(query);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Postagem não encontrada." });
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
};
