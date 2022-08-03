const express = require('express');
const bodyParser = require('body-parser');
const { getTalkers, saveTalkers, getToken } = require('./utils');
const { validateEmail } = require('./middlewares/validateEmail');
const { validatePassword } = require('./middlewares/validatePassword');
const { validateToken } = require('./middlewares/validateToken');
const { validateTalkerName } = require('./middlewares/validateTalkerName');
const { validateTalkerAge } = require('./middlewares/validateTalkerAge');
const { validateTalkerDate } = require('./middlewares/validateTalkerDate');
const { validateTalkerRate } = require('./middlewares/validateTalkerRate');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker/search', validateToken, async (req, res) => {
  const { q } = req.query;

  const listTalkers = await getTalkers();

  if (q === '') {
    return res.status(200).json(listTalkers);
  }

  const searchTalkers = listTalkers
    .filter((talker) => talker.name.includes(q));

  return res.status(200).json(searchTalkers);
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
  await saveTalkers(listTalkers);
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
  await saveTalkers(editedListTalkers);

  return res.status(200).json(talkerInfo);
});

app.delete('/talker/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const listTalkers = await getTalkers();
  const removedTalkerList = listTalkers.filter(({ id: talkerId }) => talkerId !== +id);
  await saveTalkers(removedTalkerList);

  return res.status(204).end();
});

app.listen(PORT, () => {
  console.log('Online');
});
