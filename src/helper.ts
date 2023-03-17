// helper functions
import { getData, Notifications, setData } from './dataStore';
import { getHashOf } from './other';
import HTTPError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
const nodemailer = require('nodemailer');

/**
 * checks if userId is valid
 *
 * @param {Number} authUserId
 * @returns { boolean } userValid
 */
function userValid(authUserId: number) {
  const data = getData();
  let userValid = false;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      userValid = true;
    }
  }
  return userValid;
}

/**
 * checks if channelId is valid
 *
 * @param {Number} channelId
 * @returns { boolean } channelValid
 */
function channelValid(channelId: number) {
  const data = getData();
  let channelValid = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channelValid = true;
    }
  }
  return channelValid;
}

/**
 * checks if user is member of channel
 *
 * @param { Number } uId
 * @param { Number } channelId
 * @returns { boolean } isMember
 */
function isMemberChannel(uId: number, channelId: number) {
  const data = getData();
  let isMember = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.allMembers) {
        if (member === uId) {
          isMember = true;
        }
      }
    }
  }
  return isMember;
}

/**
 * checks if the user is already a member of the channel
 *
 * @param uId number
 * @param channelId number
 * @returns boolean
 */
function isMemberOwner(uId: number, channelId: number) {
  const data = getData();
  let isMember = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.ownerMembers) {
        if (member === uId) {
          isMember = true;
        }
      }
    }
  }
  return isMember;
}

/**
 * returns the number of owners in the channel
 *
 * @param uId number
 * @param channelId number
 * @returns number
 */
function memberOwnerNo(uId: number, channelId: number) {
  const data = getData();
  let memberNo = 0;
  let memberId;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.ownerMembers) {
        memberNo++;
        memberId = member;
      }
    }
  }
  if (memberNo === 1 && memberId === uId) {
    return memberNo;
  } else {
    memberNo = 0;
    return memberNo;
  }
}

/**
 * Gets authUserId by user email
 *
 * @param email string
 * @param password string
 * @returns {};
 */
function getUserByEmail(email: string, password: string) {
  const data = getData();
  for (const user of data.users) {
    // Compares user email to the inserted email, while ignoring capitalisation.
    // Returns user Id if email and password are correct.
    if (user.email.toLowerCase() === email.toLowerCase()) {
      if (user.password !== getHashOf(password)) {
        throw HTTPError(400, 'password is not correct');
      } else {
        return {
          authUserId: user.uId,
        };
      }
    }
  }
  // Otherwise, return error.
  throw HTTPError(400, 'email entered does not belong to a user');
}

/**
 * Generates a handle which is lower case combination of nameFirst and nameLast
 *
 * @param nameFirst string
 * @param nameLast string
 * @returns string
 */
function handleGenerate(nameFirst: string, nameLast: string) {
  const data = getData();
  let concatNames = nameFirst + nameLast;
  concatNames = concatNames.toLowerCase();
  const lowerAlphanumeric = concatNames.replace(/[^a-z0-9]/g, '');
  let handle = lowerAlphanumeric.slice(0, 20);
  let handleRepeats = 0;
  const handleLength = handle.length;
  while (data.users.some(e => e.handleStr === handle)) {
    if (handle.length > handleLength) {
      handle = handle.slice(0, handleLength);
    }
    handle = handle + handleRepeats;
    handleRepeats += 1;
  }
  return handle;
}

/**
 * checks is token is valid
 *
 * @param token string
 * @returns boolean
 */
function tokenValid(token: string) {
  const data = getData();
  for (const user of data.users) {
    for (const i of user.tokens) {
      if (token === i) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Gets authUserId by token
 *
 * @param token string
 * @returns number
 */
function getUserIdByToken(token: string) {
  const data = getData();
  let authUserId;
  for (const user of data.users) {
    for (const i of user.tokens) {
      if (i === token) {
        authUserId = user.uId;
      }
    }
  }
  return authUserId;
}

/**
 * checks if messageId is valid
 *
 * @param messageId number
 * @returns boolean
 */
function messageValid(messageId: number) {
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return true;
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return true;
      }
    }
  }
  return false;
}

