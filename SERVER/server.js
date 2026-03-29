const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../')));

// Эндпоинт для получения пользователей
app.get('/api/users', (req, res) => {
    const data = fs.readFileSync(path.join(__dirname, 'USERS/USERS.json'));
    res.json(JSON.parse(data));
});

// Эндпоинт для загрузки видео
app.post('/api/upload', (req, res) => {
    const { videoData, title } = req.body;
    const filename = `${Date.now()}.mp4`;
    fs.writeFileSync(path.join(__dirname, 'UPLOADS', filename), videoData, 'base64');
    res.status(200).send({ message: 'Видео загружено' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
