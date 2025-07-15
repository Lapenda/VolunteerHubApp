import User from "../models/user.model.js";
import Volunteer from "../models/volunteer.model.js";
import Association from "../models/association.model.js";
import { createError } from "../utils/error.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw createError("User not found", 404);
    }

    const userDetails =
      user.userRole === "volunteer"
        ? await Volunteer.findOne({ userId: user._id }).select("-password")
        : await Association.findOne({ userId: user._id }).select("-password");

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userRole: user.userRole,
      followedOrganizations: user.followedOrganizations,
      ...(user.userRole === "volunteer"
        ? {
            skills: userDetails?.skills,
            availability: userDetails?.availability,
          }
        : {}),
      ...(user.userRole === "organization" ? { association: userDetails } : {}),
    };

    res.status(200).json({ success: true, data: userResponse });
  } catch (error) {
    next(error);
  }
};
