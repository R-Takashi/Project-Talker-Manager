const validateTalkerName = (req, res, next) => {
  const newTalker = req.body;
  if (!newTalker.name) {
    return res.status(400).json({
      message: 'O campo "name" é obrigatório',
    });
  }
  if (newTalker.name.length < 3) {
    return res.status(400).json({
      message: 'O "name" deve ter pelo menos 3 caracteres',
    });
  }
  next();
};

module.exports = { validateTalkerName };