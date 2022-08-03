const fs = require('fs/promises');
const randomBytes = require('randombytes');

const getTalkers = async () => {
  const talkers = await fs.readFile('./talker.json', 'utf8');
  return JSON.parse(talkers);
};

const saveTalkers = async (talkers) => {
  await fs.writeFile('./talker.json', JSON.stringify(talkers));
};

const getToken = () => {
  const token = randomBytes(8).toString('hex');
  return token;
};

module.exports = {
  getTalkers,
  saveTalkers,
  getToken,
};