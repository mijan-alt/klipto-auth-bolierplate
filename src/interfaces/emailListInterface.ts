import { Document } from "mongodb";
import { Types } from "mongoose";

interface createEmailListInterface extends Document {
    listName: string;
    listDescription: string;
    listCategory: string;
    listStatus: string;
    listData: object[];
    listBusiness: Types.ObjectId;
}

export {
    createEmailListInterface
};

