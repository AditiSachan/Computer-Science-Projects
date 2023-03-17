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

function requestDmCreateV2(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v2', { uIds }, token);
}

function requestMessageSendV2(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { channelId, message }, token);
}

function requestMessageSenddmV2(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', { dmId, message }, token);
}

function requestMessageReactV1(token: string, messageId: number, reactId: number) {
  return requestHelper('POST', '/message/react/v1', { messageId, reactId }, token);
}

function requestChannelJoinV3(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

function requestMessageEditV2(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v2', { messageId, message }, token);
}

function requestMessageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  return requestHelper('POST', '/message/share/v1', { ogMessageId, message, channelId, dmId }, token);
}

function requestChannelInviteV3(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', { channelId, uId }, token);
}

function requestNotificationsGetV1(token: string) {
  return requestHelper('GET', '/notifications/get/v1', {}, token);
}

beforeEach(() => {
  requestClear();
});

/**
 * notifications/get/V1 Test cases:
 * Tagging
 * - Successful notifications get < 20 - 1 user tagged in channel (message length < 20)
 * - Successful notifications get < 20 - 1 user tagged in channel (message length > 20)
 * - Successful notifications get < 20 - 2 user tagged in the same message in channel
 * - Successful notifications get < 20 - 1 user tagged in DM (message length < 20)
 * - Successful notifications get < 20 - 1 user tagged in DM (message length > 20)
 * - Successful notifications get < 20 - 2 user tagged in the same message in DM
 * - Successful notifications get < 20 - handle invalid
 * - Successful notifications get < 20 - user not member of channel
 * - Successful notifications get < 20 - user not member of DM
 * - Successful notifications get < 20 - user tagging themselves
 * - Successful notifications get < 20 - same valid tag appears multiple times in one message
 * - Successful notifications get < 20 - message edit in channel contains tag
 * - Successful notifications get < 20 - message edit in DM contains tag
 * - Successful notifications get < 20 - message share to channel optional message contains tags
 * - Successful notifications get < 20 - message share to DM optional message contains tags
 * React
 * - Successful notifications get < 20 - reacted message in channel
 * - Successful notifications get < 20 - reacted message in DM
 * Added to channel/DM
 * - Successful notifications get < 20 - added to a channel
 * - Successful notifications get < 20 - added to a dm
 * - Successful notifications get > 20
 * Invalid
 * - invalid token
 *
 */
test('Successful notifications get < 20 - 1 user tagged in channel (message length < 20)', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestChannelJoinV3(user2.token, channel1.channelId);
  requestMessageSendV2(user1.token, channel1.channelId, '@prettyugly hi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'nicoleleow tagged you in general: @prettyugly hi',
      }
    ],
  });
});

test('Successful notifications get < 20 - 1 user tagged in channel (message length > 20)', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestChannelJoinV3(user2.token, channel1.channelId);
  requestMessageSendV2(user1.token, channel1.channelId, '@prettyugly hihihihihihhi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'nicoleleow tagged you in general: @prettyugly hihihihi',
      }
    ],
  });
});

test('Successful notifications get < 20 - 2 user tagged in the same message in channel', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user3 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestChannelJoinV3(user2.token, channel1.channelId);
  requestChannelJoinV3(user3.token, channel1.channelId);
  requestMessageSendV2(user1.token, channel1.channelId, '@prettyugly@bigbird hi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'nicoleleow tagged you in general: @prettyugly@bigbird ',
      }
    ],
  });
  expect(requestNotificationsGetV1(user3.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'nicoleleow tagged you in general: @prettyugly@bigbird ',
      }
    ],
  });
});

test('Successful notifications get < 20 - 1 user tagged in DM (message length < 20)', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  requestMessageSenddmV2(user1.token, dm.dmId, '@prettyugly hi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'nicoleleow tagged you in nicoleleow, prettyugly: @prettyugly hi',
      },
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'nicoleleow added you to nicoleleow, prettyugly',
      }
    ],
  });
});

test('Successful notifications get < 20 - 1 user tagged in DM (message length > 20)', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  requestMessageSenddmV2(user1.token, dm.dmId, '@prettyugly hihihihihihihihi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'nicoleleow tagged you in nicoleleow, prettyugly: @prettyugly hihihihi',
      },
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'nicoleleow added you to nicoleleow, prettyugly',
      }
    ],
  });
});

test('Successful notifications get < 20 - 2 user tagged in the same message in DM', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user3 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId, user3.authUserId]);
  requestMessageSenddmV2(user1.token, dm.dmId, 'hi @prettyugly @bigbird');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'nicoleleow tagged you in bigbird, nicoleleow, prettyugly: hi @prettyugly @bigb',
      },
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'nicoleleow added you to bigbird, nicoleleow, prettyugly',
      }
    ],
  });
  expect(requestNotificationsGetV1(user3.token)).toStrictEqual({
    notifications: [
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'nicoleleow tagged you in bigbird, nicoleleow, prettyugly: hi @prettyugly @bigb',
      },
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'nicoleleow added you to bigbird, nicoleleow, prettyugly',
      }
    ],
  });
});

test('Successful notifications get < 20 - handle invalid)', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestChannelJoinV3(user2.token, channel1.channelId);
  requestMessageSendV2(user1.token, channel1.channelId, '@amazing hi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [],
  });
});

test('Successful notifications get < 20 - user not member of channel)', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestMessageSendV2(user1.token, channel1.channelId, '@prettyugly hi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [],
  });
});

