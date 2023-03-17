import { requestHelper } from './other';

// ========================================================================= //
// Wrapper Functions

function requestDmDetailsV2(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v2', { dmId }, token);
}

function requestAuthRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '');
}

function requestDmCreateV2(token: string, uIds: Array<number>) {
  return requestHelper('POST', '/dm/create/v2', { uIds }, token);
}

function requestDmListV2(token: string) {
  return requestHelper('GET', '/dm/list/v2', {}, token);
}

function requestDmRemoveV2(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { dmId }, token);
}

function requestDmLeaveV2(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v2', { dmId }, token);
}

function requestUserProfileV3(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', { uId }, token);
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '');
}

function requestDmMessagesV2(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', { dmId, start }, token);
}

// ========================================================================= //
beforeEach(() => {
  requestClear();
});
describe('/dm/leave/v1', () => {
  function setupUsers () {
    const user = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
    const user2 = requestAuthRegisterV3('hiimelmo@gmail.com', 'sesamestreet123', 'elmo', 'alsoelmo');
    const user3 = requestAuthRegisterV3('SC30@gmail.com', 'nightnight', 'Chef', 'Curry');
    const uids = [user2.authUserId];
    return {
      user: user,
      user2: user2,
      user3: user3,
      uids: uids
    };
  }
  describe('Valid cases', () => {
    test('owner of dm leaves dm', () => {
      const users = setupUsers();
      const dm = requestDmCreateV2(users.user.token, users.uids);
      const result = requestDmLeaveV2(users.user.token, dm.dmId);
      expect(result).toStrictEqual({});
      const dmDetails = requestDmDetailsV2(users.user2.token, dm.dmId);
      expect(dmDetails).toMatchObject({
        name: 'cookiemonster, elmoalsoelmo',
        members: [{
          uId: expect.any(Number),
          email: 'hiimelmo@gmail.com',
          nameFirst: 'elmo',
          nameLast: 'alsoelmo',
          handleStr: 'elmoalsoelmo'
        }]
      });
    });
    test('member of dm leaves dm', () => {
      const users = setupUsers();
      const dm = requestDmCreateV2(users.user.token, users.uids);
      const result = requestDmLeaveV2(users.user2.token, dm.dmId);
      expect(result).toStrictEqual({});
      const dmDetails = requestDmDetailsV2(users.user.token, dm.dmId);
      expect(dmDetails).toMatchObject({
        name: 'cookiemonster, elmoalsoelmo',
        members: [{
          uId: expect.any(Number),
          email: 'CookieMonster@gmail.com',
          nameFirst: 'Cookie',
          nameLast: 'Monster',
          handleStr: 'cookiemonster'
        }]
      });
    });
  });
  describe('Error cases', () => {
    test('token is invalid', () => {
      const users = setupUsers();
      const invalidToken = users.user.token + 'randomString';
      const dm = requestDmCreateV2(users.user.token, users.uids);
      const result = requestDmLeaveV2(invalidToken, dm.dmId);
      expect(result).toStrictEqual(403);
    });
    test('dmId is invalid', () => {
      const users = setupUsers();
      const dm = requestDmCreateV2(users.user.token, users.uids);
      const invalidDmId = dm.dmId + 1;
      const result = requestDmLeaveV2(users.user.token, invalidDmId);
      expect(result).toStrictEqual({ error: 'error' });
    });
    test('token is valid, dmId is valid, authurisedUser is not a member of the DM', () => {
      const users = setupUsers();
      const dm = requestDmCreateV2(users.user3.token, users.uids);
      const result = requestDmLeaveV2(users.user.token, dm.dmId);
      expect(result).toStrictEqual({ error: 'error' });
    });
  });
});
/**
 * dm/create/v1 test cases:
 * - Success - valid token, valid uIds with no duplicates
 *
 * Error cases:
 * - Invalid token
 * - uIds contains invalid uId
 * - uIds contains duplicates
 *
 * Edge cases:
 * - uIds is empty
 * - uIds includes creator of dm
 * - dm with same uIds and creator already exists
 */
