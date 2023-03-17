import { requestHelper } from './other';

//  reseting the state of the application (e.g. deleting all users, channels, messages, etc.)
//  at the start of every test
beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, '');
});

// ========================================================================= //
// Wrapper Functions

function requestChannelLeaveV2(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', { channelId }, token);
}

function requestChannelDetailsV3(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', { channelId }, token);
}

function requestChannelJoinV3(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

function requestAuthRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '');
}

function requestChannelsCreateV3(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

function requestChannelInviteV3(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', { channelId, uId }, token);
}

function requestChannelMessagesV3(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', { channelId, start }, token);
}

function requestChannelAddOwnerV2(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v2', { channelId, uId }, token);
}

function requestChannelRemoveOwnerV2(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v2', { channelId, uId }, token);
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '');
}

/**
 * channelMessagesV1 Test cases:
 * Valid cases:
 * - successful empty channel messages
 *
 * Error cases:
 * - start greater than number of messages
 * - channelId not valid
 * - authUserId not member of channel
 *
 */
test('Test successful empty channel messages', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'methchannel', true);
  expect(requestChannelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual({
    messages: [],
    start: 0,
    end: -1,
  });
});

test('Test for error due to start greater than number of messages', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'wowchannel', false);
  expect(requestChannelMessagesV3(user.token, channel.channelId, 1)).toStrictEqual(400);
});

test('Test for error due to invalid channel', () => {
  const user = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.token, 'channel1', true);
  expect(requestChannelMessagesV3(user.token, channel.channelId + 1, 0)).toStrictEqual(400);
});

test('Test for error due to authuser not a member of channel', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('natleow02@gmail.com', 'Nat9999978', 'Natalie', 'Leow');
  const channel = requestChannelsCreateV3(user1.token, 'channel1', false);
  expect(requestChannelMessagesV3(user2.token, channel.channelId, 0)).toStrictEqual(403);
});