/**
 * checks if message is sent by the user
 *
 * @param authUserId number
 * @param messageId number
 * @returns boolean
 */
function messageSentByUser(authUserId: number, messageId: number) {
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        if (message.uId === authUserId) {
          return true;
        }
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        if (message.uId === authUserId) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * checks if the authorised user have owner permissions in the channel/DM
 *
 * @param authUserId number
 * @param messageId number
 * @returns boolean
 */
function checkOwnerPermissions(authUserId: number, messageId: number) {
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        for (const member of channel.ownerMembers) {
          if (member === authUserId) {
            return true;
          }
        }
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        for (const member of dm.ownerMembers) {
          if (member === authUserId) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * checks if dmId is valid
 *
 * @param dmId number
 * @returns boolean
 */
function dmValid(dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return true;
    }
  }
  return false;
}

/**
 * checks if user is member of DM
 *
 * @param uId number
 * @param dmId number
 * @returns boolean
 */
function isMemberDm(uId: number, dmId: number) {
  const data = getData();
  let isMember = false;
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      for (const member of dm.allMembers) {
        if (member === uId) {
          isMember = true;
        }
      }
    }
  }
  return isMember;
}

/**
 * generates messageId which does not exist yet
 * checks messages in channels and dms
 *
 * @returns number
 */
function generateMessageId() {
  const data = getData();
  let messageId = 1;
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId > messageId) {
        messageId = message.messageId;
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId > messageId) {
        messageId = message.messageId;
      }
    }
  }
  messageId++;
  return messageId;
}

// Code sourced from: https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
/**
 *
 * @param str string
 * @returns boolean
 */
function isAlphaNumeric(str: string) {
  let code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

/**
 * Gets raw token and token validity from token hash
 *
 * @param tokenHash string
 * @returns object
 */
function getTokenFromTokenHash(tokenHash: string) {
  const data = getData();
  for (const user of data.users) {
    for (const token of user.tokens) {
      if (getHashOf(token) === tokenHash) {
        return {
          token: token,
          isValid: true
        };
      }
    }
  }
  throw HTTPError(403, 'Invalid token');
}

/**
 * checks whether or not the authorised user currently has one of the reacts to this message in a DM
 * Updates datastore with isThisUserReacted
 *
 * @param authUserId number
 * @param dmId number
 */
function isThisUserReactedDm(authUserId: number, dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      for (const message of dm.messages) {
        if (message.reacts.length > 0) {
          for (const react of message.reacts) {
            if (react.uIds.includes(authUserId)) {
              react.isThisUserReacted = true;
            } else {
              react.isThisUserReacted = false;
            }
          }
        }
      }
    }
  }
  setData(data);
}

/**
 * checks whether or not the authorised user currently has one of the reacts to this message in a channel
 * Updates datastore with isThisUserReacted
 *
 * @param authUserId number
 * @param channelId number
 */
function isThisUserReactedChannel(authUserId: number, channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const message of channel.messages) {
        if (message.reacts.length > 0) {
          for (const react of message.reacts) {
            if (react.uIds.includes(authUserId)) {
              react.isThisUserReacted = true;
            } else {
              react.isThisUserReacted = false;
            }
          }
        }
      }
    }
  }
  setData(data);
}

/**
 * checks if message contains a react from authuser
 *
 * @param authUserId number
 * @param messageId number
 * @param reactId number
 * @returns boolean
 */
function checkMessageContainsReact(authUserId: number, messageId: number, reactId: number) {
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        for (const react of message.reacts) {
          if (react.reactId === reactId) {
            if (react.uIds.includes(authUserId)) {
              return true;
            }
          }
        }
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        for (const react of message.reacts) {
          if (react.reactId === reactId) {
            if (react.uIds.includes(authUserId)) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

/**
 * Gets message from message Id
 *
 * @param messageId number
 * @returns string
 */
function getMessageFromMessageId(messageId: number) {
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return message.message;
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return message.message;
      }
    }
  }
}

