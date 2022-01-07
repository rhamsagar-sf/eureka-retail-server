const express = require("express");
const dotenv = require("dotenv");
var bodyParser = require("body-parser");
const cors = require("cors");
const basicAuth = require("basic-auth");
var compare = require("tsscmp");

dotenv.config();

const { Client } = require("pg");

const app = express();

app.use(express.json()); // Used to parse JSON bodies
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

// either set port from env provided by Heroku, or load 3000 for localhost
const PORT = process.env.PORT || 3000;

const client = new Client({
  // either take database url provided by heroku, or from .env file for localhost
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Basic function to validate credentials for example
function checkCredentials(name, pass) {
  var valid = true;

  // Simple method to prevent short-circut and use timing-safe compare
  valid = compare(name, "admin") && valid;
  valid = compare(pass, "eureka") && valid;

  return valid;
}

client.connect();

app.get("/", (req, res) => {
  res.send(
    "Hello World from Eureka! Use GET /customers or /customers/:userId or POST /customers for this API"
  );
  console.log(user);
});

app.get("/customers", (req, res) => {
  var credentials = basicAuth(req);
  if (!credentials || !checkCredentials(credentials.name, credentials.pass)) {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="example"');
    res.end("Access denied");
  } else {
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
  }
});

app.get("/customers/:userId", (req, res) => {
  var credentials = basicAuth(req);
  if (!credentials || !checkCredentials(credentials.name, credentials.pass)) {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="example"');
    res.end("Access denied");
  } else {
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
  }
});

/* post to update customers */

app.post("/customers", (req, res) => {
  var credentials = basicAuth(req);
  if (!credentials || !checkCredentials(credentials.name, credentials.pass)) {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="example"');
    res.end("Access denied");
  } else {
    const { id, name, email, address, phone } = req.body;
    client.query(
      "UPDATE salesforce.eureka_customers__c SET name__c = $2, email__c = $3, address__c = $4, phone__c = $5 WHERE id = $1;",
      [id, name, email, address, phone],
      (err, result) => {
        if (err) throw err;
        for (let row of result.rows) {
          console.log(JSON.stringify(row));
        }
        res.send(`User modified with ID: ${id}`);
      }
    );
  }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
