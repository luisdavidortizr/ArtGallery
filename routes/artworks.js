// Naming convention > controllers/routers are plural
// Import express and create router object
const express = require("express");
const router = express.Router();
// Import mongoose model to be used
const Artwork = require("../models/artwork");
const Author = require("../models/author");
// Moved middleware function to extensions/authentication.js to make it reusable across different routers
const AuthenticationMiddleware = require("../extensions/authentication");
// Custom Middleware function to check for an authenticated user
// function AuthenticationMiddleware(req, res, next) {
//     if (req.isAuthenticated()) { // returns true if the session was started
//         return next(); // calls the next middleware in the stack
//     }
//     else {
//         // user not authenticated
//         res.redirect("/login");
//     }
// }

// Configure multer for uploading images
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure GET/POST handlers
// Path relative to the one configured in app.js > /artworks
// GET /artworks/
router.get("/", async (req, res, next) => {
  // retrieve ALL data, and sort by published
  let artworks = await Artwork.find().sort([["published", "descending"]]);

  artworks = artworks.map((artwork) => {
    if (artwork.image) {
      artwork.image = artwork.image.toString("base64");
    }
    return artwork;
  });

  // render view
  res.render("artworks/index", {
    title: "Artworks",
    dataset: artworks,
    user: req.user,
  });
});

// GET /artworks/add
router.get("/add", AuthenticationMiddleware, async (req, res, next) => {
  let authorList = await Author.find().sort([["name", "ascending"]]);
  res.render("artworks/add", {
    title: "Add a New Artwork",
    authors: authorList,
    user: req.user,
  });
});

// POST /artworks/add
router.post("/add", AuthenticationMiddleware, upload.single("image"), async (req, res, next) => {
  // use the artwork module to save data to DB
  // use the new Artwork() method of the model
  // and map the fields with data from the request
  // newArtwork object is returned if operation was successful
  // save changes and redirect
  let newArtwork = new Artwork({
    name: req.body.name,
    published: req.body.published ? new Date(req.body.published) : null,
    author: req.body.author,
    price: req.body.price,
    image: req.file ? req.file.buffer : null
  });
  await newArtwork.save();
  res.redirect("/artworks");
});

// GET /artworks/delete/_id
// access parameters via req.params object
router.get("/delete/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let artworkId = req.params._id;
  await Artwork.findByIdAndRemove({ _id: artworkId });
  res.redirect("/artworks");
});

// GET /artworks/edit/_id
router.get("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let artworkId = req.params._id;
  let artworkData = await Artwork.findById(artworkId);
  let authorList = await Author.find().sort([["name", "ascending"]]);
  res.render("artworks/edit", {
    title: "Edit Artwork Info",
    artwork: artworkData,
    authors: authorList,
    user: req.user,
  });
});

// POST /artworks/edit/_id
router.post("/edit/:_id", AuthenticationMiddleware, upload.single("image"), async (req, res, next) => {
  let artworkId = req.params._id;
  let artwork = Artwork.findById(artworkId);

  let updateData = {
    name: req.body.name,
    published: req.body.published,
    author: req.body.author,
    price: req.body.price,
    status: req.body.status,
  };

  if (req.file) {
    updateData.image = req.file.buffer;
  } else {
    updateData.image = artwork.image;
  }

  await Artwork.findByIdAndUpdate(artworkId, updateData);
  res.redirect("/artworks");
});

// Export router object
module.exports = router;
