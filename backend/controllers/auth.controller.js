import mongoose from "mongoose";
import User from "../models/user.model.js";
import Volunteer from "../models/volunteer.model.js";
import Association from "../models/association.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validatePassword = async (inputPassword, storedPassword) => {
  const isValid = await bcrypt.compare(inputPassword, storedPassword);
  if (!isValid) {
    throw createError("Invalid credentials", 400);
  }
};

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      email,
      password,
      userRole,
      association,
      skills,
      availability,
    } = req.body;

    if (!password || password.length < 6) {
      throw createError("Password must be at least 6 characters", 400);
    }

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      throw createError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create(
      [{ name, email, password: hashedPassword, userRole }],
      { session }
    );

    let userDetails;
    if (userRole === "volunteer") {
      userDetails = await Volunteer.create(
        [{ userId: user[0]._id, skills, availability }],
        { session }
      );
    } else if (userRole === "organization") {
      userDetails = await Association.create(
        [{ userId: user[0]._id, ...association }],
        { session }
      );
    }

    const token = jwt.sign({ userId: user[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const userResponse = {
      id: user[0]._id,
      name: user[0].name,
      email: user[0].email,
      userRole: user[0].userRole,
      ...(userRole === "volunteer"
        ? {
            skills: userDetails[0].skills,
            availability: userDetails[0].availability,
          }
        : {}),
      ...(userRole === "organization" ? { association: userDetails[0] } : {}),
    };

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { token, user: userResponse },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const signIn = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password } = req.body;

    if (!password || password.length < 6) {
      throw createError("Password must be at least 6 characters", 400);
    }

    const user = await User.findOne({ email }).session(session);
    if (!user) {
      throw createError("Invalid credentials", 400);
    }

    await validatePassword(password, user.password);

    const userDetails =
      user.userRole === "volunteer"
        ? await Volunteer.findOne({ userId: user._id }).session(session)
        : await Association.findOne({ userId: user._id }).session(session);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userRole: user.userRole,
      ...(user.userRole === "volunteer"
        ? {
            skills: userDetails?.skills,
            availability: userDetails?.availability,
          }
        : {}),
      ...(user.userRole === "organization" ? { association: userDetails } : {}),
    };

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: { token, user: userResponse },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
