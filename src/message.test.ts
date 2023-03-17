import { requestHelper } from './other';

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '');
}

function requestAuthRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '');
}

function requestChannelsCreateV3(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

function requestChannelMessagesV3(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', { channelId, start }, token);
}

function requestMessageSendV2(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { channelId, message }, token);
}

function requestMessageRemoveV2(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', { messageId }, token);
}

function requestMessageEditV2(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v2', { messageId, message }, token);
}

function requestMessageSenddmV2(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', { dmId, message }, token);
}

function requestDmCreateV2(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v2', { uIds }, token);
}

function requestDmMessagesV2(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', { dmId, start }, token);
}

function requestChannelJoinV3(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

function requestMessageSendlaterV1(token: string, channelId: number, message: string, timeSent: number) {
  return requestHelper('POST', '/message/sendlater/v1', { channelId, message, timeSent }, token);
}

function requestMessageSendlaterdmV1(token: string, dmId: number, message: string, timeSent: number) {
  return requestHelper('POST', '/message/sendlaterdm/v1', { dmId, message, timeSent }, token);
}

function requestMessageReactV1(token: string, messageId: number, reactId: number) {
  return requestHelper('POST', '/message/react/v1', { messageId, reactId }, token);
}

function requestMessageUnreactV1(token: string, messageId: number, reactId: number) {
  return requestHelper('POST', '/message/unreact/v1', { messageId, reactId }, token);
}

function requestMessageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  return requestHelper('POST', '/message/share/v1', { ogMessageId, message, channelId, dmId }, token);
}

function requestMessagePinV1(token: string, messageId: number) {
  return requestHelper('POST', '/message/pin/v1', { messageId }, token);
}

function requestMessageUnpinV1(token: string, messageId: number) {
  return requestHelper('POST', '/message/unpin/v1', { messageId }, token);
}

beforeEach(() => {
  return requestHelper('DELETE', '/clear/v1', {}, '');
});

/**
 * requestMessageSendV2 Test cases:
 * Valid cases:
 * - Successful message send in 1 channel - 1 message
 * - Successful message send in 1 channel - more than 1 message, start: 0
 * - Successful message send in 1 channel - more than 1 message, start: 1
 *
 * Error cases:
 * - invalid channelId
 * - length of message less than 1 character
 * - length of message more than 1000 characters
 * - user not member of channel
 *
 */
test('Successful message send in 1 channel - 1 message', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  requestChannelsCreateV3(user.token, 'general', true);
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(message).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(requestChannelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message.messageId,
        uId: user.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message send in 1 channel - more than 1 message, start: 0', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  const message2 = requestMessageSendV2(user.token, channel.channelId, 'wassup');
  expect(message1).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(message2).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(requestChannelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user.authUserId,
        message: 'wassup',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message send in 1 channel - 50 messages, start: 0', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const idList: number[] = [];
  for (let i = 0; i < 50; i++) {
    idList.unshift(requestMessageSendV2(user.token, channel.channelId, 'Hihi').messageId);
  }
  const result = requestChannelMessagesV3(user.token, channel.channelId, 0);
  expect(result).toStrictEqual({
    messages: expect.any(Array),
    start: 0,
    end: 50,
  });
  for (let i = 0; i < 50; i++) {
    expect((result.messages[i]).messageId).toStrictEqual(idList[i]);
  }
});

test('Successful message send in 1 channel - more than 50 messages, start: 0', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const idList: number[] = [];
  for (let i = 0; i < 52; i++) {
    idList.unshift(requestMessageSendV2(user.token, channel.channelId, 'Hihi').messageId);
  }
  const result = requestChannelMessagesV3(user.token, channel.channelId, 0);
  expect(result).toStrictEqual({
    messages: expect.any(Array),
    start: 0,
    end: 50,
  });
  for (let i = 0; i < 50; i++) {
    expect(result.messages[i].messageId).toStrictEqual(idList[i]);
  }
});

test('Successful message send in 1 channel - more than 1 message, start: 1', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  const message2 = requestMessageSendV2(user.token, channel.channelId, 'wassup');
  expect(message1).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(message2).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(requestChannelMessagesV3(user.token, channel.channelId, 1)).toStrictEqual({
    messages: [
      {
        messageId: message1.messageId,
        uId: user.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 1,
    end: -1,
  });
});

test('Error message send - invalid token', () => {
  const user = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user.token, 'General', true);
  expect(requestMessageSendV2(user.token + 'ad', channel.channelId + 1, 'Hihi')).toStrictEqual(403);
});

test('Error message send - invalid channelId', () => {
  const user = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user.token, 'General', true);
  expect(requestMessageSendV2(user.token, channel.channelId + 1, 'Hihi')).toStrictEqual(400);
});

test('Error message send - length of message less than 1 character', () => {
  const user = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user.token, 'General', true);
  expect(requestMessageSendV2(user.token, channel.channelId, '')).toStrictEqual(400);
});

test('Error message send - length of message more than 1000 characters', () => {
  const user = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user.token, 'General', true);
  expect(requestMessageSendV2(user.token, channel.channelId, 'a'.repeat(1001))).toStrictEqual(400);
});

test('Error message send - user not member of channel', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user1.token, 'General', true);
  expect(requestMessageSendV2(user2.token, channel.channelId, 'Hihi')).toStrictEqual(403);
});

