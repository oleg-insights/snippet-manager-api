import { DemoTemplate } from '../types/demo-template.interface';

export const demoTemplates: DemoTemplate[] = [
    {
        title: 'Развертывание веб-сервиса на Ubuntu',
        tagNames: ['DevOps', 'Linux', 'Безопасность', 'Nginx', 'Node.js'],
        content: [
            {
                type: 'text',
                data: 'Процесс подготовки Ubuntu 22.04 LTS, установки Node.js, настройки Nginx и выпуска SSL-сертификата.\n\nПеред началом убедитесь, что у вас есть *SSH-доступ с правами root* и привязанный домен.',
            },
            {
                type: 'subtitle',
                data: '1. Обновление системы и создание пользователя',
            },
            {
                type: 'text',
                data: 'Первым делом обновляем пакеты и создаем отдельного пользователя с привилегиями `sudo`, чтобы не работать под учетной записью root.',
            },
            {
                type: 'code',
                data: `# Обновление системных пакетов
sudo apt update && sudo apt upgrade -y

# Создание нового пользователя deploy
sudo adduser deploy
sudo usermod -aG sudo deploy

# Переключение на созданного пользователя
su - deploy`,
            },
            {
                type: 'subtitle',
                data: '2. Архитектура размещения сервиса',
            },
            {
                type: 'text',
                data: 'Типовая схема работы: клиентские запросы поступают на *Nginx*, который проксирует их на локальный *Node.js-процесс*, запущенный под управлением PM2.',
            },
            {
                type: 'image',
                data: 'https://i.ibb.co/jPpt9VsQ/image.png',
            },
            {
                type: 'subtitle',
                data: '3. Конфигурация Nginx (Reverse Proxy)',
            },
            {
                type: 'text',
                data: 'Создайте конфигурационный файл для вашего сайта в директории `/etc/nginx/sites-available/`. Замените *example.com* на ваш реальный домен.',
            },
            {
                type: 'code',
                data: `server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`,
            },
            {
                type: 'subtitle',
                data: '4. Выпуск SSL-сертификата через Certbot',
            },
            {
                type: 'text',
                data: "Для защиты трафика задействуем *Let's Encrypt*. Certbot автоматически изменит конфигурацию Nginx и настроит автопродление.",
            },
            {
                type: 'code',
                data: `# Установка Certbot и плагина для Nginx
sudo apt install certbot python3-certbot-nginx -y

# Выпуск сертификата и автоматическая настройка HTTPS
sudo certbot --nginx -d example.com -d www.example.com`,
            },
            {
                type: 'text',
                data: 'После успешного выполнения команды Certbot автоматически перенаправит весь *HTTP-трафик на HTTP*. Сервер полностью готов к работе!',
            },
        ],
    },
];
