const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "series",
  password: "1234",
  port: 5432,
});

// ALLL SERIES (get)
app.get("/series", async (req, res) => {
  const result = await pool.query("SELECT * FROM series");
  res.json(result.rows);
});


//by id
app.get("/series/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM series WHERE id=$1",
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(result.rows[0]);
});

//POST
app.post("/series", async (req, res) => {
  try {
    console.log("REQUEST HIT");

    const { name, description, image_url } = req.body;

    console.log("BODY:", req.body);

    if (!name) {
      console.log("THE NAME IS MISSING");
      return res.status(400).json({ error: "Name is REQUIRED" });
    }

    const result = await pool.query(
      "INSERT INTO series(name, description, image_url) VALUES($1,$2,$3) RETURNING *",
      [name, description, image_url]
    );

    console.log("INSERT WAS SUCCESSFULL");

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("💥 FULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
//Put
app.put("/series/:id", async (req, res) => {
  const { name, description, image_url } = req.body;

  const result = await pool.query(
    "UPDATE series SET name=$1, description=$2, image_url=$3 WHERE id=$4 RETURNING *",
    [name, description, image_url, req.params.id]
  );

  res.json(result.rows[0]);
});

// DELETE
app.delete("/series/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM series WHERE id=$1 RETURNING *", [req.params.id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(result.rows[0]);
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});

