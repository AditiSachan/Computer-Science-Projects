import {
  dmValid,
  isMemberDm,
  getUserIdByToken,
  isMemberChannel,
  channelValid,
  messageValid,
  messageSentByUser,
  checkOwnerPermissions,
  generateMessageId,
  getTokenFromTokenHash,
  checkMessageContainsReact,
  getMessageFromMessageId,
  checkForTags,
  getChannelOrDmIdFromMessageId,
  pushTagNotification,
  pushReactNotification,
  checkMessagePin,
} from './helper';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { Messages, Reacts } from './dataStore';

/**
 * Send a message from the authorised user to the channel specified by channelId
 *
 * @param token string
 * @param channelId number
 * @param message string
 * @returns
 */
function messageSendV1(token: string, channelId: number, message: string) {
  const data = getData();
  const messageId = generateMessageId();

  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (!channelValid(channelId)) {
    throw HTTPError(400, 'invalid channel!');
  }
  if (message.length < 1 ||
      message.length > 1000) {
    throw HTTPError(400, 'invalid message length!');
  }
  if (!isMemberChannel(authUserId, channelId)) {
    throw HTTPError(403, 'authuser not member of channel!');
  }
  const newMessage: Messages = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: [],
    isPinned: false,
  };
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      channel.messages.unshift(newMessage);
    }
  }

  // checks for tags
  const notifiedUserIdsArray = checkForTags(message, channelId, -1);

  // push new notification
  pushTagNotification(notifiedUserIdsArray, authUserId, channelId, -1, message);

  setData(data);
  return { messageId: newMessage.messageId };
}

/**
 * Send a message from authorisedUser to the DM specified by dmId.
 *
 * @param token string
 * @param dmId number
 * @param message string
 * @returns
 */
function messageSenddmV1(token: string, dmId: number, message: string) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (!dmValid(dmId)) {
    throw HTTPError(400, 'invalid dm!');
  }
  if (message.length < 1 ||
      message.length > 1000) {
    throw HTTPError(400, 'invalid message length!');
  }
  if (!isMemberDm(authUserId, dmId)) {
    throw HTTPError(403, 'authuser not member of DM!');
  }

  const messageId = generateMessageId();

  const newMessage: Messages = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: [],
    isPinned: false,
  };
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      dm.messages.unshift(newMessage);
    }
  }

  // checks for tags
  const notifiedUserIdsArray = checkForTags(message, -1, dmId);

  // push new notification
  pushTagNotification(notifiedUserIdsArray, authUserId, -1, dmId, message);

  setData(data);
  return { messageId: newMessage.messageId };
}

/**
 * Given a message, update its text with new text.
 *
 * @param token string
 * @param messageId number
 * @param message string
 * @returns
 */
function messageEditV1(token: string, messageId: number, message: string) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (message.length > 1000) {
    throw HTTPError(400, 'invalid message length!');
  }
  if (!messageValid(messageId)) {
    throw HTTPError(400, 'invalid message!');
  }
  if (!checkOwnerPermissions(authUserId, messageId)) {
    throw HTTPError(403, 'authuser does not have owner permissions!');
  }
  if (!messageSentByUser(authUserId, messageId)) {
    throw HTTPError(403, 'message not sent by authuser!');
  }
  if (message === '') {
    messageRemoveV1(token, messageId);
    setData(data);
    return {};
  }

  // checks for tags
  const channelIdOrDmId = getChannelOrDmIdFromMessageId(messageId);
  let notifiedUserIdsArray;
  if (channelIdOrDmId.channelId === -1) {
    notifiedUserIdsArray = checkForTags(message, -1, channelIdOrDmId.dmId);
  } else {
    notifiedUserIdsArray = checkForTags(message, channelIdOrDmId.channelId, -1);
  }

  for (const channel of data.channels) {
    for (const i of channel.messages) {
      if (i.messageId === messageId) {
        i.message = message;
        // push new notification
        pushTagNotification(notifiedUserIdsArray, authUserId, channel.channelId, -1, message);
        setData(data);
        return {};
      }
    }
  }
  for (const dm of data.dms) {
    for (const i of dm.messages) {
      if (i.messageId === messageId) {
        i.message = message;
        // push new notification
        pushTagNotification(notifiedUserIdsArray, authUserId, -1, dm.dmId, message);
        setData(data);
        return {};
      }
    }
  }
}

