import Volunteer from "../models/volunteer.model.js";
import { createError } from "../utils/error.js";

export const getVolunteerByUserId = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findOne({
      userId: req.params.userId,
    }).select("_id");
    if (!volunteer) {
      throw createError("Volunteer not found", 404);
    }
    res.status(200).json({ success: true, data: volunteer });
  } catch (error) {
    next(error);
  }
};
