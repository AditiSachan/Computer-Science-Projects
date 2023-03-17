import { requestHelper } from './other';
function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '');
}

function requestAuthRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '');
}

function requestChannelsCreateV2(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

function requestChannelJoinV2(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

function requestStandupStartV1(token: string, channelId: number, length: number) {
  return requestHelper('POST', '/standup/start/v1', { channelId, length }, token);
}

function requestStandupActiveV1(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { channelId }, token);
}

function requestStandupSendV1(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', { channelId, message }, token);
}
/*
function requestChannelMessagesV3(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', { channelId, start }, token);
}

*/

beforeEach(() => {
  return requestClear();
});

describe('Tests for standup/start/v1', () => {
  test('Error when token is in valid', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    const standupStart = requestStandupStartV1(user.token + 90, channel.channelId, 90);
    expect(standupStart).toStrictEqual(403);
  });

  test('Error when channelId does not refer to a valid channel', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    const standupStart = requestStandupStartV1(user.token, channel.channelId + 90, 90);
    expect(standupStart).toStrictEqual(400);
  });

  test('Error when length is a negative number', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    const standupStart = requestStandupStartV1(user.token, channel.channelId + 90, -90);
    expect(standupStart).toStrictEqual(400);
  });

  test('Error when an active standup is currently running in the channel', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const user2 = requestAuthRegisterV2('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestChannelJoinV2(user2.token, channel.channelId);
    requestStandupStartV1(user.token, channel.channelId, 90);
    const standupStart2 = requestStandupStartV1(user2.token, channel.channelId, 80);
    expect(standupStart2).toStrictEqual(400);
  });

  test('Error when channel Id is valid and authorised user is not a member of the channel', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const user2 = requestAuthRegisterV2('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    const standupStart = requestStandupStartV1(user2.token, channel.channelId, 90);
    expect(standupStart).toStrictEqual(403);
  });

  test('Successful Case', async () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const user2 = requestAuthRegisterV2('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
    const user3 = requestAuthRegisterV2('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestChannelJoinV2(user2.token, channel.channelId);
    requestChannelJoinV2(user3.token, channel.channelId);
    const standupStart = requestStandupStartV1(user.token, channel.channelId, 80);
    expect(standupStart.timeFinish).toStrictEqual(expect.any(Number));
  });
});

describe('Tests for standup/active/v1', () => {
  test('Error when token is in valid', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestStandupStartV1(user.token, channel.channelId, 90);
    const ifStandupActive = requestStandupActiveV1(user.token + 90, channel.channelId);
    expect(ifStandupActive).toStrictEqual(403);
  });

  test('Error when channelId does not refer to a valid channel', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestStandupStartV1(user.token, channel.channelId, 90);
    const ifStandupActive = requestStandupActiveV1(user.token, channel.channelId + 90);
    expect(ifStandupActive).toStrictEqual(400);
  });

  test('Error when channel Id is valid and authorised user is not a member of the channel', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const user2 = requestAuthRegisterV2('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestStandupStartV1(user.token, channel.channelId, 90);
    const ifStandupActive = requestStandupActiveV1(user2.token, channel.channelId);
    expect(ifStandupActive).toStrictEqual(403);
  });

  test('Succesfull case', async () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const user2 = requestAuthRegisterV2('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
    const user3 = requestAuthRegisterV2('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestChannelJoinV2(user2.token, channel.channelId);
    requestChannelJoinV2(user3.token, channel.channelId);
    requestStandupStartV1(user.token, channel.channelId, 5);
    // Wait for 90 seconds
    await new Promise((r) => setTimeout(r, 3000));
    const ifStandupActive = requestStandupActiveV1(user2.token, channel.channelId);
    expect(ifStandupActive).toMatchObject(
      {
        isActive: true,
        timeFinish: ifStandupActive.timeFinish
      });
  });

  test('Succesfull case', async () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const user2 = requestAuthRegisterV2('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
    const user3 = requestAuthRegisterV2('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestChannelJoinV2(user2.token, channel.channelId);
    requestChannelJoinV2(user3.token, channel.channelId);
    requestStandupStartV1(user.token, channel.channelId, 3);
    // Wait for 90 seconds
    await new Promise((r) => setTimeout(r, 4000));
    const ifStandupActive = requestStandupActiveV1(user2.token, channel.channelId);
    expect(ifStandupActive).toMatchObject(
      {
        isActive: false,
        timeFinish: null
      });
  });
});

describe('Tests for standup/send/v1', () => {
  test('Error when token is in valid', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestStandupStartV1(user.token + 90, channel.channelId, 90);
    const ifSendSuccess = requestStandupSendV1(user.token + 90, channel.channelId, 'Debugging the http errors');
    expect(ifSendSuccess).toStrictEqual(403);
  });

  test('Error when channelId does not refer to a valid channel', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestStandupStartV1(user.token, channel.channelId, 90);
    const ifSendSuccess = requestStandupSendV1(user.token, channel.channelId + 90, 'Debugging the http errors');
    expect(ifSendSuccess).toStrictEqual(400);
  });

  test('Error when length is a negative number', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestStandupStartV1(user.token, channel.channelId, 90);
    const ifSendSuccess = requestStandupSendV1(user.token, channel.channelId, 'a'.repeat(1500));
    expect(ifSendSuccess).toStrictEqual(400);
  });

  test('Error when active standup is not currently running', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    const ifSendSuccess = requestStandupSendV1(user.token, channel.channelId, 'a'.repeat(1500));
    expect(ifSendSuccess).toStrictEqual(400);
  });

  test('Error when channel Id is valid and authorised user is not a member of the channel', () => {
    const user = requestAuthRegisterV2('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
    const user2 = requestAuthRegisterV2('Pretty.Ugly@gmail.com', 'qwerty', 'Pretty', 'Ugly');
    const channel = requestChannelsCreateV2(user.token, 'methchannel', true);
    requestStandupStartV1(user.token, channel.channelId, 90);
    const ifSendSuccess = requestStandupSendV1(user2.token, channel.channelId, 'http errros');
    expect(ifSendSuccess).toStrictEqual(403);
  });
});
