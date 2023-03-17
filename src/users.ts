import { getData, setData } from './dataStore';
import { userValid, isAlphaNumeric, getTokenFromTokenHash, getUserIdByToken } from './helper';
import validator from 'validator';
import HTTPError from 'http-errors';

function userProfileV1(authUserId: number, uId: number) {
  const data = getData();
  if (!userValid(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }
  for (const user of data.users) {
    if (user.uId === uId) {
      return {
        user: {
          uId: user.uId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
        },
      };
    }
  }
}

function usersAllV1(authUserId: number) {
  const data = getData();
  const usersReturn = [];
  for (const user of data.users) {
    usersReturn.push(userProfileV1(user.uId, user.uId).user);
  }
  return { users: usersReturn };
}

function userProfileSetnameV1 (token: string, nameFirst: string, nameLast:string) {
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained = tokenResult.token;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'Invalid token');
  }

  // Return error if nameFirst or nameLast is invalid.
  if (nameFirst.length < 1 ||
      nameFirst.length > 50 ||
      nameLast.length < 1 ||
      nameLast.length > 50) {
    throw HTTPError(400, 'Invalid name');
  }

  const data = getData();
  const uId = getUserIdByToken(tokenObtained);
  // Once user with the uId is found, their nameFirst and nameLast is updated.
  for (const user of data.users) {
    if (user.uId === uId) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
      setData(data);
      return {};
    }
  }
}

function userProfileSetemailV1 (token: string, email: string) {
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'Invalid token');
  }
  const uId = getUserIdByToken(tokenObtained);

  // Return error if email is invalid.
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid email!');
  }

  const data = getData();
  // Return error if email is in use.
  for (const user of data.users) {
    if (user.email === email) {
      throw HTTPError(400, 'Email already in use!');
    }
  }
  // Once user with the uId is found, their email is updated.
  for (const user of data.users) {
    if (user.uId === uId) {
      user.email = email;
      setData(data);
      return {};
    }
  }
}

function userProfileSethandleV1 (token: string, handleStr: string) {
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'Invalid token');
  }
  const uId = getUserIdByToken(tokenObtained);

  // Return error if handle is invalid.
  if (handleStr.length < 3 ||
      handleStr.length > 20 ||
      !isAlphaNumeric(handleStr)) {
    throw HTTPError(400, 'Invalid handle!');
  }

  const data = getData();
  // Return error if handle is in use.
  for (const user of data.users) {
    if (user.handleStr === handleStr) {
      throw HTTPError(400, 'Handle already in use!');
    }
  }

  // Once user with the uId is found, their handle is updated.
  for (const user of data.users) {
    if (user.uId === uId) {
      user.handleStr = handleStr;
      setData(data);
      return {};
    }
  }
}

export { userProfileV1, userProfileSetnameV1, userProfileSetemailV1, userProfileSethandleV1, usersAllV1 };
