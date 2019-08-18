import { setOTPForUserPhoneNumber, findUserAndResetOTP, getUserViaPhoneNumber } from '../../repositories/user';
import errorCode from '../../enums/errorCode';

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

export async function generateAndSaveOTP({ phoneNumber }) {
  const userExists = await getUserViaPhoneNumber(phoneNumber);
  if (!userExists) {
    return {
      success: false,
      error_code: errorCode.PHONE_NUMBER_NOT_REGISTERED
    };
  }
  const otp = generateOTP();
  await saveOTP(otp, phoneNumber);
  return { success: true, otp };
}
