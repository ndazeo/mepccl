const express = require('express')
const path = require('path')
const request = require('request');
const DOMParser = require('dom-parser');
const parser = new DOMParser();
const href = process.env.HREF
const PORT = process.env.PORT || 5000
const { get, set, list } = require('./database');

app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  //.get('/', (req, res) => res.render('pages/index'))
  .get('/data', data)
  .get('/', table)
  .get('/table', table)
  .get('/update', update)
  .get('/prices/:bond', (req, res) => getPrices(res, req.params.bond))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

async function data(req, res) {
  const rows = await get();
  res.json(rows);
}

async function table(req, res) {
  const rows = await get();
  res.render('pages/db', { results: rows });
}

function getPrice(bond, then) {
  return new Promise(function (resolve, reject) {
    request.get(href + bond, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const spans = parser.parseFromString(body, "text/html")
          .getElementById("IdTitulo").getElementsByTagName("span");
        spans.forEach(element => {
          if (element.getAttribute("data-field") == "UltimoPrecio") {
            resolve(Number.parseFloat(element.textContent.replace(".", "").replace(",", ".")));
          }
        });
      } else {
        reject(error);
      }
    });
  });
}

async function getPrices(res, bond) {
  res.json(await updateBond(bond));
}

async function updateBond(bond) {
  console.log("update: " + bond);
  const pAr = await getPrice(bond + "");
  const pDr = await getPrice(bond + "D");
  const pCr = await getPrice(bond + "C");
  const values = await Promise.all([pAr, pDr, pCr]);
  const result = await set(bond, values);
  return result;
}


async function update(_req, res) {
  const rows = await list()
  const bonds = rows.map(rows => rows['bond']);
  const result = await Promise.all(bonds.map(updateBond));
  res.json(result);
}