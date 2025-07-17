import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event Title is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    date: {
      type: Date,
      required: [true, "Event Date is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxLength: 200,
    },
    skillsRequired: {
      type: [String],
      default: [],
      validate: {
        validator: (skills) =>
          skills.every(
            (skill) => typeof skill === "string" && skill.length > 0
          ),
        message: "Skills must be non-empty strings",
      },
    },
    type: {
      type: String,
      enum: ["event", "job"],
      required: [true, "Type is required"],
      default: "event",
    },
    associationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Association",
      required: [true, "Association ID is required"],
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Volunteer",
      },
    ],
    pendingApplicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Volunteer",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
