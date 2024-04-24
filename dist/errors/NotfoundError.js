"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
class NotfoundError extends Error {
    constructor(message) {
        super(message);
        this.error = message;
        this.statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
        this.message = message;
    }
}
exports.default = NotfoundError;
