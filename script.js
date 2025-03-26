document.addEventListener('DOMContentLoaded', () => {
	// 1. Исправление ошибки particlesJS: Инициализация внутри DOMContentLoaded
	try {
		if (typeof particlesJS === 'function') {
			particlesJS('particles-js', {
				particles: {
					number: { value: 80, density: { enable: true, value_area: 800 } },
					color: { value: '#4f46e5' },
					shape: {
						type: 'circle',
						stroke: { width: 0, color: '#000000' },
						polygon: { nb_sides: 5 },
					},
					opacity: {
						value: 0.5,
						random: true,
						anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
					},
					size: {
						value: 3,
						random: true,
						anim: { enable: true, speed: 2, size_min: 0.1, sync: false },
					},
					line_linked: {
						enable: true,
						distance: 150,
						color: '#4f46e5',
						opacity: 0.2,
						width: 1,
					},
					move: {
						enable: true,
						speed: 1,
						direction: 'none',
						random: true,
						straight: false,
						out_mode: 'out',
						bounce: false,
						attract: { enable: true, rotateX: 600, rotateY: 1200 },
					},
				},
				interactivity: {
					detect_on: 'canvas',
					events: {
						onhover: { enable: true, mode: 'grab' },
						onclick: { enable: true, mode: 'push' },
						resize: true,
					},
					modes: {
						grab: { distance: 140, line_linked: { opacity: 0.5 } },
						bubble: {
							distance: 400,
							size: 40,
							duration: 2,
							opacity: 8,
							speed: 3,
						},
						repulse: { distance: 200, duration: 0.4 },
						push: { particles_nb: 4 },
						remove: { particles_nb: 2 },
					},
				},
				retina_detect: true,
			})
		}
	} catch (error) {
		console.error('Ошибка инициализации particlesJS:', error)
		// Можно скрыть элемент #particles-js, если он мешает без скрипта
		const particlesElement = document.getElementById('particles-js')
		if (particlesElement) particlesElement.style.display = 'none'
	}

	// --- Элементы DOM ---
	const questionEl = document.getElementById('question')
	const optionsEl = document.getElementById('options')
	const feedbackEl = document.getElementById('feedback')
	const nextBtn = document.getElementById('next-btn')
	const scoreEl = document.getElementById('score')
	const streakEl = document.getElementById('streak')
	const progressEl = document.getElementById('progress')
	const modeBtns = document.querySelectorAll(
		'.mode-btn:not(#create-challenge-btn):not(#share-challenge-btn)'
	) // Исключаем кнопки челленджа
	const gameContainer = document.querySelector('.game-container')
	const gameInterface = document.getElementById('game-interface')
	const endGameScreen = document.getElementById('end-game-screen')
	const finalScoreEl = document.getElementById('final-score')
	const playAgainBtn = document.getElementById('play-again-btn')
	const challengeInfoEl = document.getElementById('challenge-info')
	const challengeNameEl = document.getElementById('challenge-name')
	const createChallengeBtn = document.getElementById('create-challenge-btn')
	const shareChallengeBtn = document.getElementById('share-challenge-btn')

	let playedQuestionIds = [] // Массив для хранения ID вопросов в порядке их показа

	// --- Состояние игры (добавь новые) ---
	let currentHealth = 3
	let timePerQuestion = 0 // 0 - таймер выключен
	let questionTimerInterval = null
	let nickname = ''
	let gameSettings = {
		// Настройки по умолчанию
		rounds: 10,
		health: 3,
		time: 0,
		nickname: '',
	}

	// --- Переводы (можно вынести в отдельный файл/объект) ---
	const translations = {
		ru: {
			tagline:
				'Проверь свои знания географии с помощью наших веселых и сложных викторин! Угадывай столицы, страны, флаги и многое другое.',
			score: 'Счет',
			streak: 'Серия',
			loading: 'Загрузка вопроса...',
			nextQuestion: 'Следующий вопрос',
			capitals: 'Столицы',
			countries: 'Страны',
			flags: 'Флаги',
			landmarks: 'Места',
			correctFeedback: 'Правильно! 🎉',
			incorrectFeedback: 'Неправильно! Правильный ответ: ',
			gameOver: 'Игра окончена!',
			yourScore: 'Ваш итоговый счет',
			playAgain: 'Играть снова',
			challengeLoadingError: 'Ошибка загрузки данных челленджа.',
			questionLoadError: 'Не удалось загрузить вопросы для режима: ',
			challengeCreated: 'Ссылка на челлендж скопирована в буфер обмена!',
			challengeCreationError: 'Не удалось создать ссылку на челлендж.',
			createChallenge: 'Создать челлендж',
			shareResults: 'Поделиться результатом',
			challengePrefix: 'Челлендж: ',
			health: 'Здоровье',
			timeRemaining: 'Осталось времени',
			settings: 'Настройки',
			nickname: 'Никнейм',
			roundsCount: 'Количество раундов',
			healthCount: 'Количество жизней (ошибок)',
			timePerRound: 'Время на раунд (секунд, 0 - выкл)',
			save: 'Сохранить',
			leaderboard: 'Таблица лидеров (Локальная)',
			clearLeaderboard: 'Очистить таблицу',
			leaderboardEmpty: 'Пока нет результатов. Сыграйте игру!',
			challengeFrom: (name, score) =>
				`${name} бросает вам вызов! Его результат: ${score}`,
			rank: 'Место',
			confirmClearLeaderboard:
				'Вы уверены, что хотите очистить всю таблицу лидеров? Это действие необратимо.',
			questionsCount: count => {
				// Функция для правильных окончаний
				const cases = [2, 0, 1, 1, 1, 2]
				const titles = ['вопрос', 'вопроса', 'вопросов']
				return titles[
					count % 100 > 4 && count % 100 < 20
						? 2
						: cases[Math.min(count % 10, 5)]
				]
			},
			// Добавь переводы для режимов игры для лидерборда
			mode_capitals: 'Столицы',
			mode_countries: 'Страны',
			mode_flags: 'Флаги',
			mode_landmarks: 'Места',
			timeExpiredFeedback: 'Время вышло! Правильный ответ: ',
		},
		// Можно добавить 'en' и другие языки позже
	}
	const currentLang = 'ru' // Устанавливаем язык

	// Функция для получения перевода
	function _(key) {
		return translations[currentLang][key] || key
	}

	const settingsBtn = document.getElementById('settings-btn')
	const leaderboardBtn = document.getElementById('leaderboard-btn')
	const settingsModal = document.getElementById('settings-modal')
	const leaderboardModal = document.getElementById('leaderboard-modal')
	const closeSettingsBtn = document.getElementById('close-settings-btn')
	const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn')
	const nicknameInput = document.getElementById('nickname-input')
	const roundsInput = document.getElementById('rounds-input')
	const healthInput = document.getElementById('health-input')
	const timeInput = document.getElementById('time-input')
	const saveSettingsBtn = document.getElementById('save-settings-btn')
	const healthEl = document.getElementById('health')
	const timerContainer = document.querySelector('.timer-container')
	const timerEl = document.getElementById('timer')
	const timerBar = document.getElementById('timer-bar')
	const leaderboardList = document.getElementById('leaderboard-list')
	const clearLeaderboardBtn = document.getElementById('clear-leaderboard-btn')
	const challengeCreatorInfoEl = document.getElementById(
		'challenge-creator-info'
	)

	// --- Константы ---
	const SETTINGS_KEY = 'geogittySettings'
	const LEADERBOARD_KEY = 'geogittyLeaderboard'
	const MAX_LEADERBOARD_ENTRIES = 15 // Макс. записей в таблице

	// Функция для применения переводов к элементам с data-translate
	function applyTranslations() {
		document.querySelectorAll('[data-translate]').forEach(el => {
			const key = el.getAttribute('data-translate')
			// Используем innerText или textContent в зависимости от элемента
			if (
				el.tagName === 'BUTTON' ||
				el.tagName === 'P' ||
				el.tagName === 'SPAN' ||
				el.tagName === 'DIV' ||
				el.tagName === 'H2'
			) {
				// Проверяем, есть ли дочерние элементы. Если нет, меняем textContent.
				// Если есть (как у score/streak), то ищем текстовый узел.
				if (
					el.childNodes.length === 1 &&
					el.childNodes[0].nodeType === Node.TEXT_NODE
				) {
					el.textContent = _(key)
				} else {
					// Более сложная логика может понадобиться, если текст смешан с иконками/span'ами
					// Пока ищем первый текстовый узел и меняем его, если он есть
					for (let node of el.childNodes) {
						if (
							node.nodeType === Node.TEXT_NODE &&
							node.textContent.trim().length > 0
						) {
							node.textContent =
								_(key) + (['score', 'streak'].includes(key) ? ': ' : '') // Добавляем двоеточие для счета/серии
							break
						}
					}
				}
			} else if (el.tagName === 'INPUT' && el.type === 'submit') {
				el.value = _(key)
			} else {
				// Для других элементов может потребоваться другая логика
				el.textContent = _(key)
			}
		})
		// Обновляем title кнопки создания челленджа
		const createChallengeTitleKey = 'createChallengeTitle' // Добавьте перевод для title, если нужно
		if (
			createChallengeBtn &&
			translations[currentLang][createChallengeTitleKey]
		) {
			createChallengeBtn.title =
				translations[currentLang][createChallengeTitleKey]
		} else if (createChallengeBtn) {
			// Используем текст по умолчанию, если перевод title не найден
			createChallengeBtn.title =
				'Создать ссылку на челлендж из текущего режима и 10 случайных вопросов'
		}
	}

	// --- Состояние игры ---
	let currentQuestion = {}
	let acceptingAnswers = true
	let score = 0
	let streak = 0
	let questionCounter = 0
	let allQuestions = [] // Все загруженные вопросы для текущего режима/челленджа
	let availableQuestions = [] // Вопросы, доступные для текущей игры
	let questionHistory = [] // ID вопросов, которые были в этом челлендже (для шаринга)
	let currentMode = 'capitals' // Режим по умолчанию
	let currentChallengeParams = null // Параметры текущего челленджа {mode: string, ids: string[], name: string}
	const MAX_QUESTIONS = 10 // Максимальное количество вопросов в стандартной игре

	// --- Загрузка вопросов из JSON ---
	async function loadQuestions(mode) {
		try {
			const response = await fetch(`data/${mode}.json?v=${Date.now()}`) // Добавляем ?v=timestamp для обхода кеша
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data = await response.json()
			if (!Array.isArray(data)) {
				throw new Error('Data is not an array')
			}
			// Проверка наличия ID у вопросов (хотя бы у первого)
			if (data.length > 0 && typeof data[0].id === 'undefined') {
				console.warn(
					`Вопросы в файле data/${mode}.json не содержат поля 'id'. Функционал челленджей может не работать корректно.`
				)
			}
			return data
		} catch (error) {
			console.error(`Ошибка загрузки вопросов для режима ${mode}:`, error)
			feedbackEl.textContent = `${_('questionLoadError')}${mode}. ${
				error.message
			}`
			feedbackEl.className = 'feedback incorrect-feedback'
			return [] // Возвращаем пустой массив в случае ошибки
		}
	}

	// --- Логика игры ---

	// Начало или перезапуск игры
	async function startGame() {
		loadSettings()
		playedQuestionIds = []
		// ... (сброс score, streak, health) ...

		allQuestions = await loadQuestions(currentMode)

		let questionsForGame = []
		const maxQuestionsForMode = allQuestions.length

		if (currentChallengeParams) {
			// *** РЕЖИМ ЧЕЛЛЕНДЖА ***
			console.log(
				'[Challenge Start] Используются параметры челленджа:',
				JSON.stringify(currentChallengeParams)
			) // << LOG
			challengeInfoEl.style.display = 'block'
			challengeNameEl.textContent =
				currentChallengeParams.name ||
				`${_('challengePrefix')}${_(currentMode)}`

			if (
				currentChallengeParams.creator &&
				currentChallengeParams.creatorScore !== undefined
			) {
				challengeCreatorInfoEl.textContent = _('challengeFrom', [
					currentChallengeParams.creator,
					currentChallengeParams.creatorScore,
				])
				challengeCreatorInfoEl.style.display = 'block'
			}

			currentHealth =
				currentChallengeParams.health !== undefined
					? currentChallengeParams.health
					: gameSettings.health
			timePerQuestion =
				currentChallengeParams.time !== undefined
					? currentChallengeParams.time
					: gameSettings.time
			healthEl.innerText = currentHealth

			// Создаем УПОРЯДОЧЕННЫЙ список вопросов по ID из URL
			const questionsMap = new Map(allQuestions.map(q => [q.id, q]))
			console.log(
				`[Challenge Start] Загружено ${questionsMap.size} вопросов для режима ${currentMode}.`
			) // << LOG
			console.log(
				`[Challenge Start] Требуемые ID из URL: ${currentChallengeParams.ids.join(
					', '
				)}`
			) // << LOG

			questionsForGame = currentChallengeParams.ids
				.map(id => questionsMap.get(id)) // Получаем объекты вопросов по ID в порядке из URL
				.filter(q => q !== undefined) // Убираем ненайденные
			console.log(
				`[Challenge Start] Сформирован список вопросов для игры (questionsForGame) длиной ${questionsForGame.length}:`,
				questionsForGame.map(q => q.id).join(', ')
			) // << LOG

			if (questionsForGame.length !== currentChallengeParams.ids.length) {
				console.warn(
					'[Challenge Start] Не все ID вопросов из челленджа были найдены в базе данных!'
				)
			}
			if (questionsForGame.length === 0) {
				questionEl.textContent = _('challengeLoadingError')
				optionsEl.innerHTML = ''
				return
			}
			questionHistory = questionsForGame.map(q => q.id) // Для прогресс-бара
		} else {
			// *** ОБЫЧНЫЙ РЕЖИМ ***
			console.log('[Normal Start] Запуск обычной игры.') // << LOG
			// ... (логика обычного режима) ...
			const count = Math.min(gameSettings.rounds, maxQuestionsForMode)
			questionsForGame = getRandomQuestions(allQuestions, count)
			console.log(
				`[Normal Start] Выбрано ${questionsForGame.length} случайных вопросов:`,
				questionsForGame.map(q => q.id).join(', ')
			) // << LOG
			questionHistory = questionsForGame.map(q => q.id)
		}

		// Копируем вопросы для текущей игры (этот массив будет изменяться)
		availableQuestions = [...questionsForGame] // << ЭТО КЛЮЧЕВОЙ МОМЕНТ! availableQuestions должен содержать УПОРЯДОЧЕННЫЙ список в режиме челленджа
		console.log(
			`[StartGame] Итоговый массив availableQuestions для начала игры:`,
			availableQuestions.map(q => q.id).join(', ')
		) // << LOG

		if (availableQuestions.length === 0) {
			questionEl.textContent = 'Нет доступных вопросов для начала игры.'
			optionsEl.innerHTML = ''
			return
		}

		getNewQuestion() // Запускаем первый вопрос
	}

	// Получить случайные N вопросов из массива
	function getRandomQuestions(sourceArray, count) {
		const shuffled = [...sourceArray].sort(() => 0.5 - Math.random())
		return shuffled.slice(0, Math.min(count, sourceArray.length))
	}

	// Получение нового вопроса
	function getNewQuestion() {
		stopTimer()

		if (availableQuestions.length === 0) {
			console.log('[getNewQuestion] Нет доступных вопросов, завершаем игру.') // << LOG
			return showEndGame()
		}
		console.log(
			`[getNewQuestion] Осталось ${availableQuestions.length} вопросов. Текущий режим челленджа:`,
			!!currentChallengeParams
		) // << LOG
		console.log(
			`[getNewQuestion] availableQuestions перед выбором:`,
			availableQuestions.map(q => q.id).join(', ')
		) // << LOG

		questionCounter++
		const totalQuestionsInGame = questionHistory.length
		progressEl.style.width =
			totalQuestionsInGame > 0
				? `${(questionCounter / totalQuestionsInGame) * 100}%`
				: '0%'

		// *** ВЫБОР ВОПРОСА (Челлендж vs Обычный) ***
		if (currentChallengeParams) {
			// В режиме челленджа берем СТРОГО по порядку
			console.log('[getNewQuestion] Режим челленджа: используем shift()') // << LOG
			currentQuestion = availableQuestions.shift() // Берем и удаляем ПЕРВЫЙ элемент
			console.log(
				'[getNewQuestion] Получен вопрос (челлендж):',
				currentQuestion ? currentQuestion.id : 'undefined'
			) // << LOG
		} else {
			// В обычном режиме - выбираем случайно
			console.log('[getNewQuestion] Обычный режим: используем random') // << LOG
			const questionIndex = Math.floor(
				Math.random() * availableQuestions.length
			)
			currentQuestion = availableQuestions[questionIndex]
			console.log(
				'[getNewQuestion] Получен вопрос (обычный):',
				currentQuestion ? currentQuestion.id : 'undefined',
				`с индексом ${questionIndex}`
			) // << LOG

			// Записываем ID сыгранного вопроса
			if (currentQuestion && currentQuestion.id) {
				playedQuestionIds.push(currentQuestion.id)
			}

			// Удаляем выбранный вопрос из availableQuestions
			if (questionIndex > -1) {
				// Проверка индекса
				availableQuestions.splice(questionIndex, 1)
			} else if (currentQuestion) {
				// Запасной вариант удаления, если индекс некорректен
				const actualIndex = availableQuestions.findIndex(
					q => q === currentQuestion
				)
				if (actualIndex > -1) availableQuestions.splice(actualIndex, 1)
			}
		}
		// *** КОНЕЦ ВЫБОРА ВОПРОСА ***

		// Проверка, удалось ли получить вопрос
		if (!currentQuestion) {
			console.error('[getNewQuestion] Не удалось получить currentQuestion!')
			return showEndGame()
		}
		console.log(
			`[getNewQuestion] availableQuestions ПОСЛЕ выбора/удаления:`,
			availableQuestions.map(q => q.id).join(', ')
		) // << LOG

		// --- Остальной код функции getNewQuestion ---
		// (Проверка формата, отображение вопроса, опций, запуск таймера и т.д.)

		// Проверка формата вопроса
		if (
			!currentQuestion ||
			typeof currentQuestion.question !== 'string' ||
			!Array.isArray(currentQuestion.options) ||
			typeof currentQuestion.answer !== 'number'
		) {
			console.error(
				'[getNewQuestion] Некорректный формат вопроса:',
				currentQuestion
			)
			return getNewQuestion() // Пытаемся получить следующий
		}

		// Отображение вопроса + флага (если режим 'flags')
		if (currentMode === 'flags' && currentQuestion.countryCode) {
			const flagUrl = `https://flagcdn.com/w160/${currentQuestion.countryCode.toLowerCase()}.png`
			questionEl.innerHTML = `
            ${currentQuestion.question}<br>
            <img src="${flagUrl}" alt="Флаг" style="height: 80px; margin-top: 10px; border: 1px solid #ccc; border-radius: 5px;">
        `
		} else {
			questionEl.innerText = currentQuestion.question
		}

		// Генерация опций
		optionsEl.innerHTML = ''
		currentQuestion.options.forEach((option, index) => {
			const optionElement = document.createElement('div')
			optionElement.classList.add('option')
			optionElement.dataset.option = index + 1
			optionElement.innerText = option
			optionElement.addEventListener('click', selectAnswer)
			optionsEl.appendChild(optionElement)
		})

		acceptingAnswers = true
		feedbackEl.innerText = ''
		feedbackEl.className = 'feedback'
		nextBtn.style.display = 'none'
		optionsEl.querySelectorAll('.option').forEach(opt => {
			opt.classList.remove('correct', 'incorrect')
			opt.style.pointerEvents = 'auto'
		})

		// Запуск таймера, если он включен
		if (timePerQuestion > 0) {
			startTimer(timePerQuestion)
		} else {
			timerContainer.style.display = 'none'
		}
	}

	// Выбор ответа
	function selectAnswer(e) {
		if (!acceptingAnswers) return
		acceptingAnswers = false
		stopTimer() // Останавливаем таймер при выборе ответа

		const selectedOption = e.target
		const selectedAnswer = parseInt(selectedOption.dataset.option)
		const isCorrect = selectedAnswer === currentQuestion.answer

		if (isCorrect) {
			incrementScore()
			incrementStreak()
			feedbackEl.innerText = _('correctFeedback')
			feedbackEl.className = 'feedback correct-feedback'
			selectedOption.classList.add('correct')
			createConfetti()
			nextBtn.style.display = 'block' // Показываем кнопку "Далее"
		} else {
			feedbackEl.innerText = `${_('incorrectFeedback')}${
				currentQuestion.options[currentQuestion.answer - 1]
			}`
			feedbackEl.className = 'feedback incorrect-feedback'
			selectedOption.classList.add('incorrect')

			// Подсветить правильный ответ
			const correctOption = optionsEl.querySelector(
				`.option[data-option="${currentQuestion.answer}"]`
			)
			if (correctOption) {
				correctOption.classList.add('correct')
			}

			handleIncorrectAnswer() // Обрабатываем неверный ответ (здоровье, серия, кнопка "Далее" или конец игры)
		}

		// Блокируем опции после ответа
		optionsEl.querySelectorAll('.option').forEach(opt => {
			opt.style.pointerEvents = 'none'
		})
	}

	// Показать экран конца игры
	function showEndGame() {
		stopTimer() // На всякий случай остановить таймер
		gameInterface.style.display = 'none'
		finalScoreEl.innerText = score
		endGameScreen.style.display = 'block'

		// Сохраняем результат в лидерборд, если есть никнейм
		saveResultToLeaderboard()

		// Показать кнопку "Поделиться результатом" (создает ссылку на челлендж),
		// если игра завершена и в ней были вопросы.
		if (questionHistory.length > 0) {
			shareChallengeBtn.style.display = 'inline-block' // Показываем кнопку в ряд с "Играть снова"
		} else {
			shareChallengeBtn.style.display = 'none'
		}
	}

	// Увеличение счета
	function incrementScore() {
		// Более сложная система очков: +100 за правильный ответ, +50 за каждый пункт серии
		score += 100 + streak * 50
		scoreEl.innerText = score
	}

	// Увеличение серии
	function incrementStreak() {
		streak++
		streakEl.innerText = streak
	}

	// Эффект конфетти (без изменений)
	function createConfetti() {
		// ... (ваш существующий код createConfetti)
		for (let i = 0; i < 30; i++) {
			// Уменьшил количество для производительности
			const confetti = document.createElement('div')
			confetti.classList.add('confetti')
			// Позиционируем внутри game-container для лучшего вида
			confetti.style.position = 'absolute' // Важно для позиционирования относительно родителя
			confetti.style.top = Math.random() * 50 + '%' // Начать примерно сверху
			confetti.style.left = Math.random() * 100 + '%'
			confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`
			confetti.style.width = Math.random() * 8 + 4 + 'px'
			confetti.style.height = confetti.style.width // Квадратные или круглые
			confetti.style.opacity = '1'
			confetti.style.borderRadius = '50%'

			gameContainer.appendChild(confetti) // Добавляем внутрь game-container

			// Анимация конфетти
			const animation = confetti.animate(
				[
					{ transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
					{
						transform: `translateY(${gameContainer.offsetHeight}px) rotate(${
							Math.random() * 720 - 360
						}deg)`, // Падение вниз внутри контейнера
						opacity: 0,
					},
				],
				{
					duration: Math.random() * 2000 + 1500, // Немного быстрее
					easing: 'ease-out', // Падение под гравитацией
				}
			)

			animation.onfinish = () => confetti.remove()
		}
	}

	// --- Обработка челленджей ---

	// Функция для парсинга параметров URL
	function getChallengeParamsFromURL() {
		const params = new URLSearchParams(window.location.search)
		const challengeData = params.get('challenge')
		const challengeName = params.get('name')
		const creatorNickname = params.get('creator')
		const creatorScoreParam = params.get('creatorScore')
		const roundsParam = params.get('rounds')
		const healthParam = params.get('health')
		const timeParam = params.get('time')

		if (!challengeData) return null

		try {
			const parts = challengeData.split(',')
			if (parts.length < 2) return null

			const mode = parts[0]
			const ids = parts.slice(1).filter(id => id.trim() !== '')

			if (
				!['capitals', 'countries', 'flags', 'landmarks'].includes(mode) ||
				ids.length === 0
			) {
				console.error("Неверный формат параметра 'challenge':", challengeData)
				return null
			}

			const challengeParams = {
				mode,
				ids,
				name: challengeName ? decodeURIComponent(challengeName) : null,
			}

			// Добавляем информацию о создателе, если она есть и корректна
			if (creatorNickname) {
				challengeParams.creator = decodeURIComponent(creatorNickname)
				const scoreValue = parseInt(creatorScoreParam)
				if (!isNaN(scoreValue)) {
					challengeParams.creatorScore = scoreValue
				}
			}
			// (с проверкой корректности и диапазонов)
			const rounds = parseInt(roundsParam)
			if (!isNaN(rounds) && rounds >= 3 && rounds <= 50) {
				challengeParams.rounds = rounds
			}
			const health = parseInt(healthParam)
			if (!isNaN(health) && health >= 1 && health <= 10) {
				challengeParams.health = health
			}
			const time = parseInt(timeParam)
			if (!isNaN(time) && time >= 0 && time <= 60) {
				challengeParams.time = time
			}

			return challengeParams
		} catch (error) {
			console.error("Ошибка парсинга параметра 'challenge':", error)
			return null
		}
	}

	// Функция для получения перевода
	// Добавлена обработка аргументов и вызов функций-переводчиков
	function _(key, args) {
		// Принимает ключ и опциональные аргументы
		const translationData = translations[currentLang]
			? translations[currentLang][key]
			: null

		if (typeof translationData === 'function') {
			// Если перевод - это функция (как questionsCount), вызываем ее
			try {
				// Передаем аргументы в функцию перевода
				const argsArray = Array.isArray(args)
					? args
					: args !== undefined
					? [args]
					: []
				return translationData(...argsArray)
			} catch (e) {
				console.error(
					`Ошибка выполнения функции перевода для ключа "${key}":`,
					e
				)
				return key // Возвращаем ключ при ошибке
			}
		} else if (typeof translationData === 'string') {
			// Если перевод - строка, возвращаем ее
			// (Можно добавить замену плейсхолдеров типа %s, если нужно)
			return translationData
		} else {
			// Если перевод не найден, возвращаем сам ключ
			return key
		}
	}

	// Функция для генерации ссылки на челлендж
	async function generateAndCopyChallengeLink() {
		if (playedQuestionIds.length === 0) {
			alert('Нет сыгранных вопросов для создания челленджа.')
			return
		}

		// *** Используем обновленную функцию _ для вызова questionsCount ***
		const questionCountText = _('questionsCount', playedQuestionIds.length)
		const defaultName = `${_('challengePrefix')}${_(currentMode)} (${
			playedQuestionIds.length
		} ${questionCountText})`

		const challengeName = prompt(
			'Введите название для вашего челленджа:',
			defaultName
		)

		if (challengeName === null) return

		const mode = currentMode
		const idsString = questionHistory.join(',')
		const encodedName = encodeURIComponent(challengeName)

		// Формируем базовый URL
		let url = `${window.location.origin}${window.location.pathname}?challenge=${mode},${idsString}&name=${encodedName}`

		// Используем настройки, которые были активны во время этой игры (gameSettings)
		url += `&rounds=${gameSettings.rounds}&health=${gameSettings.health}&time=${gameSettings.time}`

		// Добавляем никнейм и счет, если никнейм существует
		if (nickname) {
			const encodedNickname = encodeURIComponent(nickname)
			// Добавляем счет, который был на момент *конца игры*
			// score может быть неактуальным, если кнопка нажата до конца игры,
			// но т.к. кнопка появляется только в конце, это должно быть ОК.
			url += `&creator=${encodedNickname}&creatorScore=${score}`
		}

		try {
			await navigator.clipboard.writeText(url)
			alert(_('challengeCreated'))
		} catch (err) {
			console.error('Не удалось скопировать ссылку: ', err)
			alert(_('challengeCreationError') + '\n' + url)
		}
	}
	// Добавить в объект translations:
	// ru: {
	//     ...
	//     questionsCount: (count) => { // Функция для правильных окончаний
	//         if (count % 10 === 1 && count % 100 !== 11) return 'вопрос';
	//         if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'вопроса';
	//         return 'вопросов';
	//     },
	//     ...
	// }
	// И изменить вызов:
	// const defaultName = `${_('challengePrefix')}${_(currentMode)} (${questionHistory.length} ${translations[currentLang].questionsCount(questionHistory.length)})`;

	// --- Функции Настроек ---
	function openSettingsModal() {
		// Заполняем поля текущими значениями перед открытием
		nicknameInput.value = gameSettings.nickname
		roundsInput.value = gameSettings.rounds
		healthInput.value = gameSettings.health
		timeInput.value = gameSettings.time
		settingsModal.style.display = 'block'
	}

	function closeSettingsModal() {
		settingsModal.style.display = 'none'
	}

	function saveSettings() {
		const newNickname = nicknameInput.value.trim().slice(0, 20) // Обрезаем до 20 символов
		const newRounds = parseInt(roundsInput.value) || 10
		const newHealth = parseInt(healthInput.value) || 3
		const newTime = parseInt(timeInput.value) || 0

		gameSettings = {
			nickname: newNickname,
			// Ограничиваем значения в разумных пределах
			rounds: Math.max(3, Math.min(50, newRounds)),
			health: Math.max(1, Math.min(10, newHealth)),
			time: Math.max(0, Math.min(60, newTime)),
		}

		try {
			localStorage.setItem(SETTINGS_KEY, JSON.stringify(gameSettings))
			nickname = gameSettings.nickname // Обновляем глобальную переменную никнейма
			console.log('Настройки сохранены:', gameSettings)
			// Можно уведомить пользователя
			// alert("Настройки сохранены!");
			// Применяем сразу для следующей игры (перезапуск не нужен немедленно)
			closeSettingsModal()
			// Может быть, стоит перезапустить игру, если она не идет?
			// if (!acceptingAnswers && nextBtn.style.display === 'none' && endGameScreen.style.display === 'none') {
			//    startGame();
			// }
		} catch (error) {
			console.error('Ошибка сохранения настроек в localStorage:', error)
			alert('Не удалось сохранить настройки.')
		}
	}

	function loadSettings() {
		try {
			const savedSettings = localStorage.getItem(SETTINGS_KEY)
			if (savedSettings) {
				const parsedSettings = JSON.parse(savedSettings)
				// Применяем сохраненные настройки, проверяя их тип и наличие
				gameSettings.nickname =
					typeof parsedSettings.nickname === 'string'
						? parsedSettings.nickname.slice(0, 20)
						: ''
				gameSettings.rounds =
					typeof parsedSettings.rounds === 'number'
						? Math.max(3, Math.min(50, parsedSettings.rounds))
						: 10
				gameSettings.health =
					typeof parsedSettings.health === 'number'
						? Math.max(1, Math.min(10, parsedSettings.health))
						: 3
				gameSettings.time =
					typeof parsedSettings.time === 'number'
						? Math.max(0, Math.min(60, parsedSettings.time))
						: 0
				nickname = gameSettings.nickname // Обновляем глобальную переменную
				console.log('Настройки загружены:', gameSettings)
			} else {
				console.log(
					'Сохраненные настройки не найдены, используются значения по умолчанию.'
				)
				// Обновляем инпуты в модалке значениями по умолчанию при первом запуске
				nicknameInput.value = gameSettings.nickname
				roundsInput.value = gameSettings.rounds
				healthInput.value = gameSettings.health
				timeInput.value = gameSettings.time
			}
		} catch (error) {
			console.error('Ошибка загрузки настроек из localStorage:', error)
			// В случае ошибки используем дефолтные
			gameSettings = { rounds: 10, health: 3, time: 0, nickname: '' }
		}
		// Обновляем переменные, которые используются в игре
		currentHealth = gameSettings.health
		timePerQuestion = gameSettings.time
	}

	// Обработчики для кнопок настроек
	settingsBtn.addEventListener('click', openSettingsModal)
	closeSettingsBtn.addEventListener('click', closeSettingsModal)
	saveSettingsBtn.addEventListener('click', saveSettings)

	// Закрытие модалки по клику вне ее
	window.addEventListener('click', event => {
		if (event.target == settingsModal) {
			closeSettingsModal()
		}
		if (event.target == leaderboardModal) {
			closeLeaderboardModal()
		}
	})

	// --- Функции Таймера ---
	function startTimer(duration) {
		let timeLeft = duration
		timerContainer.style.display = 'block' // Показываем блок таймера
		timerEl.textContent = timeLeft
		timerBar.style.width = '100%'
		// Быстрый transition в начале, чтобы сбросить предыдущее состояние плавно
		timerBar.style.transition = 'none'
		// Форсируем перерисовку перед началом анимации
		timerBar.offsetHeight // reflow
		timerBar.style.transition = `width ${duration}s linear` // Главная анимация на всю длительность
		timerBar.style.width = '0%' // Запускаем уменьшение полосы

		// Обновляем текстовый счетчик каждую секунду
		questionTimerInterval = setInterval(() => {
			timeLeft--
			timerEl.textContent = timeLeft
			if (timeLeft <= 0) {
				stopTimer()
				handleTimeOut()
			}
		}, 1000)
	}

	function stopTimer() {
		clearInterval(questionTimerInterval)
		questionTimerInterval = null
		timerBar.style.transition = 'none' // Отключаем transition, чтобы не было скачков при следующем запуске
	}

	function handleTimeOut() {
		if (!acceptingAnswers) return // Если уже ответили, ничего не делаем
		acceptingAnswers = false
		feedbackEl.innerText = _('timeExpiredFeedback', [
			_('timePerRound'),
			currentQuestion.options[currentQuestion.answer - 1],
		]) // Добавить ключ 'timeExpiredFeedback' в переводы
		feedbackEl.className = 'feedback incorrect-feedback'

		// Считаем как ошибку
		handleIncorrectAnswer() // Вынесем логику ошибки в отдельную функцию

		// Показываем правильный ответ
		const correctOption = optionsEl.querySelector(
			`.option[data-option="${currentQuestion.answer}"]`
		)
		if (correctOption) {
			correctOption.classList.add('correct')
		}
		// Блокируем опции
		optionsEl.querySelectorAll('.option').forEach(opt => {
			opt.style.pointerEvents = 'none'
		})

		nextBtn.style.display = 'block' // Показываем кнопку "Далее"
	}
	// Добавить в переводы:
	// timeExpiredFeedback: 'Время вышло! Правильный ответ: '

	// Вынесем логику неверного ответа
	function handleIncorrectAnswer() {
		streak = 0
		streakEl.innerText = streak
		currentHealth-- // Уменьшаем здоровье
		healthEl.innerText = Math.max(0, currentHealth) // Отображаем, минимум 0

		// Анимация потери здоровья (например, тряска)
		healthEl.parentElement.classList.add('shake')
		setTimeout(() => healthEl.parentElement.classList.remove('shake'), 500)

		if (currentHealth <= 0) {
			// Если здоровье кончилось, не показываем кнопку "Далее", а сразу идем к концу игры
			stopTimer()
			showEndGame()
		} else {
			nextBtn.style.display = 'block' // Показываем кнопку "Далее"
		}
	}

	// --- Функции Лидерборда ---
	function openLeaderboardModal() {
		displayLeaderboard()
		leaderboardModal.style.display = 'block'
	}

	function closeLeaderboardModal() {
		leaderboardModal.style.display = 'none'
	}

	function loadLeaderboard() {
		try {
			const data = localStorage.getItem(LEADERBOARD_KEY)
			return data ? JSON.parse(data) : []
		} catch (error) {
			console.error('Ошибка загрузки лидерборда:', error)
			return []
		}
	}

	function saveResultToLeaderboard() {
		if (questionHistory.length === 0 || !nickname) {
			return
		}

		// Определяем, какие настройки были использованы в этой игре
		let gameHealthSetting, gameTimeSetting
		if (currentChallengeParams) {
			// Используем настройки из челленджа (или дефолт, если их не было в URL)
			gameHealthSetting =
				currentChallengeParams.health !== undefined
					? currentChallengeParams.health
					: gameSettings.health
			gameTimeSetting =
				currentChallengeParams.time !== undefined
					? currentChallengeParams.time
					: gameSettings.time
		} else {
			// Используем локальные настройки
			gameHealthSetting = gameSettings.health
			gameTimeSetting = gameSettings.time
		}

		const leaderboard = loadLeaderboard()
		const newResult = {
			nickname: nickname,
			score: score,
			mode: currentMode,
			date: new Date().toISOString().split('T')[0],
			rounds: questionHistory.length, // Фактическое кол-во сыгранных вопросов
			health: gameHealthSetting, // Начальное здоровье для этой игры
			time: gameTimeSetting, // Настройка времени для этой игры
			isChallenge: !!currentChallengeParams, // Пометка, что это был челлендж
		}

		leaderboard.push(newResult)
		leaderboard.sort((a, b) => b.score - a.score) // Сортировка по очкам
		const trimmedLeaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES)

		try {
			localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmedLeaderboard))
			console.log('Результат сохранен в лидерборд:', newResult)
		} catch (error) {
			console.error('Ошибка сохранения лидерборда:', error)
		}
	}

	function displayLeaderboard() {
		const leaderboard = loadLeaderboard()
		leaderboardList.innerHTML = '' // Очищаем список

		if (leaderboard.length === 0) {
			// Показываем сообщение о пустой таблице через data-атрибут для перевода
			leaderboardList.setAttribute(
				'data-translate-empty',
				_('leaderboardEmpty')
			)
			return
		} else {
			leaderboardList.removeAttribute('data-translate-empty')
		}

		leaderboard.forEach((entry, index) => {
			const entryDiv = document.createElement('div')
			entryDiv.classList.add('leaderboard-entry')

			// Получаем переведенное название режима
			const modeKey = `mode_${entry.mode}`
			const translatedMode = _(modeKey) || entry.mode // Используем ключ 'mode_capitals' и т.д.

			entryDiv.innerHTML = `
          <span class="rank">${index + 1}.</span>
          <span class="nickname" title="${entry.nickname}">${
				entry.nickname
			}</span>
          <span class="details" title="Режим: ${translatedMode}, ${
				entry.rounds
			} ${_('questionsCount', entry.rounds)}, ❤️${entry.health}, ⏳${
				entry.time
			}s">${translatedMode}</span>
          <span class="score">${entry.score}</span>
      `
			leaderboardList.appendChild(entryDiv)
		})
	}

	function clearLeaderboard() {
		if (confirm(_('confirmClearLeaderboard'))) {
			// Используем перевод
			try {
				localStorage.removeItem(LEADERBOARD_KEY)
				displayLeaderboard() // Обновляем отображение (покажет пустое)
			} catch (error) {
				console.error('Ошибка очистки лидерборда:', error)
				alert('Не удалось очистить таблицу лидеров.')
			}
		}
	}

	// Обработчики для кнопок лидерборда
	leaderboardBtn.addEventListener('click', openLeaderboardModal)
	closeLeaderboardBtn.addEventListener('click', closeLeaderboardModal)
	clearLeaderboardBtn.addEventListener('click', clearLeaderboard)

	// --- Обработчики событий ---

	// Кнопки выбора режима
	modeBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			if (btn.classList.contains('active')) return // Ничего не делаем, если режим уже выбран

			modeBtns.forEach(b => b.classList.remove('active'))
			btn.classList.add('active')
			currentMode = btn.dataset.mode
			currentChallengeParams = null // Сбрасываем челлендж при смене режима вручную
			startGame() // Начинаем новую игру в выбранном режиме
		})
	})

	// Кнопка "Следующий вопрос"
	nextBtn.addEventListener('click', getNewQuestion)

	// Кнопка "Играть снова"
	playAgainBtn.addEventListener('click', () => {
		// Если был челлендж, перезапускаем его же, иначе - обычный режим
		startGame()
	})

	// Кнопка "Создать челлендж" (простая версия - ссылка на текущую игру)
	createChallengeBtn.addEventListener('click', generateAndCopyChallengeLink)

	// Кнопка "Поделиться результатом" (та же функция, что и создание, т.к. содержит те же вопросы)
	shareChallengeBtn.addEventListener('click', generateAndCopyChallengeLink)

	// --- Инициализация при загрузке ---
	loadSettings() // Загружаем настройки сразу
	applyTranslations() // Применяем переводы

	if (currentChallengeParams) {
		// Если есть челлендж, устанавливаем его режим как активный
		currentMode = currentChallengeParams.mode
		modeBtns.forEach(btn => {
			btn.classList.toggle('active', btn.dataset.mode === currentMode)
		})
		// Блокируем кнопки смены режима во время челленджа (опционально)
		// modeBtns.forEach(btn => btn.disabled = true);
		// createChallengeBtn.disabled = true; // Нельзя создать новый челлендж во время прохождения другого
	} else {
		// Убедимся, что активна кнопка режима по умолчанию ('capitals')
		modeBtns.forEach(btn => {
			btn.classList.toggle('active', btn.dataset.mode === currentMode)
		})
	}

	// Применяем переводы к динамическим плейсхолдерам/атрибутам
	const leaderboardListEl = document.getElementById('leaderboard-list')
	if (leaderboardListEl) {
		leaderboardListEl.setAttribute(
			'data-translate-empty',
			_('leaderboardEmpty')
		)
	}

	currentChallengeParams = getChallengeParamsFromURL()

	startGame() // Начать игру при загрузке (либо обычную, либо челлендж)
})
