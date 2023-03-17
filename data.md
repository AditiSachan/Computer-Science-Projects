// dataStore : struct{user and channels} which individually includes an array of structs

const dataStore = {

  users: [
    {  
      uId: 5056,
      email: 'annie123@gmail.com',
      nameFirst: 'Annie',
      nameLast: 'Rosalee',
      password: 'rosalee123',
      handleStr: 'annierosalee',
      tokens: ['abcd', 'sssd'],
      resetCodes: ['hiu12h39u1h49', 'uh19uh900o1go'],
    }, 
    {    
      uId: 4153,
      email: 'iamcookie@gmail.com',
      nameFirst: 'Cookie'
      nameLast: 'Monster',
      password: 'chompchomp',
      handleStr: 'cookiemonster',
      tokens: ['abgd', 'fssd'],
      resetCodes: ['jwr9u1n0-38r2', 'm08by209n39un']
    }
  ], 

  channels: [
    {
      channelId: 1234,
      channelName: 'General',
      isPublic: false,
      ownerMembers: [
        {
          uId: 5056,
          email: 'annie123@gmail.com',
          nameFirst: 'Annie',
          nameLast: 'Rosalee',
          password: 'rosalee123',
          handleStr: 'annierosalee',
        }
      ],
      allMembers:[
        {
          uId: 5056,
          email: 'annie123@gmail.com',
          nameFirst: 'Annie',
          nameLast: 'Rosalee',
          password: 'rosalee123',
          handleStr: 'annierosalee',
        }, 
        {    
          uId: 4153,
          email: 'iamcookie@gmail.com',
          nameFirst: 'Cookie'
          nameLast: 'Monster',
          password: 'chompchomp',
          handleStr: 'cookiemonster',
        }
      ], 
      messages: [
        {
          messageId: 2000,
          uId: 1000,
          message: 'hi',
          timeSent: 12345,
        }
      ],
    }
  ]

  dms: [
    {
      dmId: 1001,
      name: 'nicoleleowhockeenliaw',
      ownerMembers: [ 2333, 2334 ],
      allMembers: [ 2333, 2334, 4455 ],
      messages: [
        {
          messageId: 2000,
          uId: 1000,
          message: 'hi',
          timeSent: 12345,
        }
      ],
    }
  ]
}
      

