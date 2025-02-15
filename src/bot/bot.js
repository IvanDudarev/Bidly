const express = require("express");
const router = express.Router();

function sendMessage(chatId, text) {
  const data = JSON.stringify({
    chat_id: chatId,
    text: text,
  });

  const options = {
    hostname: "api.telegram.org",
    port: 443,
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data, "utf8"),
    },
  };

  const req = https.request(options, (res) => {
    let responseData = "";
    res.on("data", (chunk) => {
      responseData += chunk;
    });
    res.on("end", () => {
      console.log("Response from Telegram API:", responseData); // Логируем ответ от Telegram
    });
  });

  req.on("error", (error) => {
    console.error("Error sending message:", error);
  });

  req.write(data);
  req.end();
}

// Обработка команды /start
router.post("/start", (req, res) => {
  const { userId, firstName, lastName, username } = req.body;
  const { message } = req.body;

  if (message && message.text) {
    const chatId = message.chat.id;
    const text = message.text;

    console.log(`Sending response to chat ${chatId}: ${text}`); // Логируем отправку ответа
    sendMessage(chatId, `Вы сказали: ${text}`);
  } else {
    console.log("No message or text found in the request."); // Логируем, если сообщение пустое
  }

  res.sendStatus(200);
});

module.exports = router;
