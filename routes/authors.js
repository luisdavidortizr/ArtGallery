const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const AuthenticationMiddleware = require("../extensions/authentication");

// GET /Authors/
router.get("/", async (req, res, next) => {
  let authors = await Author.find().sort([["name", "ascending"]]);
  res.render("authors/index", { title: "Author List", dataset: authors, user: req.user });
});

// GET /Authors/Add
router.get("/add", AuthenticationMiddleware, (req, res, next) => {
  res.render("authors/add", { title: "Add a new Author", user: req.user });
});

// POST /Authors/Add
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  let newAuthor = new Author({
    name: req.body.name,
    authorId: req.body.authorId,
  });
  await newAuthor.save();
  res.redirect("/authors");
});

module.exports = router;