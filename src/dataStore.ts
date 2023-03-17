import fs from 'fs';

export interface Notifications {
  channelId: number,
  dmId: number,
  notificationMessage: string,
}

export interface Users {
  uId?: number,
  email?: string,
  nameFirst?: string,
  nameLast?: string,
  password?: string,
  handleStr?: string,
  tokens?: string[],
  notifications?: Notifications[],
  resetCodes?: string[],
}

export interface Reacts {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean,
}

export interface Messages {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: Reacts[],
  isPinned: boolean,
}
export interface Standup {
  isActive: boolean,
  timeFinish: number,
}
export interface Channels {
  channelId: number,
  name: string,
  isPublic: boolean,
  ownerMembers: number[],
  allMembers: number[],
  messages: Messages[],
  standup: Standup[],
}

export interface Dms {
  dmId: number,
  name: string,
  ownerMembers: number[],
  allMembers: number[],
  messages: Messages[],
}

export interface Data {
  users: Users[],
  channels: Channels[],
  dms: Dms[],
}

// YOU SHOULD MODIFY THIS OBJECT BELOW
const data: Data = {
  users: [],
  channels: [],
  dms: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// load data into datastore
const dataStore = JSON.parse(String(fs.readFileSync('dataStore.json', { flag: 'r' })));
data.users = dataStore.users;
data.channels = dataStore.channels;
data.dms = dataStore.dms;

/**
 * To access data
 *
 * @returns data
 */
function getData() {
  return data;
}

/**
 * updates dataStore
 *
 * @param newData Data
 */
function setData(newData: Data) {
  fs.writeFileSync(
    'dataStore.json',
    JSON.stringify(newData, null, 4),
    { flag: 'w' }
  );
}

export { getData, setData };
