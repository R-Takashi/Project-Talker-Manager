const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const getTalkers = async () => {
  const talkers = await fs.readFile('./talker.json', 'utf8');
  return JSON.parse(talkers);
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

app.listen(PORT, () => {
  console.log('Online');
});
