const validateTalkerAge = (req, res, next) => {
  const newTalker = req.body;

  if (!newTalker.age || !Number.isInteger(newTalker.age)) {
    return res.status(400).json({
      message: 'O campo "age" é obrigatório',
    });
  }
  if (newTalker.age < 18) {
    return res.status(400).json({
      message: 'A pessoa palestrante deve ser maior de idade',
    });
  }
  next();
};

module.exports = validateTalkerAge;