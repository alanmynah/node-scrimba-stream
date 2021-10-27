const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "michael",
  host: "localhost",
  database: "postgres",
  port: 5432,
});

app.get("/", (req, res) => {
  res.send("Hello from Scrimba!");
});

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

app.listen(port, () => console.log(`Listening on port ${port}!`));
