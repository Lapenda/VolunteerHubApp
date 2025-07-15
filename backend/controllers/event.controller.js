import Event from "../models/event.model.js";
import Association from "../models/association.model.js";
import Volunteer from "../models/volunteer.model.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/email.js";
import User from "../models/user.model.js";

export const createEvent = async (req, res, next) => {
  try {
    const { title, date, location, skillsRequired } = req.body;
    const association = await Association.findOne({ userId: req.user._id });
    if (!association) {
      throw createError("Only organizations can create events", 403);
    }
    const event = await Event.create({
      title,
      date,
      location,
      skillsRequired: skillsRequired || [],
      associationId: association._id,
    });

    const followers = await User.find({
      _id: { $in: association.followers },
    }).select("email");
    const subject = `New Event: ${event.title}`;
    const text = `A new event "${event.title}" has been created by ${association.name}.\n\nDetails:\nDate: ${event.date}\nLocation: ${event.location}\nSkills Required: ${event.skillsRequired.join(", ") || "None"}`;
    for (const follower of followers) {
      await sendEmail(follower.email, subject, text);
    }

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const searchEvents = async (req, res, next) => {
  try {
    const { location, skills, date } = req.query;
    const query = {};
    if (location) query.location = new RegExp(location, "i");
    if (skills)
      query.skillsRequired = { $in: skills.split(",").map((s) => s.trim()) };
    if (date) query.date = { $gte: new Date(date) };
    const events = await Event.find(query).populate(
      "associationId",
      "name contact"
    );
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (req, res, next) => {
  try {
    if (
      !req.params.eventId ||
      !mongoose.Types.ObjectId.isValid(req.params.eventId)
    ) {
      throw createError("Invalid event ID", 400);
    }
    const volunteer = await Volunteer.findOne({
      userId: req.user._id,
    }).select("-password");
    if (!volunteer) {
      throw createError("Only volunteers can register for events", 403);
    }
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      throw createError("Event not found", 404);
    }
    if (event.participants.includes(volunteer._id)) {
      throw createError("Already registered for this event", 400);
    }
    event.participants.push(volunteer._id);
    await event.save();
    res.status(200).json({ success: true, message: "Registered for event" });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, date, location, skillsRequired } = req.body;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw createError("Invalid event ID", 400);
    }
    const association = await Association.findOne({ userId: req.user._id });
    if (!association) {
      throw createError("Only organizations can update events", 403);
    }
    const event = await Event.findById(eventId);
    if (!event) {
      throw createError("Event not found", 404);
    }

    if (event.associationId.toString() !== association._id.toString()) {
      throw createError("You can only update your own events", 403);
    }
    event.title = title || event.title;
    event.date = date ? new Date(date) : event.date;
    event.location = location || event.location;
    event.skillsRequired = skillsRequired || event.skillsRequired;
    await event.save();
    await event.populate("associationId", "name contact");

    const volunteers = await Volunteer.find({
      _id: { $in: event.participants },
    }).select("userId");
    const userIds = volunteers.map((v) => v.userId);
    const participants = await User.find({ _id: { $in: userIds } }).select(
      "email"
    );
    const subject = `Updated Event: ${event.title}`;
    const text = `The event "${event.title}" by ${association.name} has been updated.\n\nDetails:\nDate: ${event.date}\nLocation: ${event.location}\nSkills Required: ${event.skillsRequired.join(", ") || "None"}`;
    for (const participant of participants) {
      await sendEmail(participant.email, subject, text);
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw createError("Invalid event ID", 400);
    }
    const association = await Association.findOne({ userId: req.user._id });
    if (!association) {
      throw createError("Only organizations can delete events", 403);
    }
    const event = await Event.findById(eventId);
    if (!event) {
      throw createError("Event not found", 404);
    }
    if (event.associationId.toString() !== association._id.toString()) {
      throw createError("You can only delete your own events", 403);
    }
    await event.deleteOne();

    const volunteers = await Volunteer.find({
      _id: { $in: event.participants },
    }).select("userId");
    const userIds = volunteers.map((v) => v.userId);
    const participants = await User.find({ _id: { $in: userIds } }).select(
      "email"
    );
    const subject = `Cancelled Event: ${event.title}`;
    const text = `The event "${event.title}" by ${association.name} has been cancelled.`;
    for (const participant of participants) {
      await sendEmail(participant.email, subject, text);
    }

    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw createError("Invalid event ID", 400);
    }
    const event = await Event.findById(eventId).populate(
      "associationId",
      "name contact"
    );
    if (!event) {
      throw createError("Event not found", 404);
    }
    console.log(event);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};
