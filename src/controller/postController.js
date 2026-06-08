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
      const posts = await Post.find();
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

  getByTitle: async (req, res, next) => {
    try {
      const post = await Post.find({ title: req.params.title });
      if (post.length === 0) {
        return res.status(404).json({ error: "Nenhuma postagem encontrada." });
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  },

  getByAuthor: async (req, res, nest) => {
    try {
      const post = await Post.find({ author: req.params.author });
      if (post.length === 0) {
        return res.status(404).json({ error: "Nenhuma postagem encontrada." });
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
};
