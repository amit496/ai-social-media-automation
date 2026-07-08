"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const publisherController_1 = require("../controllers/publisherController");
const trendingController_1 = require("../controllers/trendingController");
const requestValidation_1 = require("../middleware/requestValidation");
const router = express_1.default.Router();
router.get('/health', trendingController_1.getHealth);
router.get('/trending', trendingController_1.getTrendingTopics);
router.get('/topic', trendingController_1.getBestTopic);
router.post('/generate', requestValidation_1.validateGeneratePayload, trendingController_1.generateContent);
router.post('/publish', requestValidation_1.validatePublishPayload, publisherController_1.publishContent);
router.get('/published', publisherController_1.getPublishedPosts);
router.get('/scheduled', publisherController_1.getScheduledPosts);
exports.default = router;
