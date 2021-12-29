const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const { Client } = require("pg");

const app = express();

// either set port from env provided by Heroku, or load 3000 for localhost
const PORT = process.env.PORT || 3000;

const client = new Client({
  // either take database url provided by heroku, or from .env file for localhost
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

app.get("/", (req, res) => {
  res.send("Hello World from Eureka!");
});

app.get("/customers", (req, res) => {
  client.query(
    "SELECT * FROM salesforce.eureka_customers__c;",
    (err, result) => {
      if (err) throw err;
      for (let row of result.rows) {
        console.log(JSON.stringify(row));
      }
      res.send(result.rows);
    }
  );
});

app.get("/customers/:userId", (req, res) => {
  const userId = req.params.userId;
  client.query(
    "SELECT * FROM salesforce.eureka_customers__c WHERE id = $1;",
    [userId],
    (err, result) => {
      if (err) throw err;
      for (let row of result.rows) {
        console.log(JSON.stringify(row));
      }
      res.send(result.rows);
    }
  );
});

/* post to update customers */

app.post("/customers", (req, res) => {
  const { id, name } = req.headers;
  client.query(
    "UPDATE salesforce.eureka_customers__c SET name__c = $1 WHERE id = $2;",
    [name, id],
    (err, result) => {
      if (err) throw err;
      for (let row of result.rows) {
        console.log(JSON.stringify(row));
      }
      res.send(`User modified with ID: ${id}`);
    }
  );
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
