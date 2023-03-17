import { getData } from './dataStore';
import HTTPError from 'http-errors';
import { getTokenFromTokenHash, getUserIdByToken } from './helper';

/**
 * Returns the user's most recent 20 notifications
 * ordered from most recent to least recent.
 *
 * @param token string
 * @returns { notifications }
 */
function notificationsGetV1(token: string) {
  // if token is invalid , has to return error
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  // getting authUserId from the token given
  const authUserId = getUserIdByToken(tokenObtained);
  const data = getData();

  for (const user of data.users) {
    if (user.uId === authUserId) {
      return {
        notifications: user.notifications.slice(0, 20),
      };
    }
  }
}

export { notificationsGetV1 };
