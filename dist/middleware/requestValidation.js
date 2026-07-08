"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePublishPayload = exports.validateGeneratePayload = void 0;
const validationError_1 = require("../errors/validationError");
const validateGeneratePayload = (req, res, next) => {
    const { topic } = req.body;
    if (topic && typeof topic !== 'string') {
        throw new validationError_1.ValidationError('topic must be a string');
    }
    next();
};
exports.validateGeneratePayload = validateGeneratePayload;
const validatePublishPayload = (req, res, next) => {
    const { topic, platform, scheduleFor } = req.body;
    if (!topic || typeof topic !== 'string') {
        throw new validationError_1.ValidationError('topic is required and must be a string');
    }
    if (!platform || (platform !== 'facebook' && platform !== 'instagram')) {
        throw new validationError_1.ValidationError('platform is required and must be facebook or instagram');
    }
    if (scheduleFor && typeof scheduleFor !== 'string') {
        throw new validationError_1.ValidationError('scheduleFor must be a string');
    }
    next();
};
exports.validatePublishPayload = validatePublishPayload;
