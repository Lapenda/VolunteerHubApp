import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    skills: {
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
    availability: {
      type: [availabilitySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Volunteer", volunteerSchema);
