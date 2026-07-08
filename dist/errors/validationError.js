"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const httpError_1 = require("./httpError");
class ValidationError extends httpError_1.HttpError {
    constructor(message = 'Validation failed') {
        super(400, message);
    }
}
exports.ValidationError = ValidationError;