describe('/dm/create/v1', () => {
  function setUpuIds() {
    const dmMember1 = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
    const dmMember2 = requestAuthRegisterV3('velmadinkley@gmail.com', 'Jinkies!', 'Velma', 'Dinkley');
    const dmMember3 = requestAuthRegisterV3('fredjones@gmail.com', 'uuuuh_idk', 'Fred', 'Jones');
    const uIds = [dmMember1.authUserId, dmMember2.authUserId, dmMember3.authUserId];
    return {
      dmMember1: dmMember1,
      dmMember2: dmMember2,
      dmMember3: dmMember3,
      uIds: uIds,
    };
  }
  test('Success - valid token, valid uIds with no duplicates', () => {
    const dmCreator = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
    const uIds = setUpuIds();
    const newDm = requestDmCreateV2(dmCreator.token, uIds.uIds);
    expect(newDm).toStrictEqual({ dmId: expect.any(Number) });
    expect(requestDmDetailsV2(uIds.dmMember1.token, newDm.dmId)).toStrictEqual({
      name: 'fredjones, norvillerogers, scoobydoo, velmadinkley',
      members: [
        requestUserProfileV3(dmCreator.token, dmCreator.authUserId).user,
        requestUserProfileV3(uIds.dmMember1.token, uIds.dmMember1.authUserId).user,
        requestUserProfileV3(uIds.dmMember2.token, uIds.dmMember2.authUserId).user,
        requestUserProfileV3(uIds.dmMember3.token, uIds.dmMember3.authUserId).user,
      ],
    });
  });

  describe('Error Cases', () => {
    test('Invalid token', () => {
      requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
      const uIds = setUpuIds();
      const newDm = requestDmCreateV2('1', uIds.uIds);
      expect(newDm).toStrictEqual(403);
    });

    test('uIds contains invalid uId', () => {
      const dmCreator = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
      const uIds = setUpuIds();
      const newuIds = uIds.uIds;
      newuIds.push(-999);
      const newDm = requestDmCreateV2(dmCreator.token, newuIds);
      expect(newDm).toStrictEqual(400);
    });

    test('uIds contains duplicates', () => {
      const dmCreator = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
      const uIds1 = setUpuIds();
      const uIds = (uIds1.uIds).concat(uIds1.uIds);
      const newDm = requestDmCreateV2(dmCreator.token, uIds);
      expect(newDm).toStrictEqual(400);
    });
  });

  describe('Edge Cases', () => {
    test('uIds is empty', () => {
      const dmCreator = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
      const uIds: number[] = [];
      const newDm = requestDmCreateV2(dmCreator.token, uIds);
      expect(newDm).toStrictEqual({ dmId: expect.any(Number) });
      expect(requestDmDetailsV2(dmCreator.token, newDm.dmId)).toStrictEqual({
        name: 'scoobydoo',
        members: [requestUserProfileV3(dmCreator.token, dmCreator.authUserId).user],
      });
    });

    test('uIds includes creator of dm', () => { // SHOULD RETURN ERROR BASED ON FORUM POST
      const dmCreator = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
      const uIds = setUpuIds();
      const includesCreator = uIds.uIds;
      includesCreator.push(dmCreator.authUserId);
      const newDm = requestDmCreateV2(dmCreator.token, includesCreator);
      expect(newDm).toStrictEqual(400);
    });

    test('dm with same uIds and creator already exists', () => {
      const dmCreator = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
      const uIds = setUpuIds();
      const newDm = requestDmCreateV2(dmCreator.token, uIds.uIds);
      const newDm2 = requestDmCreateV2(dmCreator.token, uIds.uIds);
      expect(newDm.dmId === newDm2.dmId).toStrictEqual(false);
    });
  });
});