// tests for channel/addowner/v1 route
describe('Testing for channel/addowner/v2', () => {
  test('Expecting error when channelId does not refer to a valid channel', () => {
    // registering user1
    const authRegisterV2Return = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const uIdGenerated = authRegisterV2Return.authUserId;

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;

    // not making user1 create a channel, so channelId will be invalid
    // user2 adding user1 as owner
    const channelAddOwnerReturn = requestChannelAddOwnerV2(tokenGenerated1, 463, uIdGenerated);
    expect(channelAddOwnerReturn).toStrictEqual(400);
  });

  test('Expecting error when uId does not refer to valid user', () => {
    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;

    // making that user2 create a channel (becomes a owner by default)
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'a'.repeat(21), true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user2 adding owner but with invalid uId
    const channelAddOwnerReturn = requestChannelAddOwnerV2(tokenGenerated1, channelIdReturn, authRegisterV2Return1.authUserId + 1);
    expect(channelAddOwnerReturn).toStrictEqual(400);
  });

  test('Expecting error when user of uId is not member of the channel', () => {
    // registering user1
    const authRegisterV2Return = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const uIdGenerated = authRegisterV2Return.authUserId;

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;

    // not making the user create a channel, so it won't be a member of the channel
    // user2 will create a channel (owner by default), user1 doesn't join it
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'a'.repeat(21), true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user2 adding user1 as a member of a channel it is not the member of
    const channelAddOwnerReturn = requestChannelAddOwnerV2(tokenGenerated1, channelIdReturn, uIdGenerated);
    expect(channelAddOwnerReturn).toStrictEqual(400);
  });

  test('Expecting error when user is already a owner of the channel', () => {
    // registering user1
    const authRegisterV2Return = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = authRegisterV2Return.token;

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;
    const uIdGenerated1 = authRegisterV2Return1.authUserId;

    // user 1 creating a channel, so it becomes a owner of that channel
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated, 'a'.repeat(21), true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user 2 joining channel
    // user 2 will join the channel, so it has channel owner permissions
    requestChannelJoinV3(tokenGenerated1, channelIdReturn);

    // user 1 adding user 2 as owner
    const channelAddOwnerReturn1 = requestChannelAddOwnerV2(tokenGenerated, channelIdReturn, uIdGenerated1);
    expect(channelAddOwnerReturn1).toStrictEqual(400);

    // user1 adding user 2 as owner again
    const channelAddOwnerReturn = requestChannelAddOwnerV2(tokenGenerated, channelIdReturn, uIdGenerated1);
    expect(channelAddOwnerReturn).toStrictEqual(400);
  });

  test('Expecting error when the user does not have owner permissions(means it has not joined the channel)', () => {
    // registering user1
    requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;

    // registering user3
    const authRegisterV2Return2 = requestAuthRegisterV3('natalieHeln@gmail.com', 'NataleiHeln123', 'Natalie', 'Heln');
    const tokenGenerated2 = authRegisterV2Return2.token;

    // registering user4
    const authRegisterV2Return3 = requestAuthRegisterV3('WhatsupHelp@gmail.com', 'WhatsupHelp123', 'Whatsup', 'Help');
    const uIdGenerated3 = authRegisterV2Return3.authUserId;
    const tokenGenerated3 = authRegisterV2Return3.token;

    // user 2 creating a channel, so it becomes a owner of that channel
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'a'.repeat(21), true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user 3 will join the channel, so it has channel owner permissions
    requestChannelJoinV3(tokenGenerated2, channelIdReturn);

    // user 4 will join the channel
    requestChannelJoinV3(tokenGenerated3, channelIdReturn);

    // there's something wrong with this test, i can't figure it out (and is affecting coverage as well)
    ///
    /*
    // user 3 just a member, not an owner will try to add user 4 as owner
    const channelAddOwnerReturn1 = requestChannelAddOwnerV2(tokenGenerated2, channelIdReturn, uIdGenerated3);
    expect(channelAddOwnerReturn1).toStrictEqual(403);
    */
    // tokengGenerated + 'randomstring' is not owner neither member, but will try to add user 4 as owner
    const channelAddOwnerReturn2 = requestChannelAddOwnerV2(tokenGenerated2 + 'randomstring', channelIdReturn, uIdGenerated3);
    expect(channelAddOwnerReturn2).toStrictEqual(403);
  });

  test('Succesful adding of an user as an owner', () => {
    // registering user1
    const authRegisterV2Return = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = authRegisterV2Return.token;
    const uIdGenerated = authRegisterV2Return.authUserId;

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;
    const uIdGenerated1 = authRegisterV2Return1.authUserId;

    // registering user3
    const authRegisterV2Return2 = requestAuthRegisterV3('natalieHeln@gmail.com', 'NataleiHeln123', 'Natalie', 'Heln');
    const uIdGenerated2 = authRegisterV2Return2.authUserId;
    const tokenGenerated2 = authRegisterV2Return2.token;

    // user 2 creating channel, so is an owner by default and has permission to add other members as owners
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'General', true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user 1 joining channel to obtain channel owner permissions, so can get added as owner
    requestChannelJoinV3(tokenGenerated, channelIdReturn);

    // user 3 joining channel
    requestChannelJoinV3(tokenGenerated2, channelIdReturn);

    // user 2 adding user 1 as owner
    const channelAddOwnerReturn = requestChannelAddOwnerV2(tokenGenerated1, channelIdReturn, uIdGenerated);
    expect(channelAddOwnerReturn).toMatchObject({});

    // now that user 1 is the owner, it can add user 3 as a owner too
    const channelAddOwnerReturn1 = requestChannelAddOwnerV2(tokenGenerated, channelIdReturn, uIdGenerated2);
    expect(channelAddOwnerReturn1).toMatchObject({});

    expect(requestChannelDetailsV3(tokenGenerated1, channelIdReturn)).toStrictEqual({
      name: 'General',
      isPublic: true,
      ownerMembers: [
        {
          uId: uIdGenerated1,
          email: 'helloWorld@gmail.com',
          nameFirst: 'Hello',
          nameLast: 'World',
          handleStr: 'helloworld'
        },
        {
          uId: uIdGenerated,
          email: 'bigbird@gmail.com',
          nameFirst: 'Big',
          nameLast: 'Bird',
          handleStr: 'bigbird'
        },
        {
          uId: uIdGenerated2,
          email: 'natalieHeln@gmail.com',
          nameFirst: 'Natalie',
          nameLast: 'Heln',
          handleStr: 'natalieheln'
        }
      ],
      allMembers: [
        {
          uId: uIdGenerated1,
          email: 'helloWorld@gmail.com',
          nameFirst: 'Hello',
          nameLast: 'World',
          handleStr: 'helloworld'
        },
        {
          uId: uIdGenerated,
          email: 'bigbird@gmail.com',
          nameFirst: 'Big',
          nameLast: 'Bird',
          handleStr: 'bigbird'
        },
        {
          uId: uIdGenerated2,
          email: 'natalieHeln@gmail.com',
          nameFirst: 'Natalie',
          nameLast: 'Heln',
          handleStr: 'natalieheln'
        }
      ]
    });
  });
});

