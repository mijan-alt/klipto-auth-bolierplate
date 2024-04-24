"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
class UnAuthenticatedError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.error = message;
        this.statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
    }
}
exports.default = UnAuthenticatedError;