/**
 * requestMessageSenddmV2 Test cases:
 * Valid cases:
 * - Successful message send dm - 1 message, start: 0
 * - Successful message send dm - more than 1 message, start: 0
 * - Successful message send dm - more than 1 message, start: 1
 *
 * Error cases:
 * - invalid dmId
 * - length of message less than 1 character
 * - length of message more than 1000 characters
 * - user not member of dm
 *
 */
test('Successful message send dm - 1 message, start: 0', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const user3 = requestAuthRegisterV3('hahaha@gmail.com', 'haha12345', 'Haha', 'Funny');
  requestDmCreateV2(user1.token, [user3.authUserId]);
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user2.token, dm.dmId, 'Hihi');
  expect(message).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(requestDmMessagesV2(user1.token, dm.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message.messageId,
        uId: user2.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message send dm - more than 1 message, start: 0', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message1 = requestMessageSenddmV2(user2.token, dm.dmId, 'Hihi');
  const message2 = requestMessageSenddmV2(user2.token, dm.dmId, 'Happy birthday');
  expect(message1).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(message2).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(requestDmMessagesV2(user2.token, dm.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user2.authUserId,
        message: 'Happy birthday',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user2.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message send dm - more than 1 message, start: 1', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message1 = requestMessageSenddmV2(user2.token, dm.dmId, 'Hihi');
  const message2 = requestMessageSenddmV2(user2.token, dm.dmId, 'Happy birthday');
  expect(message1).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(message2).toStrictEqual({
    messageId: expect.any(Number)
  });
  expect(requestDmMessagesV2(user2.token, dm.dmId, 1)).toStrictEqual({
    messages: [
      {
        messageId: message1.messageId,
        uId: user2.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 1,
    end: -1,
  });
});

test('Successful message send in 1 DM - 50 messages, start: 0', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const idList: number[] = [];
  for (let i = 0; i < 50; i++) {
    idList.unshift(requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi').messageId);
  }
  const result = requestDmMessagesV2(user1.token, dm.dmId, 0);
  expect(result).toStrictEqual({
    messages: expect.any(Array),
    start: 0,
    end: 50,
  });
  for (let i = 0; i < 50; i++) {
    expect((result.messages[i]).messageId).toStrictEqual(idList[i]);
  }
});

test('Successful message send in 1 DM - more than 50 messages, start: 0', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const idList: number[] = [];
  for (let i = 0; i < 52; i++) {
    idList.unshift(requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi').messageId);
  }
  const result = requestDmMessagesV2(user1.token, dm.dmId, 0);
  expect(result).toStrictEqual({
    messages: expect.any(Array),
    start: 0,
    end: 50,
  });
  for (let i = 0; i < 50; i++) {
    expect(result.messages[i].messageId).toStrictEqual(idList[i]);
  }
});

test('Error message send dm - invalid token', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestMessageSenddmV2(user1.token + user2.token, dm.dmId + 1, 'Hihi')).toStrictEqual(403);
});

test('Error message send dm - invalid dmId', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestMessageSenddmV2(user1.token, dm.dmId + 1, 'Hihi')).toStrictEqual(400);
});

test('Error message send dm - length of message less than 1 character', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestMessageSenddmV2(user1.token, dm.dmId, '')).toStrictEqual(400);
});

test('Error message send dm - length of message more than 1000 characters', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestMessageSenddmV2(user1.token, dm.dmId, 'a'.repeat(1001))).toStrictEqual(400);
});

test('Error message send dm - user not member of dm', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('abc@gmail.com', 'abc12345', 'Henry', 'James');
  const user3 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestMessageSenddmV2(user3.token, dm.dmId, 'Hihi')).toStrictEqual(403);
});

/**
 * messageEditV1 Test cases for channels:
 * Valid cases:
 * - Successful message edit
 *
 * Error cases:
 * - invalid messageId
 * - length of message more than 1000 characters
 * - message was not sent by auth user making this request
 * - authorised user does not have owner permissions in the channe
 *
 */
test('Successful message edit', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Heyyo');
  const message2 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageEditV2(user.token, message1.messageId, 'Helo')).toStrictEqual({});
  expect(requestChannelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user.authUserId,
        message: 'Helo',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message edit - empty string, message gets deleted', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageEditV2(user.token, message.messageId, '')).toStrictEqual({});
  expect(requestChannelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual({
    messages: [],
    start: 0,
    end: -1,
  });
});

test('Error message edit - invalid token', () => {
  const user = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user.token, 'General', true);
  const message = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageEditV2(user.token + 'ad', message.messageId + 1, 'Hihi')).toStrictEqual(403);
});

test('Error message edit - invalid messageId', () => {
  const user = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user.token, 'General', true);
  const message = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageEditV2(user.token, message.messageId + 1, 'Hihi')).toStrictEqual(400);
});

test('Error message edit - length of message more than 1000 characters', () => {
  const user = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user.token, 'General', true);
  const message = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageEditV2(user.token, message.messageId, 'a'.repeat(1001))).toStrictEqual(400);
});

test('Error message edit - message was not sent by auth user making this request', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user1.token, 'General', true);
  requestChannelJoinV3(user2.token, channel.channelId);
  const message = requestMessageSendV2(user2.token, channel.channelId, 'Hihi');
  expect(requestMessageEditV2(user1.token, message.messageId, 'Hihi')).toStrictEqual(403);
});

