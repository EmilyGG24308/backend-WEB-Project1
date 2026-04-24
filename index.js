const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  user: process.env.DATABASE_URL ? undefined : "postgres",
  host: process.env.DATABASE_URL ? undefined : "localhost",
  database: process.env.DATABASE_URL ? undefined : "series",
  password: process.env.DATABASE_URL ? undefined : "1234",
  port: 5432,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS series (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        rating FLOAT,
        genre1 TEXT,
        genre2 TEXT
      );
    `);
    console.log("TABLE READY");
  } catch (err) {
    console.error("TABLE ERROR:", err);
  }
};

createTable();

// ALLL SERIES (get)

app.get("/", async (req, res) => {
  console.log("HIT /series");
  

  try {
    const {q, sort = "id", order= "asc", page=1, limit=4}=req.query;
    const validSortFields = ["id", "name", "rating"];
    const validOrders = ["asc", "desc"];

    const sortField = validSortFields.includes(sort) ? sort : "id";
    const sortOrder = validOrders.includes(order.toLowerCase()) ? order : "asc";
    const offset = (page - 1) * limit;
    let query = "SELECT id, name, description, image_url, rating, genre1, genre2 FROM series ";

    let values = [];
  
    //search by name
    if (q){
      query +=" WHERE name ILIKE $1";
      values.push(`%${q}%`);
    }
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);   
    const result = await pool.query(query, values);
  
    console.log("SENDING:", result.rows);

    return res.status(200).json(result.rows); 

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});


//by id
app.get("/:id", async (req, res) => {
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
app.post("/", async (req, res) => {
  try {
    console.log("REQUEST HIT");

    const { name, description, image_url, rating, genre1, genre2 } = req.body;
    const ratingValue=rating? Number(rating) : null;

    console.log("BODY:", req.body);

    if (!name) {
      console.log("THE NAME IS MISSING");
      return res.status(400).json({ error: "Name is REQUIRED" });
    }

    const result = await pool.query(
      "INSERT INTO series(name, description, image_url, rating, genre1, genre2) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [name, description, image_url, ratingValue, genre1, genre2]
    );

    console.log("INSERT WAS SUCCESSFULL");

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(" FULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

//Put
app.put("//:id", async (req, res) => {
  console.log("BODY RECEIVED:", req.body);

  const {id}=req.params;
  const { name, description, image_url, rating, genre1, genre2 } = req.body;
  

  try {
    // get current data
    const current = await pool.query(
      "SELECT * FROM series WHERE id=$1",
      [id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ error: "series not found" });
    }

    const existing = current.rows[0];

    //only update what was sent
    const updatedName =
      typeof name === "string" && name.trim() !== ""
        ? name
        : existing.name;

    const updatedDescription =
      typeof description === "string" && description.trim() !== ""
        ? description
        : existing.description;

    const updatedImage =
      typeof image_url === "string" && image_url.trim() !== ""
        ? image_url
        : existing.image_url;

    const updatedRating =
      typeof rating === "number" && rating >= 0.5 && rating <= 5
        ? rating
        : existing.rating;

    const updatedGenre1 =
      typeof genre1 === "string" && genre1.trim() !== ""
        ? genre1
        : existing.genre1;

    const updatedGenre2 =
      typeof genre2 === "string" && genre2.trim() !== ""
        ? genre2
        : existing.genre2;

    // update
    const result = await pool.query(
      `UPDATE series 
       SET name=$1, description=$2, image_url=$3, rating=$4, genre1=$5, genre2=$6
       WHERE id=$7
       RETURNING *`,
      [
        updatedName,
        updatedDescription,
        updatedImage,
        updatedRating,
        updatedGenre1,
        updatedGenre2,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// DELETE
app.delete("/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM series WHERE id=$1 RETURNING *", [req.params.id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Not found" });
  }

  res.status(204).send();
});


app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});

