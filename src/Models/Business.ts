import mongoose from "mongoose";
import { BusinessInterface } from "../Interface";


const businessSchema = new mongoose.Schema<BusinessInterface>({
  businessName: { type: String, required: true },
  businessEmail: { type: String, required: true },
  businessCategory: { type: String, required: true },
  businessBio: { type: String, required: true },
});

export const Business = mongoose.model<BusinessInterface>("Business", businessSchema);
