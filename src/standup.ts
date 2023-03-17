import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { isMemberChannel, channelValid, makeStandupInactive, getTokenFromTokenHash, getUserIdByToken } from './helper';

function standupStartV1 (token: string, channelId: number, length: number) {
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

  // ERROR if
  if (!channelValid(channelId)) {
    throw HTTPError(400, 'invalid channelId!');
  }

  if (length < 0) {
    throw HTTPError(400, 'negative standup period given!');
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const standup of channel.standup) {
        if (standup.isActive === true) {
          throw HTTPError(400, 'active standup is currently running in the channel!');
        }
      }
    }
  }

  if (!isMemberChannel(authUserId, channelId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel!');
  }

  setTimeout(() => {
    makeStandupInactive(channelId);
  },
  length * 1000
  );

  const timeWhenStanupFinish = Date.now() + length * 1000;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.standup.push({
        isActive: true,
        timeFinish: timeWhenStanupFinish
      });
    }
  }
  setData(data);
  return ({ timeFinish: timeWhenStanupFinish });
}

function standupActiveV1(token: string, channelId: number) {
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

  // ERROR if
  if (!channelValid(channelId)) {
    throw HTTPError(400, 'invalid channelId!');
  }

  if (channelValid(channelId) && !isMemberChannel(authUserId, channelId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel!');
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const standups of channel.standup) {
        if (standups.isActive === true) {
          return {
            isActive: true,
            timeFinish: standups.timeFinish
          };
        }
      }
    }
  }

  // if it comes here, none of the standups are active
  return ({
    isActive: false,
    timeFinish: null
  });
}

function standupSendV1(token: string, channelId: number, message: string) {
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

  // ERROR if
  if (!channelValid(channelId)) {
    throw HTTPError(400, 'invalid channelId!');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Message exceeds 1000 characters!');
  }

  let noActiveStandup = true;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const standups of channel.standup) {
        if (standups.isActive === true) {
          noActiveStandup = false;
          break;
        }
      }
    }
  }

  if (noActiveStandup === true) {
    throw HTTPError(400, 'No active standup currently running in the channel!');
  }

  if (channelValid(channelId) && !isMemberChannel(authUserId, channelId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel!');
  }
  return ({});
}

export {
  standupStartV1,
  standupActiveV1,
  standupSendV1
};
