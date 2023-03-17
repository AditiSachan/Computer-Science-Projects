import { channelValid, isMemberChannel, userValid, isMemberOwner, memberOwnerNo, getTokenFromTokenHash, getUserIdByToken, isThisUserReactedChannel, pushAddChannelNotification } from './helper';
import { getData, setData } from './dataStore';
import { userProfileV1 } from './users';
import HTTPError from 'http-errors';

/**
 *
 * @param {integer} authUserId
 * @param {integer} channelId
 * @returns {string}
 */
function channelDetailsV1 (authUserId: number, channelId: number) {
  const data = getData();
  if (!userValid(authUserId) ||
      !channelValid(channelId) ||
      !isMemberChannel(authUserId, channelId)) {
    return { error: 'error' };
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      const ownerMembers = channel.ownerMembers.map(function(x) { return userProfileV1(x, x).user; });
      const allMembers = channel.allMembers.map(function(x) { return userProfileV1(x, x).user; });
      return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: ownerMembers,
        allMembers: allMembers
      };
    }
  }
}

/**
 * Given a channel with ID channelId that the authorised user is a member of
 * return up to 50 messages between index "start" and "start + 50"
 * returns a new index "end" which is the value of "start + 50"
 * if this function has returned the least recent messages in the channel, returns -1 in "end"
 *
 * @param {integer} authUserId
 * @param {integer} channelId
 * @param {integer} start
 * @returns {object}
 */
function channelMessagesV1(token: string, channelId: number, start: number) {
  const data = getData();

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
  const end = start + 50;

  // error checks
  if (!channelValid(channelId)) {
    throw HTTPError(400, 'invalid channel!');
  }
  if (!isMemberChannel(authUserId, channelId)) {
    throw HTTPError(403, 'authuser not member of channel!');
  }

  isThisUserReactedChannel(authUserId, channelId);

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (start === 0 && channel.messages.length === 0) {
        return {
          messages: channel.messages,
          start: start,
          end: -1,
        };
      } else if (start >= channel.messages.length) {
        throw HTTPError(400, 'start is greater than the total number of messages!');
      } else if (end > channel.messages.length) {
        return {
          messages: channel.messages.slice(start),
          start: start,
          end: -1,
        };
      } else {
        return {
          messages: channel.messages.slice(start, end),
          start: start,
          end: end,
        };
      }
    }
  }
}

/**
 *
 * @param {integer} authUserId
 * @param {integer} channelId
 * @returns {string}
 */
function channelJoinV1 (token: string, channelId: number) {
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'Invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  const data = getData();

  if (!userValid(authUserId)) {
    throw HTTPError(400, 'Invalid User!');
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.allMembers) {
        if (member === authUserId) {
          throw HTTPError(400, 'User already in channel!');
        }
      }

      if (channel.isPublic === true) {
        channel.allMembers.push(authUserId);
        setData(data);
        return {};
      } else {
        throw HTTPError(403, 'Private Channel!');
      }
    }
  }
  throw HTTPError(400, 'Invalid channel!');
}

/**
 *
 * @param {number} authUserId
 * @param {number} channelId
 * @param {number} uId
 * @returns {} or { error: 'error' }
 */
function channelInviteV2(token: string, channelId: number, uId: number) {
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'Invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  const data = getData();

  if (!channelValid(channelId)) {
    throw HTTPError(400, 'Invalid Channel!');
  }

  if (isMemberChannel(uId, channelId) || !userValid(uId)) {
    throw HTTPError(400, 'Invalid User!');
  }

  if (!isMemberChannel(authUserId, channelId)) {
    throw HTTPError(403, 'Authorised user not in channel');
  }

  // add the invitee to the channel.
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.allMembers.push(uId);
    }
  }

  // push new notification
  pushAddChannelNotification(authUserId, channelId, uId);

  setData(data);
  return {};
}

function channelLeaveV1(token: string, channelId: number) {
  const data = getData();

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

  const checkIfChannelValid = channelValid(channelId);
  // returns error if channelId does not refer to valid channel
  if (checkIfChannelValid === false) {
    throw HTTPError(400, 'Invalid parameters passed in!');
  }

  // channelId is valid but authorised user is not part of the channel
  const checkIfMemberOfChannel = isMemberChannel(authUserId, channelId);
  if (checkIfChannelValid === true &&
      checkIfMemberOfChannel === false) {
    throw HTTPError(403, 'You arent authorised to access this"');
  }

  for (const channels of data.channels) {
    if (channelId === channels.channelId) {
      for (const members of channels.ownerMembers) {
        if (members === authUserId) {
          channels.ownerMembers.splice((channels.ownerMembers.indexOf(members)), 1);
        }
      }
    }
  }

  // remove from the user from allMember and ownerMember arrays
  for (const channels of data.channels) {
    if (channelId === channels.channelId) {
      for (const members of channels.allMembers) {
        if (members === authUserId) {
          channels.allMembers.splice((channels.allMembers.indexOf(members)), 1);
        }
      }
    }
  }

  setData(data);
  return {};
}

/**
 *
 * @param authUserId
 * @param channelId
 * @param uId
 * @returns
 */
function channelAddOwnerV1(token: string, channelId: number, uId: number) {
  const data = getData();

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

  // Error conditions in order
  // channelId does not refer to valid channel
  // uId does not refer to a valid user
  // uId refers to a user who is not the member of the channel
  // uId refers to a user who is already a owner of the channel
  if (channelValid(channelId) === false ||
    userValid(uId) === false ||
    isMemberChannel(uId, channelId) === false ||
    isMemberOwner(uId, channelId) === true) {
    throw HTTPError(400, 'Invalid parameters passed in!');
  }
  // channelId is valid and the authorised user does not have owner permissions in the channel
  if (channelValid(channelId) && (isMemberOwner(authUserId, channelId) === false)) {
    throw HTTPError(403, 'You arent authorised to access this"');
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.ownerMembers.push(uId);
    }
  }
  setData(data);
  return {};
}

function channelRemoveOwnerV1(token: string, channelId: number, uId: number) {
  const data = getData();
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

  // Error conditions in order
  // channelId does not refer to valid channel
  // uId does not refer to a valid user
  // uId refers to a user who is not the owner of the channel
  // uId refers to a user who is currently the only owner of the channel
  if (channelValid(channelId) === false ||
      userValid(uId) === false ||
      isMemberOwner(uId, channelId) === false ||
      (memberOwnerNo(uId, channelId) === 1)
  ) {
    throw HTTPError(400, 'Invalid parameters passed in!');
  }

  // channelId is valid and the authorised user does not have owner permissions in the channel
  if (channelValid(channelId) && (isMemberOwner(authUserId, channelId) === false)) {
    throw HTTPError(403, 'You arent authorised to access this"');
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.ownerMembers) {
        if (member === uId) {
          channel.ownerMembers.splice(channel.ownerMembers.indexOf(member), 1);
        }
      }
    }
  }
  setData(data);
  return {};
}

export {
  channelInviteV2,
  channelMessagesV1,
  channelJoinV1,
  channelDetailsV1,
  channelAddOwnerV1,
  channelRemoveOwnerV1,
  channelLeaveV1
};
