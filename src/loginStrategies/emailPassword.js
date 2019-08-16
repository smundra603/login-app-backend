import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import UserModel from '../modles/user';
import ErrorCode from '../enums/errorCode';

async function isValidPassword(password, currentPassword) {
  return bcrypt.compare(password, currentPassword);
}

export default function (passport) {
  passport.use(
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password'
      },
      async (req, email, password, done) => {
        console.log('email, password', email, password);
        const user = await UserModel.findOne({
          email: email.toLowerCase()
        });
        console.log('user inside is', user);
        if (!user) {
          return done(null, false, { message: ErrorCode.INCORRECT_USERNAME });
        }
        const passwordValid = await isValidPassword(password, user.password);
        if (!passwordValid) {
          return done(null, false, { message: ErrorCode.INCORRECT_PASSWORD });
        }
        return done(null, user);
      }
    )
  );
}
