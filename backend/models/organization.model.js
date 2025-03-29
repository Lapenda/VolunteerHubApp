import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization Name is required"],
      minLength: 2,
      maxLength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Organization Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email adress"],
    },
    password: {
      type: String,
      required: [true, "User Password is required"],
      minLength: 6,
    },
    type: {},
  },
  { timestamps: true }
);

const organization = new mongoose.model("Organization", organizationSchema);

export default organization;
