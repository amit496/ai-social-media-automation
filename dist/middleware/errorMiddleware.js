"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const httpError_1 = require("../errors/httpError");
const logger_1 = require("../utils/logger");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof httpError_1.HttpError) {
        return res.status(err.status).json({ success: false, error: err.message });
    }
    if (err instanceof SyntaxError &&
        'status' in err &&
        err.status === 400 &&
        'body' in err) {
        return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
    }
    const errorMessage = err.message || 'Internal server error';
    logger_1.logger.error(`${req.method} ${req.path} - ${errorMessage}`);
    return res.status(500).json({ success: false, error: errorMessage });
};
exports.errorMiddleware = errorMiddleware;
