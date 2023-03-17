Assumptions:

  1. Emails are not case-sensitive while passwords are case-sensitive.
  2. Since we can't test if a function returns the correct randomly generated authUserId, we assume any number it returns is correct.
  3. Functions that require authUserId as a parameter will return error if authUserId is not registered.
  4. Since there is no function that can add messages into the dataStore, we assume that messages array in every channel is empty. Therefore, it is assumed that it is impossible to test successful channelMessagesV1 return except for an empty list with start: 0 and end: -1.
  5. For channelsCreateV1 function, assume that isPublic entered is boolean.
