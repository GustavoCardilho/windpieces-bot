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
  element: {
    type: String,
    enum: ["fire", "water", "earth", "wind", "ice", "air"],
  },
  local: {
    type: String,
    enum: ["initial"],
  },
  weapon: {
    type: String,
    enum: ["sword", "bow", "staff", "axe", "dagger"],
  },
  magicPower: {
    type: Number,
    default: 0,
  },
  physicalPower: {
    type: Number,
    default: 0,
  },
  defense: {
    type: Number,
    default: 0,
  },
  speed: {
    type: Number,
    default: 0,
  },
});

export const UserModel = mongoose.model<typeof UserSchema>("User", UserSchema);
