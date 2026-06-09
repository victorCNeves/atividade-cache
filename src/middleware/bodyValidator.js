export default async (req, res, next) => {
  const { title, content, author } = req.body;
  const errors = {};

  if (typeof title !== "string") {
    errors.title = "O título deve ser uma string.";
  } else if (title.trim() === "") {
    errors.title = "O título é obrigatório.";
  }

  if (typeof content !== "string") {
    errors.content = "O conteúdo deve ser uma string.";
  } else if (content.trim() === "") {
    errors.content = "O conteúdo é obrigatório.";
  }
  if (typeof author !== "string") {
    errors.author = "O autor deve ser uma string.";
  } else if (author.trim() === "") {
    errors.author = "O autor é obrigatório.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors: errors });
  }

  next();
};
