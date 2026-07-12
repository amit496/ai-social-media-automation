"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const appConfig_1 = require("./config/appConfig");
const mongo_1 = require("./config/mongo");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const notFoundMiddleware_1 = require("./middleware/notFoundMiddleware");
const trendingRoutes_1 = __importDefault(require("./routes/trendingRoutes"));
const schedulerService_1 = require("./services/schedulerService");
const autoPostService_1 = require("./services/autoPostService");
const logger_1 = require("./utils/logger");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api', trendingRoutes_1.default);
    app.use(notFoundMiddleware_1.notFoundMiddleware);
    app.use(errorMiddleware_1.errorMiddleware);
    return app;
};
exports.createApp = createApp;
const startServer = async () => {
    await (0, mongo_1.connectMongo)();
    const app = (0, exports.createApp)();
    const port = appConfig_1.appConfig.port;
    app.listen(port, () => {
        logger_1.logger.info(`AI Social Media Automation API running on http://localhost:${port}`);
        setInterval(() => {
            schedulerService_1.schedulerService.runPendingScheduledPosts().catch((err) => {
                logger_1.logger.error(`Scheduled post runner failed: ${err.message}`);
            });
        }, 60000);
        if (appConfig_1.appConfig.autoPostEnabled) {
            autoPostService_1.autoPostService.start();
        }
        else {
            logger_1.logger.info('Auto-posting is disabled via AUTO_POST_ENABLED=false');
        }
    });
};
exports.startServer = startServer;
if (require.main === module) {
    (0, exports.startServer)().catch((err) => {
        logger_1.logger.error(`Server failed to start: ${err.message}`);
        process.exit(1);
    });
}
