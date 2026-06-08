export default (req, res, next) => {
  const { title, author } = req.query;

  if (title && title.trim() === "") {
    return res
      .status(400)
      .json({ error: "O parâmetro 'title' não pode ser vazio." });
  }

  if (author && author.trim() === "") {
    return res
      .status(400)
      .json({ error: "O parâmetro 'author' não pode ser vazio." });
  }

  next();
};
