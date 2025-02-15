const express = require("express");
const router = express.Router();

// Обработка первого открытия Mini App
router.post("/init", (req, res) => {
  const { userId, firstName, lastName, username } = req.body;

  // Отправляем HTML-страницу с сообщением об ошибке
  res.status(500).send(`
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Ошибка</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f9;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .message {
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            text-align: center;
                        }
                        .success {
                            color: #28a745;
                        }
                        .error {
                            color: #dc3545;
                        }
                    </style>
                </head>
                <body>
                    <div class="message error">
                        <h1>Ошибка!</h1>
                        <p>Произошла ошибка при сохранении пользователя.</p>
                    </div>
                </body>
                </html>
            `);
});

module.exports = router;
