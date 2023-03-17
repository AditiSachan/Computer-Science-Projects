import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { messageSendV1, messageSenddmV1, messageEditV1, messageRemoveV1, messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1, messageShareV1, messageSendlaterV1, messageSendlaterdmV1 } from './message';
import { authRegisterV1, authLoginV1, authLogoutV1, authPasswordresetRequestV1, authPasswordresetResetV1 } from './auth';
import { clearV1 } from './other';
import { userProfileV1, userProfileSetnameV1, userProfileSetemailV1, userProfileSethandleV1, usersAllV1 } from './users';
import { getTokenFromTokenHash, getUserIdByToken } from './helper';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { dmCreateV1, dmDetailsV1, dmLeaveV1, dmMessagesV1, dmRemoveV1, dmListV1 } from './dm';
import { channelAddOwnerV1, channelRemoveOwnerV1, channelDetailsV1, channelJoinV1, channelInviteV2, channelLeaveV1 } from './channel';
import { channelMessagesV1 } from './channel';
import { notificationsGetV1 } from './notifications';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', (req, res, next) => {
  const token = req.headers.token as string;
  const messageId = parseInt(req.query.messageId as string);
  return res.json(messageRemoveV1(token, messageId));
});

app.post('/message/senddm/v2', (req, res, next) => {
  const token = req.headers.token as string;
  const { dmId, message } = req.body;
  return res.json(messageSenddmV1(token, dmId, message));
});

app.post('/message/send/v2', (req, res, next) => {
  const token = req.headers.token as string;
  const { channelId, message } = req.body;
  return res.json(messageSendV1(token, channelId, message));
});

app.put('/message/edit/v2', (req, res, next) => {
  const token = req.headers.token as string;
  const { messageId, message } = req.body;
  return res.json(messageEditV1(token, messageId, message));
});

app.post('/auth/login/v3', (req, res) => {
  const { email, password } = req.body;
  res.json(authLoginV1(email, password));
});

