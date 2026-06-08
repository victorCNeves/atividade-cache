export default (error, req, res, next) => {
  if (error.name === "CastError")
    return res.status(400).json({ error: "ID inválido." });

  res.status(500).json({ error: "Ocorreu um erro inesperado no servidor." });
};
