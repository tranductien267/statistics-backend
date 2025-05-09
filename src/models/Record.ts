// src/models/attendanceModel.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IRecord extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  date:Date,
  location:String,
  startTime:String,
  endTime: String;
  task: String;
}

const record: Schema<IRecord> = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:{ type: Date, required: true },
  location: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  task: { type: String, required: true },
});

const RecordSchema = mongoose.model<IRecord>('records', record);

export default RecordSchema;
