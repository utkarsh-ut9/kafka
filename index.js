const { Client, LocalAuth, Chat } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  ffmpeg: './ffmpeg.exe',
  authStrategy: new LocalAuth({ clientId: "client" }),
});

const config = require("./config/config.json");

client.initialize();
//generate QR code
client.on("qr", (qr) => {
  console.log("Scan the QR below : ");
  qrcode.generate(qr, { small: true });
});
//auth success
client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});
//auth error?
client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});
//show loading %
client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, "%", message);
});
//clear console on start send owner a message that bot is active now
client.on("ready", () => {
  console.clear();
  console.log("Started!");
  client.sendMessage(config.ownerNum, config.startupMsg); //change your owner number in config.json file
});
//handle calls
let rejectCalls = true; //change to false if  you don't want to reject calls automatically
client.on("call", async (call) => {
  console.log("Call received, rejecting. GOTO script to disable", call);
  if (rejectCalls) await call.reject();
  await client.sendMessage(
    call.from,
    `[${call.fromMe ? "Outgoing" : "Incoming"}] Phone call from ${
      call.from
    }, type ${call.isGroup ? "group" : ""} ${
      call.isVideo ? "video" : "audio"
    } call. ${
      rejectCalls ? "This call was automatically rejected by the script." : ""
    }`
  );
});
//handle deleted messages
client.on("message_revoke_everyone", async (before) => {
  if (before) {
    client.sendMessage(before.from, before.body);
  }
});
//logging the messages on console (not persistent)
client.on("message", async (msg) => {
  console.log(msg.from, msg.body);
});

//disconnection
client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});

const prefix = config.prefix;
//switch case for commands

client.on("message", async (message) => {
//   const isCmd = message.from.startsWith(prefix) ? true : false;

  if (message.body == '.s' || (message.hasQuotedMsg && message.body == '.s')) {
    if (
      message.type == "image" ||
        message.type == "video" ||
        message.type == "gif"
    ) {
      try {
        const media = await message.downloadMedia();
        client.sendMessage(message.from, media, {
          sendMediaAsSticker: true,
          stickerName: config.name, // Sticker Name = Edit in 'config/config.json'
          stickerAuthor: config.author, // Sticker Author = Edit in 'config/config.json'
        });
      } catch {
        client.sendMessage(message.from, "*[❎]* Failed!");
      }
    }
  }
});
