import { NextFunction, Request, Response } from "express";
import User from "../../Models/UserSchema";
import {
  BadRequestError,
  UnAuthenticatedError,
  UnAuthorizedError,
} from "../../errors";
import { BusinessEmailList } from "../../Models/EmailListSchema";
import { Business } from "../../Models/BusinessSchema";
import { StatusCodes } from "http-status-codes";

const CreateEmailList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userid = req.user;
  const payload = req.body;

  try {
    const activeUser = await User.findById(userid);

    if (!activeUser) {
      throw new UnAuthenticatedError("You need to signin");
    }

    const userBusiness = await Business.findById(activeUser.business);

    if (!userBusiness || userBusiness === null || undefined) {
      throw new UnAuthorizedError(
        "You need to have a business before creating an email list"
      );
    }

    const emailListData = {
      listName: payload.listName,
      listDescription: payload.listDescription,
      listCategory: payload.ListCategory,
      listStatus: payload.listStatus,
      listData: payload.listData,
      listBusinessId: userBusiness._id,
    };

    const newEmailList = await BusinessEmailList.create(emailListData);

    if (!newEmailList) {
      throw new BadRequestError("Unable to create email list");
    }

    userBusiness.emailList.unshift(newEmailList._id);

    await userBusiness.save();
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Opps, unable to process this.`,
    });
  }
};

const ReadAllEmailList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userid = req.user;

  try {
    const activeUser = await User.findById(userid);

    if (!activeUser) {
      throw new UnAuthenticatedError("You need to signin");
    }

    const AllEmailList = await BusinessEmailList.find({
      listBusiness: activeUser.business,
    });

    if (!AllEmailList) {
      throw new UnAuthenticatedError("Email List is empty");
    }

    res.status(StatusCodes.OK).json({
      data: AllEmailList,
      message: "Successfuly retrieved your email list",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Opps, unable to process this.`,
    });
  }
};

const ReadSingleEmailList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userid = req.user;

  const listid = req.params;

  try {
    const activeUser = await User.findById(userid);

    if (!activeUser) {
      throw new UnAuthenticatedError("You need to signin");
    }

    const SingleEmailList = await BusinessEmailList.findById(listid);

    if (!SingleEmailList) {
      throw new UnAuthenticatedError("Email List not found");
    }

    res.status(StatusCodes.OK).json({
      data: SingleEmailList,
      message: "Successfuly retrieved your email list data",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Opps, unable to process this.`,
    });
  }
};

const UpdateEmailList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userid = req.user;
  const payload = req.body;

  try {
    const activeUser = await User.findById(userid);

    if (!activeUser) {
      throw new UnAuthorizedError("You need to signin");
    }

    const SingleEmailList = await BusinessEmailList.findById(payload.listid);

    if (!SingleEmailList) {
      throw new UnAuthenticatedError("Unfortunately, this list does not exist");
    }

    if (payload.data.listBusinessId !== activeUser.business) {
      throw new UnAuthorizedError("");
    }

    const emailListData = {
      listName: payload.data.listName,
      listDescription: payload.data.listDescription,
      listCategory: payload.data.ListCategory,
      listStatus: payload.data.listStatus,
      listData: payload.data.listData,
      listBusinessId: payload.data.listBusinessId,
    };

    const UpdateEmailList = await BusinessEmailList.findByIdAndUpdate(
      payload.listid,
      { emailListData, new: true }
    );

    if (!UpdateEmailList) {
      throw new BadRequestError("Unable to update email list");
    }

    res.status(StatusCodes.OK).json({
      message: "Successfuly retrieved your email list",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Opps, unable to process this.`,
    });
  }
};

const DeleteEmailList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userid = req.user;
  const payload = req.body;

  try {
    const activeUser = await User.findById(userid);

    if (!activeUser) {
      throw new UnAuthorizedError("You need to signin");
    }

    const SingleEmailList = await BusinessEmailList.findById(payload.listid);

    if (!SingleEmailList) {
      throw new UnAuthenticatedError("Unfortunately, this list does not exist");
    }

    if (payload.listBusinessId !== activeUser.business) {
      throw new UnAuthorizedError("");
    }

    const UpdateEmailList = await BusinessEmailList.findByIdAndUpdate(
      payload.listid
    );

    if (!UpdateEmailList) {
      throw new BadRequestError("Unable to delete email list");
    }

    res.status(StatusCodes.OK).json({
      message: "Successfuly deleted your email list",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Opps, unable to process this.`,
    });
  }
};

export  { CreateEmailList, ReadAllEmailList, ReadSingleEmailList, UpdateEmailList, DeleteEmailList };