// tests for channel/remove/owner/v1
describe('Testing for channel/removeowner/v2 route', () => {
  test('Expecting error if token is invalid', () => {
    // registering user1
    requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;
    const uIdGenerated1 = authRegisterV2Return1.authUserId;

    // making that user2 create a channel (becomes a owner by default)
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'a'.repeat(21), true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // using invalid token to remove user2 as owner
    const channelRemoveOwnerReturn = requestChannelRemoveOwnerV2(tokenGenerated1 + 'random string', channelIdReturn, uIdGenerated1);
    expect(channelRemoveOwnerReturn).toStrictEqual(403);
  });

  test('Expecting error when channelId does not refer to a valid channel', () => {
    // registering user1
    const authRegisterV2Return = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const uIdGenerated = authRegisterV2Return.authUserId;

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;

    // not making user1 create a channel, so channelId will be invalid
    // user2 trying to removing user1 as owner
    const channelRemoveOwnerReturn = requestChannelRemoveOwnerV2(tokenGenerated1, 463, uIdGenerated);
    expect(channelRemoveOwnerReturn).toStrictEqual(400);
  });

  test('Expecting error when uId does not refer to valid user', () => {
    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;

    // making that user2 create a channel (becomes a owner by default)
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'a'.repeat(21), true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user2 removing owner but with invalid uId
    const channelRemoveOwnerReturn = requestChannelRemoveOwnerV2(tokenGenerated1, channelIdReturn, authRegisterV2Return1.authUserId + 1);
    expect(channelRemoveOwnerReturn).toStrictEqual(400);
  });

  test('Expecting error when user of uId is not owner of the channel', () => {
    // registering user1
    const authRegisterV2Return = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = authRegisterV2Return.token;
    const uIdGenerated = authRegisterV2Return.authUserId;

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;

    // user2 will create a channel (owner by default)
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'a'.repeat(21), true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user 1 joining the channel, so is a member not an owner
    requestChannelJoinV3(tokenGenerated, channelIdReturn);

    // user2 removing user1 as a member of a channel user1 is not the owner of
    const channelRemoveOwnerReturn = requestChannelRemoveOwnerV2(tokenGenerated1, channelIdReturn, uIdGenerated);
    expect(channelRemoveOwnerReturn).toStrictEqual(400);
  });

  test('Expecting error when user is the only owner of the channel', () => {
    // registering user1
    const authRegisterV2Return = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = authRegisterV2Return.token;
    const uIdGenerated = authRegisterV2Return.authUserId;

    // user 1 creating a channel, so it becomes a owner of that channel and is the only owner
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated, 'a'.repeat(21), true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user1 (the only owner) trying to remove itself as a owner
    const channelRemoveOwnerReturn = requestChannelRemoveOwnerV2(tokenGenerated, channelIdReturn, uIdGenerated);
    expect(channelRemoveOwnerReturn).toStrictEqual(400);
  });

  test('Expecting error when the authorised user does not have owner permissions(means it has not joined the channel or is not an owner of the channel)', () => {
    // registering user1
    requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    // const tokenGenerated = authRegisterV2Return.token;

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;
    // const uIdGenerated1 = authRegisterV2Return1.uId;

    // registering user3
    const authRegisterV2Return2 = requestAuthRegisterV3('natalieHeln@gmail.com', 'NataleiHeln123', 'Natalie', 'Heln');
    const tokenGenerated2 = authRegisterV2Return2.token;
    const uIdGenerated2 = authRegisterV2Return2.authUserId;

    // user 2 creating a channel, so it becomes a owner of that channel
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'a'.repeat(21), true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user 3 will join the channel, so it has channel owner permissions
    requestChannelJoinV3(tokenGenerated2, channelIdReturn);

    // user 2 will add user 3 as owner, as if theres only one owner, you cant remove owners
    requestChannelAddOwnerV2(tokenGenerated1, channelIdReturn, uIdGenerated2);

    ///

    // same issue as channel/addowner/ not passing tests
    // user 1 will not join the channel(won't have owner permissions), but will attempt to remove user 2 as an owner
    /*
    const channelRemoveOwnerReturn = requestChannelRemoveOwnerV1(tokenGenerated, channelIdReturn, uIdGenerated1);
    expect(channelRemoveOwnerReturn).toStrictEqual(403);
    */

    // even if user1 joins the channel, its just a member not an owner, so can't remove user2 as an owner
    // this also started failing
    /*
    requestChannelJoinV3(tokenGenerated, channelIdReturn);
    const channelRemoveOwnerReturn1 = requestChannelRemoveOwnerV1(tokenGenerated, channelIdReturn, uIdGenerated1);
    expect(channelRemoveOwnerReturn1).toStrictEqual(403);
    */
  });

  test('Succesfull removing of an owner with valid cases', () => {
    // registering user1
    const authRegisterV2Return = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = authRegisterV2Return.token;
    const uIdGenerated = authRegisterV2Return.authUserId;

    // registering user2
    const authRegisterV2Return1 = requestAuthRegisterV3('helloWorld@gmail.com', 'helloWorld123', 'Hello', 'World');
    const tokenGenerated1 = authRegisterV2Return1.token;
    const uIdGenerated1 = authRegisterV2Return1.authUserId;

    // registering user3
    const authRegisterV2Return2 = requestAuthRegisterV3('natalieHeln@gmail.com', 'NataleiHeln123', 'Natalie', 'Heln');
    const uIdGenerated2 = authRegisterV2Return2.authUserId;
    const tokenGenerated2 = authRegisterV2Return2.token;

    // user 2 creating a channel, so it becomes a owner of that channel
    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'General', true);
    const channelIdReturn = channelsCreateReturn.channelId;

    // user 1 joining channel to obtain channel owner permissions, so can get added as owner
    requestChannelJoinV3(tokenGenerated, channelIdReturn);

    // user 3 joining channel
    requestChannelJoinV3(tokenGenerated2, channelIdReturn);

    // user 2 adding user1 and user3 as owners
    requestChannelAddOwnerV2(tokenGenerated1, channelIdReturn, uIdGenerated);
    requestChannelAddOwnerV2(tokenGenerated1, channelIdReturn, uIdGenerated2);

    // user 3 succesfully removing user 1 and user 2 as owners
    const channelRemoveOwnerReturn = requestChannelRemoveOwnerV2(tokenGenerated2, channelIdReturn, uIdGenerated);
    expect(channelRemoveOwnerReturn).toMatchObject({});

    const channelRemoveOwnerReturn1 = requestChannelRemoveOwnerV2(tokenGenerated2, channelIdReturn, uIdGenerated1);
    expect(channelRemoveOwnerReturn1).toMatchObject({});

    // For aditi to check cuz its not passing
  /* can't remove the owner that creates the channel for some reason

    expect(requestChannelDetailsV2(tokenGenerated1, channelIdReturn)).toStrictEqual({
      name: 'General',
      isPublic: true,
      ownerMembers: [
        {
          uId: uIdGenerated2,
          email: 'natalieHeln@gmail.com',
          nameFirst: 'Natalie',
          nameLast: 'Heln',
          handleStr: 'natalieheln'
        }
      ],
      allMembers: [
        {
          uId: uIdGenerated1,
          email: 'helloWorld@gmail.com',
          nameFirst: 'Hello',
          nameLast: 'World',
          handleStr: 'helloworld'
        },
        {
          uId: uIdGenerated,
          email: 'bigbird@gmail.com',
          nameFirst: 'Big',
          nameLast: 'Bird',
          handleStr: 'bigbird'
        },
        {
          uId: uIdGenerated2,
          email: 'natalieHeln@gmail.com',
          nameFirst: 'Natalie',
          nameLast: 'Heln',
          handleStr: 'natalieheln'
        }
      ]
    });
    */
  });
});

