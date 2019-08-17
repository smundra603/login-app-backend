import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import mongoConnect from './databaseConnections/mongoConnection';
import LoginRoutes from './routes/loginRoutes';

const app = express();
mongoConnect(app);
app.on('ready', () => {
  app.listen(process.env.PORT, () => {
    console.log('app is ready and listening to port ', process.env.PORT);
  });
});

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use('/', LoginRoutes);
