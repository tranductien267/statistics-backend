// src/models/userModel.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  usercode: string;
  username: string;
  password: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  usercode: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model<IUser>('User', userSchema,'user');

export default User;