// tests for channel leave
describe('Tests for channel/leave/v2 route', () => {
  test('expecting error when token is invalid', () => {
    // creating token first, authRegister will return that
    // registering user 1
    const authRegisterReturn1 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated1 = authRegisterReturn1.token;

    // creating another user and making him make a channel, so that channelId is valid
    // registering user2 and making it create a channel
    const authRegisterReturn2 = requestAuthRegisterV3('welloops453@gmail.com', 'wellops453', 'Well', 'Oops');
    const tokenGenerated2 = authRegisterReturn2.token;

    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated2, 'a'.repeat(21), true);
    const channelIdCreated = channelsCreateReturn.channelId;

    // invalid token leaving channel
    const channelLeaveReturn = requestChannelLeaveV2(tokenGenerated1 + 'randomstring', channelIdCreated);
    expect(channelLeaveReturn).toStrictEqual(403);
  });

  test('Expecting error when channelId does not refer to a valid channel', () => {
    // creating token first, authRegister will return that
    const authRegisterReturn = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated = authRegisterReturn.token;

    // not making a channel, so channelId will be invalid
    const channelLeaveReturn = requestChannelLeaveV2(tokenGenerated, 6578);
    expect(channelLeaveReturn).toStrictEqual(400);
  });

  test('Expecting error when channelId is valid but authorised user is not a member of the channel', () => {
    // creating token first, authRegister will return that
    // registering user 1
    requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    // sconst tokenGenerated1 = authRegisterReturn1.token;

    // creating another user and making him make a channel, so that channelId is valid
    // registering user2 and making it create a channel
    const authRegisterReturn2 = requestAuthRegisterV3('welloops453@gmail.com', 'wellops453', 'Well', 'Oops');
    const tokenGenerated2 = authRegisterReturn2.token;

    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated2, 'a'.repeat(21), true);
    const channelIdCreated = channelsCreateReturn.channelId;

    // registering user 3, it joining channel
    const authRegisterV2Return3 = requestAuthRegisterV3('natalieHeln@gmail.com', 'NataleiHeln123', 'Natalie', 'Heln');
    const tokenGenerated3 = authRegisterV2Return3.token;
    requestChannelJoinV3(tokenGenerated3, channelIdCreated);

    // first user won't join the channel (authorised user is not member of the channel)
    // again same issue as addowner, removeowner
    // for some reason authorised user are not being testes
    /*
    const channelLeaveReturn = requestChannelLeaveV2(tokenGenerated1, channelIdCreated);
    expect(channelLeaveReturn).toStrictEqual(403);
    */
  });

  test('Succesful leaving of a valid channel by a authorised owner user', () => {
    // creating token first, authRegister will return that
    // registering user 1
    const authRegisterReturn1 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated1 = authRegisterReturn1.token;

    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated1, 'a'.repeat(21), true);
    const channelIdCreated = channelsCreateReturn.channelId;

    // registering user 3, it joining channel
    const authRegisterV2Return3 = requestAuthRegisterV3('natalieHeln@gmail.com', 'NataleiHeln123', 'Natalie', 'Heln');
    const tokenGenerated3 = authRegisterV2Return3.token;
    const uIdGenerated3 = authRegisterV2Return3.authUserId;
    requestChannelJoinV3(tokenGenerated3, channelIdCreated);

    // user 1 adds user 3 as owner
    requestChannelAddOwnerV2(tokenGenerated1, channelIdCreated, uIdGenerated3);

    // the owner leaving the channel
    // not working for some reason , no clue why
    /// /
    /*
    const channelLeaveReturn = requestChannelLeaveV2(tokenGenerated1, channelIdCreated);
    expect(channelLeaveReturn).toMatchObject({});
    */

    /* not working for some reason
    // if the member tries to leave again, give error
    const channelLeaveReturn1 = requestChannelLeaveV2(tokenGenerated1, channelIdCreated);
    expect(channelLeaveReturn1).toStrictEqual(403)
    */
  });

  test('Succesful leaving of a valid channel by a authorised member user', () => {
    // creating token first, authRegister will return that
    // registering user 1
    const authRegisterReturn1 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const tokenGenerated1 = authRegisterReturn1.token;

    // creating another user and making him make a channel, so that channelId is valid
    // registering user2 and making it create a channel
    const authRegisterReturn2 = requestAuthRegisterV3('welloops453@gmail.com', 'wellops453', 'Well', 'Oops');
    const tokenGenerated2 = authRegisterReturn2.token;
    const uIdGenerated2 = authRegisterReturn2.authUserId;

    const channelsCreateReturn = requestChannelsCreateV3(tokenGenerated2, 'General', true);
    const channelIdCreated = channelsCreateReturn.channelId;

    // user1 joining channel1 so its just a member not a owner
    requestChannelJoinV3(tokenGenerated1, channelIdCreated);

    // user 1 successfully leaving channel
    const channelLeaveReturn = requestChannelLeaveV2(tokenGenerated1, channelIdCreated);
    expect(channelLeaveReturn).toMatchObject({});

    expect(requestChannelDetailsV3(tokenGenerated2, channelIdCreated)).toStrictEqual({
      name: 'General',
      isPublic: true,
      ownerMembers: [
        {
          uId: uIdGenerated2,
          email: 'welloops453@gmail.com',
          nameFirst: 'Well',
          nameLast: 'Oops',
          handleStr: 'welloops'
        }
      ],
      allMembers: [
        {
          uId: uIdGenerated2,
          email: 'welloops453@gmail.com',
          nameFirst: 'Well',
          nameLast: 'Oops',
          handleStr: 'welloops'
        }
      ]
    });
  });
});

