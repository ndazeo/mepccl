const { query } = require('express');
const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

exports.set = async (bond, prices) => {
    console.log(bond, prices);

    const querystr = `INSERT 
        INTO prices (bond, A,D,C) 
        VALUES ($1 , $2::decimal, $3::decimal, $4::decimal) 
        ON CONFLICT (bond)
        DO UPDATE SET A=$2::decimal, D=$3::decimal, C=$4::decimal;`;

    const res = await client.query(querystr, [bond, ...prices]);
    return res;
}

exports.get = async () => {
    const res = await client.query('SELECT * FROM prices;');
    return res.rows;
}

exports.list = async () => {
    const res = await client.query('SELECT bond FROM prices;');
    return res.rows;
}