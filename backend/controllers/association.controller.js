import Association from "../models/association.model.js";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";

export const followAssociation = async (req, res, next) => {
  try {
    const { associationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(associationId)) {
      throw createError("Invalid association ID", 400);
    }
    const association = await Association.findById(associationId);
    if (!association) {
      throw createError("Association not found", 404);
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      throw createError("User not found", 404);
    }
    if (association.followers.includes(req.user._id)) {
      throw createError("Already following this association", 400);
    }
    association.followers.push(req.user._id);
    user.followedOrganizations.push(association._id);
    await association.save();
    await user.save();
    res.status(200).json({ success: true, message: "Followed association" });
  } catch (error) {
    next(error);
  }
};

export const unfollowAssociation = async (req, res, next) => {
  try {
    const { associationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(associationId)) {
      throw createError("Invalid association ID", 400);
    }
    const association = await Association.findById(associationId);
    if (!association) {
      throw createError("Association not found", 404);
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      throw createError("User not found", 404);
    }
    if (!association.followers.includes(req.user._id)) {
      throw createError("Not following this association", 400);
    }
    association.followers = association.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    user.followedOrganizations = user.followedOrganizations.filter(
      (id) => id.toString() !== association._id.toString()
    );
    await association.save();
    await user.save();
    res.status(200).json({ success: true, message: "Unfollowed association" });
  } catch (error) {
    next(error);
  }
};

export const getAssociation = async (req, res, next) => {
  try {
    const { associationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(associationId)) {
      throw createError("Invalid association ID", 400);
    }
    const association = await Association.findById(associationId).populate(
      "followers",
      "name email"
    );
    if (!association) {
      throw createError("Association not found", 404);
    }

    const events = await Event.find({ associationId, type: "event" }).populate(
      "associationId",
      "name contact"
    );
    const jobs = await Event.find({ associationId, type: "job" })
      .populate({
        path: "participants",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "pendingApplicants",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("associationId", "name contact");

    console.log(jobs);
    res.status(200).json({
      success: true,
      data: {
        ...association.toObject(),
        events,
        jobs,
      },
    });
  } catch (error) {
    next(error);
  }
};