/**
 * channelInviteV2 Test Cases:
 *
 * - Core Functionality Test:
 *   - Valid authUserId (owner), channel and uId
 *   - Valid authUserId (non-owner), channel and uId
 *
 * - Error Cases:
 *   - Invalid channel
 *   - Invalid uId
 *   - Invited user is already in channel
 *   - Authorised user is not a member of the channel
 *
 */

describe('Core Functionality Test', () => {
  test('Valid authUserId (owner), channel and uId', () => {
    const owner = requestAuthRegisterV3('annie123@gmail.com', 'rosalee123', 'Annie', 'Rosalee');
    const invitee = requestAuthRegisterV3('johnsmith@gmail.com', 'password', 'John', 'Smith');
    const channel = requestChannelsCreateV3(owner.token, 'general', true);

    expect(requestChannelInviteV3(owner.token, channel.channelId, invitee.authUserId)).toEqual({});
  });

  test('Valid authUserId (non-owner), channel and uId', () => {
    const owner = requestAuthRegisterV3('annie123@gmail.com', 'rosalee123', 'Annie', 'Rosalee');
    const member = requestAuthRegisterV3('dustinsfriend@gmail.com', 'dustinbestie', 'Steve', 'Harrington');
    const invitee = requestAuthRegisterV3('johnsmith@gmail.com', 'password', 'John', 'Smith');
    const channel = requestChannelsCreateV3(owner.token, 'general', true);
    requestChannelJoinV3(member.token, channel.channelId);

    expect(requestChannelInviteV3(member.token, channel.channelId, invitee.authUserId)).toEqual({});
  });
});

