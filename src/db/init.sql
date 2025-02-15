-- Создание перечисления для языков
CREATE TYPE language_enum AS ENUM('en', 'ru', 'be', 'uk', 'kk', 'es', 'it');

-- Создание перечислений для статусов
-- 'активный', 'закрытый'
CREATE TYPE request_status_enum AS ENUM('active', 'closed');

-- 'ожидание', 'принято', 'отклонено'
CREATE TYPE response_status_enum AS ENUM('pending', 'accepted', 'rejected');

-- Создание перечисления для срочности
-- 'как можно скорее', 'сегодня', 'завтра', 'эта_неделя', 'следующая_неделя', 'следующий_месяц'
CREATE TYPE urgency_enum AS ENUM(
    'asap',
    'today',
    'tomorrow',
    'this_week',
    'next_week',
    'next_month'
);

-- Создание таблицы users
CREATE TABLE IF NOT EXISTS
    users (
        id SERIAL PRIMARY KEY, -- Уникальный идентификатор пользователя
        tg_id BIGINT UNIQUE NOT NULL, -- ID пользователя в Telegram
        tg_username VARCHAR(255) NOT NULL, -- Имя пользователя в Telegram
        username VARCHAR(255) DEFAULT '', -- Имя пользователя установленное в сервисе
        city VARCHAR(255) DEFAULT 'Moscow', -- Город пользователя
        country VARCHAR(255) DEFAULT 'Russian', -- Страна пользователя
        language_id language_enum DEFAULT 'ru', -- Язык пользователя (ISO 639-1)
        photo VARCHAR(255) DEFAULT '', -- Фото пользователя (путь к файлу или URL)
        description TEXT DEFAULT '', -- Описание пользователя
        is_seller BOOLEAN DEFAULT FALSE, -- Флаг, является ли пользователь продавцом/исполнителем
        free_requests_left INT DEFAULT 3, -- Количество оставшихся бесплатных запросов
        subscription_end_date TIMESTAMP, -- Дата окончания подписки (если продавец/исполнитель)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Дата регистрации
    );

-- Создание таблицы requests
CREATE TABLE IF NOT EXISTS
    requests (
        id SERIAL PRIMARY KEY, -- Уникальный идентификатор запроса
        user_id INT REFERENCES users (id) ON DELETE CASCADE, -- ID пользователя, создавшего запрос
        photo VARCHAR(255) [], -- Фото товара/услуги (массив путей к файлам или URL)
        city VARCHAR(255) DEFAULT 'Moscow',
        country VARCHAR(255) DEFAULT 'Russian',
        description TEXT NOT NULL, -- Описание запроса
        price NUMERIC(10, 2), -- Желаемая цена
        category VARCHAR(255) NOT NULL, -- Категория товара/услуги
        urgency urgency_enum DEFAULT 'asap', -- Срочность запроса
        status request_status_enum DEFAULT 'active', -- Статус запроса (active, closed)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Дата создания запроса
    );

-- Создание таблицы responses
CREATE TABLE IF NOT EXISTS
    responses (
        id SERIAL PRIMARY KEY, -- Уникальный идентификатор ответа
        request_id INT REFERENCES requests (id) ON DELETE CASCADE, -- ID запроса
        user_id INT REFERENCES users (id) ON DELETE CASCADE, -- ID продавца/исполнителя
        photo VARCHAR(255) [], -- Фото товара/услуги (массив путей к файлам или URL)
        description TEXT NOT NULL, -- Описание предложения
        price NUMERIC(10, 2) NOT NULL, -- Цена предложения
        status response_status_enum DEFAULT 'pending', -- Статус ответа (pending, accepted, rejected)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Дата создания ответа
    );

-- Создание таблицы reviews
CREATE TABLE IF NOT EXISTS
    reviews (
        id SERIAL PRIMARY KEY, -- Уникальный идентификатор отзыва
        seller_id INT REFERENCES users (id) ON DELETE CASCADE, -- ID продавца/исполнителя
        buyer_id INT REFERENCES users (id) ON DELETE CASCADE, -- ID покупателя
        request_id INT REFERENCES requests (id) ON DELETE CASCADE, -- ID запроса
        rating INT CHECK (
            rating >= 1
            AND rating <= 5
        ), -- Рейтинг (от 1 до 5)
        comment TEXT, -- Текст отзыва
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Дата создания отзыва
    );

-- Создание таблицы ratings
CREATE TABLE IF NOT EXISTS
    ratings (
        user_id INT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE, -- ID продавца/исполнителя
        average_rating NUMERIC(2, 1) DEFAULT 0.0, -- Средний рейтинг от 0.0 до 5.0
        total_reviews INT DEFAULT 0 -- Общее количество отзывов
    );

-- Создание индексов для ускорения поиска
CREATE INDEX IF NOT EXISTS idx_requests_city ON requests (city);

CREATE INDEX IF NOT EXISTS idx_requests_country ON requests (country);

CREATE INDEX IF NOT EXISTS idx_requests_category ON requests (category);

CREATE INDEX IF NOT EXISTS idx_responses_request_id ON responses (request_id);

CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews (seller_id);

-- Триггер для автоматического обновления рейтинга при добавлении отзыва
CREATE
OR REPLACE FUNCTION update_rating () RETURNS TRIGGER AS $$
BEGIN
    UPDATE ratings
    SET
        average_rating = (SELECT AVG(rating) FROM reviews WHERE seller_id = NEW.seller_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE seller_id = NEW.seller_id)
    WHERE user_id = NEW.seller_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_trigger
AFTER INSERT ON reviews FOR EACH ROW
EXECUTE FUNCTION update_rating ();

-- Вставка тестовых данных (опционально)
INSERT INTO
    users (
        tg_id,
        tg_username,
        username,
        city,
        country,
        language_id,
        photo,
        description,
        is_seller
    )
VALUES
    (
        123456789,
        'user1_tg',
        'user1',
        'Moscow',
        'Russia',
        'ru',
        'user1.jpg',
        'Описание пользователя 1',
        FALSE
    ),
    (
        987654321,
        'seller1_tg',
        'seller1',
        'Moscow',
        'Russia',
        'ru',
        'seller1.jpg',
        'Описание продавца 1',
        TRUE
    ) ON CONFLICT (tg_id)
DO NOTHING;

INSERT INTO
    requests (
        user_id,
        photo,
        description,
        price,
        category,
        urgency
    )
VALUES
    (
        1,
        ARRAY['photo1.jpg'],
        'Нужен ремонт телефона',
        1000,
        'Ремонт',
        'asap'
    ) ON CONFLICT (id)
DO NOTHING;

INSERT INTO
    responses (request_id, user_id, photo, description, price)
VALUES
    (
        1,
        2,
        ARRAY['photo2.jpg'],
        'Могу починить телефон',
        1200
    ) ON CONFLICT (id)
DO NOTHING;

INSERT INTO
    reviews (
        seller_id,
        buyer_id,
        request_id,
        rating,
        comment
    )
VALUES
    (2, 1, 1, 5, 'Отличный сервис!') ON CONFLICT (id)
DO NOTHING;

INSERT INTO
    ratings (user_id, average_rating, total_reviews)
VALUES
    (2, 5.0, 1) ON CONFLICT (user_id)
DO NOTHING;