app.post('/auth/register/v3', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

app.get('/user/profile/v3', (req, res) => {
  const token = req.headers.token as string;
  const tokenResult = getTokenFromTokenHash(token);
  const authUserId = getUserIdByToken(tokenResult.token);
  const uId = parseInt(req.query.uId as string);
  res.json(userProfileV1(authUserId, uId));
});

app.put('/user/profile/setname/v2', (req, res) => {
  const token = req.headers.token as string;
  const { nameFirst, nameLast } = req.body;
  res.json(userProfileSetnameV1(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v2', (req, res) => {
  const token = req.headers.token as string;
  const { email } = req.body;
  res.json(userProfileSetemailV1(token, email));
});

app.put('/user/profile/sethandle/v2', (req, res) => {
  const token = req.headers.token as string;
  const { handleStr } = req.body;
  res.json(userProfileSethandleV1(token, handleStr));
});

// channel join for testing
app.post('/channel/join/v3', (req, res) => {
  /* const token = req.headers.token as string;
  const { channelId } = req.body;

  // if token is invalid , has to return error
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    res.json({ error: 'error' });
  }

  // getting authUserId from the token given
  const authUserId = getUserIdByToken(tokenObtained);

  const returnValue = channelJoinV1(authUserId, channelId);
  if (returnValue.error === 'error') {
    res.json({ error: 'error' });
  } else {
    res.json({});
  } */
  const token = req.headers.token as string;
  const { channelId } = req.body;
  const returnValue = channelJoinV1(token, channelId);
  res.json(returnValue);
});

app.post('/channel/invite/v3', (req, res) => {
  const token = req.headers.token as string;
  const { channelId, uId } = req.body;
  const returnValue = channelInviteV2(token, channelId, uId);
  res.json(returnValue);
});

app.get('/channels/list/v3', (req, res) => {
  try {
    const token = req.headers.token as string;
    return res.json(channelsListV1(token));
  } catch (err) {
    const token = req.headers.token as string;
    return res.json(channelsListV1(token));
  }
});

app.post('/auth/logout/v2', (req, res) => {
  const token = req.headers.token as string;
  const tokenResult = getTokenFromTokenHash(token);
  res.json(authLogoutV1(tokenResult.token));
});

app.post('/channels/create/v3', (req, res) => {
  try {
    const token = req.headers.token as string;
    const { name, isPublic } = req.body;
    return res.json(channelsCreateV1(token, name, isPublic));
  } catch (err) {
    const token = req.headers.token as string;
    const { name, isPublic } = req.body;
    return res.json(channelsCreateV1(token, name, isPublic));
  }
});

app.post('/dm/leave/v2', (req, res) => {
  const token = req.headers.token as string;
  const { dmId } = req.body;
  // const tokenResult = getTokenFromTokenHash(token);
  const resultDmLeaveV1 = dmLeaveV1(token, dmId);
  res.json(resultDmLeaveV1);
});

app.post('/channel/leave/v2', (req, res) => {
  try {
    const token = req.headers.token as string;
    const { channelId } = req.body;
    return res.json(channelLeaveV1(token, channelId));
  } catch (err) {
    const token = req.headers.token as string;
    const { channelId } = req.body;
    return res.json(channelLeaveV1(token, channelId));
  }
});

app.get('/channel/details/v3', (req, res) => {
  const token = req.headers.token as string;
  const tokenResult = getTokenFromTokenHash(token);
  const authUserId = getUserIdByToken(tokenResult.token);
  const channelId = parseInt(req.query.channelId as string);
  const channelDetails = channelDetailsV1(authUserId, channelId);
  res.json(channelDetails);
});
/*
app.post('/channel/join/v2', (req, res) => {
  const token = req.headers.token as string;
  const { channelId } = req.body;

  // if token is invalid , has to return error
  const tokenResult = getTokenFromTokenHash(token);
  let tokenObtained;
  if (tokenResult.isValid) {
    tokenObtained = tokenResult.token;
  } else {
    res.json({ error: 'error' });
  }

  // getting authUserId from the token given
  const authUserId = getUserIdByToken(tokenObtained);

  const returnValue = channelJoinV1(authUserId, channelId);
  if (returnValue.error === 'error') {
    res.json({ error: 'error' });
  } else {
    res.json({});
  }
});
*/
app.post('/channel/addowner/v2', (req, res) => {
  try {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    return res.json(channelAddOwnerV1(token, channelId, uId));
  } catch (err) {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    return res.json(channelAddOwnerV1(token, channelId, uId));
  }
});

app.post('/channel/removeowner/v2', (req, res) => {
  try {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    return res.json(channelRemoveOwnerV1(token, channelId, uId));
  } catch (err) {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    return res.json(channelRemoveOwnerV1(token, channelId, uId));
  }
});

app.post('/dm/create/v2', (req, res) => {
  const token = req.headers.token as string;
  const { uIds } = req.body;
  const tokenResult = getTokenFromTokenHash(token);
  const authUserId = getUserIdByToken(tokenResult.token);
  res.json(dmCreateV1(authUserId, uIds));
});

app.delete('/clear/v1', (req, res, next) => {
  return res.json(clearV1());
});

app.get('/dm/details/v2', (req, res) => {
  const token = req.headers.token as string;
  const tokenResult = getTokenFromTokenHash(token);
  if (!tokenResult.isValid) {
    res.json({ error: 'error' });
  }
  const dmId = parseInt(req.query.dmId as string);
  const dmDetails = dmDetailsV1(token, dmId);
  res.json(dmDetails);
});

app.get('/dm/messages/v2', (req, res) => {
  const token = req.headers.token as string;
  // const tokenResult = getTokenFromTokenHash(token);
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessagesV1(token, dmId, start));
});

app.get('/channel/messages/v3', (req, res, next) => {
  const token = req.headers.token as string;
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  res.json(channelMessagesV1(token, channelId, start));
});

app.get('/users/all/v2', (req, res) => {
  const token = req.headers.token as string;
  const tokenResult = getTokenFromTokenHash(token);
  const authUserId = getUserIdByToken(tokenResult.token);
  res.json(usersAllV1(authUserId));
});

app.get('/dm/list/v2', (req, res) => {
  const token = req.headers.token as string;
  const tokenResult = getTokenFromTokenHash(token);
  const authUserId = getUserIdByToken(tokenResult.token);
  res.json(dmListV1(authUserId));
});

app.delete('/dm/remove/v2', (req, res) => {
  const token = req.headers.token as string;
  const tokenResult = getTokenFromTokenHash(token);
  const authUserId = getUserIdByToken(tokenResult.token);
  const dmId = parseInt(req.query.dmId as string);
  res.json(dmRemoveV1(authUserId, dmId));
});

app.get('/channels/listall/v3', (req, res) => {
  const token = req.headers.token as string;
  const tokenResult = getTokenFromTokenHash(token);
  const authUserId = getUserIdByToken(tokenResult.token);
  const channels = channelsListallV1(authUserId);
  res.json(channels);
});

app.post('/message/sendlater/v1', (req, res) => {
  const token = req.headers.token as string;
  const { channelId, message, timeSent } = req.body;
  return res.json(messageSendlaterV1(token, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req, res) => {
  const token = req.headers.token as string;
  const { dmId, message, timeSent } = req.body;
  return res.json(messageSendlaterdmV1(token, dmId, message, timeSent));
});

app.post('/message/share/v1', (req, res, next) => {
  const token = req.headers.token as string;
  const { ogMessageId, message, channelId, dmId } = req.body;
  res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});

app.post('/message/react/v1', (req, res, next) => {
  const token = req.headers.token as string;
  const { messageId, reactId } = req.body;
  res.json(messageReactV1(token, messageId, reactId));
});

app.post('/message/unreact/v1', (req, res, next) => {
  const token = req.headers.token as string;
  const { messageId, reactId } = req.body;
  res.json(messageUnreactV1(token, messageId, reactId));
});

app.get('/notifications/get/v1', (req, res) => {
  const token = req.headers.token as string;
  res.json(notificationsGetV1(token));
});

app.post('/message/pin/v1', (req, res, next) => {
  const token = req.headers.token as string;
  const { messageId } = req.body;
  return res.json(messagePinV1(token, messageId));
});

app.post('/message/unpin/v1', (req, res, next) => {
  const token = req.headers.token as string;
  const { messageId } = req.body;
  return res.json(messageUnpinV1(token, messageId));
});

app.post('/auth/passwordreset/request/v1', (req, res) => {
  const { email } = req.body;
  res.json(authPasswordresetRequestV1(email));
});

app.post('/auth/passwordreset/reset/v1', (req, res) => {
  const { resetCode, newPassword } = req.body;
  res.json(authPasswordresetResetV1(resetCode, newPassword));
});

app.post('/standup/start/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, length } = req.body;
    return res.json(standupStartV1(token, channelId, length));
  } catch (err) {
    const token = req.headers.token as string;
    const { channelId, length } = req.body;
    return res.json(standupStartV1(token, channelId, length));
  }
});

app.get('/standup/active/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = parseInt(req.query.channelId as string);
    return res.json(standupActiveV1(token, channelId));
  } catch (err) {
    const token = req.headers.token as string;
    const channelId = parseInt(req.query.channelId as string);
    return res.json(standupActiveV1(token, channelId));
  }
});

app.post('/standup/send/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, message } = req.body;
    return res.json(standupSendV1(token, channelId, message));
  } catch (err) {
    const token = req.headers.token as string;
    const { channelId, message } = req.body;
    return res.json(standupSendV1(token, channelId, message));
  }
});

// for logging errors
app.use(morgan('dev'));

// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
