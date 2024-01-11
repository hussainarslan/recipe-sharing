// import the necessary modules
var express = require("express");
var router = express.Router();
var recipeController = require("../controllers/recipeController");

//define the route for all recipes
router.get("/", recipeController.getAllRecipes);

// define the route for reading specific recipe
router.get("/:id", recipeController.readRecipe);

// define the route for recipe creation
router.post("/create", recipeController.createRecipe);

// define the route for updating specific recipe
router.put("/update/:id", recipeController.updateRecipe);

// define the route for deleting specific recipe
router.delete("/delete/:id", recipeController.deleteRecipe);

// export the router
module.exports = router;