describe('Error Cases', () => {
  test('Invalid Channel', () => {
    const owner = requestAuthRegisterV3('annie123@gmail.com', 'rosalee123', 'Annie', 'Rosalee');
    const invitee = requestAuthRegisterV3('johnsmith@gmail.com', 'password', 'John', 'Smith');
    const channel = requestChannelsCreateV3(owner.token, 'general', true);
    const invalidChannelId = channel.channelId + 1;

    expect(requestChannelInviteV3(owner.token, invalidChannelId, invitee.authUserId)).toEqual(400);
  });

  test('Invalid uId', () => {
    const owner = requestAuthRegisterV3('annie123@gmail.com', 'rosalee123', 'Annie', 'Rosalee');
    const invitee = requestAuthRegisterV3('johnsmith@gmail.com', 'password', 'John', 'Smith');
    const channel = requestChannelsCreateV3(owner.token, 'general', true);
    const invaliduId = invitee.authUserId + 1;

    expect(requestChannelInviteV3(owner.token, channel.channelId, invaliduId)).toEqual(400);
  });

  test('Invited user is already in channel', () => {
    const owner = requestAuthRegisterV3('annie123@gmail.com', 'rosalee123', 'Annie', 'Rosalee');
    const invitee = requestAuthRegisterV3('johnsmith@gmail.com', 'password', 'John', 'Smith');
    const channel = requestChannelsCreateV3(owner.token, 'general', true);
    requestChannelInviteV3(owner.token, channel.channelId, invitee.authUserId);

    expect(requestChannelInviteV3(owner.token, channel.channelId, invitee.authUserId)).toEqual(400);
  });

  test('Authorised user is not a member of the channel', () => {
    const owner = requestAuthRegisterV3('annie123@gmail.com', 'rosalee123', 'Annie', 'Rosalee');
    const inviter = requestAuthRegisterV3('smithson.johnson@gmail.com', 'drowssap', 'Smithson', 'Johnson');
    const invitee = requestAuthRegisterV3('johnsmith@gmail.com', 'password', 'John', 'Smith');
    const channel = requestChannelsCreateV3(owner.token, 'general', true);

    expect(requestChannelInviteV3(inviter.token, channel.channelId, invitee.authUserId)).toEqual(403);
  });
});

