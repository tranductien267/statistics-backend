// src/server.ts
import express, { Request, Response } from 'express';
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
import User from './models/User';
import RecordSchema from './models/Record';

const app = express();
app.use(express.json());
app.use(cors());

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// API login
app.post('/api/login', async (req: Request, res: Response) => {
  console.log('login request')
  const { usercode, password } = req.body;

  if (!usercode || !password) {
    return res.status(400).json({ message: 'User ID and password are required' }) as any;
  }

  try {
    // Kiểm tra người dùng có tồn tại trong cơ sở dữ liệu không
    console.log("find : " + usercode)
    const user = await User.findOne({ usercode: usercode });
    console.log("find : " + user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' }) as any;
    }

    // Kiểm tra mật khẩu
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid password' }) as any;
    }
    user.password = "*********";
    console.log("user new : " + user)
    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// API submit attendance (chấm công)
app.post('/api/submit', async (req: Request, res: Response) => {
  const { userId, date, location,startTime,endTime,task } = req.body;
  console.log("submit--->" + userId)
  if (!userId || !date || !location || !startTime || !endTime || !task) {
    return res.status(400).json({ message: 'User ID, Check-in time, and Check-out time are required' }) as any;
  }

  try {
    const user = await User.findOne({ _id: userId });
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' }) as any;
    }

    const recordSchema = new RecordSchema({
      userId: user._id, // Sử dụng _id của user từ MongoDB
      date: new Date(date),
      location,
      startTime,
      endTime,
      task
    });

    await recordSchema.save();
    res.status(201).json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/timesheet', async (req: Request, res: Response) => {
  console.log('timesheet request')
  try {
    const { userCode, startDate, endDate, page = 1, limit = 10 } = req.query;
    console.log('condition: ' + startDate + "-" + endDate)
    // Phân trang
    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};

    // Lọc theo userId nếu có
    if (userCode) {
      const user = await User.findOne({ usercode: userCode });
      if (user) {
        filter.userId = user._id;
      }else {
        return res.status(200).json({
          timesheets:[],
          page: Number(page),
          limit: Number(limit),
        }) as any;
      }    
    }

    // Lọc theo ngày nếu có
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Lấy dữ liệu chấm công từ MongoDB
    const timesheets = await RecordSchema.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .populate("userId")
      .exec(); // Nếu muốn lấy thêm thông tin user

    // Trả về kết quả
    console.log(timesheets[0])
    return res.status(200).json({
      timesheets,
      page: Number(page),
      limit: Number(limit),
    }) as any;
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return res.status(500).json({ message: "Server error" }) as any;
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
  console.log('users request')
  try {
    // Lọc theo userId nếu có
    const users = await User.find()
    console.log( users)
    return res.status(200).json(users) as any;

  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Server error" }) as any;
  }
});
app.get('/api/test', async (req: Request, res: Response) => {
  console.log('users request')
  try {
    return   res.json({ message: 'API test thành công!' });

  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return res.status(500).json({ message: "Server error" }) as any;
  }
});
app.get('/api/timesheetByUser', async (req: Request, res: Response) => {
  console.log('timesheet request')
  try {
    const { userId, month, year} = req.query;
    console.log('condition: ' + userId + "-" + month + "-" + year)
    const filter: any = {};
    // Lọc theo userId nếu có
    if (!userId || !month || !year) {
      return res.status(400).json({ error: "Bad request" });
    }
    const user = await User.findOne({ _id: userId });  
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
    // Lọc theo ngày nếu có
    filter.userId = user._id
    filter.date = {
      $gte: startDate,
      $lte: endDate,
    };


    // Lấy dữ liệu chấm công từ MongoDB
    const timesheets = await RecordSchema.find(filter)
    // Trả về kết quả
    console.log(timesheets[0])
    return res.status(200).json(timesheets) as any;
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return res.status(500).json({ message: "Server error" }) as any;
  }
});
app.post("/api/updateTimesheet", async (req, res) => {
  const updatedData = req.body;

  try {
    for (const item of updatedData) {
      await RecordSchema.updateOne(
        { _id:item._id},
        { $set: item },
        { upsert: true }
      );
    }
    res.status(200).send("Cập nhật thành công");
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
