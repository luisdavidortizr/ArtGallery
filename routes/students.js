// Naming convention > controllers/routers are plural
// Import express and create router object
const express = require("express");
const router = express.Router();
// Import mongoose model to be used
const Student = require("../models/student");
const Course = require("../models/course");
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
// Configure GET/POST handlers
// Path relative to the one configured in app.js > /students
// GET /students/
router.get("/", async (req, res, next) => {
  // retrieve ALL data, and sort by birthday
  let students = await Student.find().sort([["birthday", "descending"]]);
  // render view
  res.render("students/index", {
    title: "Student Tracker",
    dataset: students,
    user: req.user,
  });
});
// GET /students/add
router.get("/add", AuthenticationMiddleware, async (req, res, next) => {
  let courseList = await Course.find().sort([["name", "ascending"]]);
  res.render("students/add", {
    title: "Add a New Student",
    courses: courseList,
    user: req.user,
  });
});

// POST /students/add
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  // use the student module to save data to DB
  // use the new Student() method of the model
  // and map the fields with data from the request
  // newStudent object is returned if operation was successful
  // save changes and redirect
  let newStudent = new Student({
    name: req.body.name,
    birthday: req.body.birthday ? new Date(req.body.birthday) : null,
    course: req.body.course,
  });
  await newStudent.save();
  res.redirect("/students");
});

// GET /students/delete/_id
// access parameters via req.params object
router.get("/delete/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let studentId = req.params._id;
  await Student.findByIdAndRemove({ _id: studentId });
  res.redirect("/students");
});

// GET /students/edit/_id
router.get("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let studentId = req.params._id;
  let studentData = await Student.findById(studentId);
  let courseList = await Course.find().sort([["name", "ascending"]]);
  res.render("students/edit", {
    title: "Edit Student Info",
    student: studentData,
    courses: courseList,
    user: req.user,
  });
});

// POST /students/edit/_id
router.post("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let studentId = req.params._id;
  await Student.findByIdAndUpdate(
    { _id: studentId }, // filter to find the student to update
    {
      // updated data
      name: req.body.name,
      birthday: req.body.birthday,
      course: req.body.course,
      status: req.body.status,
    }
  );
  res.redirect("/students");
});

// Export router object
module.exports = router;
