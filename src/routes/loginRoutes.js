import passport from 'passport';
import { Router } from 'express';
import LocalAuth from '../loginStrategies/emailPassword';
import { checkIfAlreadyRegistered, getEncryptedPassword } from './helpers/userHelper';
import { upsertUser } from '../repositories/user';
import ErroCode from '../enums/errorCode';

LocalAuth(passport);

const router = Router();

// const successRedirect = '/loginSuccess';
// const failureRedirect = '/loginFailure';

router.post('/login', (req, res, next) => {
  console.log(req.url);
  passport.authenticate('local', (err, user, info) => {
    console.log('authenticate');
    console.log(err);
    console.log(user);
    console.log(info);
    if (err) {
      return res.status(500).send({ success: false });
    }
    if (!user) {
      return res.status(500).send({ succes: false, error_code: info.message });
    }
    return res.send({ success: true, user });
  })(req, res, next);
});

router.get('/loginSuccess', (req, res) => {
  console.log('req', res);
  return res.send({ succes: 'true' });
});

router.get('/loginFailure', (req, res) => {
  console.log('req', res);
  return res.send({ succes: 'false' });
});
// passport.serializeUser((user, done) => {
//   done(null, user.email);
//   // where is this user.id going? Are we supposed to access this anywhere?
// });

// passport.deserializeUser((email, done) => {
//   done(null, { email });
// });bi

router.post('/register', async (req, res) => {
  const { username, email, password, name, phoneNumber } = req.body;
  const { alreadyExists, alreadyExistingFields } = await checkIfAlreadyRegistered(username, email, phoneNumber);
  if (alreadyExists) {
    return res.send({
      success: false,
      error_code: ErroCode.USER_ALREADY_EXISTS,
      alreadyExistingFields
    });
  }
  const encryptedPassword = await getEncryptedPassword(password);
  const { upserted } = await upsertUser({
    username,
    name,
    email: email.toLowerCase(),
    phoneNumber,
    password: encryptedPassword
  });
  if (!upserted) {
    return res.status(500).send({
      succes: false,
      error_code: ErroCode.USER_NOT_CREATED
    });
  }
  return res.send({
    succes: true
  });
});

export default router;