/**
 * Given a messageId for a message, this message is removed from the channel/DM
 *
 * @param token string
 * @param messageId number
 * @returns
 */
function messageRemoveV1(token: string, messageId: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (!messageValid(messageId)) {
    throw HTTPError(400, 'invalid message!');
  }
  if (!checkOwnerPermissions(authUserId, messageId)) {
    throw HTTPError(403, 'authuser does not have owner permissions!');
  }
  if (!messageSentByUser(authUserId, messageId)) {
    throw HTTPError(403, 'message not sent by authuser!');
  }

  for (const channel of data.channels) {
    for (const i in channel.messages) {
      if (channel.messages[i].messageId === messageId) {
        channel.messages.splice(parseInt(i), 1);
        setData(data);
        return {};
      }
    }
  }
  for (const dm of data.dms) {
    for (const i in dm.messages) {
      if (dm.messages[i].messageId === messageId) {
        dm.messages.splice(parseInt(i), 1);
        setData(data);
        return {};
      }
    }
  }
}
function messageSendlaterV1(token: string, channelId: number, message: string, timeSent: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token');
  }
  if (!channelValid(channelId)) {
    throw HTTPError(400, 'invalid channel');
  }
  if (message.length < 1 ||
      message.length > 1000) {
    throw HTTPError(400, 'invalid message length');
  }
  if (Math.floor(Date.now() / 1000) > timeSent) {
    throw HTTPError(400, 'invalid timeSent');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (!isMemberChannel(authUserId, channelId)) {
    throw HTTPError(403, 'authorised user is not member of channel!');
  }
  const messageId = generateMessageId();
  function sendMessage() {
    const newMessage: Messages = {
      messageId: messageId,
      uId: authUserId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false
    };
    for (const channel of data.channels) {
      if (channelId === channel.channelId) {
        channel.messages.unshift(newMessage);
      }
    }
    setData(data);
  }
  setTimeout(sendMessage, ((timeSent - Math.floor(Date.now() / 1000)) * 1000));
  return { messageId: messageId };
}

function messageSendlaterdmV1(token: string, dmId: number, message: string, timeSent: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token');
  }
  if (!dmValid(dmId)) {
    throw HTTPError(400, 'invalid dm');
  }
  if (message.length < 1 ||
      message.length > 1000) {
    throw HTTPError(400, 'invalid message length');
  }
  if (Math.floor(Date.now() / 1000) > timeSent) {
    throw HTTPError(400, 'invalid timeSent');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (!isMemberDm(authUserId, dmId)) {
    throw HTTPError(403, 'authorised user is not member of dm');
  }
  const messageId = generateMessageId();
  function sendMessage() {
    const newMessage: Messages = {
      messageId: messageId,
      uId: authUserId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false
    };
    for (const dm of data.dms) {
      if (dmId === dm.dmId) {
        dm.messages.unshift(newMessage);
      }
    }
    setData(data);
  }
  setTimeout(sendMessage, ((timeSent - Math.floor(Date.now() / 1000)) * 1000));
  return { messageId: messageId };
}
/**
 * A new message containing the contents of both the original message and the optional message
 * sent to the channel/DM
 *
 * @param token string
 * @param ogMessageId number
 * @param message string
 * @param channelId number
 * @param dmId number
 * @returns { sharedMessageId }
 */
function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (channelId !== -1) {
    if (dmId !== -1) {
      throw HTTPError(400, 'neither channelId nor dmId are -1!');
    }
  }
  if (!messageValid(ogMessageId)) {
    throw HTTPError(400, 'invalid messageId!');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'message too long!');
  }

  // dmId is -1, share message to channels
  if (dmId === -1) {
    if (!channelValid(channelId)) {
      throw HTTPError(400, 'invalid channelId!');
    }
    if (!isMemberChannel(authUserId, channelId)) {
      throw HTTPError(403, 'authorised user has not joined the channel!');
    }
    const ogMessage = getMessageFromMessageId(ogMessageId);
    const sharedMessage = messageSendV1(token, channelId, ogMessage + message).messageId;
    setData(data);
    return { sharedMessageId: sharedMessage };
  }

  // channelId is -1, share message to DMs
  if (channelId === -1) {
    if (!dmValid(dmId)) {
      throw HTTPError(400, 'invalid dmId!');
    }
    if (!isMemberDm(authUserId, dmId)) {
      throw HTTPError(403, 'authorised user has not joined the DM!');
    }
    const ogMessage = getMessageFromMessageId(ogMessageId);
    const sharedMessage = messageSenddmV1(token, dmId, ogMessage + message).messageId;
    setData(data);
    return { sharedMessageId: sharedMessage };
  }
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * add a "react" to that particular message.
 *
 * @param token string
 * @param messageId number
 * @param reactId number
 * @returns {} or HTTPError
 */
function messageReactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (!messageValid(messageId)) {
    throw HTTPError(400, 'invalid messageId!');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'invalid reactId!');
  }
  if (checkMessageContainsReact(authUserId, messageId, reactId)) {
    throw HTTPError(400, 'message contains react!');
  }

  // adding react to channels
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        // pushes a new react object if react array is empty
        if (message.reacts.length === 0) {
          const newReact: Reacts = {
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          };
          message.reacts.push(newReact);
        }

        // push new notification
        pushReactNotification(authUserId, channel.channelId, -1, messageId);

        // adds authUserId into the react
        for (const react of message.reacts) {
          if (react.reactId === reactId) {
            react.uIds.push(authUserId);
            setData(data);
            return {};
          }
        }
      }
    }
  }

  // adding react to dms
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        // pushes a new react object if react array is empty
        if (message.reacts.length === 0) {
          const newReact: Reacts = {
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          };
          message.reacts.push(newReact);
        }

        // push new notification
        pushReactNotification(authUserId, -1, dm.dmId, messageId);

        // adds authUserId into the react
        for (const react of message.reacts) {
          if (react.reactId === reactId) {
            react.uIds.push(authUserId);
            setData(data);
            return {};
          }
        }
      }
    }
  }
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * remove a "react" to that particular message.
 *
 * @param token string
 * @param messageId number
 * @param reactId number
 * @returns {} or HTTPError
 */
function messageUnreactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (!messageValid(messageId)) {
    throw HTTPError(400, 'invalid messageId!');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'invalid reactId!');
  }
  if (!checkMessageContainsReact(authUserId, messageId, reactId)) {
    throw HTTPError(400, 'message does not contain react!');
  }
  // unreact for channels
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        for (const react of message.reacts) {
          if (react.reactId === reactId) {
            react.uIds.splice(react.uIds.indexOf(authUserId), 1);
            setData(data);
            return {};
          }
        }
      }
    }
  }
  // unreact for dms
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        for (const react of message.reacts) {
          if (react.reactId === reactId) {
            react.uIds.splice(react.uIds.indexOf(authUserId), 1);
            setData(data);
            return {};
          }
        }
      }
    }
  }
}

function messagePinV1(token: string, messageId: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (!messageValid(messageId)) {
    throw HTTPError(400, 'invalid messageId!');
  }
  if (checkMessagePin(messageId)) {
    throw HTTPError(400, 'message is pinned!');
  }
  if (!checkOwnerPermissions(authUserId, messageId)) {
    throw HTTPError(403, 'authorised user does not have owner permissions!');
  }
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        message.isPinned = true;
        setData(data);
        return {};
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        message.isPinned = true;
        setData(data);
        return {};
      }
    }
  }
}

function messageUnpinV1(token: string, messageId: number) {
  const data = getData();
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdByToken(tokenObtained);
  if (!messageValid(messageId)) {
    throw HTTPError(400, 'invalid messageId!');
  }
  if (!checkMessagePin(messageId)) {
    throw HTTPError(400, 'message is not pinned!');
  }
  if (!checkOwnerPermissions(authUserId, messageId)) {
    throw HTTPError(403, 'authorised user does not have owner permissions!');
  }
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        message.isPinned = false;
        setData(data);
        return {};
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        message.isPinned = false;
        setData(data);
        return {};
      }
    }
  }
}

export { messageRemoveV1, messageSendV1, messageSenddmV1, messageEditV1, messageSendlaterV1, messageSendlaterdmV1, messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1, messageShareV1 };
