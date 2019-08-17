import { setOTPForUserPhoneNumber, findUserAndResetOTP } from '../../repositories/user';

export function generateOTP() {
  const randomNumber = Math.random() * 9000;
  const otp = Math.floor(1000 + randomNumber);
  return otp;
}

export async function saveOTP(otp, phoneNumber) {
  return setOTPForUserPhoneNumber(phoneNumber, otp);
}

export async function validateOTPAndGetRegisteredUser(phoneNumber, otp) {
  return findUserAndResetOTP(phoneNumber, otp);
}