test('Error message edit - authorised user does not have owner permissions in the channel', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user1.token, 'General', true);
  requestChannelJoinV3(user2.token, channel.channelId);
  const message = requestMessageSendV2(user2.token, channel.channelId, 'Hihi');
  expect(requestMessageEditV2(user2.token, message.messageId, 'Hihi')).toStrictEqual(403);
});

/**
 * messageEditV1 Test cases for DMs:
 * Valid cases:
 * - Successful message edit
 *
 * Error cases:
 * - invalid messageId
 * - length of message more than 1000 characters
 * - message was not sent by auth user making this request
 * - authorised user does not have owner permissions in the channe
 *
 */
test('Successful message edit', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user3 = requestAuthRegisterV3('hockeen.liaw@gmail.com', 'Hockeen88', 'Hockeen', 'Liaw');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId, user3.authUserId]);
  const message1 = requestMessageSenddmV2(user1.token, dm.dmId, 'Heyyo');
  const message2 = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  expect(requestMessageEditV2(user1.token, message1.messageId, 'wassupp')).toStrictEqual({});
  expect(requestDmMessagesV2(user1.token, dm.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'wassupp',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message edit - empty string, message gets deleted', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageEditV2(user.token, message.messageId, '')).toStrictEqual({});
  expect(requestChannelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual({
    messages: [],
    start: 0,
    end: -1,
  });
});

test('Error message edit - invalid token', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  expect(requestMessageEditV2(user1.token + user2.token, message.messageId + 1, 'Helo')).toStrictEqual(403);
});

test('Error message edit - invalid messageId', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  expect(requestMessageEditV2(user1.token, message.messageId + 1, 'Helo')).toStrictEqual(400);
});

test('Error message edit - length of message more than 1000 characters', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  expect(requestMessageEditV2(user1.token, message.messageId, 'a'.repeat(1001))).toStrictEqual(400);
});

test('Error message edit - message was not sent by auth user making this request', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user2.token, dm.dmId, 'Hihi');
  expect(requestMessageEditV2(user1.token, message.messageId, 'Hhelo')).toStrictEqual(403);
});

test('Error message edit - authorised user does not have owner permissions in the channel', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user2.token, dm.dmId, 'Hihi');
  expect(requestMessageEditV2(user2.token, message.messageId, 'Hihi')).toStrictEqual(403);
});

/**
 * messageRemoveV1 Test cases for channels:
 * Valid cases:
 * - Successful message remove - no message left
 * - Successful message remove
 *
 * Error cases:
 * - invalid messageId
 * - message was not sent by auth user making this request
 * - authorised user does not have owner permissions in the channe
 *
 */
test('Successful message remove - no message left', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageRemoveV2(user.token, message.messageId)).toStrictEqual({});
  expect(requestChannelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual({
    messages: [],
    start: 0,
    end: -1,
  });
});

test('Successful message remove', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  const message2 = requestMessageSendV2(user.token, channel.channelId, 'I love you');
  const message3 = requestMessageSendV2(user.token, channel.channelId, 'Merry Christmas');
  expect(requestMessageRemoveV2(user.token, message2.messageId)).toStrictEqual({});
  expect(requestChannelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message3.messageId,
        uId: user.authUserId,
        message: 'Merry Christmas',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Error message remove - invalid token', () => {
  const user = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user.token, 'General', true);
  const message = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageRemoveV2(user.token + 'ad', message.messageId + 1)).toStrictEqual(403);
});

test('Error message remove - invalid messageId', () => {
  const user = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user.token, 'General', true);
  const message = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageRemoveV2(user.token, message.messageId + 1)).toStrictEqual(400);
});

test('Error message remove - message was not sent by auth user making this request', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user1.token, 'General', true);
  requestChannelJoinV3(user2.token, channel.channelId);
  const message = requestMessageSendV2(user2.token, channel.channelId, 'Hihi');
  expect(requestMessageRemoveV2(user1.token, message.messageId)).toStrictEqual(403);
});

test('Error message remove - authorised user does not have owner permissions in the channel', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user1.token, 'General', true);
  requestChannelJoinV3(user2.token, channel.channelId);
  const message = requestMessageSendV2(user2.token, channel.channelId, 'Hihi');
  expect(requestMessageRemoveV2(user2.token, message.messageId)).toStrictEqual(403);
});

/**
 * messageRemoveV1 Test cases for DMs:
 * Valid cases:
 * - Successful message remove
 *
 * Error cases:
 * - invalid messageId
 * - message was not sent by auth user making this request
 * - authorised user does not have owner permissions in the DM
 *
 */
test('Successful message remove - no message left', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  expect(requestMessageRemoveV2(user1.token, message.messageId)).toStrictEqual({});
  expect(requestDmMessagesV2(user1.token, dm.dmId, 0)).toStrictEqual({
    messages: [],
    start: 0,
    end: -1,
  });
});

test('Successful message remove', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message1 = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  const message2 = requestMessageSenddmV2(user1.token, dm.dmId, 'I love you');
  const message3 = requestMessageSenddmV2(user1.token, dm.dmId, 'Merry Christmas');
  expect(requestMessageRemoveV2(user1.token, message2.messageId)).toStrictEqual({});
  expect(requestDmMessagesV2(user1.token, dm.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message3.messageId,
        uId: user1.authUserId,
        message: 'Merry Christmas',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Error message remove - invalid token', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  expect(requestMessageRemoveV2(user1.token + user2.token, message.messageId + 1)).toStrictEqual(403);
});

test('Error message remove - invalid messageId', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  expect(requestMessageRemoveV2(user1.token, message.messageId + 1)).toStrictEqual(400);
});

