# Документация внутреннего API

## Общие принципы

- Backend предоставляет REST API для frontend
- Используется JSON для обмена данными
- Все запросы авторизуются через JWT

## Основные эндпоинты

| Метод | Путь           | Описание                 |
| ----- | -------------- | ------------------------ |
| GET   | /api/tracks    | Получить список треков   |
| POST  | /api/login     | Авторизация пользователя |
| POST  | /api/register  | Регистрация              |
| GET   | /api/playlists | Получить плейлисты       |

## Пример запроса

```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Пример ответа

```json
{
  "token": "jwt.token.here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```
