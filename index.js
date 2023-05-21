const { Client, LocalAuth, Chat } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const colors = require('colors');
const fs = require('fs');
var ffmpegx = require('fluent-ffmpeg');

const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    },
    ffmpeg: ffmpegx,
    authStrategy: new LocalAuth({ clientId: "client" })
});
const config = require('./config/config.json');

client.on('qr', (qr) => {
    console.log('Scan the QR below : ');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.clear();
    console.log('KURU KURU~')
});

client.on('message_revoke_everyone', async (delMsg) => {
    // Fired whenever a message is deleted by anyone (including you)
    let msgFromMyself
    if (delMsg )
    if (!msgFromMyself)
    client.sendMessage('Msg deleted: ', delMsg.from, delMsg.body)
    
});


client.on('message', async msg => {
    console.log(msg.body);
    
});

client.initialize();

