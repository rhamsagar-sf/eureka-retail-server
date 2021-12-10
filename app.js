const express = require('express')
const dotenv = require('dotenv');
dotenv.config();

const { Client } = require('pg');

const app = express()
const PORT = process.env.PORT || 3000;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/user', (req, res) => {
  client.query('SELECT * FROM salesforce.eureka_customers__c;', (err, result) => {
    if (err) throw err;
    for (let row of result.rows) {
      console.log(JSON.stringify(row));
    }
    res.send(result.rows);
    client.end();
  });  
});


app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})