const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

// Загрузка переменных окружения
dotenv.config();

const app = express();

// Get bot token
const BOT_TOKEN = process.env.BOT_TOKEN;
// Webhook URL
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// SSL-сертификаты
const options = {
  key: fs.readFileSync(path.resolve(__dirname, "../ssl/certificate.key")),   // Приватный ключ
  cert: fs.readFileSync(path.resolve(__dirname, "../ssl/certificate.crt")),  // Сертификат
  ca: fs.readFileSync(path.resolve(__dirname, "../ssl/certificate_ca.crt")), // Промежуточный сертификат
};

// Middleware
app.use(express.json());

// Подключение роутеров
const botRoutes = require("./bot/bot");
const frontendRoutes = require("./frontend/index");
const apiRoutes = require("./backend/api");

app.use("/bot", botRoutes);           // Маршруты для бота
app.use("/frontend", frontendRoutes); // Маршруты для Mini App
app.use("/api", apiRoutes);           // Маршруты для API

// Установка webhook
function setWebhook() {
  const data = JSON.stringify({
    url: WEBHOOK_URL,
  });

  const options = {
    hostname: "api.telegram.org",
    port: 443,
    path: `/bot${BOT_TOKEN}/setWebhook`,
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
      console.log("Webhook response:", responseData);
    });
  });

  req.on("error", (error) => {
    console.error("Error setting webhook:", error);
  });

  req.write(data);
  req.end();
}

// Запуск HTTPS-сервера
const PORT = process.env.PORT || 443;
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS server is running on port ${PORT}`);
  setWebhook(); // Установка webhook при запуске сервера
});
