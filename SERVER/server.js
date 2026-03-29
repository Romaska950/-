const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Статические файлы - корень проекта
app.use(express.static(path.join(__dirname, '../')));
app.use('/CLIENT', express.static(path.join(__dirname, '../CLIENT')));
app.use('/UPLOADS', express.static(path.join(__dirname, 'UPLOADS')));

// Путь к файлам данных
const USERS_PATH = path.join(__dirname, 'USERS/USERS.json');
const VIDEOS_PATH = path.join(__dirname, 'UPLOADS/videos.json');

// Инициализация файлов если не существуют
function initDataFiles() {
    // Users
    if (!fs.existsSync(USERS_PATH)) {
        fs.mkdirSync(path.dirname(USERS_PATH), { recursive: true });
        fs.writeFileSync(USERS_PATH, JSON.stringify([
            {
                name: "Администратор",
                login: "admin",
                password: "admin",
                avatar: "A",
                avatarType: "text",
                subscriptions: [],
                likedVideos: []
            }
        ], null, 2));
    }
    
    // Videos
    if (!fs.existsSync(VIDEOS_PATH)) {
        fs.mkdirSync(path.dirname(VIDEOS_PATH), { recursive: true });
        fs.writeFileSync(VIDEOS_PATH, JSON.stringify([], null, 2));
    }
}

initDataFiles();

// ===== API ENDPOINTS =====

// Получить всех пользователей
app.get('/api/users', (req, res) => {
    try {
        const data = fs.readFileSync(USERS_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (e) {
        res.json([]);
    }
});

// Регистрация
app.post('/api/register', (req, res) => {
    try {
        const { name, login, password } = req.body;
        const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
        
        if (users.find(u => u.login === login)) {
            return res.status(400).json({ error: 'Логин уже занят' });
        }
        
        const newUser = {
            name,
            login,
            password,
            avatar: name.charAt(0).toUpperCase(),
            avatarType: "text",
            subscriptions: [],
            likedVideos: []
        };
        
        users.push(newUser);
        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
        res.json({ success: true, user: newUser });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Вход
app.post('/api/login', (req, res) => {
    try {
        const { login, password } = req.body;
        const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
        const user = users.find(u => u.login === login && u.password === password);
        
        if (!user) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        
        res.json({ success: true, user });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить пользователя
app.put('/api/users/:login', (req, res) => {
    try {
        const { login } = req.params;
        const updates = req.body;
        const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
        const index = users.findIndex(u => u.login === login);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        users[index] = { ...users[index], ...updates };
        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
        res.json({ success: true, user: users[index] });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить видео
app.get('/api/videos', (req, res) => {
    try {
        const data = fs.readFileSync(VIDEOS_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (e) {
        res.json([]);
    }
});

// Загрузить видео (метаданные + base64)
app.post('/api/videos', (req, res) => {
    try {
        const videoData = req.body;
        const videos = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf8'));
        
        videoData.id = Date.now();
        videoData.createdAt = Date.now();
        videos.unshift(videoData);
        
        fs.writeFileSync(VIDEOS_PATH, JSON.stringify(videos, null, 2));
        res.json({ success: true, video: videoData });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить видео
app.put('/api/videos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updates = req.body;
        const videos = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf8'));
        const index = videos.findIndex(v => v.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Видео не найдено' });
        }
        
        videos[index] = { ...videos[index], ...updates };
        fs.writeFileSync(VIDEOS_PATH, JSON.stringify(videos, null, 2));
        res.json({ success: true, video: videos[index] });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить видео
app.delete('/api/videos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let videos = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf8'));
        videos = videos.filter(v => v.id !== id);
        fs.writeFileSync(VIDEOS_PATH, JSON.stringify(videos, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 ИльТьюб сервер запущен на порту ${PORT}`);
    console.log(`📺 Открой http://localhost:${PORT}`);
});
