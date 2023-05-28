const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  ffmpeg: "./ffmpeg.exe",
  authStrategy: new LocalAuth({ clientId: "client" }),
});

const config = require("./config/config.json");
const { isUint16Array } = require("util/types");

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
  // client.sendMessage(config.ownerNum, config.startupMsg); //uncomment this line after changing your owner number in config.json file
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

//logging the messages on console (not persistent)
client.on("message", async (msg) => {
  console.log(msg.from, msg.body);
});

//handle deleted messages
client.on("message_revoke_everyone", async (after, before) => {
  if (before) {
    client.sendMessage(before.from, before.body);
  }
});

//disconnection
client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});

client.on("message", async (message) => {
  //send sticker using .s command
  let isQuotedImg = false;
  let isQuotedVid = false;
  let isQuotedGif = false;

  const quotedMsg = await message.getQuotedMessage();

  if (quotedMsg && (quotedMsg.body === ".s" || message.body === ".s")) {
    if (quotedMsg.type === "image") {
      isQuotedImg = true;
    } else if (quotedMsg.type === "video") {
      isQuotedVid = true;
    } else if (quotedMsg.type === "gif") {
      isQuotedGif = true;
    }
  }

  if (
    (quotedMsg && (isQuotedGif || isQuotedImg || isQuotedVid)) ||
    (message.body === ".s" &&
      (message.type === "image" ||
        message.type === "video" ||
        message.type === "gif"))
  ) {
    try {
      const media = quotedMsg
        ? await quotedMsg.downloadMedia()
        : await message.downloadMedia();
      await client.sendMessage(message.from, media, {
        sendMediaAsSticker: true,
        stickerName: config.name, // Sticker Name = Edit in 'config/config.json'
        stickerAuthor: config.author, // Sticker Author = Edit in 'config/config.json'
      });
    } catch {
      await message.reply("Failed to send the sticker.");
    }
  }

  //menu (edit the helpMenu.txt file in config folder)
  if (message.body == ".help") {
    fs.readFile("config/helpMenu.txt", function (err, data) {
      if (err) throw err;
      client.sendMessage(message.from, data.toString());
    });
  }

  //spam message
  if (message.body.startsWith(".spam ")) {
    // Replies with the same message n number of times
    n = message.body.slice(6, 8);
    if (n < 10) {
      while (n--) {
        client.sendMessage(message.from, message.body.slice(8));
      }
    } else {
      message.reply("Please enter single digit value");
    }
  }
  //delete messages from bot side
  if (message.body === ".del") {
    if (message.hasQuotedMsg) {
      const quotedMsg = await message.getQuotedMessage();
      if (quotedMsg.fromMe) {
        quotedMsg.delete(true);
      } else {
        message.reply("I can only delete my own messages");
      }
    }
  }
  //easter eggs
  if (message.body.includes("kuru kuru")) {
    //if the message body includes kuru kuru sends the sticker
    const mediaPath = "./webp/kurukuru.webp";
    const mediaData = MessageMedia.fromFilePath(mediaPath);
    client
      .sendMessage(message.from, mediaData, {
        sendMediaAsSticker: true,
      })
      .then(() => {
        client.sendMessage(message.from, "Kuru Rin~");
      })
      .catch((error) => {
        console.error("Error sending sticker:", error);
      });
  }
});
