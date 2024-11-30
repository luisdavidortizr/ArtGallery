var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// Router Objects
var indexRouter = require("./routes/index");
var artworksRouter = require("./routes/artworks");
var authorsRouter = require("./routes/authors");
// var usersRouter = require('./routes/users');
// Import MongoDB and Configuration modules
var mongoose = require("mongoose");
var configs = require("./configs/globals");
// HBS Helper Methods
var hbs = require("hbs");
// Import passport and session modules
var passport = require('passport');
var session = require('express-session');
// Import user model
var User = require('./models/user');
const { profile } = require("console");
// Import GitHub Strategy
var GithubStrategy = require('passport-github2').Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
// Express App Object
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// Express Configuration
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// Configure passport module https://www.npmjs.com/package/express-session
app.use(session({
  secret: 's2021pr0j3ctTracker',
  resave: false,
  saveUninitialized: false
}));
// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
// Link passport to the user model
passport.use(User.createStrategy());
// configure github strategy
passport.use(new FacebookStrategy({
  clientID: configs.Authentication.facebook.ClientId,
  clientSecret: configs.Authentication.facebook.ClientSecret,
  callbackURL: configs.Authentication.facebook.CallbackUrl
}, async (accessToken, refreshToken, profile, done) => {
  // search user by ID
  const user = await User.findOne({ oauthId: profile.id });
  // user exists (returning user)
  if (user) {
    // no need to do anything else
    return done(null, user);
  }
  else {
    // new user so register them in the db
    const newUser = new User({
      username: profile.username,
      oauthId: profile.id,
      oauthProvider: 'facebook',
      created: Date.now()
    });
    // add to DB
    const savedUser = await newUser.save();
    // return
    return done(null, savedUser);
  }
}));
passport.use(new GithubStrategy({
  clientID: configs.Authentication.github.ClientId,
  clientSecret: configs.Authentication.github.ClientSecret,
  callbackURL: configs.Authentication.github.CallbackUrl
}, async (accessToken, refreshToken, profile, done) => {
  const user = await User.findOne({ oauthId: profile.id });
  if (user) {
    return done(null, user);
  } else {
    const newUser = new User({
      username: profile.username,
      oauthId: profile.id,
      oauthProvider: "github",
      created: Date.now()
    });
    const savedUser = await newUser.save();
    return done(null, savedUser);
  }
}));
// Set passport to write/read user data to/from session object
passport.serializeUser((user, done) => {
  done(null, user.id);  // Use user ID or a unique identifier
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


// Routing Configuration
app.use("/", indexRouter);
app.use("/artworks", artworksRouter);
app.use('/authors', authorsRouter);
// app.use('/users', usersRouter);
// Connecting to the DB
mongoose
  .connect(configs.ConnectionStrings.MongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((message) => console.log("Connected Successfully!"))
  .catch((error) => console.log(`Error while connecting: ${error}`));
// Sub-Expressions https://handlebarsjs.com/guide/builtin-helpers.html#sub-expressions
// function name and helper function with parameters
hbs.registerHelper("createOptionElement", (currentValue, selectedValue) => {
  console.log(currentValue + " " + selectedValue);
  // initialize selected property
  var selectedProperty = "";
  // if values are equal set selectedProperty accordingly
  if (currentValue == selectedValue.toString()) {
    selectedProperty = "selected";
  }
  // return html code for this option element
  // return new hbs.SafeString('<option '+ selectedProperty +'>' + currentValue + '</option>');
  return new hbs.SafeString(
    `<option ${selectedProperty}>${currentValue}</option>`
  );
});
// helper function to format date values
hbs.registerHelper('toShortDate', (longDateValue) => {
  return new hbs.SafeString(longDateValue.toLocaleDateString('en-CA'));
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
