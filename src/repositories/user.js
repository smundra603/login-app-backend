import UserModel from '../modles/user';

export async function upsertUser(userDoc) {
  try {
    await UserModel.update({}, userDoc, { upsert: true });
    return {
      upserted: true
    };
  } catch (error) {
    console.log('Error while upserting user');
    return {
      upserted: false
    };
  }
}

export async function getUserViaPhoneNumber(phoneNumber) {
  return UserModel.findOne({ phoneNumber });
}

export async function getUserByEmail(email) {
  return UserModel.findOne({
    email: email.toLowerCase()
  });
}

export async function getUserByUserNameOrEmail(username, email) {
  return UserModel.findOne(
    {
      $or: [{ username }, { email: email.toLowerCase() }]
    },
    { username: 1, email: 1, phoneNumber: 1 }
  );
}

export async function setOTPForUserPhoneNumber(phoneNumber, otp) {
  return UserModel.updateOne({ phoneNumber }, { $set: { otp } });
}

export async function findUserAndResetOTP(phoneNumber, otp) {
  return UserModel.findOneAndUpdate({ phoneNumber, otp }, { $set: { otp: '' } });
}
