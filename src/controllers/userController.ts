// import the necessary modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("typeorm");
const { User } = require("../entity/User");
import { Request, Response, NextFunction } from "express";
const {
  generateToken,
  verifyToken,
  checkAdmin,
} = require("../middleware/auth");

// define the controller for user signup
exports.signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get the username and password from the request body
    const { username, password } = req.body;

    // validate the input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // check if the username already exists
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user with the role 'normal'
    const newUser = new User();
    newUser.username = username;
    newUser.password = hashedPassword;
    newUser.role = "normal";

    // save the user to the database
    await userRepository.save(newUser);

    // generate a token for the user
    const token = generateToken(newUser);

    // send the token as a response
    res.status(201).json({ token });
  } catch (error) {
    // handle any errors
    next(error);
  }
};

// define the controller for user login
exports.login = async (req, res, next) => {
  try {
    // get the username and password from the request body
    const { username, password } = req.body;

    // validate the input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // check if the username exists in the database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ username });

    // if the username does not exist, return an error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // compare the password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // if the passwords do not match, return an error
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // if the passwords match, generate a token for the user
    const token = generateToken(user);

    // send the token as a response
    res.status(200).json({ token });
  } catch (error) {
    // handle any errors
    next(error);
  }
};
