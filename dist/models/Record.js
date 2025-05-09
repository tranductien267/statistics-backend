"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/attendanceModel.ts
const mongoose_1 = __importDefault(require("mongoose"));
const record = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    task: { type: String, required: true },
});
const RecordSchema = mongoose_1.default.model('records', record);
exports.default = RecordSchema;
