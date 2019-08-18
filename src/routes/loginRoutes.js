import passport from 'passport';
import { Router } from 'express';
import LocalAuth from '../loginStrategies/emailPassword';
import { checkIfAlreadyRegistered, getEncryptedPassword } from './helpers/userHelper';
import { upsertUser } from '../repositories/user';
import { validateOTPAndGetRegisteredUser, generateAndSaveOTP } from './helpers/otpHelper';
import { getCustomToken } from './helpers/tokenHelper';

import ErrorCode from '../enums/errorCode';

LocalAuth(passport);

const router = Router();

// eslint-disable-next-line consistent-return

router.post('/verify-otp', async (req, res) => {
  const { otp, phoneNumber } = req.body;
  if (!otp || !phoneNumber) {
    res.status(500).send({
      success: false,
      error_code: ErrorCode.INVALID_DATA
    });
  }
  const otpUser = await validateOTPAndGetRegisteredUser(phoneNumber, otp);
  if (!otpUser) {
    return res.status(500).send({
      success: false,
      error_code: ErrorCode.INVALID_OTP
    });
  }
  const custom_token = await getCustomToken({ user: otpUser });
  return res.send({
    success: true,
    custom_token
  });
});

router.post('/login_mobile', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(500).send({
      success: false,
      error_code: ErrorCode.INVALID_DATA
    });
  }
  const otpResponse = await generateAndSaveOTP(req.body);
  if (!otpResponse.success) {
    return res.status(500).send(otpResponse);
  }
  return res.send(otpResponse);
});

// eslint-disable-next-line consistent-return
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(500).send({
      success: false,
      error_code: ErrorCode.INVALID_DATA
    });
  }
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return res.status(500).send({ success: false });
    }
    if (!user) {
      return res.status(500).send({ success: false, error_code: info.message });
    }
    const custom_token = await getCustomToken({ user });
    return res.send({ success: true, custom_token });
  })(req, res, next);
});

router.post('/register', async (req, res) => {
  const { username, email, password, name, phoneNumber } = req.body;
  const { alreadyExists, alreadyExistingFields } = await checkIfAlreadyRegistered(username, email, phoneNumber);
  if (alreadyExists) {
    return res.send({
      success: false,
      error_code: ErrorCode.USER_ALREADY_EXISTS,
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
      success: false,
      error_code: ErrorCode.USER_NOT_CREATED
    });
  }
  return res.send({
    success: true
  });
});

export default router;
