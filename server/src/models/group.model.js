import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({}, { timestamps: true });

export const Group = mongoose.model("Group", groupSchema);