describe('/dm/details/v1', () => {
  function setUpUsers() {
    const user = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
    const user2 = requestAuthRegisterV3('hiimelmo@gmail.com', 'sesamestreet123', 'elmo', 'alsoelmo');
    const user3 = requestAuthRegisterV3('SC30@gmail.com', 'nightnight', 'Chef', 'Curry');
    const uids = [user2.authUserId];
    return {
      user: user,
      user2: user2,
      user3: user3,
      uids: uids,
    };
  }

  describe('Valid cases', () => {
    test('token is valid, dmId is valid, authorised user is a member of DM', () => {
      const users = setUpUsers();
      const dm = requestDmCreateV2(users.user.token, users.uids);
      const result = requestDmDetailsV2(users.user.token, dm.dmId);
      expect(result).toMatchObject({
        name: 'cookiemonster, elmoalsoelmo',
        members: [{
          uId: expect.any(Number),
          email: 'CookieMonster@gmail.com',
          nameFirst: 'Cookie',
          nameLast: 'Monster',
          handleStr: 'cookiemonster'
        },
        {
          uId: expect.any(Number),
          email: 'hiimelmo@gmail.com',
          nameFirst: 'elmo',
          nameLast: 'alsoelmo',
          handleStr: 'elmoalsoelmo'
        }]
      });
    });
  });
  describe('Error cases', () => {
    test('token is invalid', () => {
      const users = setUpUsers();
      const invalidToken = users.user.token + 'randomString';
      const dm = requestDmCreateV2(users.user.token, users.uids);
      const result = requestDmDetailsV2(invalidToken, dm.dmId);
      expect(result).toStrictEqual(403);
    });
    test('dmId is invalid', () => {
      const users = setUpUsers();
      const dm = requestDmCreateV2(users.user.token, users.uids);
      const invalidDmId = dm.dmId + 1;
      const result = requestDmDetailsV2(users.user.token, invalidDmId);
      expect(result).toStrictEqual({ error: 'error' });
    });
    test('token is valid, dmId is valid, authurisedUser is not a member of the DM', () => {
      const users = setUpUsers();
      const dm = requestDmCreateV2(users.user3.token, users.uids);
      const result = requestDmDetailsV2(users.user.token, dm.dmId);
      expect(result).toStrictEqual({ error: 'error' });
    });
  });
});

/**
 * dm/list/v1 test cases:
 * - Success - valid  user is a member of multiple dms
 *
 * Edge cases:
 * - Valid user is a member of 0 dms
 * - Valid user is owner of dms
 *
 * Error:
 * - Given token is invalid
 */
describe('/dm/list/v1', () => {
  test('Success - valid  user is a member of multiple dms', () => {
    const dm1Creator = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
    const dm2Creator = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
    const dmMember = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
    const uIds = [dmMember.authUserId];
    requestDmCreateV2(dm1Creator.token, uIds);
    requestDmCreateV2(dm2Creator.token, uIds);
    expect(requestDmListV2(dmMember.token)).toStrictEqual({
      dms: [
        {
          dmId: expect.any(Number),
          name: 'norvillerogers, scoobydoo',
        },
        {
          dmId: expect.any(Number),
          name: 'cookiemonster, norvillerogers',
        },
      ]
    });
  });

  describe('Edge cases', () => {
    test('Valid user is a member of 0 dms', () => {
      const dmMember = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
      expect(requestDmListV2(dmMember.token)).toStrictEqual({ dms: [] });
    });

    test('Valid user is owner of dms', () => {
      const dmCreator = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
      const dmMember1 = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
      const dmMember2 = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
      requestDmCreateV2(dmCreator.token, [dmMember1.authUserId]);
      requestDmCreateV2(dmCreator.token, [dmMember2.authUserId]);
      expect(requestDmListV2(dmCreator.token)).toStrictEqual({
        dms: [
          {
            dmId: expect.any(Number),
            name: 'cookiemonster, scoobydoo',
          },
          {
            dmId: expect.any(Number),
            name: 'norvillerogers, scoobydoo',
          },
        ]
      });
    });
  });

  test('Error - invalid token', () => {
    expect(requestDmListV2('1')).toStrictEqual(403);
  });
});

/**
 * dm/remove/v1 test cases:
 * - Success - token is dm creator, dm exists
 *
 * Error cases:
 * - Invalid token
 * - Invalid dmId
 * - Token is not original creator
 * - Token is original creator but is no longer in dm
 */
