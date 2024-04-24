"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userController_js_1 = require("../controllers/userController.js");
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
userRouter.route("/single-user/:id").get(userController_js_1.getSingleUser);
exports.default = userRouter;
