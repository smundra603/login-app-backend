import jwt from 'jsonwebtoken';
import ErrorCode from '../../enums/errorCode';

const secret = process.env.JWT_SECRET;

export async function getCustomToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

export async function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, secret);
    console.log('Decoded', decoded);
    return {
      error: false,
      decoded
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        error: true,
        error_code: ErrorCode.TOKEN_EXPIRED
      };
    }
    return {
      error: true,
      error_code: ErrorCode.TOKEN_EXPIRED
    };
  }
}
