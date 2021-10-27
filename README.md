# Node Stream

Steps to follow to recreate whatever we've done in the stream.

## Prerequisites

1. Installed Node.

You can find relevant links to download and install Node.js for your packages on [the official site](https://nodejs.org/en/download/).

2. Installed Postgres. (or any other db you like)

Same here. Find the relevant installer on [the official page](https://www.postgresql.org/download/).

3. Quick check everything is stalled and works:

```sh
node --version # should print out your installed version.
psql --version # same, but for postgres
```

## Setup project

```sh
npm init -y
npm i express pg
```

## Create a Hello Scrimba app

```js
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello from Scrimba stream!");
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
```

## Add hot-reloading

```sh
npm i -D nodemon
```

add this to `package.json`

```json
  "scripts": {
    "dev": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

## Add GET, POST, DELETE with a variable as storage

We will create `/cats` endpoints to update a global variable. Db will replace it.

```js
app.use(express.json()); // to be able to parse json from req body.

app.get("/cats", (req, res) => {
  res.status(200).json(cats);
});

app.post("/cats", (req, res) => {
  const { name, age, color } = req.body;
  const newCat = { name, age, color };
  cats.push(newCat);
  res.status(201).json(newCat);
});

app.delete("/cats", (req, res) => {
  cats = cats.filter((cat) => cat.name !== req.query.name);
  res.sendStatus(204);
});
```

## Setup Postgres

open a new terminal and run `psql`

```sh
psql postgres
# now you should enter sql prompt
# check you're connected to the right db by getting connection info
\conninfo
```

That should print something similar to the following:

> You are connected to database "postgres" as user "michael" via socket in "/tmp" at port "5432".

```sh
# and to quit it's
\q
```

## Create tables and add some data

Now we can write sql. In the stream we use UI, but if you're familiar with the CLI, you can use the below sql in your `psql` prompt.

```sql
CREATE TABLE cats (
  ID SERIAL PRIMARY KEY,
  name TEXT,
  age INTEGER,
  color TEXT
);

INSERT INTO cats (name, age, color)
  VALUES ('Pumpkin', 4, 'tuxedo'), ('Albie', 12, 'grey');
```

## Connect our API to Db

Add this to `index.js`

```js
const Pool = require("pg").Pool;
const pool = new Pool({
  user: "michael",
  host: "localhost",
  database: "postgres",
  port: 5432,
});
```

## Update existing handlers to use Postgres Db

```js
app.get("/cats", (req, res) => {
  pool.query("SELECT * FROM cats", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

app.post("/cats", (req, res) => {
  const { name, age, color } = req.body;

  pool.query(
    "INSERT INTO cats (name, age, color) VALUES ($1, $2, $3) RETURNING *;",
    [name, age, color],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).send(results.rows[0]);
    }
  );
});

app.delete("/cats", (req, res) => {
  pool.query(
    "DELETE FROM cats WHERE name = $1;",
    [req.query.name],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.sendStatus(204);
    }
  );
});
```
