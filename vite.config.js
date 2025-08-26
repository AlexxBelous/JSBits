import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';

export default defineConfig({
    root: '.', // Корень проекта — текущая папка
    server: {
        watch: {
            // Включаем polling для надежного вотчинга файлов (полезно в некоторых ОС)
            usePolling: true,
        },
    },
    plugins: [
        {
            name: 'quiz-builder-auto-create',
            enforce: 'pre', // Запускаем плагин перед другими
            configureServer(server) {
                // Папка для мониторинга создания task-n.js
                const jsDir = path.resolve(__dirname, 'assets/QuizBuilder/js');
                const watcher = chokidar.watch(jsDir, {
                    persistent: true,
                    ignoreInitial: true, // Игнорируем существующие файлы при старте
                });

                watcher.on('add', (filePath) => {
                    const fileName = path.basename(filePath);
                    const match = fileName.match(/^task-(\d+)\.js$/);
                    if (match) {
                        const n = match[1]; // Извлекаем номер n
                        console.log(`Detected new task-${n}.js — creating related files...`);

                        // Пути для создания файлов
                        const basePath = path.resolve(__dirname, 'assets/QuizBuilder');
                        const filesToCreate = [
                            { dir: 'answers', name: `answer-${n}.html`, content: '' },
                            { dir: 'css', name: `css-${n}.css`, content: '' },
                            { dir: 'markups', name: `markup-${n}.html`, content: '' },
                            { dir: 'questions', name: `question-${n}.html`, content: '' },
                        ];

                        filesToCreate.forEach((file) => {
                            const dirPath = path.join(basePath, file.dir);
                            const fullPath = path.join(dirPath, file.name);
                            if (!fs.existsSync(dirPath)) {
                                fs.mkdirSync(dirPath, { recursive: true });
                            }
                            if (!fs.existsSync(fullPath)) {
                                fs.writeFileSync(fullPath, file.content);
                                console.log(`Created: ${file.dir}/${file.name}`);
                            }
                        });

                        // После создания файлов — триггерим reload Vite
                        server.ws.send({ type: 'full-reload' });
                    }
                });

                // Мониторим изменения во всех файлах структуры для полного reload
                const allDirsToWatch = [
                    path.resolve(__dirname, 'index.html'),
                    path.resolve(__dirname, 'assets'),
                ];
                const globalWatcher = chokidar.watch(allDirsToWatch, {
                    persistent: true,
                    ignoreInitial: true,
                });

                globalWatcher.on('all', (event, changedPath) => {
                    if (event === 'add' || event === 'change' || event === 'unlink') {
                        console.log(`File change detected: ${changedPath} — triggering full reload`);
                        server.ws.send({ type: 'full-reload' });
                    }
                });

                // Закрываем вотчеры при остановке сервера
                server.httpServer.once('close', () => {
                    watcher.close();
                    globalWatcher.close();
                });
            },
        },
        {
            name: 'dynamic-quiz-includes',
            transformIndexHtml(html) {
                const basePath = path.resolve(__dirname, 'assets/QuizBuilder');

                // Функция для поиска максимального n в папке по паттерну
                const getMaxN = (dir, pattern) => {
                    const dirPath = path.join(basePath, dir);
                    if (!fs.existsSync(dirPath)) return null;
                    const files = fs.readdirSync(dirPath);
                    const ns = files
                        .map(file => file.match(pattern))
                        .filter(match => match)
                        .map(match => parseInt(match[1], 10));
                    if (ns.length === 0) return null;
                    return Math.max(...ns);
                };

                // Получаем max n для каждой папки
                const maxCssN = getMaxN('css', /^css-(\d+)\.css$/);
                const maxJsN = getMaxN('js', /^task-(\d+)\.js$/);
                const maxQuestionsN = getMaxN('questions', /^question-(\d+)\.html$/);
                const maxMarkupsN = getMaxN('markups', /^markup-(\d+)\.html$/);
                const maxAnswersN = getMaxN('answers', /^answer-(\d+)\.html$/);

                // Замена ссылок на последние файлы
                if (maxCssN !== null) {
                    html = html.replace(/href="assets\/QuizBuilder\/css\/css-n\.css"/, `href="assets/QuizBuilder/css/css-${maxCssN}.css"`);
                }
                if (maxJsN !== null) {
                    html = html.replace(/src="assets\/QuizBuilder\/js\/task-n\.js"/, `src="assets/QuizBuilder/js/task-${maxJsN}.js"`);
                    // Замена номера в заголовке <title> на основе maxJsN
                    html = html.replace(/<title>Task-<\/title>/, `<title>Task-${maxJsN}</title>`);
                }

                // Вставка содержимого файлов
                if (maxQuestionsN !== null) {
                    const questionsContent = fs.readFileSync(path.join(basePath, 'questions', `question-${maxQuestionsN}.html`), 'utf-8');
                    html = html.replace('<div class="questions"></div>', `<div class="questions">${questionsContent}</div>`);
                }
                if (maxMarkupsN !== null) {
                    const markupsContent = fs.readFileSync(path.join(basePath, 'markups', `markup-${maxMarkupsN}.html`), 'utf-8');
                    html = html.replace('<div class="markups"></div>', `<div class="markups">${markupsContent}</div>`);
                }
                if (maxAnswersN !== null) {
                    const answersContent = fs.readFileSync(path.join(basePath, 'answers', `answer-${maxAnswersN}.html`), 'utf-8');
                    html = html.replace('<code class="answers"></code>', `<code class="answers">${answersContent}</code>`);
                }

                return html;
            },
        },
    ],
});