test('Error message remove - message was not sent by auth user making this request', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user2.token, dm.dmId, 'Hihi');
  expect(requestMessageRemoveV2(user1.token, message.messageId)).toStrictEqual(403);
});

test('Error message remove - authorised user does not have owner permissions in the channel', () => {
  const user1 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user2 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user2.token, dm.dmId, 'Hihi');
  expect(requestMessageRemoveV2(user2.token, message.messageId)).toStrictEqual(403);
});

/**
 * messageShareV1 Test cases for channels:
 * Valid cases:
 * - Successful message share for channel - message given, sent to different channel
 * - Successful message share for channel - message given, sent to same channel
 * - Successful message share for channel - message not given
 *
 * Error cases:
 * - invalid token
 * - channelId is invalid
 * - neither channelId nor dmId are -1
 * - ogMessageId does not refer to a valid message within a channel
 * - length of message is more than 1000 characters
 * - authorised user has not joined the channel they are trying to share the message to
 *
 */

test('Successful message share for channel - message given, sent to different channel', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel1 = requestChannelsCreateV3(user.token, 'channel1', true);
  const channel2 = requestChannelsCreateV3(user.token, 'channel2', true);
  const message = requestMessageSendV2(user.token, channel1.channelId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user.token, message.messageId, 'lol', channel2.channelId, -1);
  expect(sharedMessage).toStrictEqual({
    sharedMessageId: expect.any(Number)
  });
  expect(requestChannelMessagesV3(user.token, channel2.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: sharedMessage.sharedMessageId,
        uId: user.authUserId,
        message: 'Hihilol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message share for channel - message given, sent to same channel', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel1 = requestChannelsCreateV3(user.token, 'channel1', true);
  const message = requestMessageSendV2(user.token, channel1.channelId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user.token, message.messageId, 'lol', channel1.channelId, -1);
  expect(sharedMessage).toStrictEqual({
    sharedMessageId: expect.any(Number)
  });
  expect(requestChannelMessagesV3(user.token, channel1.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: sharedMessage.sharedMessageId,
        uId: user.authUserId,
        message: 'Hihilol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message.messageId,
        uId: user.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message share for channel - message not given', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel1 = requestChannelsCreateV3(user.token, 'channel1', true);
  const channel2 = requestChannelsCreateV3(user.token, 'channel2', true);
  const message = requestMessageSendV2(user.token, channel1.channelId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user.token, message.messageId, '', channel2.channelId, -1);
  expect(sharedMessage).toStrictEqual({
    sharedMessageId: expect.any(Number)
  });
  expect(requestChannelMessagesV3(user.token, channel2.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: sharedMessage.sharedMessageId,
        uId: user.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Error message share for channel - token invalid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel1 = requestChannelsCreateV3(user.token, 'channel1', true);
  const channel2 = requestChannelsCreateV3(user.token, 'channel2', true);
  const message = requestMessageSendV2(user.token, channel1.channelId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user.token + 'ad', message.messageId, 'lol', channel2.channelId, -1);
  expect(sharedMessage).toStrictEqual(403);
});

test('Error message share for channel - channelId invalid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel1 = requestChannelsCreateV3(user.token, 'channel1', true);
  const channel2 = requestChannelsCreateV3(user.token, 'channel2', true);
  const message = requestMessageSendV2(user.token, channel1.channelId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user.token, message.messageId, 'lol', channel2.channelId + channel1.channelId, -1);
  expect(sharedMessage).toStrictEqual(400);
});

test('Error message share for channel - neither channelId not dmId are -1', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('amazingwow@gmail.com', 'amazing123', 'Amazing', 'Wow');
  const channel1 = requestChannelsCreateV3(user1.token, 'channel1', true);
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSendV2(user1.token, channel1.channelId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user1.token, message.messageId, 'lol', channel1.channelId, dm.dmId);
  expect(sharedMessage).toStrictEqual(400);
});

test('Error message share for channel - ogMessageId does not refer to a valid message within a channel', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel1 = requestChannelsCreateV3(user.token, 'channel1', true);
  const channel2 = requestChannelsCreateV3(user.token, 'channel2', true);
  const message = requestMessageSendV2(user.token, channel1.channelId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user.token, message.messageId + 1, 'lol', channel2.channelId, -1);
  expect(sharedMessage).toStrictEqual(400);
});

test('Error message share for channel - length of message > 1000', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel1 = requestChannelsCreateV3(user.token, 'channel1', true);
  const channel2 = requestChannelsCreateV3(user.token, 'channel2', true);
  const message = requestMessageSendV2(user.token, channel1.channelId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user.token, message.messageId + 1, 'a'.repeat(1001), channel2.channelId, -1);
  expect(sharedMessage).toStrictEqual(400);
});

test('Error message share for channel - auth user not in the channel they are trying to share the message to', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('amazingwow@gmail.com', 'amazing123', 'Amazing', 'Wow');
  const channel1 = requestChannelsCreateV3(user1.token, 'channel1', true);
  const channel2 = requestChannelsCreateV3(user2.token, 'channel2', true);
  const message = requestMessageSendV2(user1.token, channel1.channelId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user1.token, message.messageId, 'lol', channel2.channelId, -1);
  expect(sharedMessage).toStrictEqual(403);
});

