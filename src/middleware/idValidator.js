export default (req, res, next) => {
  const { id } = req.params;

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  next();
};
