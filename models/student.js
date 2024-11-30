// Naming convention for models: use singular form of the represented entity
// Import mongoose
const mongoose = require("mongoose");
// Define data schema (JSON)
const dataSchemaObj = {
  name: { type: String, required: true },
  birthday: { type: Date },
  course: { type: String, required: true },
  status: { type: String, default: "PASSED" },
};
// Create mongoose schema
const studentsSchema = mongoose.Schema(dataSchemaObj);
// Create and import mongoose model
module.exports = mongoose.model("Student", studentsSchema);