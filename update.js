const express = require('express')
const path = require('path')
const request = require('request');
const DOMParser = require('dom-parser');
const parser = new DOMParser();
const href = "https://www.invertironline.com/titulo/cotizacion/BCBA/"
const { set, list } = require('./database');

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

await update();