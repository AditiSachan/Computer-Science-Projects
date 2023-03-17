import { getData, setData } from './dataStore';
import { getUserByEmail, handleGenerate, sendPasswordresetEmail } from './helper';
import validator from 'validator';
import { getHashOf, tokenGenerate } from './other';
import HTTPError from 'http-errors';

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns {number} user.id or {error: 'error'} if email or password is invalid.
 */
function authLoginV1(email: string, password: string) {
  const authUserId = getUserByEmail(email, password);
  const token = tokenGenerate(authUserId.authUserId);
  const tokenHash = getHashOf(token.token);
  return {
    token: tokenHash,
    authUserId: authUserId.authUserId
  };
}

/**
 *
 * @param {string} email
 * @param {string} password
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {number} authUserId
 */
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  const data = getData();
  for (const user of data.users) {
    if (user.email === email) {
      throw HTTPError(400, 'email address is already being used by another user');
    }
  }
  if (!validator.isEmail(email) ||
    password.length < 6 ||
    nameFirst.length < 1 ||
    nameFirst.length > 50 ||
    nameLast.length < 1 ||
    nameLast.length > 50) {
    throw HTTPError(400, 'invalid email or password too short or invalid name length');
  }
  const handle = handleGenerate(nameFirst, nameLast);
  let uId = 1;
  if (data.users.length !== 0) {
    uId = data.users[data.users.length - 1].uId + 1;
  }
  data.users.push(
    {
      uId: uId,
      nameFirst: nameFirst,
      nameLast: nameLast,
      email: email,
      password: getHashOf(password),
      handleStr: handle,
      notifications: [],
    }
  );
  const token = tokenGenerate(uId);
  const tokenHash = getHashOf(token.token);
  setData(data);
  return {
    token: tokenHash,
    authUserId: uId
  };
}

/**
 *
 * @param {string} token
 * @returns {}
 */
function authLogoutV1(token: string) {
  const data = getData();
  for (const user of data.users) {
    const tokenIndex = user.tokens.indexOf(token);
    if (tokenIndex > -1) {
      user.tokens.splice(tokenIndex, 1);
    }
  }
  setData(data);
  return {};
}

function authPasswordresetRequestV1(email: string) {
  const data = getData();
  for (const user of data.users) {
    if (user.email === email) {
      const resetCode = sendPasswordresetEmail(email);
      if (user.resetCodes === undefined) {
        user.resetCodes = [resetCode];
      } else {
        user.resetCodes.push(resetCode);
      }
      user.tokens = [];
      setData(data);
    }
  }

  return {};
}

function authPasswordresetResetV1(resetCode: string, newPassword: string) {
  if (newPassword.length < 6) {
    throw HTTPError(400, 'password entered is less than 6 characters long');
  }
  const data = getData();
  for (const user of data.users) {
    if (user.resetCodes !== undefined) {
      const resetCodeIndex = user.resetCodes.indexOf(resetCode);
      if (resetCodeIndex > -1) {
        user.password = newPassword;
        user.resetCodes.splice(resetCodeIndex, 1);
        setData(data);
        return {};
      }
    }
  }
  throw HTTPError(400, 'resetCode is not a valid reset code');
}

export { authLoginV1, authRegisterV1, authLogoutV1, authPasswordresetRequestV1, authPasswordresetResetV1 };
