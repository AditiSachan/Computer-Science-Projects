import { requestHelper } from './other';

// ========================================================================= //
// Wrapper Functions

function requestAuthRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '');
}

function requestUserProfileV3(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', { uId }, token);
}

function requestUsersAllV2(token: string) {
  return requestHelper('GET', '/users/all/v2', {}, token);
}

function requestUserProfileSetnameV2(token: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/user/profile/setname/v2', { nameFirst, nameLast }, token);
}

function requestUserProfileSetemailV2(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v2', { email }, token);
}

function requestUserProfileSethandleV2(token: string, handleStr: string) {
  return requestHelper('PUT', '/user/profile/sethandle/v2', { handleStr }, token);
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '');
}

// ========================================================================= //
beforeEach(() => {
  requestClear();
});

/**
 * userProfileV2 Test Cases:
 * - Valid uId
 *
 * Error Cases:
 * - Invalid uId
 *
 */

describe('/user/profile/v2', () => {
  test('success', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'bigbird@gmail.com',
        nameFirst: 'Big',
        nameLast: 'Bird',
        handleStr: 'bigbird',
      }
    });
  });

  test('error invalid uId', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileV3(user.token, user.authUserId + 999)).toStrictEqual(400);
  });

  test('error invalid token', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileV3(user.token + 'a', user.authUserId)).toStrictEqual(403);
  });
});

/**
 * users/all/v1
 * - Success - dataStore contains multiple users
 *
 * Error cases:
 * - Invalid token
 */
describe('/users/all/v1', () => {
  test('Success - dataStore contains multiple users', () => {
    const user1 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    const user2 = requestAuthRegisterV3('scoobydoo@gmail.com', 'scoobySnack1', 'Scooby', 'Doo');
    const user3 = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
    expect(requestUsersAllV2(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          email: 'bigbird@gmail.com',
          nameFirst: 'Big',
          nameLast: 'Bird',
          handleStr: 'bigbird',
        },
        {
          uId: user2.authUserId,
          email: 'scoobydoo@gmail.com',
          nameFirst: 'Scooby',
          nameLast: 'Doo',
          handleStr: 'scoobydoo',
        },
        {
          uId: user3.authUserId,
          email: 'shaggy@gmail.com',
          nameFirst: 'Norville',
          nameLast: 'Rogers',
          handleStr: 'norvillerogers',
        }
      ]
    });
  });

  test('Error - invalid token', () => {
    const user1 = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUsersAllV2(user1.token + 'banana')).toStrictEqual(403);
  });
});

/**
 * userProfileSetnameV1 Tests:
 *
 * Core functionality:
 * - Valid nameFirst and nameLast
 *
 * Error Cases:
 *  - length of nameFirst is not between 1 and 50 characters
 *    - more 50 characters
 *    - empty string
 *
 *  - length of nameLast is not between 1 and 50 characters
 *    - more than 50  characters
 *    - empty string
 *
 *  - user does not exist
 *
 * Edge Cases:
 *  - 1 character nameFirst
 *  - 50 character nameFirst
 *  - 1 character nameLast
 *  - 50 character nameLast
 */

describe('/user/profile/setname/v1', () => {
  test('Valid nameFirst and nameLast', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestUserProfileSetnameV2(user.token, 'Smol', 'Chicken');
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'bigbird@gmail.com',
        nameFirst: 'Smol',
        nameLast: 'Chicken',
        handleStr: 'bigbird',
      }
    });
  });

  test('error invalid nameFirst (> 50 characters)', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileSetnameV2(user.token, 'a'.repeat(51), 'Chicken'))
      .toStrictEqual(400);
  });

  test('error invalid nameFirst (0 characters)', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileSetnameV2(user.token, '', 'Chicken'))
      .toStrictEqual(400);
  });

  test('error invalid nameLast (> 50 characters)', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileSetnameV2(user.token, 'Chicken', 'a'.repeat(51)))
      .toStrictEqual(400);
  });

  test('error invalid nameLast (0 characters)', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileSetnameV2(user.token, 'Chicken', ''))
      .toStrictEqual(400);
  });

  test('user does not exist', () => {
    expect(requestUserProfileSetnameV2('1', 'Chicken', 'Nugget'))
      .toStrictEqual(403);
  });

  test('edge case: valid nameFirst (1 character)', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestUserProfileSetnameV2(user.token, 'a', 'Chicken');
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'bigbird@gmail.com',
        nameFirst: 'a',
        nameLast: 'Chicken',
        handleStr: 'bigbird',
      }
    });
  });

  test('edge case: valid nameFirst (50 characters)', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestUserProfileSetnameV2(user.token, 'a'.repeat(50), 'Chicken');
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'bigbird@gmail.com',
        nameFirst: 'a'.repeat(50),
        nameLast: 'Chicken',
        handleStr: 'bigbird',
      }
    });
  });

  test('edge case: valid nameLast (1 character)', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestUserProfileSetnameV2(user.token, 'Smol', 'a');
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'bigbird@gmail.com',
        nameFirst: 'Smol',
        nameLast: 'a',
        handleStr: 'bigbird',
      }
    });
  });

  test('edge case: valid nameLast (50 characters)', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestUserProfileSetnameV2(user.token, 'Smol', 'a'.repeat(50));
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'bigbird@gmail.com',
        nameFirst: 'Smol',
        nameLast: 'a'.repeat(50),
        handleStr: 'bigbird',
      }
    });
  });
});

