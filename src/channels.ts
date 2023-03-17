import { getData, setData } from './dataStore';
import { userValid, getTokenFromTokenHash, getUserIdByToken } from './helper';
import { Channels } from './dataStore';
import HTTPError from 'http-errors';

/**
 *
 * @param {integer} authUserId
 * @returns {string}
 */
function channelsListallV1 (authUserId: number) {
  const data = getData();
  if (!userValid(authUserId)) {
    return { error: 'error' };
  }

  const channelsArray = [];
  for (const channels of data.channels) {
    const channelObject = {
      channelId: channels.channelId,
      name: channels.name
    };
    channelsArray.push(channelObject);
  }
  return { channels: channelsArray };
}
/**
 * Creates a new channel with the given name that is either a public or private channel.
 * The user who created it automatically joins the channel.
 *
 * @param {integer} authUserId
 * @param {string} name
 * @param {boolean} isPublic
 * @returns {object} channelId
 */
function channelsCreateV1 (token: string, name: string, isPublic: boolean) {
  const data = getData();

  // if token is invalid , has to return error
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }

  const authUserId = getUserIdByToken(tokenObtained);

  // returns error when
  // length of name is less than 1 or
  // more than 20 characters

  if (name.length < 1 ||
    name.length > 20 ||
    name === '') {
    throw HTTPError(400, 'invalid channel name!');
  }

  // generates channelId which does not exist yet
  let channelId = 1;
  if (data.channels.length !== 0) {
    channelId = data.channels[data.channels.length - 1].channelId + 1;
  }

  // creating a new channel object
  // to be pushed into channels array
  const newChannel: Channels = {
    name: name,
    isPublic: isPublic,
    channelId: channelId,
    ownerMembers: [authUserId],
    allMembers: [authUserId],
    messages: [],
    standup: []
  };

  // pushing the new object into the channels array
  data.channels.push(newChannel);

  // pass in the entire data object, with modifications made
  setData(data);

  // new change
  return {
    channelId: channelId,
  };
}

/**
 * @param {integer} authUserId
 * @returns {}
 */
function channelsListV1 (token: string) {
  const data = getData();

  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }

  const authUserId = getUserIdByToken(tokenObtained);

  // array to store all the arrays
  const channels1 = [];

  // to traverse through channels array
  for (const channelsToCheckMembership of data.channels) {
    // to traverse throught allMembers key of each channels object
    for (const allMember of channelsToCheckMembership.allMembers) {
      if (allMember === authUserId) {
        channels1.push({
          channelId: channelsToCheckMembership.channelId,
          name: channelsToCheckMembership.name
        });
      }
    }
  }

  return {
    channels: channels1
  };
}

export { channelsCreateV1, channelsListallV1, channelsListV1 };