/**
 * messageShareV1 Test cases for DMs:
 * Valid cases:
 * - Successful message share
 *
 * Error cases:
 * - dmId is invalid
 * - ogMessageId does not refer to a valid message within a DM
 * - length of message is more than 1000 characters
 * - authorised user has not joined the DM they are trying to share the message to
 *
 */

test('Successful message share for DM - message given, sent to different dm', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm1 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const dm2 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user1.token, message.messageId, 'lol', -1, dm2.dmId);
  expect(sharedMessage).toStrictEqual({
    sharedMessageId: expect.any(Number)
  });
  expect(requestDmMessagesV2(user1.token, dm2.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: sharedMessage.sharedMessageId,
        uId: user1.authUserId,
        message: 'Hihilol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message share for DM - message given, sent to same DM', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm1 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user1.token, message.messageId, 'lol', -1, dm1.dmId);
  expect(sharedMessage).toStrictEqual({
    sharedMessageId: expect.any(Number)
  });
  expect(requestDmMessagesV2(user1.token, dm1.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: sharedMessage.sharedMessageId,
        uId: user1.authUserId,
        message: 'Hihilol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message share for DM - message not given', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm1 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const dm2 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user1.token, message.messageId, '', -1, dm2.dmId);
  expect(sharedMessage).toStrictEqual({
    sharedMessageId: expect.any(Number)
  });
  expect(requestDmMessagesV2(user1.token, dm2.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: sharedMessage.sharedMessageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Error message share for DM - DMId invalid', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm1 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const dm2 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user1.token, message.messageId, 'lol', -1, dm2.dmId + dm1.dmId);
  expect(sharedMessage).toStrictEqual(400);
});

test('Error message share for DM - ogMessageId does not refer to a valid message within a DM', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm1 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const dm2 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user1.token, message.messageId + 1, 'lol', -1, dm2.dmId);
  expect(sharedMessage).toStrictEqual(400);
});

test('Error message share for DM - length of message > 1000', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm1 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const dm2 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user1.token, message.messageId, 'a'.repeat(1001), -1, dm2.dmId);
  expect(sharedMessage).toStrictEqual(400);
});

test('Error message share for DM - auth user not in the DM they are trying to share the message to', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user3 = requestAuthRegisterV3('hockeenliaw@gmail.com', 'Hockeen2726', 'Hockeen', 'Liaw');
  const dm1 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const dm2 = requestDmCreateV2(user2.token, [user3.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hihi');
  const sharedMessage = requestMessageShareV1(user1.token, message.messageId, 'lol', -1, dm2.dmId);
  expect(sharedMessage).toStrictEqual(403);
});

/**
 * messageReactV1 Test cases:
 * Valid cases:
 * - Successful message react - first react
 * - successful message react - second react
 *
 * Error cases:
 * - invalid messageId
 * - invalid reactId
 * - message already contains a react with ID reactId from the authorised user
 *
 */
test('Successful message react in DM - first react', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message1 = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  const message2 = requestMessageSenddmV2(user1.token, dm.dmId, 'Lol');
  expect(requestMessageReactV1(user1.token, message1.messageId, 1)).toStrictEqual({});
  expect(requestDmMessagesV2(user1.token, dm.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'Lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [
          {
            reactId: 1,
            uIds: [user1.authUserId],
            isThisUserReacted: true,
          }
        ],
        isPinned: false,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message react in DM - second react', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message1 = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  const message2 = requestMessageSenddmV2(user1.token, dm.dmId, 'Lol');
  expect(requestMessageReactV1(user1.token, message1.messageId, 1)).toStrictEqual({});
  expect(requestMessageReactV1(user2.token, message1.messageId, 1)).toStrictEqual({});
  expect(requestDmMessagesV2(user1.token, dm.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'Lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [
          {
            reactId: 1,
            uIds: [user1.authUserId, user2.authUserId],
            isThisUserReacted: true,
          }
        ],
        isPinned: false,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message react in channels - first react', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  const message2 = requestMessageSendV2(user.token, channel.channelId, 'Lol');
  expect(requestMessageReactV1(user.token, message1.messageId, 1)).toStrictEqual({});
  expect(requestChannelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user.authUserId,
        message: 'Lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [
          {
            reactId: 1,
            uIds: [user.authUserId],
            isThisUserReacted: true,
          }
        ],
        isPinned: false,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message react in channels - second react', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user1.token, 'methchannel', true);
  requestChannelJoinV3(user2.token, channel.channelId);
  const message1 = requestMessageSendV2(user1.token, channel.channelId, 'Hihi');
  const message2 = requestMessageSendV2(user1.token, channel.channelId, 'Lol');
  expect(requestMessageReactV1(user1.token, message1.messageId, 1)).toStrictEqual({});
  expect(requestMessageReactV1(user2.token, message1.messageId, 1)).toStrictEqual({});
  expect(requestChannelMessagesV3(user1.token, channel.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'Lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [
          {
            reactId: 1,
            uIds: [user1.authUserId, user2.authUserId],
            isThisUserReacted: true,
          }
        ],
        isPinned: false,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Error message react - token not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageReactV1(user.token + 'ad', message1.messageId, 1)).toStrictEqual(403);
});

test('Error message react - messageId not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageReactV1(user.token, message1.messageId + 1, 1)).toStrictEqual(400);
});

test('Error message react - reactId not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageReactV1(user.token, message1.messageId, 2)).toStrictEqual(400);
});

