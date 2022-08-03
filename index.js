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

const validateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      message: 'Token não encontrado',
    });
  }
  if (token.length !== 16) {
    return res.status(401).json({
      message: 'Token inválido',
    });
  }
  next();
};

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

const validateTalkerDate = (req, res, next) => {
  const newTalker = req.body;
  const { talk } = newTalker;
  const regexDate = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/;
  if (!talk) {
    return res.status(400).json({
      message: 'O campo "talk" é obrigatório',
    });
  } if (!talk.watchedAt) {
    return res.status(400).json({
      message: 'O campo "watchedAt" é obrigatório',
    });
  } if (!regexDate.test(talk.watchedAt)) {
    return res.status(400).json({
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }
  next();
};

const validateTalkerRate = (req, res, next) => {
  const newTalker = req.body;
  const { talk } = newTalker;

  if (talk.rate === undefined) {
    return res.status(400).json({
      message: 'O campo "rate" é obrigatório',
    });
  }
  if (!Number.isInteger(talk.rate) || talk.rate < 1 || talk.rate > 5) {
    return res.status(400).json({
      message: 'O campo "rate" deve ser um inteiro de 1 à 5',
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

app.post('/talker', validateToken, validateTalkerName,
validateTalkerAge, validateTalkerDate, validateTalkerRate, async (req, res) => {
  const listTalkers = await getTalkers();

  const newTalker = req.body;
  const addTalker = {
    id: listTalkers.length + 1,
    ...newTalker,
  };

  listTalkers.push(addTalker);
  await fs.writeFile('./talker.json', JSON.stringify(listTalkers));
  return res.status(201).json(addTalker);
});

app.put('/talker/:id', validateToken, validateTalkerName,
validateTalkerAge, validateTalkerDate, validateTalkerRate, async (req, res) => {
  const { id } = req.params;
  const listTalkers = await getTalkers();
  const editTalker = req.body;
  let talkerInfo = {};

  const editedListTalkers = listTalkers.map((talker) => {
    if (talker.id === +id) {
      talkerInfo = {
        id: talker.id,
        ...editTalker,
      };
      return talkerInfo;
    }
    return talker;
  });
  await fs.writeFile('./talker.json', JSON.stringify(editedListTalkers));

  return res.status(200).json(talkerInfo);
});

app.listen(PORT, () => {
  console.log('Online');
});
