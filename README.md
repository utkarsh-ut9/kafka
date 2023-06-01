
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

| COMMAND         	| DESCRIPTION                                                                         	| USAGE                                                                           	|
|-----------------	|-------------------------------------------------------------------------------------	|---------------------------------------------------------------------------------	|
| .s              	| Image/GIF to Sticker                                                                	| Send .s in caption OR tag a image in chat and reply it with .s                  	|
| .del            	| Delete bot-side messages for everyone                                               	| Reply to the bot's message with .del                                            	|
| .ss query       	| Search sticker based on query using GIPHY API                                       	| Write command .ss followed by your query (e.g., .ss neko)                       	|
| .revokeON       	| Turn on anti-delete mode i.e, the bot resends the deleted messages by users in chat 	| Message .revokeON to turn on Anti-Delete Mode                                   	|
| .revokeOFF      	| Turn off anti-delete mode                                                           	| Message .revokeOFF to turn off Anti-Delete Mode                                 	|
| .spam n message 	| Repeatedly sends the message for n number of times (max n = 9)                      	| Message .spam followed by an integer N (between 1 & 9) followed by your message 	|
| .rejectCallsON  	| Reject calls to bot number automatically                                            	| Message .rejectCallsON in chat                                                  	|
| .rejectCallsOFF 	| Turn off call rejection                                                             	| Message .rejectCallsOFF in chat                                                 	|
| .help           	| Shows the list of commands and their usages                                         	| Message .help in chat                                                           	|
| .eastereggs     	| Some eastereggs included in the project                                             	| Message .eastereggs in chat to show a list of eastereggs                        	|

## Acknowledgements

 - [WhatsApp Web JS] https://wwebjs.dev/
 - [GIPHY API] https://developers.giphy.com/
 

