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
