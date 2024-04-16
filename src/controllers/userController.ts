import User from "../Models/User.js";
import express from 'express'
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const getSingleUser = async (req: Request, res: Response) => {
    const id = req.params.id
    
    try {
        const user = await User.findById(id)

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({message:"User not found"})
        }

        const oldUser = await User.findById(id).populate('businesses')

        res.status(StatusCodes.OK).json({
            oldUser
        })
    } catch (error) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:"Oops there was an error"})
    }

}