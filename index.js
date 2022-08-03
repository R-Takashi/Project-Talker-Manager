const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const randomBytes = require('randombytes');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const getTalkers = async () => {
  const talkers = await fs.readFile('./talker.json', 'utf8');
  return JSON.parse(talkers);
};

const getToken = () => {
  const token = randomBytes(8).toString('hex');
  return token;
};

const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return res.status(400).json({
      message: 'O campo "email" é obrigatório',
    });
  }
  if (!regexEmail.test(email)) {
    return res.status(400).json({
      message: 'O "email" deve ter o formato "email@email.com"',
    });
  }
  next();
};

const validatePassword = (req, res, next) => {
  const { password } = req.body;
  const passwordLength = 6;
  if (!password) {
    return res.status(400).json({
      message: 'O campo "password" é obrigatório',
    });
  }
  if (password.length < passwordLength) {
    return res.status(400).json({
      message: 'O "password" deve ter pelo menos 6 caracteres',
    });
  }
  next();
};

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (req, res) => {
  const listTalkers = await getTalkers();

  return res.status(200).json(listTalkers);
});

app.get('/talker/:id', async (req, res) => {
    const listTalkers = await getTalkers();

    const talker = listTalkers.find(({ id }) => id === +req.params.id);

    if (!talker) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    return res.status(200).json(talker);
});

app.post('/login', validateEmail, validatePassword, (req, res) => {
  const token = getToken();
  return res.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log('Online');
});
