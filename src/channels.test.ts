import { requestHelper } from './other';

//  reseting the state of the application (e.g. deleting all users, channels, messages, etc.)
//  at the start of every test
beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, '');
});

// ========================================================================= //
// Wrapper Functions

function requestAuthRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '');
}

function requestChannelsCreateV3(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

function requestChannelsListV3(token: string) {
  return requestHelper('GET', '/channels/list/v3', {}, token);
}

function requestChannelJoinV3(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '');
}

function requestChannelsListallV3(token: string) {
  return requestHelper('GET', '/channels/listall/v3', {}, token);
}
// ========================================================================= //

// tests for channels/create/v3 route
describe('Testing for channels/create/v3 route', () => {
  test('Expecting error when length of name is less than one', () => {
    // creating token first, authRegister will return that
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = user.token;
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated, '', true);
    expect(channelsCreateReturn).toStrictEqual(400);
  });

  test('Expecting error when length of name is more than 20', () => {
    // creating token first, authRegister will return that
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = user.token;
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated, 'a'.repeat(21), true);
    expect(channelsCreateReturn).toStrictEqual(400);
  });

  test('Expecting error when token is invalid token', () => {
    // not creating a token first
    const channelsCreateReturn = requestChannelsCreateV3('12ab', 'General', false);
    expect(channelsCreateReturn).toStrictEqual(403);
  });

  test('Expecting an integer as a return when valid parameters are given(isPublic is true)', () => {
    // creating token first, authRegister will return that
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = user.token;

    // then testing channel/create/v2
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated, 'General', true);
    expect(channelsCreateReturn.channelId).toStrictEqual(expect.any(Number));
  });

  test('Expecting an integer as a return when valid parameters are given(isPublic is false)', () => {
    // creating token first, authRegister will return that
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = user.token;

    // then testing channel/create/v2
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated, 'General', false);
    expect(channelsCreateReturn.channelId).toStrictEqual(expect.any(Number));
  });
});

