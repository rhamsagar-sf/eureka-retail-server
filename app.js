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

/* post to update customers */

app.post("/customers", (req, res) => {
  client.query(
    "UPDATE salesforce.eureka_customers__c SET phone__c = 98765432 WHERE id = 1;",
    (err, result) => {
      if (err) throw err;
      for (let row of result.rows) {
        console.log(JSON.stringify(row));
      }
      res.send(result.rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
