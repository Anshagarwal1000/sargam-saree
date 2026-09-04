import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    profilePic: {
      type: String,
      default: "",
    }, // Cloudinary image URL

    profilePicPublicId: {
      type: String,
      default: "",
    }, // Cloudinary public ID

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token:{type:String,default:null},
    

  },
    
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
