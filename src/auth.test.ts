import { requestHelper } from './other';

// ========================================================================= //
// Wrapper Functions

function requestAuthRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '');
}

function requestAuthLoginV3(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v3', { email, password }, '');
}

function requestAuthLogoutV2(token: string) {
  return requestHelper('POST', '/auth/logout/v2', {}, token);
}

function requestUserProfileV3(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', { uId }, token);
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '');
}

function requestAuthPasswordresetRequestV1(email: string) {
  return requestHelper('POST', '/auth/passwordreset/request/v1', { email }, '');
}

function requestAuthPasswordresetResetV1(resetCode: string, newPassword: string) {
  return requestHelper('POST', '/auth/passwordreset/reset/v1', { resetCode, newPassword }, '');
}

// ========================================================================= //
beforeEach(() => {
  requestClear();
});

/**
 * authLoginV1 Test Cases:
 *
 * - Core Functionality Test:
 *   - Registered email and correct password
 *
 * - Error Cases (including edge case errors):
 *   - Unregistered email
 *   - Incorrect password
 *   - Password with incorrect case (case-sensitive test)
 *   - Invalid email
 *   - Empty email
 *   - Empty password
 *
 * - Edge Cases:
 *   - Email with incorrect case (case-sensitive test)
 *
 */
describe('/auth/login/v2', () => {
  test('Success - Registered email and correct password', () => {
    const a = requestAuthRegisterV3('annie123@gmail.com', 'rosalee123', 'Annie', 'Rosalee');
    const b = requestAuthLoginV3('annie123@gmail.com', 'rosalee123');
    expect(b.authUserId).toStrictEqual(a.authUserId);
    expect(b.token === a.token).toStrictEqual(false);
  });

  describe('Error Cases', () => {
    test.each([
      { email: 'haventregistered@gmail.com', password: 'rosalee123' },
      { email: 'annie123@gmail.com', password: '123rosalee' },
      { email: 'annie123@gmail.com', password: 'RosaLee123' },
      { email: 'annie123gmail.com', password: 'rosalee123' },
      { email: '', password: 'rosalee123' },
      { email: 'annie123@gmail.com', password: '' },
    ])('email=$email, password=$password', ({ email, password }) => {
      requestAuthRegisterV3('annie123@gmail.com', 'rosalee123', 'Annie', 'Rosalee');
      expect(requestAuthLoginV3(email, password)).toStrictEqual(400);
    });
  });

  describe('Edge Cases', () => {
    test('Email with incorrect case', () => {
      const a = requestAuthRegisterV3('annie123@gmail.com', 'rosalee123', 'Annie', 'Rosalee');
      const b = requestAuthLoginV3('Annie123@gmail.com', 'rosalee123');
      expect(b.authUserId).toStrictEqual(a.authUserId);
      expect(b.token === a.token).toStrictEqual(false);
    });
  });
});

/**
 * authRegisterV1 Test Cases:
 * - Valid email not in use. Valid password, nameFirst and nameLast. Unique handleStr
 *
 * Edge Cases
 * - handleStr already in use
 * - nameFirst or nameLast contains non alphanumeric characters
 * - nameFirst + nameLast > 20 characters
 *
 * Error Cases:
 * - Invalid email
 * - Email already in use
 * - Password < 6 characters
 * - nameFirst < 1 character
 * - nameFirst > 50 characters
 * - nameLast < 1 character
 * - nameLast > 50 characters
 *
 */
describe('/auth/register/v2', () => {
  describe('error', () => {
    test.each([
      { email: 'bigbirdgmail.com', password: 'BigBird123', nameFirst: 'Big', nameLast: 'Bird' },
      { email: 'bigbird@gmail.com', password: 'BB123', nameFirst: 'Big', nameLast: 'Bird' },
      { email: 'bigbird@gmail.com', password: 'BigBird123', nameFirst: '', nameLast: 'Bird' },
      { email: 'bigbird@gmail.com', password: 'BigBird123', nameFirst: 'Big', nameLast: '' },
      { email: 'bigbird@gmail.com', password: 'BigBird123', nameFirst: 'a'.repeat(51), nameLast: 'Bird' },
      { email: 'bigbird@gmail.com', password: 'BigBird123', nameFirst: 'Big', nameLast: 'a'.repeat(51) },
    ])('email=$email, password=$password, nameFirst=$nameFirst, nameLast=$nameLast', ({ email, password, nameFirst, nameLast }) => {
      expect(requestAuthRegisterV3(email, password, nameFirst, nameLast)).toStrictEqual(400);
    });

    test('email already in use', () => {
      requestAuthRegisterV3('bigbird@gmail.com', 'password', 'Bi', 'Gbird');
      expect(requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird')).toStrictEqual(400);
    });
  });

  test('success', () => {
    expect(requestAuthRegisterV3('bigbird@gmail.com', 'BigBird123', 'Big', 'Bird')).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });

  describe('edge cases', () => {
    test('handleStr already in use', () => {
      requestAuthRegisterV3('jimothyjelly@gmail.com', 'examplepassword', 'Jimothy', 'Jelly');
      const user2 = requestAuthRegisterV3('yjellyjimoth@gmail.com', 'examplepassword', 'Jimoth', 'yJelly');
      expect(requestUserProfileV3(user2.token, user2.authUserId)).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: 'yjellyjimoth@gmail.com',
          nameFirst: 'Jimoth',
          nameLast: 'yJelly',
          handleStr: 'jimothyjelly0',
        }
      });
    });

    test('nameFirst and nameLast contain non alphanumeric characters', () => {
      const user = requestAuthRegisterV3('jimothyjelly@gmail.com', 'examplepassword', 'Jimo-thee', 'Jel-lee');
      expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: 'jimothyjelly@gmail.com',
          nameFirst: 'Jimo-thee',
          nameLast: 'Jel-lee',
          handleStr: 'jimotheejellee',
        }
      });
    });

    test('nameFirst + nameLast > 20 characters', () => {
      const user = requestAuthRegisterV3('terminator@gmail.com', 'examplepassword', 'Arnold', 'Schwarzenegger Junior');
      expect(requestUserProfileV3(user.token, user.authUserId)).toStrictEqual({
        user: {
          uId: expect.any(Number),
          email: 'terminator@gmail.com',
          nameFirst: 'Arnold',
          nameLast: 'Schwarzenegger Junior',
          handleStr: 'arnoldschwarzenegger',
        }
      });
    });
  });
});

