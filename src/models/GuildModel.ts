import mongoose from "mongoose";
import { z } from "zod";

const GuildSchema = new mongoose.Schema({
    
  guildID: String,
  ownerID: String,
});

export const GuildModel = mongoose.model<typeof GuildSchema>(
  "Guild",
  GuildSchema,
);
