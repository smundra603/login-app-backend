import mongoose from 'mongoose';

// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
  console.log('Mongoose default connection open');
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  console.log('Mongoose default connection error: ' + err);
});

export default async function mongoConnect(app) {
  await mongoose.connect(mongoURI, {});

  app.emit('ready');
  console.log('connected');
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
