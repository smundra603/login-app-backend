import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  createdAt: {
    type: Date,
    default: new Date().toISOString()
  },
  lastLogin: {
    type: Date
  },
  password: {
    type: String
  }
});

const UserModel = mongoose.model('users', UserSchema, 'users');
export default UserModel;
