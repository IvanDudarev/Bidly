const { Pool } = require('pg');

// Подключение к базе данных
const pool = new Pool({
  user: 'ваш_пользователь',
  host: 'localhost',
  database: 'ваша_база_данных',
  password: 'ваш_пароль',
  port: 5432,
});

module.exports = pool;

const pool = require('./db');

// Получить всех пользователей
const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Создать нового пользователя
const createUser = async (req, res) => {
  const { tg_id, tg_username, username, city, country, language_id, photo, description, is_seller } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (tg_id, tg_username, username, city, country, language_id, photo, description, is_seller) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [tg_id, tg_username, username, city, country, language_id, photo, description, is_seller]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получить все запросы
const getRequests = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM requests');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Создать новый запрос
const createRequest = async (req, res) => {
  const { user_id, photo, description, price, category, urgency } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO requests (user_id, photo, description, price, category, urgency) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, photo, description, price, category, urgency]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получить все ответы
const getResponses = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM responses');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Создать новый ответ
const createResponse = async (req, res) => {
  const { request_id, user_id, photo, description, price } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO responses (request_id, user_id, photo, description, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [request_id, user_id, photo, description, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получить все отзывы
const getReviews = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reviews');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Создать новый отзыв
const createReview = async (req, res) => {
  const { seller_id, buyer_id, request_id, rating, comment } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO reviews (seller_id, buyer_id, request_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [seller_id, buyer_id, request_id, rating, comment]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получить все рейтинги
const getRatings = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ratings');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Создать новый рейтинг
const createRating = async (req, res) => {
  const { user_id, average_rating, total_reviews } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO ratings (user_id, average_rating, total_reviews) VALUES ($1, $2, $3) RETURNING *',
      [user_id, average_rating, total_reviews]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  getRequests,
  createRequest,
  getResponses,
  createResponse,
  getReviews,
  createReview,
  getRatings,
  createRating,
};


const http = require('http');
const controllers = require('./controllers');

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Парсинг тела запроса
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    if (body) {
      req.body = JSON.parse(body);
    }

    // Маршруты
    if (url === '/users' && method === 'GET') {
      controllers.getUsers(req, res);
    } else if (url === '/users' && method === 'POST') {
      controllers.createUser(req, res);
    } else if (url === '/requests' && method === 'GET') {
      controllers.getRequests(req, res);
    } else if (url === '/requests' && method === 'POST') {
      controllers.createRequest(req, res);
    } else if (url === '/responses' && method === 'GET') {
      controllers.getResponses(req, res);
    } else if (url === '/responses' && method === 'POST') {
      controllers.createResponse(req, res);
    } else if (url === '/reviews' && method === 'GET') {
      controllers.getReviews(req, res);
    } else if (url === '/reviews' && method === 'POST') {
      controllers.createReview(req, res);
    } else if (url === '/ratings' && method === 'GET') {
      controllers.getRatings(req, res);
    } else if (url === '/ratings' && method === 'POST') {
      controllers.createRating(req, res);
    } else {
      res.status(404).json({ message: 'Route not found' });
    }
  });
});

module.exports = server;


const server = require('./routes');

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// Создать пользователя
// curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{
//     "tg_id": 123456789,
//     "tg_username": "user1_tg",
//     "username": "user1",
//     "city": "Moscow",
//     "country": "Russia",
//     "language_id": "ru",
//     "photo": "user1.jpg",
//     "description": "Описание пользователя 1",
//     "is_seller": false
//   }'


// Получить всех пользователей
// curl -X GET http://localhost:3000/users

// Создать запрос
// curl -X POST http://localhost:3000/requests -H "Content-Type: application/json" -d '{
//     "user_id": 1,
//     "photo": ["photo1.jpg"],
//     "description": "Нужен ремонт телефона",
//     "price": 1000,
//     "category": "Ремонт",
//     "urgency": "asap"
//   }'


// Update free requests count 
// const cron = require('node-cron');
// const { Pool } = require('pg'); // Используем pg для работы с PostgreSQL

// // Настройка подключения к базе данных
// const pool = new Pool({
//     user: 'your_db_user',
//     host: 'localhost',
//     database: 'your_db_name',
//     password: 'your_db_password',
//     port: 5432,
// });

// // Функция для обновления free_requests_left
// async function resetFreeRequests() {
//     try {
//         const res = await pool.query(`
//             UPDATE users
//             SET free_requests_left = 3
//             WHERE free_requests_left < 3;
//         `);
//         console.log('Free requests reset successfully:', res.rowCount, 'rows updated');
//     } catch (err) {
//         console.error('Error resetting free requests:', err);
//     }
// }

// // Настройка задачи на выполнение в первый день каждого месяца в 00:00
// cron.schedule('0 0 1 * *', () => {
//     console.log('Running resetFreeRequests task...');
//     resetFreeRequests();
// });

// console.log('Scheduler started...');