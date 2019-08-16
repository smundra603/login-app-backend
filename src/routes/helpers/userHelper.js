import bcrypt from 'bcryptjs';
import UserModel from '../../modles/user';

export async function checkIfAlreadyRegistered(username, email, phoneNumber) {
  const user = await UserModel.findOne(
    {
      $or: [{ username }, { email }]
    },
    { username: 1, email: 1, phoneNumber: 1 }
  );
  const alreadyExistsInfo = { alreadyExists: false, alreadyExistingFields: [] };
  if (user) {
    alreadyExistsInfo.alreadyExists = true;
    if (user.username === username) {
      alreadyExistsInfo.alreadyExistingFields.push('username');
    }
    if (user.username === email) {
      alreadyExistsInfo.alreadyExistingFields.push('email');
    }
    if (user.username === phoneNumber) {
      alreadyExistsInfo.alreadyExistingFields.push('phonenumber');
    }
  }

  return alreadyExistsInfo;
}

export async function getEncryptedPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (saltError, salt) => {
      if (saltError) {
        reject(saltError);
      }
      bcrypt.hash(password, salt, (hassError, hash) => {
        // Store hash in your password DB.
        if (hassError) {
          reject(hassError);
        }
        resolve(hash);
      });
    });
  });
}