test('Successful notifications get < 20 - user not member of DM', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const user3 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  requestMessageSenddmV2(user1.token, dm.dmId, '@bigbird hi');
  expect(requestNotificationsGetV1(user3.token)).toStrictEqual({
    notifications: [],
  });
});

test('Successful notifications get < 20 - user tagging themselves', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestMessageSendV2(user1.token, channel1.channelId, '@nicoleleow hi');
  expect(requestNotificationsGetV1(user1.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'nicoleleow tagged you in general: @nicoleleow hi',
      }
    ],
  });
});

test('Successful notifications get < 20 - same valid tag appears multiple times in one message', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestChannelJoinV3(user2.token, channel1.channelId);
  requestMessageSendV2(user1.token, channel1.channelId, '@prettyugly @prettyugly hi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'nicoleleow tagged you in general: @prettyugly @prettyu',
      }
    ],
  });
});

test('Successful notifications get < 20 - message edit in channel contains tag', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestChannelJoinV3(user2.token, channel1.channelId);
  const message = requestMessageSendV2(user1.token, channel1.channelId, 'hi');
  requestMessageEditV2(user1.token, message.messageId, '@prettyugly hi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'nicoleleow tagged you in general: @prettyugly hi',
      }
    ],
  });
});

test('Successful notifications get < 20 - message edit in DM contains tag', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm1 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm1.dmId, 'hi');
  requestMessageEditV2(user1.token, message.messageId, '@prettyugly hi');
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: -1,
        dmId: dm1.dmId,
        notificationMessage: 'nicoleleow tagged you in nicoleleow, prettyugly: @prettyugly hi',
      },
      {
        channelId: -1,
        dmId: dm1.dmId,
        notificationMessage: 'nicoleleow added you to nicoleleow, prettyugly',
      }
    ],
  });
});

test('Successful notifications get < 20 - message share to channel optional message contains tag', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  const channel2 = requestChannelsCreateV3(user1.token, 'math', true);
  requestChannelJoinV3(user2.token, channel1.channelId);
  requestChannelJoinV3(user2.token, channel2.channelId);
  const message = requestMessageSendV2(user1.token, channel1.channelId, 'hi');
  requestMessageShareV1(user1.token, message.messageId, '@prettyugly hi', channel2.channelId, -1);
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel2.channelId,
        dmId: -1,
        notificationMessage: 'nicoleleow tagged you in math: hi@prettyugly hi',
      }
    ],
  });
});

test('Successful notifications get < 20 - message share to DM optional message contains tag', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm1 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const dm2 = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm1.dmId, 'hi');
  requestMessageShareV1(user1.token, message.messageId, '@prettyugly hi', -1, dm2.dmId);
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: -1,
        dmId: dm2.dmId,
        notificationMessage: 'nicoleleow tagged you in nicoleleow, prettyugly: hi@prettyugly hi',
      },
      {
        channelId: -1,
        dmId: dm2.dmId,
        notificationMessage: 'nicoleleow added you to nicoleleow, prettyugly',
      },
      {
        channelId: -1,
        dmId: dm1.dmId,
        notificationMessage: 'nicoleleow added you to nicoleleow, prettyugly',
      }
    ],
  });
});

test('Successful notifications get < 20 - reacted message in channel', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestChannelJoinV3(user2.token, channel1.channelId);
  const message = requestMessageSendV2(user1.token, channel1.channelId, 'hi');
  requestMessageReactV1(user2.token, message.messageId, 1);
  expect(requestNotificationsGetV1(user1.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'prettyugly reacted to your message in general',
      }
    ],
  });
});

test('Successful notifications get < 20 - reacted message in DM', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  const message = requestMessageSenddmV2(user1.token, dm.dmId, 'hi');
  requestMessageReactV1(user2.token, message.messageId, 1);
  expect(requestNotificationsGetV1(user1.token)).toStrictEqual({
    notifications: [
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'prettyugly reacted to your message in nicoleleow, prettyugly',
      }
    ],
  });
});

test('Successful notifications get < 20 - added to a channel', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', false);
  requestChannelInviteV3(user1.token, channel1.channelId, user2.authUserId);
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'nicoleleow added you to general',
      }
    ],
  });
});

test('Successful notifications get < 20 - added to a DM', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestNotificationsGetV1(user2.token)).toStrictEqual({
    notifications: [
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: 'nicoleleow added you to nicoleleow, prettyugly',
      }
    ],
  });
});

test('Successful notifications get > 20', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const idList: number[] = [];
  for (let i = 0; i < 25; i++) {
    const channelId = requestChannelsCreateV3(user1.token, 'general', false).channelId;
    idList.unshift(channelId);
    requestChannelInviteV3(user1.token, channelId, user2.authUserId);
  }
  const result = requestNotificationsGetV1(user2.token);
  expect(result).toStrictEqual({
    notifications: expect.any(Array)
  });
  for (let i = 0; i < 20; i++) {
    expect(result.notifications[i].channelId).toStrictEqual(idList[i]);
  }
});

test('Invalid token', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
  const channel1 = requestChannelsCreateV3(user1.token, 'general', true);
  requestChannelJoinV3(user2.token, channel1.channelId);
  requestMessageSendV2(user1.token, channel1.channelId, '@prettyugly hi');
  expect(requestNotificationsGetV1(user2.token + user1.token)).toStrictEqual(403);
});

requestClear();