/**
 * userProfileSetemailV1 Tests:
 *
 * Core functionality:
 * - Valid email that is not in use.
 *
 * Error Cases:
 *  - Invalid email
 *  - Email is in use
 *  - User does not exist
 *
 */

describe('/user/profile/setemail/v1', () => {
  test('Valid email', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestUserProfileSetemailV2(user.token, 'tastychicken@gmail.com');
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'tastychicken@gmail.com',
        nameFirst: 'Big',
        nameLast: 'Bird',
        handleStr: 'bigbird',
      }
    });
  });

  test('error: invalid email', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileSetemailV2(user.token, 'spicychickengmail.com'))
      .toStrictEqual(400);
  });

  test('error: email in use', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestAuthRegisterV3('tastychicken@gmail.com', 'Chicken123', 'Tasty', 'Chicken');
    expect(requestUserProfileSetemailV2(user.token, 'tastychicken@gmail.com'))
      .toStrictEqual(400);
  });

  test('user does not exist', () => {
    expect(requestUserProfileSetemailV2('1', 'Chicken@gmail.com'))
      .toStrictEqual(403);
  });
});

/**
 * userProfileSethandleV1 Tests:
 *
 * Core functionality:
 * - Valid handle that is not in use by another user
 *
 * Error Cases:
 *  - Handle has less than 3 characters
 *  - Handle has more than 20 characters
 *  - Handle contains non-alphanumeric characters
 *  - Handle is in use by another user
 *  - User does not exist
 *
 * Edge Cases:
 *  - Handle has 3 characters
 *  - Handle has 20 characters
 */

describe('/user/profile/sethandle/v1', () => {
  test('Valid handle', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestUserProfileSethandleV2(user.token, 'KentuckyFried');
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'bigbird@gmail.com',
        nameFirst: 'Big',
        nameLast: 'Bird',
        handleStr: 'KentuckyFried',
      }
    });
  });

  test('error: handle less than 3 characters', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileSethandleV2(user.token, 'xd'))
      .toStrictEqual(400);
  });

  test('error: handle more than 20 characters', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileSethandleV2(user.token, 'a'.repeat(21)))
      .toStrictEqual(400);
  });

  test('error: handle contains non-alphanumeric characters', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    expect(requestUserProfileSethandleV2(user.token, 'non-alphanumeric?'))
      .toStrictEqual(400);
  });

  test('error: handle is in use by another user', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestAuthRegisterV3('tastychicken@gmail.com', 'Chicken123', 'Tasty', 'Chicken');
    expect(requestUserProfileSethandleV2(user.token, 'tastychicken'))
      .toStrictEqual(400);
  });

  test('user does not exist', () => {
    expect(requestUserProfileSethandleV2('1', 'chickenchicken'))
      .toStrictEqual(403);
  });

  test('edge: handle has 3 characters', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestUserProfileSethandleV2(user.token, 'KFC');
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'bigbird@gmail.com',
        nameFirst: 'Big',
        nameLast: 'Bird',
        handleStr: 'KFC',
      }
    });
  });

  test('edge: handle has 20 characters', () => {
    const user = requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird');
    requestUserProfileSethandleV2(user.token, 'a'.repeat(20));
    expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
      user: {
        uId: expect.any(Number),
        email: 'bigbird@gmail.com',
        nameFirst: 'Big',
        nameLast: 'Bird',
        handleStr: 'a'.repeat(20),
      }
    });
  });
});

requestClear();
