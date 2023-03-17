import { requestHelper } from './other';

// ========================================================================= //
// Wrapper Functions

function requestAuthRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast }, '');
}

function requestChannelsCreateV3(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

function requestUserProfileV3(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', { uId }, token);
}

function requestChannelDetailsV3(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', { channelId }, token);
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, '');
}

// ========================================================================= //
beforeEach(() => {
  requestClear();
});

test('successful clear', () => {
  const user = requestAuthRegisterV3('nicole@gmail.com', 'Niahdb8988', 'Nicole', 'Leow');
  const channel = requestChannelsCreateV3(user.authUserId, 'mathchannel', true);
  const bodyObj = requestClear();
  expect(bodyObj).toEqual({});
  expect(requestChannelDetailsV3(user.userId, channel.channelId)).toStrictEqual(403);
  expect(requestUserProfileV3(user.userId, user.userId)).toStrictEqual(403);
});

requestClear();
