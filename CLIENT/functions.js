// Функция для инициализации расширенных функций клиента
export const initClientFunctions = () => {
    console.log("CLIENT: Расширенные функции инициализированы.");
    // Здесь можно добавлять кастомную логику, которая будет подгружаться в index.html
};

// Функция для рендеринга видео-контента через сервер
export const fetchVideosFromServer = async () => {
    try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Ошибка при получении видео с сервера:", error);
        return [];
    }
};
