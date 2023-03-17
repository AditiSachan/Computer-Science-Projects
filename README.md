# Computer-Science-Projects
A project coded in C focusing on filesystem objects and bitwise operations

Bytelocker, a rudimentary single-file encryption tool
Encryption is the process of converting information into an obscured format, which can (in theory), only be converted back into useful 
information by an authorized party who knows the encryption process and key. Encryption is an incredibly useful tool,
and is the reason why the internet can function in the way it does, with sensitive information freely transmitted across it.

File encryption is particularly useful to safeguard data in the case that it is stolen. 
Encrypting your files could prevent someone from being able to access your photos in the event that your laptop gets stolen.

Algorithms for file encryption: XOR (eXclusive OR).

XOR encryption works by employing the bitwise XOR operation on every bit of some given data.
A key, which when broken up into it's constituent bits, expanded to much the length of the data being encrypted. 
The XOR operation is then employed between these two bitstreams to yield the encrypted data. 
This encrypted data can be decrypted only by re-running the same XOR operation with the same key. 
In bytelocker, standalone XOR encryption will only employ the the single-byte key 0xFF.
