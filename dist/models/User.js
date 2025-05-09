"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/userModel.ts
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    usercode: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
});
const User = mongoose_1.default.model('User', userSchema, 'user');
exports.default = User;