test('Error message react -  message already contains a react with ID reactId from the authorised user', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  requestMessageReactV1(user.token, message1.messageId, 1);
  expect(requestMessageReactV1(user.token, message1.messageId, 1)).toStrictEqual(400);
});

/**
 * messageUnreactV1 Test cases:
 * Valid cases:
 * - Successful message unreact
 *
 * Error cases:
 * - invalid messageId
 * - invalid reactId
 * - message does not contain a react with ID reactId from the authorised user
 *
 */

test('Successful message unreact in DM', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message1 = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  const message2 = requestMessageSenddmV2(user1.token, dm.dmId, 'Lol');
  requestMessageReactV1(user1.token, message1.messageId, 1);
  requestMessageReactV1(user2.token, message1.messageId, 1);
  expect(requestMessageUnreactV1(user2.token, message1.messageId, 1)).toStrictEqual({});
  expect(requestDmMessagesV2(user2.token, dm.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'Lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [
          {
            reactId: 1,
            uIds: [user1.authUserId],
            isThisUserReacted: false,
          }
        ],
        isPinned: false,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message unreact in channel', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user1.token, 'methchannel', true);
  requestChannelJoinV3(user2.token, channel.channelId);
  const message1 = requestMessageSendV2(user1.token, channel.channelId, 'Hihi');
  const message2 = requestMessageSendV2(user1.token, channel.channelId, 'Lol');
  requestMessageReactV1(user1.token, message1.messageId, 1);
  requestMessageReactV1(user2.token, message1.messageId, 1);
  expect(requestMessageUnreactV1(user2.token, message1.messageId, 1)).toStrictEqual({});
  expect(requestChannelMessagesV3(user2.token, channel.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'Lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [
          {
            reactId: 1,
            uIds: [user1.authUserId],
            isThisUserReacted: false,
          }
        ],
        isPinned: false,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Error message unreact - token not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  requestMessageReactV1(user.token, message1.messageId, 1);
  expect(requestMessageUnreactV1(user.token + 'Ad', message1.messageId, 1)).toStrictEqual(403);
});

test('Error message unreact - messageId not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  requestMessageReactV1(user.token, message1.messageId, 1);
  expect(requestMessageUnreactV1(user.token, message1.messageId + 1, 1)).toStrictEqual(400);
});

test('Error message unreact - reactId not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  requestMessageReactV1(user.token, message1.messageId, 1);
  expect(requestMessageUnreactV1(user.token, message1.messageId, 2)).toStrictEqual(400);
});

test('Error message unreact -  message does not contain a react with ID reactId from the authorised user', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('hahafunny@gmail.com', 'HAHA9999978', 'Haha', 'Funny');
  const channel = requestChannelsCreateV3(user1.token, 'methchannel', true);
  requestChannelJoinV3(user2.token, channel.channelId);
  const message1 = requestMessageSendV2(user1.token, channel.channelId, 'Hihi');
  requestMessageReactV1(user1.token, message1.messageId + 1, 1);
  expect(requestMessageUnreactV1(user2.token, message1.messageId, 1)).toStrictEqual(400);
});

/**
 * messagePinV1 Test cases:
 * Valid cases:
 * - Successful message pin
 *
 * Error cases:
 * - invalid messageId
 * - message already pinned
 * - authorised user does not have owner permissions
 *
 */

test('Successful message pin in DM', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message1 = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  const message2 = requestMessageSenddmV2(user1.token, dm.dmId, 'lol');
  expect(requestMessagePinV1(user1.token, message1.messageId)).toStrictEqual({});
  expect(requestDmMessagesV2(user1.token, dm.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: true,
      }
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message pin in channel', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user1.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user1.token, channel.channelId, 'Hihi');
  const message2 = requestMessageSendV2(user1.token, channel.channelId, 'lol');
  expect(requestMessagePinV1(user1.token, message1.messageId)).toStrictEqual({});
  expect(requestChannelMessagesV3(user1.token, channel.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: true,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Error message pin - token not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessagePinV1(user.token + 'ad', message1.messageId)).toStrictEqual(403);
});

test('Error message pin - messageId not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessagePinV1(user.token, message1.messageId + 1)).toStrictEqual(400);
});

test('Error message pin - message already pinned', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  requestMessagePinV1(user.token, message1.messageId);
  expect(requestMessagePinV1(user.token, message1.messageId)).toStrictEqual(400);
});

test('Error message unreact -  authorised user does not have owner permissions', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user1.token, 'methchannel', true);
  requestChannelJoinV3(user2.token, channel.channelId);
  const message1 = requestMessageSendV2(user1.token, channel.channelId, 'Hihi');
  expect(requestMessagePinV1(user2.token, message1.messageId)).toStrictEqual(403);
});

/**
 * messageUnpinV1 Test cases:
 * Valid cases:
 * - Successful message unpin
 *
 * Error cases:
 * - invalid messageId
 * - message not already pinned
 * - authorised user does not have owner permissions
 *
 */

