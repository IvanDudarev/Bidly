const express = require("express");
const router = express.Router();

// Получение данных пользователя
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  res.status(200);
});

module.exports = router;