// Tests for channels/list/v2 route
describe('Tests for channels/list/v2 route', () => {
  test('Expecting error when the authUserId is invalid', () => {
    // registering a user, using other tokenGenerated+1, so it would be invalid
    // creating token first, authRegister will return that
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = user.token;

    // then creating a channel
    requestChannelsCreateV3((tokenGenerated), 'General', true);

    // then accesing an array of channels the authorised user (accessed through tokens) is part of
    const channelsListReturn = requestChannelsListV3((tokenGenerated + 'randomstring'));
    expect(channelsListReturn).toStrictEqual(403);
  });

  test('Expecting array when the authUserId is part of one channels', () => {
    // creating token first, authRegister will return that
    const authRegisterReturn = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = authRegisterReturn.token;

    // then creating a channel
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated, 'General', true);
    const channelIdCreated = channelsCreateReturn.channelId;

    // then accesing an array of channels the authorised user (accessed through tokens) is part of
    const channelsListReturn = requestChannelsListV3(tokenGenerated);
    expect(channelsListReturn.channels).toStrictEqual([{
      channelId: channelIdCreated,
      name: 'General',
    }]);
  });

  test('Expecting array when the authUserId is part of 2 channels', () => {
    // creating token first, authRegister will return that
    const authRegisterReturn = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = authRegisterReturn.token;

    // then creating a channel
    const channelsCreateReturn1 = requestChannelsCreateV3(tokenGenerated, 'channel1', true);
    const channelIdCreated1 = channelsCreateReturn1.channelId;

    // same user creating another channel
    const channelsCreateReturn2 = requestChannelsCreateV3(tokenGenerated, 'channel2', true);
    const channelIdCreated2 = channelsCreateReturn2.channelId;

    // then accesing an array of channels the authorised user (accessed through tokens) is part of
    const channelsListReturn = requestChannelsListV3(tokenGenerated);
    expect(channelsListReturn.channels).toStrictEqual([{
      channelId: channelIdCreated1,
      name: 'channel1',
    }, {
      channelId: channelIdCreated2,
      name: 'channel2',
    }]);
  });

  test('Expecting empty array when the authUserId is part of none the channels', () => {
    // creating token first, authRegister will return that
    // to register user1 first and not making it part of any channel
    const authRegisterReturn1 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated1 = authRegisterReturn1.token;

    // registering user2 and making it create a channel
    const authRegisterReturn2 = requestAuthRegisterV3('welloops453@gmail.com', 'wellops453', 'Well', 'Oops');
    const tokenGenerated2 = authRegisterReturn2.token;

    // just user2 creating a channel2
    requestChannelsCreateV3(tokenGenerated2, 'General', true);

    // testing the user1 who is member of no channel
    const channelsListReturn = requestChannelsListV3(tokenGenerated1);
    expect(channelsListReturn.channels).toStrictEqual([]);
  });

  test('test for member who did not create channels but just is a member of channels', () => {
    // to register userl
    const authRegisterReturn1 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated1 = authRegisterReturn1.token;

    // to register user2
    const authRegisterReturn2 = requestAuthRegisterV3('welloops453@gmail.com', 'wellops453', 'Well', 'Oops');
    const tokenGenerated2 = authRegisterReturn2.token;

    // user 1 creating channel1
    const channelsCreateReturn1 = requestChannelsCreateV3(tokenGenerated1, 'channel1', true);
    const channelIdCreated1 = channelsCreateReturn1.channelId;

    // user 1 creating channel3
    requestChannelsCreateV3(tokenGenerated1, 'channel3', false);

    // user 2 joins channel1 but not channel3
    // channelJoinV1 takes in the token (authorised user) and the channelId it needs to join
    requestChannelJoinV3(tokenGenerated2, channelIdCreated1);

    // user 2 creating channel2
    const channelsCreateReturn2 = requestChannelsCreateV3(tokenGenerated2, 'channel2', true);
    const channelIdCreated2 = channelsCreateReturn2.channelId;

    // testing membership of user2
    const channelsListReturn = requestChannelsListV3(tokenGenerated2);
    expect(channelsListReturn.channels).toStrictEqual([{
      channelId: channelIdCreated1,
      name: 'channel1',
    }, {
      channelId: channelIdCreated2,
      name: 'channel2',
    }]);
  });
});

describe('/channels/listall/v2', () => {
  describe('Valid Cases', () => {
    test('token is valid, channels are all public', () => {
      const user = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
      const channel = requestChannelsCreateV3(user.token, 'General', true);
      const channel2 = requestChannelsCreateV3(user.token, 'Help', true);
      const result = requestChannelsListallV3(user.token);
      expect(result.channels).toStrictEqual([
        {
          channelId: channel.channelId,
          name: 'General'
        },
        {
          channelId: channel2.channelId,
          name: 'Help'
        }
      ]);
    });

    test('token is valid, channels are all private', () => {
      const user = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
      const channel = requestChannelsCreateV3(user.token, 'General', false);
      const channel2 = requestChannelsCreateV3(user.token, 'Help', false);
      const result = requestChannelsListallV3(user.token);
      expect(result.channels).toStrictEqual([
        {
          channelId: channel.channelId,
          name: 'General'
        },
        {
          channelId: channel2.channelId,
          name: 'Help'
        }
      ]);
    });
    test('token is valid, channels are both public and private', () => {
      const user = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
      const channel = requestChannelsCreateV3(user.token, 'General', true);
      const channel2 = requestChannelsCreateV3(user.token, 'Help', false);
      const result = requestChannelsListallV3(user.token);
      expect(result.channels).toStrictEqual([
        {
          channelId: channel.channelId,
          name: 'General'
        },
        {
          channelId: channel2.channelId,
          name: 'Help'
        }
      ]);
    });
  });

  describe('Error cases', () => {
    test('token is invalid', () => {
      const user = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
      const invalidUser = user.token + 'randomstring';
      const result = requestChannelsListallV3(invalidUser);
      expect(result).toStrictEqual(403);
    });
  });
});

requestClear();
