const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Item = require("../models/item_model");

const cloudinary = require("cloudinary");
const middleware = require("../utils/middleware");

router.post("/", async (req, res) => {
  const body = req.body;

  // FOR USE LATER !!
  // const decodedToken = jwt.verify(req.token, process.env.SECRET);
  // if (!req.token || !decodedToken.id) {
  //   return res.status(401).json({ error: "token missing or invalid" });
  // }

  const id = await uuidv4();
  const item = {
    // user_id: decodedToken.id,
    id,
    name: body.name,
    photo_url: body.photo_url,
    price: body.price,
    description: body.description,
    category: body.category,
  };

  const savedItem = await Item.add(item);

  res.json(savedItem.rows);
});

router.post("/image", middleware.multerUpload, async (req, res) => {
  console.log("made it here");
  console.log("req.body", req.body);
  console.log("req.file", req.file);

  if (req.file !== undefined) {
    const file = await middleware.dataUri(req).content;
    const result = await cloudinary.uploader.upload(file);
    res.json({ result: result.url, name: req.body.name });
  }

  res.json({ result: "", name: req.body.name });
});

router.get("/", async (req, res) => {
  const items = await Item.get();

  res.json(items.rows);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const foundItem = await Item.getOne(id);

  if (foundItem.rows.length === 0) {
    res.status(404).send({ error: "Requested non existing item" });
  } else {
    res.json(foundItem.rows);
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const removedItem = await Item.deleteOne(id);
  if (removedItem.rowCount === 0) {
    res.status(404).send({ error: "Can't delete non existing item" });
  } else {
    res.status(204).send({ success: "item succesfully deleted" });
  }
});

module.exports = router;