/**
 * authLogoutV1 Test Cases:
 * - User has single active token
 *
 * Edge Cases:
 * - User has no active tokens
 * - User has multiple active tokens
 *
 */

describe('/auth/logout/v2', () => {
  describe('success', () => {
    test('single active token', () => {
      const newUser = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
      expect(requestUserProfileV3(newUser.token, newUser.authUserId)).toStrictEqual({
        user: {
          uId: newUser.authUserId,
          email: 'shaggy@gmail.com',
          nameFirst: 'Norville',
          nameLast: 'Rogers',
          handleStr: 'norvillerogers',
        }
      });
      expect(requestAuthLogoutV2(newUser.token)).toStrictEqual({});
      expect(requestUserProfileV3(newUser.token, newUser.authUserId)).toStrictEqual(403);
    });
  });

  describe('edge cases', () => {
    test('no active tokens', () => {
      const newUser = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
      requestAuthLogoutV2(newUser.token);
      expect(requestAuthLogoutV2(newUser.token)).toStrictEqual(403);
    });

    test('multiple active tokens', () => {
      const newUser = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
      const newSession1 = requestAuthLoginV3('shaggy@gmail.com', 'Zoinks!');
      const newSession2 = requestAuthLoginV3('shaggy@gmail.com', 'Zoinks!');
      expect(requestUserProfileV3(newUser.token, newUser.authUserId) === 403).toStrictEqual(false);
      expect(requestAuthLogoutV2(newUser.token)).toStrictEqual({});
      expect(requestUserProfileV3(newUser.token, newUser.authUserId)).toStrictEqual(403);
      expect(requestUserProfileV3(newSession2.token, newSession2.authUserId) === 403).toStrictEqual(false);
      expect(requestAuthLogoutV2(newSession2.token)).toStrictEqual({});
      expect(requestUserProfileV3(newSession2.token, newSession2.authUserId)).toStrictEqual(403);
      expect(requestUserProfileV3(newSession1.token, newSession1.authUserId) === 403).toStrictEqual(false);
      expect(requestAuthLogoutV2(newSession1.token)).toStrictEqual({});
      expect(requestUserProfileV3(newSession1.token, newSession2.authUserId)).toStrictEqual(403);
    });
  });
});

/**
 * authPasswordresetRequestV1 Test Cases:
 * - Valid email, user has multiple active sessions
 * - Valid email, user has no active sessions
 * - Invalid email
 * - Multiple reset requests for same users (before resetting password)
 *
 */
describe('/auth/passwordreset/request/v1', () => {
  test('Valid email, user has multiple active sessions', () => {
    const newUser = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
    const newSession1 = requestAuthLoginV3('shaggy@gmail.com', 'Zoinks!');
    const newSession2 = requestAuthLoginV3('shaggy@gmail.com', 'Zoinks!');
    expect(requestAuthPasswordresetRequestV1('shaggy@gmail.com')).toStrictEqual({});
    expect(requestUserProfileV3(newSession2.token, newSession2.authUserId)).toStrictEqual(403);
    expect(requestUserProfileV3(newSession1.token, newSession1.authUserId)).toStrictEqual(403);
    expect(requestUserProfileV3(newUser.token, newUser.authUserId)).toStrictEqual(403);
  });

  test('Valid email, user has no active sessions', () => {
    const newUser = requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
    requestAuthLogoutV2(newUser.token);
    expect(requestAuthPasswordresetRequestV1('shaggy@gmail.com')).toStrictEqual({});
  });

  test('Invalid email', () => {
    requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
    expect(requestAuthPasswordresetRequestV1('jeremybaruah@gmail.com')).toStrictEqual({});
  });
});

/**
 * authPasswordresetResetV1 Test Cases:
 * NOTE: SUCCESSFUL CALLS TO THIS ROUTE CAN ONLY BE TESTED MANUALLY USING MAILTRAP
 *
 * Error cases:
 * - Reset without reset request, random resetCode
 * - Random resetCode, invalid newPassword
 *
 */
describe('/auth/passwordreset/reset/v1', () => {
  test('Error - Reset without reset request, random resetCode', () => {
    requestAuthRegisterV3('shaggy@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
    expect(requestAuthPasswordresetResetV1('90g4t-912u4t-24y9tg', 'sc00bysn4ck')).toStrictEqual(400);
  });

  test('Error - Random resetCode, invalid newPassword', () => {
    requestAuthRegisterV3('scooby@gmail.com', 'Zoinks!', 'Norville', 'Rogers');
    requestAuthPasswordresetRequestV1('scooby@gmail.com');
    expect(requestAuthPasswordresetResetV1('oiqboy-fo9019324-f9uh1j', 'short')).toStrictEqual(400);
  });
});

requestClear();