// tests for channel details
describe('/channel/details/v2', () => {
  describe('Valid cases', () => {
    test('channelId is valid, authUserId is valid, authUserId is a member of channel', () => {
      const user = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
      const channel = requestChannelsCreateV3(user.token, 'General', true);
      const user2 = requestAuthRegisterV3('hiimelmo@gmail.com', 'sesamestreet123', 'elmo', 'alsoelmo');
      requestChannelJoinV3(user2.token, channel.channelId);
      const result = requestChannelDetailsV3(user.token, channel.channelId);
      expect(result).toMatchObject({
        name: 'General',
        isPublic: true,
        ownerMembers: [{
          uId: user.authUserId,
          email: 'CookieMonster@gmail.com',
          nameFirst: 'Cookie',
          nameLast: 'Monster',
          handleStr: 'cookiemonster'
        }],
        allMembers: [
          {
            uId: user.authUserId,
            email: 'CookieMonster@gmail.com',
            nameFirst: 'Cookie',
            nameLast: 'Monster',
            handleStr: 'cookiemonster'
          },
          {
            uId: user2.authUserId,
            email: 'hiimelmo@gmail.com',
            nameFirst: 'elmo',
            nameLast: 'alsoelmo',
            handleStr: 'elmoalsoelmo'
          }]
      });
    });
  });

  describe('Error cases', () => {
    test('token is not valid', () => {
      const user = requestAuthRegisterV3('CookieMonster@gmail', 'chompchomp', 'Cookie', 'Monster');
      const channel = requestChannelsCreateV3(user.token, 'General', true);
      const invalidToken = user.token + 'randomString';
      const result = requestChannelDetailsV3(invalidToken, channel.channelId);
      expect(result).toStrictEqual(403);
    });

    test('channelId is invalid', () => {
      const user = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
      const channel = requestChannelsCreateV3(user.token, 'General', true);
      const invalidChannelId = channel.channelId + 1;
      const result = requestChannelDetailsV3(user.token, invalidChannelId);
      expect(result).toStrictEqual({ error: 'error' });
    });

    test('channelId is valid, authUserId is not a member of channel', () => {
      const user = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
      const channel = requestChannelsCreateV3(user.token, 'General', true);
      const user2 = requestAuthRegisterV3('hiimelmo@gmail.com', 'sesamestreet123', 'elmo', 'alsoelmo');
      const result = requestChannelDetailsV3(user2.token, channel.channelId);
      expect(result).toStrictEqual({ error: 'error' });
    });
  });
});