/**
 * Gets Handlestr from userId
 *
 * @param userId number
 * @returns string
 */
function getHandleFromUserId(userId: number) {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === userId) {
      return user.handleStr;
    }
  }
}

/**
 * Gets channel name from channel ID
 *
 * @param channelId number
 * @returns string
 */
function getChannelNameFromChannelId(channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return channel.name;
    }
  }
}

/**
 * Gets DM name from Dm Id
 *
 * @param dmId number
 * @returns string
 */
function getDmNameFromDmId(dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return dm.name;
    }
  }
}

/**
 * Gets userId from messageId
 *
 * @param messageId number
 * @returns number
 */
function getUserFromMessageId(messageId: number) {
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return message.uId;
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return message.uId;
      }
    }
  }
}

/**
 * Checks for tags in a message and
 * returns an array of userIds tagged in message
 *
 * @param message string
 * @param channelId number
 * @param dmId number
 * @returns number[]
 */
function checkForTags(message: string, channelId: number, dmId: number) {
  const data = getData();
  const notifiedUserIdsSet = new Set <number>();
  if (message.includes('@')) {
    const messageArray = message.split('@');
    for (const user of data.users) {
      for (const i of messageArray) {
        if (i.includes(user.handleStr)) {
          notifiedUserIdsSet.add(user.uId);
        }
      }
    }
  }
  const notifiedUserIdsArray: number[] = Array.from(notifiedUserIdsSet);
  if (dmId === -1) {
    for (const userId of notifiedUserIdsArray) {
      for (const channel of data.channels) {
        if (!channel.allMembers.includes(userId)) {
          notifiedUserIdsArray.splice(notifiedUserIdsArray.indexOf(userId), 1);
        }
      }
    }
  }
  if (channelId === -1) {
    for (const userId of notifiedUserIdsArray) {
      for (const dm of data.dms) {
        if (!dm.allMembers.includes(userId)) {
          notifiedUserIdsArray.splice(notifiedUserIdsArray.indexOf(userId), 1);
        }
      }
    }
  }
  return notifiedUserIdsArray;
}

/**
 * Gets channelId or dmId from messageId
 *
 * @param messageId number
 * @returns object
 */
function getChannelOrDmIdFromMessageId(messageId: number) {
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return {
          channelId: channel.channelId,
          dmId: -1
        };
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return {
          channelId: -1,
          dmId: dm.dmId
        };
      }
    }
  }
}

/**
 * Pushes notification when a user is tagged in channel/DM
 *
 * @param notifiedUserIdsArray number[]
 * @param authUserId number
 * @param channelId number
 * @param dmId number
 * @param message string
 */
function pushTagNotification(notifiedUserIdsArray: number[], authUserId: number, channelId: number, dmId: number, message: string) {
  const data = getData();
  for (const userId of notifiedUserIdsArray) {
    const notiHandleStr = getHandleFromUserId(authUserId);
    const concatMessage = message.slice(0, 20);
    let newNotification: Notifications;
    if (channelId === -1) {
      const notiDmName = getDmNameFromDmId(dmId);
      newNotification = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: `${notiHandleStr} tagged you in ${notiDmName}: ${concatMessage}`,
      };
    }
    if (dmId === -1) {
      const notiChannelName = getChannelNameFromChannelId(channelId);
      newNotification = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: `${notiHandleStr} tagged you in ${notiChannelName}: ${concatMessage}`,
      };
    }
    for (const user of data.users) {
      if (user.uId === userId) {
        user.notifications.unshift(newNotification);
      }
    }
  }
}

/**
 * Pushes notification when someone reacts on a user's message
 *
 * @param authUserId number
 * @param channelId number
 * @param dmId number
 * @param messageId number
 */
