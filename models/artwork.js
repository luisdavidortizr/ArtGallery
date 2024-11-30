// Naming convention for models: use singular form of the represented entity
// Import mongoose
const mongoose = require("mongoose");
// Define data schema (JSON)
const dataSchemaObj = {
  name: { type: String, required: true },
  published: { type: Date },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "ON SALE" },
  image: { type: Buffer },
};
// Create mongoose schema
const artworksSchema = mongoose.Schema(dataSchemaObj);
// Create and import mongoose model
module.exports = mongoose.model("Artwork", artworksSchema);