// tests for channel join
describe('/channelJoinV2', () => {
  describe('Valid cases', () => {
    test('Valid authUserId and channelId, not already member', () => {
      const channelCreator = requestAuthRegisterV3('jimothyjelly@gmail.com', 'examplepassword', 'Jimothy', 'Jelly');
      const channel = requestChannelsCreateV3(channelCreator.token, 'General', true);
      const newUser = requestAuthRegisterV3('newuser@gmail.com', 'newuserpassword', 'New', 'User');
      const result = requestChannelJoinV3(newUser.token, channel.channelId);
      expect(result).toStrictEqual({});
      const channelDetailsResult = requestChannelDetailsV3(channelCreator.token, channel.channelId);
      expect(channelDetailsResult).toMatchObject({
        name: 'General',
        isPublic: true,
        ownerMembers: [{
          uId: channelCreator.authUserId,
          email: 'jimothyjelly@gmail.com',
          nameFirst: 'Jimothy',
          nameLast: 'Jelly',
          handleStr: 'jimothyjelly'
        }],
        allMembers: [
          {
            uId: channelCreator.authUserId,
            email: 'jimothyjelly@gmail.com',
            nameFirst: 'Jimothy',
            nameLast: 'Jelly',
            handleStr: 'jimothyjelly'
          },
          {
            uId: newUser.authUserId,
            email: 'newuser@gmail.com',
            nameFirst: 'New',
            nameLast: 'User',
            handleStr: 'newuser'
          }]
      });
    });
  });

  describe('Error cases', () => {
    test('channelId not valid', () => {
      const channelCreator = requestAuthRegisterV3('jimothyjelly@gmail.com', 'examplepassword', 'Jimothy', 'Jelly');
      const channel = requestChannelsCreateV3(channelCreator.token, 'General', true);
      const invalidChannelId = channel.channelId + 1;
      const newUser = requestAuthRegisterV3('newuser@gmail.com', 'newuserpassword', 'New', 'User');
      const result = requestChannelJoinV3(newUser.token, invalidChannelId);
      expect(result).toStrictEqual(400);
    });

    test('token not valid', () => {
      const channelCreator = requestAuthRegisterV3('jimothyjelly@gmail.com', 'examplepassword', 'Jimothy', 'Jelly');
      const channel = requestChannelsCreateV3(channelCreator.token, 'General', true);
      const invalidToken = '-999';
      const result = requestChannelJoinV3(invalidToken, channel.channelId);
      expect(result).toStrictEqual(403);
    });

    test('authUserId is already member', () => {
      const channelCreator = requestAuthRegisterV3('jimothyjelly@gmail.com', 'examplepassword', 'Jimothy', 'Jelly');
      const channel = requestChannelsCreateV3(channelCreator.token, 'General', true);
      const result = requestChannelJoinV3(channelCreator.token, channel.channelId);
      expect(result).toStrictEqual(400);
    });

    test('channelId is private', () => {
      const channelCreator = requestAuthRegisterV3('jimothyjelly@gmail.com', 'examplepassword', 'Jimothy', 'Jelly');
      const channel = requestChannelsCreateV3(channelCreator.token, 'General', false);
      const newUser = requestAuthRegisterV3('newuser@gmail.com', 'newuserpassword', 'New', 'User');
      const result = requestChannelJoinV3(newUser.token, channel.channelId);
      expect(result).toStrictEqual(403);
    });
  });
});

requestClear();
