import passport from 'passport';
import { Router } from 'express';
import LocalAuth from '../loginStrategies/emailPassword';
import { checkIfAlreadyRegistered, getEncryptedPassword } from './helpers/userHelper';
import { upsertUser, getUserViaPhoneNumber } from '../repositories/user';
import { generateOTP, saveOTP, validateOTPAndGetRegisteredUser } from './helpers/otpHelper';
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
  return res.send({
    success: true,
    user: otpUser
  });
});

async function generateAndSendOTP({ phoneNumber }) {
  const userExists = await getUserViaPhoneNumber(phoneNumber);
  if (!userExists) {
    return {
      success: false,
      error_code: ErrorCode.PHONE_NUMBER_NOT_REGISTERED
    };
  }
  const otp = generateOTP();
  await saveOTP(otp, phoneNumber);
  return { success: true, otp };
}
router.post('/resend-otp', async (req, res) => {
  const otpResponse = await generateAndSendOTP(req.body);
  if (!otpResponse.success) {
    return res.status(500).send(otpResponse);
  }
  return res.send(otpResponse);
});

router.post('/login', async (req, res, next) => {
  const { mode = 'email_password' } = req.body;
  if (mode === 'phoneNumber') {
    const otpResponse = await generateAndSendOTP(req.body);
    if (!otpResponse.success) {
      return res.status(500).send(otpResponse);
    }
    return res.send(otpResponse);
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).send({ success: false });
    }
    if (!user) {
      return res.status(500).send({ success: false, error_code: info.message });
    }
    return res.send({ success: true, user });
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
