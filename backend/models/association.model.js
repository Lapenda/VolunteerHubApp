import mongoose from "mongoose";

const associationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Association Name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    contact: {
      type: String,
      required: [true, "Contact is required"],
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Association", associationSchema);
