import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import ErrorCode from '../enums/errorCode';
import { getUserByEmail } from '../repositories/user';

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
        const user = await getUserByEmail(email);
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
