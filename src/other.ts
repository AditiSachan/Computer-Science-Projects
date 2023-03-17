import { getData, setData } from './dataStore';
import { v4 as uuidv4 } from 'uuid';
import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import crypto from 'crypto';

const port = config.port;
const url = config.url;
const secret = 'crunchie';

/**
 * clears datastore
 *
 * @returns {}
 */
function clearV1() {
  const data = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  setData(data);
  return {};
}

/**
 * Generates token for user session
 *
 * @param authUserId
 * @returns { token }
 */
function tokenGenerate(authUserId: number) {
  const data = getData();
  const token = uuidv4();
  for (const user of data.users) {
    if (user.uId === authUserId) {
      if (user.tokens === undefined) {
        user.tokens = [token];
      } else {
        user.tokens.push(token);
      }
    }
  }
  setData(data);
  return ({ token: token });
}

function requestHelper(method: HttpVerb, path: string, payload: object, token: string) {
  let qs = {};
  let json = {};
  let headers = {};
  // let headers = JSON.stringify(token);
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  if (token !== '') {
    headers = { token };
  }
  const res = request(method, `${url}:${port}${path}`, { qs, json, headers });
  if (res.statusCode !== 200) {
    return res.statusCode;
  } else {
    return JSON.parse(res.getBody() as string);
  }
}

function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext + secret).digest('hex');
}

export { clearV1, tokenGenerate, requestHelper, getHashOf };