test('Successful message unpin in DM', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message1 = requestMessageSenddmV2(user1.token, dm.dmId, 'Hihi');
  const message2 = requestMessageSenddmV2(user1.token, dm.dmId, 'lol');
  requestMessagePinV1(user1.token, message1.messageId);
  expect(requestMessageUnpinV1(user1.token, message1.messageId)).toStrictEqual({});
  expect(requestDmMessagesV2(user1.token, dm.dmId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Successful message unpin in channel', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user1.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user1.token, channel.channelId, 'Hihi');
  const message2 = requestMessageSendV2(user1.token, channel.channelId, 'lol');
  requestMessagePinV1(user1.token, message1.messageId);
  expect(requestMessageUnpinV1(user1.token, message1.messageId)).toStrictEqual({});
  expect(requestChannelMessagesV3(user1.token, channel.channelId, 0)).toStrictEqual({
    messages: [
      {
        messageId: message2.messageId,
        uId: user1.authUserId,
        message: 'lol',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'Hihi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
    ],
    start: 0,
    end: -1,
  });
});

test('Error message unpin - token not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  requestMessagePinV1(user.token, message1.messageId);
  expect(requestMessageUnpinV1(user.token + 'ad', message1.messageId)).toStrictEqual(403);
});

test('Error message unpin - messageId not valid', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  requestMessagePinV1(user.token, message1.messageId);
  expect(requestMessageUnpinV1(user.token, message1.messageId + 1)).toStrictEqual(400);
});

test('Error message unpin - message not already pinned', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  const message1 = requestMessageSendV2(user.token, channel.channelId, 'Hihi');
  expect(requestMessageUnpinV1(user.token, message1.messageId)).toStrictEqual(400);
});

test('Error message unpin -  authorised user does not have owner permissions', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel = requestChannelsCreateV3(user1.token, 'methchannel', true);
  requestChannelJoinV3(user2.token, channel.channelId);
  const message1 = requestMessageSendV2(user1.token, channel.channelId, 'Hihi');
  requestMessagePinV1(user1.token, message1.messageId);
  expect(requestMessageUnpinV1(user2.token, message1.messageId)).toStrictEqual(403);
});

describe('message/sendlater/v1', () => {
  function setupUsers () {
    const user1 = requestAuthRegisterV3('UndyingDiligence@gmail.com', 'Industria', 'Undying', 'Diligence');
    const user2 = requestAuthRegisterV3('UnsightlyHumility@gmail.com', 'Humilitas', 'Unsightly', 'Humility');
    const channel = requestChannelsCreateV3(user1.token, 'General', true);
    return {
      user1: user1,
      user2: user2,
      channel: channel
    };
  }
  describe('Valid cases', () => {
    test('single message sent to a channel', async() => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterV1(setup.user1.token, setup.channel.channelId, 'whoboe', time + 3);
      expect(result).toStrictEqual({ messageId: result.messageId });
      const channelMessages1 = requestChannelMessagesV3(setup.user1.token, setup.channel.channelId, 0);
      expect(channelMessages1).toStrictEqual({
        messages: [],
        start: 0,
        end: -1
      });
      await new Promise((r) => setTimeout(r, 3200));
      const channelMessages2 = requestChannelMessagesV3(setup.user1.token, setup.channel.channelId, 0);
      expect(channelMessages2).toStrictEqual({
        messages: [{
          messageId: result.messageId,
          uId: setup.user1.authUserId,
          message: 'whoboe',
          timeSent: time + 3,
          reacts: [],
          isPinned: false
        }],
        start: 0,
        end: -1
      });
    });

    test('multiple messages sent to a channel', async() => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterV1(setup.user1.token, setup.channel.channelId, 'whoboe', time + 3);
      const result2 = requestMessageSendlaterV1(setup.user1.token, setup.channel.channelId, 'weew', time + 4);
      expect(result).toStrictEqual({ messageId: result.messageId });
      expect(result2).toStrictEqual({ messageId: result2.messageId });
      const channelMessages1 = requestChannelMessagesV3(setup.user1.token, setup.channel.channelId, 0);
      expect(channelMessages1).toStrictEqual({
        messages: [],
        start: 0,
        end: -1
      });
      await new Promise((r) => setTimeout(r, 4200));
      const channelMessages2 = requestChannelMessagesV3(setup.user1.token, setup.channel.channelId, 0);
      expect(channelMessages2).toStrictEqual({
        messages: [{
          messageId: result2.messageId,
          uId: setup.user1.authUserId,
          message: 'weew',
          timeSent: time + 4,
          reacts: [],
          isPinned: false
        },
        {
          messageId: result.messageId,
          uId: setup.user1.authUserId,
          message: 'whoboe',
          timeSent: time + 3,
          reacts: [],
          isPinned: false
        }],
        start: 0,
        end: -1
      });
    });
  });
  describe('Error cases', () => {
    test('invalid token', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const invalidtoken = setup.user1.token + 'randomstring';
      const result = requestMessageSendlaterV1(invalidtoken, setup.channel.channelId, 'hop', time + 3);
      expect(result).toStrictEqual(403);
    });

    test('invalid channelId', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const invalidChannelId = setup.channel.channelId + 1;
      const result = requestMessageSendlaterV1(setup.user1.token, invalidChannelId, 'hop', time + 3);
      expect(result).toStrictEqual(400);
    });

    test('message is less than 1 character', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterV1(setup.user1.token, setup.channel.channelId, '', time + 3);
      expect(result).toStrictEqual(400);
    });

    test('message is over 1000 caharacters', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterV1(setup.user1.token, setup.channel.channelId, 'L'.repeat(1001), time + 3);
      expect(result).toStrictEqual(400);
    });

    test('invalid timeSent', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterV1(setup.user1.token, setup.channel.channelId, 'hop', time - 3);
      expect(result).toStrictEqual(400);
    });

    test('authorised user is not a member of the channel', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterV1(setup.user2.token, setup.channel.channelId, 'hop', time + 3);
      expect(result).toStrictEqual(403);
    });

    test('interacting with message before it is sent', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterV1(setup.user1.token, setup.channel.channelId, 'hop', time + 3);
      const messageEdit = requestMessageEditV2(setup.user1.token, result.messageId, 'weewoo');
      // const messageShare = requestMessageShareV1(setup.user1.token, result.messageId, '', setup.channel.channelId, -1);
      const messageRemove = requestMessageRemoveV2(setup.user1.token, result.messageId);
      expect(messageEdit).toStrictEqual(400);
      // expect(messageShare).toStrictEqual();
      expect(messageRemove).toStrictEqual(400);
    });
  });
});

