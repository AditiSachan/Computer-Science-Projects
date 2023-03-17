import { getData, setData } from './dataStore';
import { userValid, getUserIdByToken, dmValid, isMemberDm, getTokenFromTokenHash, isThisUserReactedDm, pushAddDmNotification } from './helper';
import { userProfileV1 } from './users';
import HTTPError from 'http-errors';

function dmLeaveV1 (token: string, dmId: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    return { error: 'error' };
  }
  const userId = getUserIdByToken(tokenObtained);

  if (!dmValid(dmId) || !isMemberDm(userId, dmId)) {
    return { error: 'error' };
  }
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      for (const user of dm.ownerMembers) {
        if (user === userId) {
          dm.ownerMembers.splice((dm.ownerMembers.indexOf(user)), 1);
        }
      }
      for (const user of dm.allMembers) {
        if (user === userId) {
          dm.allMembers.splice((dm.allMembers.indexOf(user)), 1);
        }
      }
    }
  }
  setData(data);
  return {};
}
/**
 *
 * @param { number } authUserId
 * @param { number[] } uIds
 * @returns { dmId || error }
 */
function dmCreateV1(authUserId: number, uIds: number[]) {
  if (!userValid(authUserId) || (new Set(uIds).size !== uIds.length)) {
    throw HTTPError(400, "duplicate 'uId's in uIds");
  }
  if (uIds.includes(authUserId)) {
    throw HTTPError(400, 'uIds includes creator');
  }
  const ownerMembers = [authUserId];
  const dmNameArray: string[] = [];
  const allMembers = [authUserId];
  for (const uId of uIds) {
    if (!userValid(uId)) {
      throw HTTPError(400, 'uId in uIds does not refer to a valid user');
    }
    const user = userProfileV1(uId, uId).user;
    dmNameArray.push(user.handleStr);
    allMembers.push(uId);
  }
  dmNameArray.push(userProfileV1(authUserId, authUserId).user.handleStr);
  dmNameArray.sort();
  const name = dmNameArray.join(', ');
  const data = getData();
  let dmId = 0;
  for (const dm of data.dms) {
    if (dm.dmId > dmId) {
      dmId = dm.dmId;
    }
  }
  dmId++;
  data.dms.push({
    dmId: dmId,
    name: name,
    ownerMembers: ownerMembers,
    allMembers: allMembers,
    messages: [],
  });

  // push new notification
  pushAddDmNotification(authUserId, dmId, uIds);

  setData(data);
  return { dmId: dmId };
}

/**
 * @param { number } authUserId
 * @param { number } channelId
 * @returns {string}
 */
function dmDetailsV1 (token: string, dmId: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    return { error: 'error' };
  }
  const userId = getUserIdByToken(tokenObtained);
  if (!dmValid(dmId) || !isMemberDm(userId, dmId)) {
    return { error: 'error' };
  }
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      const members = dm.allMembers.map(function(x) { return userProfileV1(x, x).user; });
      return {
        name: dm.name,
        members: members,
      };
    }
  }
}

function dmListV1 (authUserId: number) {
  const dms = [];
  const data = getData();
  for (const dm of data.dms) {
    if (dm.allMembers.includes(authUserId)) {
      dms.push({
        dmId: dm.dmId,
        name: dm.name,
      });
    }
  }
  return { dms: dms };
}

function dmRemoveV1(authUserId: number, dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (dm.ownerMembers.includes(authUserId)) {
        data.dms.splice(data.dms.indexOf(dm), 1);
        setData(data);
        return {};
      } else {
        throw HTTPError(403, 'Authorised user is not creator, or is no longer in dm');
      }
    }
  }
  throw HTTPError(400, 'dmId does not refer to a valid DM');
}

function dmMessagesV1 (token: string, dmId: number, start: number) {
  const data = getData();
  const end = start + 50;
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    return { error: 'error' };
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (dmValid(dmId) === false ||
      isMemberDm(authUserId, dmId) === false) {
    return { error: 'error' };
  }
  isThisUserReactedDm(authUserId, dmId);
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (start === 0 && dm.messages.length === 0) {
        return {
          messages: dm.messages,
          start: start,
          end: -1,
        };
      } else if (start >= dm.messages.length) {
        return { error: 'error' };
      } else if (end > dm.messages.length) {
        return {
          messages: dm.messages.slice(start),
          start: start,
          end: -1,
        };
      } else {
        return {
          messages: dm.messages.slice(start, end),
          start: start,
          end: end,
        };
      }
    }
  }
}

export { dmCreateV1, dmDetailsV1, dmLeaveV1, dmMessagesV1, dmRemoveV1, dmListV1 };