function pushReactNotification(authUserId: number, channelId: number, dmId: number, messageId: number) {
  const data = getData();
  const notiHandleStr = getHandleFromUserId(authUserId);
  const notiUserId = getUserFromMessageId(messageId);
  let newNotification: Notifications;
  if (dmId === -1) {
    const notiChannelName = getChannelNameFromChannelId(channelId);
    newNotification = {
      channelId: channelId,
      dmId: -1,
      notificationMessage: `${notiHandleStr} reacted to your message in ${notiChannelName}`,
    };
  }
  if (channelId === -1) {
    const notiDmName = getDmNameFromDmId(dmId);
    newNotification = {
      channelId: -1,
      dmId: dmId,
      notificationMessage: `${notiHandleStr} reacted to your message in ${notiDmName}`,
    };
  }
  for (const user of data.users) {
    if (user.uId === notiUserId) {
      user.notifications.unshift(newNotification);
    }
  }
}

/**
 * Pushes notification when a user is added into a channel
 *
 * @param authUserId number
 * @param channelId number
 * @param uId number
 */
function pushAddChannelNotification(authUserId: number, channelId: number, uId: number) {
  const data = getData();
  const notiHandleStr = getHandleFromUserId(authUserId);
  const notiChannelName = getChannelNameFromChannelId(channelId);
  const newNotification: Notifications = {
    channelId: channelId,
    dmId: -1,
    notificationMessage: `${notiHandleStr} added you to ${notiChannelName}`,
  };
  for (const user of data.users) {
    if (user.uId === uId) {
      user.notifications.unshift(newNotification);
    }
  }
}

/**
 * Pushes notification when a user is added into a DM
 *
 * @param authUserId number
 * @param dmId number
 * @param uIds number[]
 */
function pushAddDmNotification(authUserId: number, dmId: number, uIds: number[]) {
  const data = getData();
  for (const uId of uIds) {
    const notiHandleStr = getHandleFromUserId(authUserId);
    const notiDmName = getDmNameFromDmId(dmId);
    const newNotification: Notifications = {
      channelId: -1,
      dmId: dmId,
      notificationMessage: `${notiHandleStr} added you to ${notiDmName}`,
    };
    for (const user of data.users) {
      if (user.uId === uId) {
        user.notifications.unshift(newNotification);
      }
    }
  }
}

function sendPasswordresetEmail(email: string) {
  // generate code
  const resetCode = uuidv4();

  // send email
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '7ddbf3eef45f4c',
      pass: 'd085a710430308'
    }
  });

  const mailOptions = {
    from: 'F15A-Crunchie@outlook.com',
    to: email,
    subject: 'Password Reset Request',
    text: resetCode,
    html: '<b>Hey there! </b><br> Here is the code for your password reset request,'
  };

  transport.sendMail(mailOptions);

  return resetCode;
}

function checkMessagePin(messageId: number) {
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        if (message.isPinned) {
          return true;
        }
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        if (message.isPinned) {
          return true;
        }
      }
    }
  }
  return false;
}

function makeStandupInactive(channelId: number) {
  const data = getData();
  // function when standup gets over
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const standup of channel.standup) {
        standup.isActive = false;
        standup.timeFinish = null;
      }
    }
  }

  setData(data);
}

export {
  userValid,
  isMemberChannel,
  isMemberOwner,
  memberOwnerNo,
  channelValid,
  getUserByEmail,
  handleGenerate,
  getUserIdByToken,
  messageValid,
  messageSentByUser,
  checkOwnerPermissions,
  dmValid,
  isMemberDm,
  tokenValid,
  isAlphaNumeric,
  generateMessageId,
  getTokenFromTokenHash,
  isThisUserReactedDm,
  isThisUserReactedChannel,
  checkMessageContainsReact,
  getMessageFromMessageId,
  getHandleFromUserId,
  getChannelNameFromChannelId,
  getDmNameFromDmId,
  getUserFromMessageId,
  checkForTags,
  getChannelOrDmIdFromMessageId,
  pushTagNotification,
  pushReactNotification,
  pushAddChannelNotification,
  pushAddDmNotification,
  checkMessagePin,
  sendPasswordresetEmail,
  makeStandupInactive
};
