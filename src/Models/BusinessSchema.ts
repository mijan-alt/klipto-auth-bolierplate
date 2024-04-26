import mongoose, { Schema } from "mongoose";
import { BusinessInterface } from "../interfaces/userAuthInterface";

const businessSchema = new mongoose.Schema<BusinessInterface>({
  businessName: { type: String, required: true },
  businessEmail: { type: String, required: true },
  businessCategory: { type: String, required: true },
  businessBio: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
});

export const Business = mongoose.model<BusinessInterface>(
  "Business",
  businessSchema
);
