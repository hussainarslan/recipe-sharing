import { Request, Response, NextFunction } from "express";
import { IRecipeRequest } from "../interfaces/recipe";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Recipe } from "../entity/Recipe";
import { FindOneOptions } from "typeorm";

require("dotenv").config();

const { SECRET } = process.env;
// a secret key for generating and verifying tokens

// a function to generate a token for a user
const generateToken = (user: User) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    SECRET,
    { expiresIn: "1h" }
  );
};

// a function to verify a token and attach the user to the request
const verifyToken = (
  req: IRecipeRequest,
  res: Response,
  next: NextFunction
) => {
  // get the token from the header
  const token = req.headers["authorization"];

  // if no token, return an error
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // verify the token
  jwt.verify(token, SECRET, async (err, decoded) => {
    // if verification failed, return an error
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // if verification succeeded, get the user from the database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne(decoded.id);

    // if no user found, return an error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // if user found, attach it to the request and call the next middleware
    req.user = user;
    next();
  });
};

// a function to check if the user is an admin
const checkAdmin = (req: IRecipeRequest, res: Response, next: NextFunction) => {
  // get the user from the request
  const user = req.user as User;

  // if the user is not an admin, return an error
  if (user.role !== "admin") {
    return res.status(403).json({ message: "You are not an admin" });
  }

  // if the user is an admin, call the next middleware
  next();
};

// a function to check if the user is the owner of a recipe
const checkOwner = async (
  req: IRecipeRequest,
  res: Response,
  next: NextFunction
) => {
  // get the user and the recipe id from the request
  const user = req.user as User;
  const recipeId = Number(req.params.id);

  // validate the id
  if (!recipeId) {
    return res.status(400).json({ message: "Recipe id is required" });
  }
  const recipeRepository = AppDataSource.getRepository(Recipe);
  // get the recipe from the database
  const options: FindOneOptions<Recipe> = {
    where: {
      id: recipeId,
    },
  };
  const recipe = await recipeRepository.findOne(options);

  // if no recipe found, return an error
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  // if the user is not the owner of the recipe, return an error
  if (recipe.user.id !== user.id) {
    return res
      .status(403)
      .json({ message: "You are not the owner of this recipe" });
  }

  // if the user is the owner of the recipe, call the next middleware
  next();
};

// export the functions
export { generateToken, verifyToken, checkAdmin, checkOwner };
