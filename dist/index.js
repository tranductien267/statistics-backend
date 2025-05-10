"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const User_1 = __importDefault(require("./models/User"));
const Record_1 = __importDefault(require("./models/Record"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cors());
// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));
// API login
app.get('/', (req, res) => {
  res.send('Hello Railway!');
});
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('login request');
    const { usercode, password } = req.body;
    if (!usercode || !password) {
        return res.status(400).json({ message: 'User ID and password are required' });
    }
    try {
        // Kiểm tra người dùng có tồn tại trong cơ sở dữ liệu không
        console.log("find : " + usercode);
        const user = yield User_1.default.findOne({ usercode: usercode });
        console.log("find : " + user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Kiểm tra mật khẩu
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        res.status(200).json({ user: user });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
// API submit attendance (chấm công)
app.post('/api/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, date, location, startTime, endTime, task } = req.body;
    console.log("submit--->" + userId);
    if (!userId || !date || !location || !startTime || !endTime || !task) {
        return res.status(400).json({ message: 'User ID, Check-in time, and Check-out time are required' });
    }
    try {
        const user = yield User_1.default.findOne({ _id: userId });
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const recordSchema = new Record_1.default({
            userId: user._id, // Sử dụng _id của user từ MongoDB
            date: new Date(date),
            location,
            startTime,
            endTime,
            task
        });
        yield recordSchema.save();
        res.status(201).json({ message: 'Attendance submitted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}));
app.get('/api/timesheet', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('timesheet request');
    try {
        const { userCode, startDate, endDate, page = 1, limit = 10 } = req.query;
        console.log('condition: ' + startDate + "-" + endDate);
        // Phân trang
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        // Lọc theo userId nếu có
        if (userCode) {
            const user = yield User_1.default.findOne({ usercode: userCode });
            if (user) {
                filter.userId = user._id;
            }
            else {
                return res.status(200).json({
                    timesheets: [],
                    page: Number(page),
                    limit: Number(limit),
                });
            }
        }
        // Lọc theo ngày nếu có
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }
        // Lấy dữ liệu chấm công từ MongoDB
        const timesheets = yield Record_1.default.find(filter)
            .skip(skip)
            .limit(Number(limit))
            .populate("userId")
            .exec(); // Nếu muốn lấy thêm thông tin user
        // Trả về kết quả
        console.log(timesheets[0]);
        return res.status(200).json({
            timesheets,
            page: Number(page),
            limit: Number(limit),
        });
    }
    catch (error) {
        console.error("Error fetching timesheets:", error);
        return res.status(500).json({ message: "Server error" });
    }
}));
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
