import mongoose from "mongoose";
import { z } from "zod";

const UserSchema = new mongoose.Schema({
  userID: String,
  guildID: String,
  level: {
    type: Number,
    default: 0,
  },
  xp: {
    type: Number,
    default: 0,
  },
  coins: {
    type: Number,
    default: 0,
  },
  class: {
    type: String,
  },
});

export const UserModel = mongoose.model<typeof UserSchema>("User", UserSchema);
