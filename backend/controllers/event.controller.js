import Event from "../models/event.model.js";
import Association from "../models/association.model.js";
import Volunteer from "../models/volunteer.model.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/email.js";
import User from "../models/user.model.js";

export const createEvent = async (req, res, next) => {
  try {
    const { title, date, location, skillsRequired, type } = req.body;
    if (!["event", "job"].includes(type)) {
      throw createError("Invalid type. Must be 'event' or 'job'", 400);
    }
    const association = await Association.findOne({ userId: req.user._id });
    if (!association) {
      throw createError("Only organizations can create events", 403);
    }
    const event = await Event.create({
      title,
      date,
      location,
      skillsRequired: skillsRequired || [],
      type,
      associationId: association._id,
      participants: [],
      pendingApplicants: [],
    });

    const followers = await User.find({
      _id: { $in: association.followers },
    }).select("email");
    const subject = `New Event: ${event.title}`;
    const text = `A new ${event.type} "${event.title}" has been created by ${association.name}.\n\nDetails:\nDate: ${event.date}\nLocation: ${event.location}\nSkills Required: ${event.skillsRequired.join(", ") || "None"}`;
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
    const { location, skills, date, type } = req.query;
    const query = {};
    if (location) query.location = new RegExp(location, "i");
    if (skills)
      query.skillsRequired = { $in: skills.split(",").map((s) => s.trim()) };
    if (date) query.date = { $gte: new Date(date) };
    if (type) query.type = type;
    const events = await Event.find(query).populate(
      "associationId",
      "name contact"
    );
    //console.log(events);
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
    if (event.type === "job") {
      throw createError("Use apply endpoint for jobs", 400);
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

export const applyForJob = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw createError("Invalid job ID", 400);
    }
    const volunteer = await Volunteer.findOne({ userId: req.user._id }).select(
      "-password"
    );
    if (!volunteer) {
      throw createError("Only volunteers can apply for jobs", 403);
    }
    const event = await Event.findById(eventId).populate(
      "associationId",
      "name contact"
    );
    if (!event) {
      throw createError("Job not found", 404);
    }
    if (event.type !== "job") {
      throw createError("This is not a job", 400);
    }

    if (
      event.participants.includes(volunteer._id) ||
      event.pendingApplicants.includes(volunteer._id)
    ) {
      throw createError("Already applied or approved for this job", 400);
    }
    event.pendingApplicants.push(volunteer._id);
    await event.save();

    const associationUser = await Association.findById(
      event.associationId
    ).select("contact");

    const volunteerUser = await User.findById(req.user._id).select("name");
    const subject = `New Job Application: ${event.title}`;
    const text = `Hey, ${volunteerUser.name} wants to apply for your position "${event.title}". Go check your profile to approve or reject the application.`;
    await sendEmail(associationUser.contact, subject, text);

    res.status(200).json({ success: true, message: "Applied for job" });
  } catch (error) {
    next(error);
  }
};

export const approveOrRejectApplication = async (req, res, next) => {
  try {
    const { eventId, volunteerId, action } = req.body;
    if (
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(volunteerId)
    ) {
      throw createError("Invalid job or volunteer ID", 400);
    }
    if (!["approve", "reject"].includes(action)) {
      throw createError("Invalid action", 400);
    }
    const association = await Association.findOne({ userId: req.user._id });
    if (!association) {
      throw createError(
        "Only organizations can approve/reject applications",
        403
      );
    }
    const event = await Event.findById(eventId);
    if (!event) {
      throw createError("Job not found", 404);
    }
    if (event.type !== "job") {
      throw createError("This is not a job", 400);
    }
    if (event.associationId.toString() !== association._id.toString()) {
      throw createError("You can only manage your own jobs", 403);
    }
    if (!event.pendingApplicants.includes(volunteerId)) {
      throw createError("Volunteer not found in pending applicants", 400);
    }

    event.pendingApplicants = event.pendingApplicants.filter(
      (id) => id.toString() !== volunteerId
    );
    const volunteer = await Volunteer.findById(volunteerId).select("userId");
    const volunteerUser = await User.findById(volunteer.userId).select(
      "email name"
    );

    if (action === "approve") {
      event.participants.push(volunteerId);
      await event.save();
      const subject = `Approved for Job: ${event.title}`;
      const text = `Your application for "${event.title}" by ${association.name} has been approved. You are now part of the work group.`;
      await sendEmail(volunteerUser.email, subject, text);
    } else {
      event.pendingApplicants.remove(volunteerId);
      await event.save();
      const subject = `Application Rejected for Job: ${event.title}`;
      const text = `Your application for "${event.title}" by ${association.name} has been rejected.`;
      await sendEmail(volunteerUser.email, subject, text);
    }

    res.status(200).json({ success: true, message: `Application ${action}d` });
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
    const subject = `Cancelled ${event.type === "job" ? "Job" : "Event"}: ${event.title}`;
    const text = `The ${event.type} "${event.title}" by ${association.name} has been cancelled.`;
    for (const participant of participants) {
      await sendEmail(participant.email, subject, text);
    }

    res.status(200).json({
      success: true,
      message: `${event.type === "job" ? "Job" : "Event"} deleted`,
    });
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
