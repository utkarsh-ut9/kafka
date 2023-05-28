
# WhatsApp Bot (Kafka~) [UNDER-DEVELOPMENT]

Kafka is a stellaron hunter and a part time WhatsApp Bot~

It is an underdevelopment project. Mainly using the 'whatsapp-web.js'


## Installation

Clone this repository using

```bash
  git clone https://github.com/utkarsh-ut9/kafka.git
  cd kafka
  npm install
```
    
## To run

```bash
node .
````
Scan the QR code generated and your session will be saved (the bot uses MultiDevice)

## Features

- Bot can send the recently deleted messages (if captured)
- Img to Sticker conversion (use .s in caption while sending media or tag a media with .s)
- Text to Sticker conversion (to-do)
- GIF to Sticker (use .s in caption while sending media)
- Resends deleted messages (text) while the bot is active (disable it by commenting the revoke_everyone function)
- List of commands can be obtained via .help command
- Delete bot message for everyone using .del command
- Spam a message upto 9 times at once using .spam command followed by an integer specifying how many times to send the message
- Auto Call Rejection function (default: ON) 
- Some easter eggs
- Multiple features need to be implemented in future

## Acknowledgements

 - [WhatsApp Web JS] https://github.com/pedroslopez/whatsapp-web.js/blob/main/example.js
 