describe('/dm/remove/v1', () => {
  function setUpDm() {
    const dmCreator = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
    const dmMember1 = requestAuthRegisterV3('CookieMonster@gmail.com', 'chompchomp', 'Cookie', 'Monster');
    const dmMember2 = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
    const dm = requestDmCreateV2(dmCreator.token, [dmMember1.authUserId, dmMember2.authUserId]);
    return {
      dmCreator: dmCreator,
      dmMember1: dmMember1,
      dmMember2: dmMember2,
      dm: dm,
    };
  }
  function testReturn() {
    return {
      name: 'cookiemonster, norvillerogers, scoobydoo',
      members: [
        {
          uId: expect.any(Number),
          email: 'scoobydoo@gmail.com',
          nameFirst: 'Scooby',
          nameLast: 'Doo',
          handleStr: 'scoobydoo',
        },
        {
          uId: expect.any(Number),
          email: 'CookieMonster@gmail.com',
          nameFirst: 'Cookie',
          nameLast: 'Monster',
          handleStr: 'cookiemonster',
        },
        {
          uId: expect.any(Number),
          email: 'shaggy@gmail.com',
          nameFirst: 'Norville',
          nameLast: 'Rogers',
          handleStr: 'norvillerogers'
        },
      ],
    };
  }
  test('Success - token is dm creator, dm exists', () => {
    const setUp = setUpDm();
    expect(requestDmDetailsV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual(testReturn());
    expect(requestDmRemoveV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual({});
    expect(requestDmDetailsV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual({ error: 'error' });
  });

  describe('Error cases', () => {
    test('Invalid token', () => {
      const setUp = setUpDm();
      expect(requestDmDetailsV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual(testReturn());
      expect(requestDmRemoveV2('1', setUp.dm.dmId)).toStrictEqual(403);
      expect(requestDmDetailsV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual(testReturn());
    });

    test('Invalid dmId', () => {
      const setUp = setUpDm();
      expect(requestDmDetailsV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual(testReturn());
      expect(requestDmRemoveV2(setUp.dmCreator.token, setUp.dm.dmId + 999)).toStrictEqual(400);
      expect(requestDmDetailsV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual(testReturn());
    });

    test('Token is not original creator', () => {
      const setUp = setUpDm();
      expect(requestDmDetailsV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual(testReturn());
      expect(requestDmRemoveV2(setUp.dmMember1.token, setUp.dm.dmId)).toStrictEqual(403);
      expect(requestDmDetailsV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual(testReturn());
    });

    test('Token is original creator but is no longer in dm', () => {
      const setUp = setUpDm();
      expect(requestDmDetailsV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual(testReturn());
      requestDmLeaveV2(setUp.dmCreator.token, setUp.dm.dmId);
      expect(requestDmRemoveV2(setUp.dmCreator.token, setUp.dm.dmId)).toStrictEqual(403);
      expect(requestDmDetailsV2(setUp.dmMember1.token, setUp.dm.dmId)).toStrictEqual({
        name: 'cookiemonster, norvillerogers, scoobydoo',
        members: [
          {
            uId: expect.any(Number),
            email: 'CookieMonster@gmail.com',
            nameFirst: 'Cookie',
            nameLast: 'Monster',
            handleStr: 'cookiemonster',
          },
          {
            uId: expect.any(Number),
            email: 'shaggy@gmail.com',
            nameFirst: 'Norville',
            nameLast: 'Rogers',
            handleStr: 'norvillerogers'
          },
        ],
      });
    });
  });
});

/**
 * dmMessagesV2 Test cases:
 * Valid cases:
 * - successful empty dm messages
 *
 * Error cases:
 * - invalid token
 * - start greater than number of messages
 * - dmId not valid
 * - authUserId not member of dm
 */
test('Test successful empty dm messages', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('hiimelmo@gmail.com', 'sesamestreet123', 'elmo', 'alsoelmo');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestDmMessagesV2(user1.token, dm.dmId, 0)).toStrictEqual({
    messages: [],
    start: 0,
    end: -1,
  });
});

test('Test for error due to invalid token', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('hiimelmo@gmail.com', 'sesamestreet123', 'elmo', 'alsoelmo');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestDmMessagesV2(user1.token + user2.token, dm.dmId, 1)).toStrictEqual(403);
});

test('Test for error due to start greater than number of messages', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('hiimelmo@gmail.com', 'sesamestreet123', 'elmo', 'alsoelmo');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestDmMessagesV2(user1.token, dm.dmId, 1)).toStrictEqual(
    { error: 'error' }
  );
});

test('Test for error due to invalid dm', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('hiimelmo@gmail.com', 'sesamestreet123', 'elmo', 'alsoelmo');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestDmMessagesV2(user1.token, dm.dmId + 1, 0)).toStrictEqual(
    { error: 'error' }
  );
});

test('Test for error due to authuser not a member of dm', () => {
  const user1 = requestAuthRegisterV3('nicoleleow02@gmail.com', 'Nic9999978', 'Nicole', 'Leow');
  const user2 = requestAuthRegisterV3('hiimelmo@gmail.com', 'sesamestreet123', 'elmo', 'alsoelmo');
  const user3 = requestAuthRegisterV3('hehehehehe@gmail.com', 'heheh12345', 'Hockeen', 'Liaw');
  const dm = requestDmCreateV2(user1.token, [user2.authUserId]);
  expect(requestDmMessagesV2(user3.token, dm.dmId, 0)).toStrictEqual(
    { error: 'error' }
  );
});

requestClear();
