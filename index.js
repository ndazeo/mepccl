const express = require('express')
const path = require('path')
const DOMParser = require('dom-parser');
const parser = new DOMParser();
const href = process.env.HREF
const PORT = process.env.PORT || 5000
const { get } = require('./database');

app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/data', data)
  .get('/', table)
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

async function data(req, res) {
  const rows = await get();
  res.json(rows);
}

async function table(req, res) {
  const rows = await get();
  res.render('pages/db', { results: rows });
}
