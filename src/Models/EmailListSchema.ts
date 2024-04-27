import mongoose, { Schema } from "mongoose";
import { EmailListInterface } from "../interfaces/emailListInterface";

const BusinessEmailListData = new mongoose.Schema<EmailListInterface>({
  listName: {
    type: "string",
    required: true,
  },
  listDescription: {
    type: "string",
    required: true,
  },
  listCategory: {
    type: "string",
    required: true,
  },
  listStatus: {
    type: "string",
    required: true,
    enum: ["active", "disabled"],
  },
  listData: {
    type: [Schema.Types.Mixed],
    required: true,
  },
  listBusiness: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Business",
  },
});

export const BusinessEmailList = mongoose.model(
  "BusinessEmailList",
  BusinessEmailListData
);
