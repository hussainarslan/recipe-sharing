// import the necessary modules
var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController");

// define the route for user signup
router.post("/signup", userController.signup);

// define the route for user login
router.post("/login", userController.login);

// export the router
module.exports = router;
