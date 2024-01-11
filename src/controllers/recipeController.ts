// import the necessary modules
import { Recipe } from "../entity/Recipe";
import { IRecipeRequest } from "../interfaces/recipe";
import { Request, Response, NextFunction } from "express";
const FileFilterCallback = require("multer");
const { AppDataSource } = require("typeorm");
const Joi = require("joi");
const multer = require("multer");
const {
  generateToken,
  verifyToken,
  checkAdmin,
  checkOwner,
} = require("../middleware/auth");

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (erro: Error | null, filename: string) => void;

// define the schema for recipe validation
const recipeSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().optional(),
});

// define the multer storage for image upload
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ) => {
    cb(null, "public/images");
  },
  filename: (req: Request, file: Express.Multer.File, cb: FileNameCallback) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// define the multer upload middleware
const upload = multer({ storage: storage });

// define the controller for creating a recipe
exports.createRecipe = [
  verifyToken, // verify the user token
  upload.single("image"), // upload the image file
  async (req: IRecipeRequest, res: Response, next: NextFunction) => {
    try {
      // get the recipe data from the request body
      const { title, description } = req.body;

      // get the image filename from the request file
      const image = req.file ? req.file.filename : null;

      // validate the recipe data
      const { error } = recipeSchema.validate({ title, description, image });

      // if validation failed, return an error
      if (error) {
        return res.status(400).json({ message: error.message });
      }

      // get the user from the request
      const user = req.user;

      // create a new recipe with the user and the data
      const newRecipe = new Recipe();
      newRecipe.title = title;
      newRecipe.description = description;
      newRecipe.image = image;
      newRecipe.user = user;

      // save the recipe to the database
      const recipeRepository = AppDataSource.getRepository(Recipe);
      await recipeRepository.save(newRecipe);

      // send a success message as a response
      res.status(201).json({ message: "Recipe created successfully" });
    } catch (error) {
      // handle any errors
      next(error);
    }
  },
];

// define the controller for getting all recipes
exports.getAllRecipes = [
  verifyToken, // verify the user token
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // find all recipes in the database
      const recipeRepository = AppDataSource.getRepository(Recipe);
      const recipes = await recipeRepository.find();

      // send the recipes as a response
      res.status(200).json(recipes);
    } catch (error) {
      // handle any errors
      next(error);
    }
  },
];

// define the controller for reading a specific recipe
exports.readRecipe = [
  verifyToken, // verify the user token
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get the recipe id from the request params
      const id = req.params.id;

      // validate the id
      if (!id) {
        return res.status(400).json({ message: "Recipe id is required" });
      }

      // find the recipe by id in the database
      const recipeRepository = AppDataSource.getRepository(Recipe);
      const recipe = await recipeRepository.findOne(id);

      // if no recipe found, return an error
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      // if recipe found, send it as a response
      res.status(200).json(recipe);
    } catch (error) {
      // handle any errors
      next(error);
    }
  },
];

// define the controller for updating a recipe
exports.updateRecipe = [
  verifyToken, // verify the user token
  upload.single("image"), // upload the image file
  async (req: IRecipeRequest, res: Response, next: NextFunction) => {
    try {
      // get the recipe data and the recipe id from the request body and params
      const { title, description } = req.body;
      const id = req.params.id;

      // get the image filename from the request file
      const image = req.file ? req.file.filename : null;

      // validate the recipe data
      const { error } = recipeSchema.validate({ title, description, image });

      // if validation failed, return an error
      if (error) {
        return res.status(400).json({ message: error.message });
      }

      // find the recipe by id in the database
      const recipeRepository = AppDataSource.getRepository(Recipe);
      const recipe = await recipeRepository.findOne(id);

      // if no recipe found, return an error
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      // get the user from the request
      const user = req.user;

      // check the authorization and ownership of the user
      if (user.role !== "admin" && recipe.user.id !== user.id) {
        return res
          .status(403)
          .json({ message: "You are not allowed to edit this recipe" });
      }

      // update the recipe with the new data
      await recipeRepository.save({ ...recipe, title, description, image });

      // send a success message as a response
      res.status(200).json({ message: "Recipe updated successfully" });
    } catch (error) {
      // handle any errors
      next(error);
    }
  },
];

// define the controller for deleting a recipe
exports.deleteRecipe = [
  verifyToken, // verify the user token
  async (req: IRecipeRequest, res: Response, next: NextFunction) => {
    try {
      // get the recipe id from the request params
      const id = req.params.id;

      // validate the id
      if (!id) {
        return res.status(400).json({ message: "Recipe id is required" });
      }

      // find the recipe by id in the database
      const recipeRepository = AppDataSource.getRepository(Recipe);
      const recipe = await recipeRepository.findOne(id);

      // if no recipe found, return an error
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      // get the user from the request
      const user = req.user;

      // check the authorization and ownership of the user
      if (user.role !== "admin" && recipe.user.id !== user.id) {
        return res
          .status(403)
          .json({ message: "You are not allowed to delete this recipe" });
      }

      // delete the recipe from the database
      await recipeRepository.delete(id);

      // send a success message as a response
      res.status(200).json({ message: "Recipe deleted successfully" });
    } catch (error) {
      // handle any errors
      next(error);
    }
  },
];
