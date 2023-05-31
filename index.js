const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;
const axios = require("axios");

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

let revokeON = false; //this is for message_revoke_everyone function

//logging the messages on console (not persistent)
client.on("message", async (msg) => {
  console.log(msg.from, msg.body);
  if (msg.body === ".revokeON") {
    revokeON = true;
    client.sendMessage(
      msg.from,
      "The bot will resend the deleted messages now."
    );
  } else if (msg.body === ".revokeOFF") {
    revokeON = false;
    client.sendMessage(
      msg.from,
      "The bot will not send the deleted messages now."
    );
  }
});

//send deleted messages by other users
client.on("message_revoke_everyone", async (after, before) => {
  if (revokeON && before) {
    const deletedMessage = before.body;
    // Send the deleted message along with the sender name
    const reply = `Message Deletion Detected:\nMessage: ${deletedMessage}`;
    client.sendMessage(before.from, reply);
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

  if (message.body === ".eastereggs") {
    try {
      const folderPath = "./webp"; // Path to the folder
      const files = await fsp.readdir(folderPath);
      const fileNames = files.map((file) => path.parse(file).name);
      await client.sendMessage(
        message.from,
        `Following are some easter eggs. Try them out!\n\n` +
          fileNames.join("\n")
      );
    } catch (err) {
      console.error("Error reading folder:", err);
    }
  }

  const folderPath = "./webp/";
  // Get the filename from the message body
  const fileName = message.body.toLowerCase();
  if (fileName) {
    // Check if the webp file exists
    const filePath = `${folderPath}${fileName}.webp`;
    if (fs.existsSync(filePath)) {
      const mediaPath = filePath;
      const mediaData = MessageMedia.fromFilePath(mediaPath);
      await client
        .sendMessage(message.from, mediaData, {
          sendMediaAsSticker: true,

          stickerName: config.name, // Sticker Name = Edit in 'config/config.json'
          stickerAuthor: config.author, // Sticker Author = Edit in 'config/config.json'
        })
        .catch((error) => {
          console.error("Error sending sticker:", error);
        });
    }
  }
  //search sticker using giphy
  if (message.body.toLowerCase().startsWith(".ss")) {
    const stickerApiUrl = "https://api.giphy.com/v1/stickers/search";
    const apiKey = config.giphyAPI;
    const query = message.body.toLowerCase().slice(4);
    console.log(`query=>`, query);

    // Make a request to the GIPHY API to search for stickers
    axios
      .get(stickerApiUrl, {
        params: {
          api_key: apiKey,
          q: query,
        },
      })
      .then((response) => {
        // Check if any stickers were found
        if (response.data.data.length > 0) {
          // Get the first sticker from the search results
          const stickerUrl = response.data.data[0].images.original.webp;

          // Download the sticker
          const stickerPath = "./webp/searchsticker.webp";
          downloadSticker(stickerUrl, stickerPath)
            .then(() => {
              // Send the sticker on WhatsApp
              const mediaPath = stickerPath;
              const mediaData = MessageMedia.fromFilePath(mediaPath);
              client
                .sendMessage(message.from, mediaData, {
                  sendMediaAsSticker: true,
                })
                .catch((error) => {
                  console.error("Error sending sticker:", error);
                });
            })
            .catch((error) => {
              console.error("Error downloading sticker:", error);
            });
        } else {
          message.reply(`query=>` + query + " No stickers found.");
        }
      })
      .catch((error) => {
        console.error("Error searching for stickers:", error);
      });
  }

  async function downloadSticker(url, filename) {
    const response = await axios({
      url,
      responseType: "stream",
    });

    response.data.pipe(fs.createWriteStream(filename));

    return new Promise((resolve, reject) => {
      response.data.on("end", () => {
        resolve();
      });

      response.data.on("error", (err) => {
        reject(err);
      });
    });
  }
});
