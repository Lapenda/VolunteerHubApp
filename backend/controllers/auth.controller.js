import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    if (!password || password.length < 6) {
      throw createError("Password must be at least 6 characters");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw createError("User already exists", 409);
    }

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session }
    );

    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const userResponse = {
      id: newUsers[0]._id,
      name: newUsers[0].name,
      email: newUsers[0].email,
    };

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password } = req.body;

    if (!password || password.length < 6) {
      throw createError("Password must be at least 6 characters");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw createError("Error signing in", 400);
    }

    await validatePassword(password, user.password);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

//export const signOut = async (req, res, next) => {};

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validatePassword = async (inputPassword, storedPassword) => {
  const isValid = await bcrypt.compare(inputPassword, storedPassword);
  if (!isValid) {
    throw createError("Error signing in", 400);
  }
};
