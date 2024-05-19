const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/comparar/planillasistema", async (req, res) => {
  const rows = req.body;

  try {
    const insertPromises = rows.map((row) => {
      return pool.query(
        `INSERT INTO planillasistema (code, codbarras, descripcion, marca, unxcaja, quantityu, quanitityb, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          row.code,
          row.codbarras,
          row.descripcion,
          row.marca,
          row.unxcaja,
          row.quantityu,
          row.quanitityb,
          row.total,
        ]
      );
    });

    await Promise.all(insertPromises);
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/planillasistema", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM planillasistema");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});



router.post("/comparar/planillaoperador", async (req, res) => {
  const rows = req.body;

  try {
    const insertPromises = rows.map((row) => {
      return pool.query(
        `INSERT INTO planillaoperador (code, codbarras, descripcion, marca, unxcaja, quantityu, quanitityb, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          row.code,
          row.codbarras,
          row.descripcion,
          row.marca,
          row.unxcaja,
          row.quantityu,
          row.quanitityb,
          row.total,
        ]
      );
    });

    await Promise.all(insertPromises);
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/comparar/planillaoperador", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM planillaoperador");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
