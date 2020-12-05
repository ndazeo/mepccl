const express = require('express')
const path = require('path')
const fetch = require('node-fetch');
const DOMParser = require('dom-parser');
const parser = new DOMParser();
const href = process.env.HREF
const { set } = require('./database');

async function getTable() {
    const res = await fetch(href).catch(e => { console.log(e) });
    const body = await res.text().catch(e => { console.log(e) });
    const rows = parser.parseFromString(body, "text/html")
        .getElementById("cotizaciones").getElementsByTagName("tr")
        .map(row => [row.getElementsByTagName("b")[0].innerHTML.trim(), row.getElementsByTagName("td")[1].innerHTML.trim().replace(".", "").replace(",", ".")])
        .sort();
    
    var table = new Map();
    rows.forEach(
        row => {
            var key = row[0][row[0].length - 1];
            var code = row[0];
            if (key == "C" || key == "D") {
                code = code.substr(0, row[0].length - 1);
                key = 1 + (key == "C");
            } else {
                key = 0;
            }
            values = [0,0,0];
            if (table.has(code)) {
                values = table.get(code);
            }
            values[key] = row[1];
            table.set(code, values)
        }
    )
    
    return table;
}


async function update() {
    const rows = await getTable().catch(e => { console.log(e) });
    rows.forEach((values, bond) => {
        if (values[2] != 0) {
            set(bond, values);
        }
    });
}

function getTime() {
    const todayAR = new Date().toLocaleString("en-US", {
        timeZone: "America/Buenos_Aires"
    });
    return new Date(todayAR);
}

const now = getTime();
const wday = now.getDay();
const hour = now.getHours();
if (0 < wday && wday < 6 && 9 < hour && hour < 18) {
    console.log("Updating");
    update();
}