describe('message/sendlaterdm/v1', () => {
  function setupUsers () {
    const user1 = requestAuthRegisterV3('UndyingDiligence@gmail.com', 'Industria', 'Undying', 'Diligence');
    const user2 = requestAuthRegisterV3('UnsightlyHumility@gmail.com', 'Humilitas', 'Unsightly', 'Humility');
    const user3 = requestAuthRegisterV3('TwistedKindness@gmail.com', 'Humanitas', 'Twisted', 'Kindness');
    const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
    return {
      user1: user1,
      user2: user2,
      user3: user3,
      dm: dm
    };
  }
  describe('Valid cases', () => {
    test('single message sent to a dm', async() => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterdmV1(setup.user1.token, setup.dm.dmId, 'whoboe', time + 3);
      expect(result).toStrictEqual({ messageId: result.messageId });
      const dmMessages1 = requestDmMessagesV2(setup.user1.token, setup.dm.dmId, 0);
      expect(dmMessages1).toStrictEqual({
        messages: [],
        start: 0,
        end: -1
      });
      await new Promise((r) => setTimeout(r, 3200));
      const dmMessages2 = requestDmMessagesV2(setup.user1.token, setup.dm.dmId, 0);
      expect(dmMessages2).toStrictEqual({
        messages: [{
          messageId: result.messageId,
          uId: setup.user1.authUserId,
          message: 'whoboe',
          timeSent: time + 3,
          reacts: [],
          isPinned: false
        }],
        start: 0,
        end: -1
      });
    });

    test('multiple messages sent to a dm', async() => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterdmV1(setup.user1.token, setup.dm.dmId, 'whoboe', time + 3);
      const result2 = requestMessageSendlaterdmV1(setup.user1.token, setup.dm.dmId, 'weew', time + 4);
      expect(result).toStrictEqual({ messageId: result.messageId });
      expect(result2).toStrictEqual({ messageId: result2.messageId });
      const dmMessages1 = requestDmMessagesV2(setup.user1.token, setup.dm.dmId, 0);
      expect(dmMessages1).toStrictEqual({
        messages: [],
        start: 0,
        end: -1
      });
      await new Promise((r) => setTimeout(r, 4200));
      const dmMessages2 = requestDmMessagesV2(setup.user1.token, setup.dm.dmId, 0);
      expect(dmMessages2).toStrictEqual({
        messages: [{
          messageId: result2.messageId,
          uId: setup.user1.authUserId,
          message: 'weew',
          timeSent: time + 4,
          reacts: [],
          isPinned: false
        },
        {
          messageId: result.messageId,
          uId: setup.user1.authUserId,
          message: 'whoboe',
          timeSent: time + 3,
          reacts: [],
          isPinned: false
        }],
        start: 0,
        end: -1
      });
    });
  });
  describe('Error cases', () => {
    test('invalid token', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const invalidtoken = setup.user1.token + 'randomstring';
      const result = requestMessageSendlaterdmV1(invalidtoken, setup.dm.dmId, 'hop', time + 3);
      expect(result).toStrictEqual(403);
    });

    test('invalid channelId', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const invalidDmId = setup.dm.dm + 1;
      const result = requestMessageSendlaterdmV1(setup.user1.token, invalidDmId, 'hop', time + 3);
      expect(result).toStrictEqual(400);
    });

    test('message is less than 1 character', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterdmV1(setup.user1.token, setup.dm.dmId, '', time + 3);
      expect(result).toStrictEqual(400);
    });

    test('message is over 1000 caharacters', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterdmV1(setup.user1.token, setup.dm.dmId, 'L'.repeat(1001), time + 3);
      expect(result).toStrictEqual(400);
    });

    test('invalid timeSent', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterdmV1(setup.user1.token, setup.dm.dmId, 'hop', time - 3);
      expect(result).toStrictEqual(400);
    });

    test('authorised user is not a member of the channel', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterdmV1(setup.user3.token, setup.dm.dmId, 'hop', time + 3);
      expect(result).toStrictEqual(403);
    });

    test('interacting with message before it is sent', () => {
      const setup = setupUsers();
      const time = Math.floor(Date.now() / 1000);
      const result = requestMessageSendlaterdmV1(setup.user1.token, setup.dm.dmId, 'hop', time + 3);
      const messageEdit = requestMessageEditV2(setup.user1.token, result.messageId, 'weewoo');
      // const messageShare = requestMessageShareV1(setup.user1.token, result.messageId, '', setup.channel.channelId, -1);
      const messageRemove = requestMessageRemoveV2(setup.user1.token, result.messageId);
      expect(messageEdit).toStrictEqual(400);
      // expect(messageShare).toStrictEqual();
      expect(messageRemove).toStrictEqual(400);
    });
  });
});

requestClear();
