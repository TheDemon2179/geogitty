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
		},
		// Можно добавить 'en' и другие языки позже
	}
	const currentLang = 'ru' // Устанавливаем язык

	// Функция для получения перевода
	function _(key) {
		return translations[currentLang][key] || key
	}

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
		console.log(
			`Starting game. Mode: ${currentMode}`,
			currentChallengeParams ? `Challenge: ${currentChallengeParams.name}` : ''
		)
		questionCounter = 0
		score = 0
		streak = 0
		questionHistory = [] // Сбрасываем историю для новой игры
		scoreEl.innerText = score
		streakEl.innerText = streak
		progressEl.style.width = '0%'
		feedbackEl.innerText = ''
		feedbackEl.className = 'feedback'
		nextBtn.style.display = 'none'
		gameInterface.style.display = 'block'
		endGameScreen.style.display = 'none'
		shareChallengeBtn.style.display = 'none' // Скрыть кнопку шаринга по умолчанию

		// Загружаем все вопросы для режима
		allQuestions = await loadQuestions(currentMode)

		if (allQuestions.length === 0 && !currentChallengeParams) {
			questionEl.textContent = _('questionLoadError') + currentMode
			optionsEl.innerHTML = ''
			return // Не можем начать игру без вопросов
		}

		// Если это челлендж, фильтруем вопросы
		if (currentChallengeParams) {
			const challengeIds = new Set(currentChallengeParams.ids)
			availableQuestions = allQuestions.filter(q => challengeIds.has(q.id))
			// Сохраняем ID вопросов челленджа для возможного шаринга результата
			questionHistory = availableQuestions.map(q => q.id)

			// Проверяем, все ли ID из URL найдены
			if (availableQuestions.length !== challengeIds.size) {
				console.warn(
					'Некоторые ID вопросов из челленджа не найдены в файле данных.'
				)
				// Можно показать сообщение пользователю
			}
			// Если не удалось загрузить ни одного вопроса для челленджа
			if (availableQuestions.length === 0) {
				questionEl.textContent = _('challengeLoadingError')
				optionsEl.innerHTML = ''
				challengeInfoEl.style.display = 'block' // Показываем инфо о челлендже
				challengeNameEl.textContent =
					currentChallengeParams.name + ' (Ошибка загрузки)'
				return
			}

			challengeInfoEl.style.display = 'block' // Показываем инфо о челлендже
			challengeNameEl.textContent =
				currentChallengeParams.name || `${_('challengePrefix')}${currentMode}`
		} else {
			// Обычный режим: берем MAX_QUESTIONS случайных вопросов
			challengeInfoEl.style.display = 'none' // Скрываем инфо о челлендже
			availableQuestions = getRandomQuestions(allQuestions, MAX_QUESTIONS)
			// Сохраняем ID для возможного создания челленджа из этой игры
			questionHistory = availableQuestions.map(q => q.id)
		}

		if (availableQuestions.length === 0) {
			// Если даже после фильтрации/выборки вопросов не осталось
			questionEl.textContent = 'Нет доступных вопросов для начала игры.'
			optionsEl.innerHTML = ''
			return
		}

		getNewQuestion()
	}

	// Получить случайные N вопросов из массива
	function getRandomQuestions(sourceArray, count) {
		const shuffled = [...sourceArray].sort(() => 0.5 - Math.random())
		return shuffled.slice(0, Math.min(count, sourceArray.length))
	}

	// Получение нового вопроса
	function getNewQuestion() {
		// Условие конца игры: закончились доступные вопросы
		if (availableQuestions.length === 0) {
			return showEndGame()
		}

		questionCounter++
		// Прогресс считается от количества вопросов в *текущей* игре (челлендже или MAX_QUESTIONS)
		const totalQuestionsInGame = currentChallengeParams
			? currentChallengeParams.ids.length
			: Math.min(MAX_QUESTIONS, allQuestions.length)
		// Обновляем прогресс только если totalQuestionsInGame > 0, чтобы избежать деления на ноль
		progressEl.style.width =
			totalQuestionsInGame > 0
				? `${(questionCounter / totalQuestionsInGame) * 100}%`
				: '0%'

		// Выбираем случайный вопрос из *оставшихся*
		const questionIndex = Math.floor(Math.random() * availableQuestions.length)
		currentQuestion = availableQuestions[questionIndex]

		// Проверяем, есть ли у вопроса необходимые поля
		if (
			!currentQuestion ||
			typeof currentQuestion.question !== 'string' ||
			!Array.isArray(currentQuestion.options) ||
			typeof currentQuestion.answer !== 'number'
		) {
			console.error('Некорректный формат вопроса:', currentQuestion)
			// Удаляем некорректный вопрос и пытаемся получить следующий
			availableQuestions.splice(questionIndex, 1)
			getNewQuestion()
			return
		}

		questionEl.innerText = currentQuestion.question

		optionsEl.innerHTML = '' // Очищаем предыдущие опции
		currentQuestion.options.forEach((option, index) => {
			const optionElement = document.createElement('div')
			optionElement.classList.add('option')
			optionElement.dataset.option = index + 1 // Нумерация с 1
			optionElement.innerText = option
			optionElement.addEventListener('click', selectAnswer)
			optionsEl.appendChild(optionElement)
		})

		// Удаляем использованный вопрос из списка доступных для этой сессии
		availableQuestions.splice(questionIndex, 1)

		acceptingAnswers = true
		feedbackEl.innerText = ''
		feedbackEl.className = 'feedback'
		nextBtn.style.display = 'none'
	}

	// Выбор ответа
	function selectAnswer(e) {
		if (!acceptingAnswers) return
		acceptingAnswers = false

		const selectedOption = e.target
		const selectedAnswer = parseInt(selectedOption.dataset.option) // Преобразуем в число

		const isCorrect = selectedAnswer === currentQuestion.answer

		if (isCorrect) {
			incrementScore()
			incrementStreak()
			feedbackEl.innerText = _('correctFeedback')
			feedbackEl.className = 'feedback correct-feedback'
			selectedOption.classList.add('correct')
			createConfetti()
		} else {
			streak = 0 // Сброс серии при ошибке
			streakEl.innerText = streak
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
		}

		// Показываем кнопку "Следующий вопрос"
		nextBtn.style.display = 'block'
	}

	// Показать экран конца игры
	function showEndGame() {
		gameInterface.style.display = 'none' // Скрыть интерфейс игры
		finalScoreEl.innerText = score
		endGameScreen.style.display = 'block' // Показать экран результатов
		// Показать кнопку "Поделиться", если это был челлендж с ID вопросов
		if (currentChallengeParams && questionHistory.length > 0) {
			shareChallengeBtn.style.display = 'inline-block'
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
		const challengeData = params.get('challenge') // Ожидаем формат "mode,id1,id2,id3..."
		const challengeName = params.get('name')

		if (!challengeData) {
			return null
		}

		try {
			const parts = challengeData.split(',')
			if (parts.length < 2) return null // Должен быть режим и хотя бы один ID

			const mode = parts[0]
			const ids = parts.slice(1).filter(id => id.trim() !== '') // Убираем пустые ID

			if (
				!['capitals', 'countries', 'flags', 'landmarks'].includes(mode) ||
				ids.length === 0
			) {
				console.error("Неверный формат параметра 'challenge':", challengeData)
				return null
			}

			return {
				mode,
				ids,
				name: challengeName ? decodeURIComponent(challengeName) : null,
			}
		} catch (error) {
			console.error("Ошибка парсинга параметра 'challenge':", error)
			return null
		}
	}

	// Функция для генерации ссылки на челлендж
	async function generateAndCopyChallengeLink() {
		if (questionHistory.length === 0) {
			alert('Нет вопросов в текущей игре для создания челленджа.')
			return
		}

		// Предлагаем ввести имя челленджа
		const defaultName = `${_('challengePrefix')}${_(currentMode)} (${
			questionHistory.length
		} ${_('questionsCount', questionHistory.length)})` // Добавить ключ 'questionsCount' в переводы
		const challengeName = prompt(
			'Введите название для вашего челленджа:',
			defaultName
		)

		if (challengeName === null) return // Пользователь нажал "Отмена"

		const mode = currentMode
		const idsString = questionHistory.join(',')
		const encodedName = encodeURIComponent(challengeName)

		const url = `${window.location.origin}${window.location.pathname}?challenge=${mode},${idsString}&name=${encodedName}`

		try {
			await navigator.clipboard.writeText(url)
			alert(_('challengeCreated')) // Сообщаем об успехе
		} catch (err) {
			console.error('Не удалось скопировать ссылку: ', err)
			alert(_('challengeCreationError') + '\n' + url) // Показываем ссылку, если копирование не удалось
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
	applyTranslations() // Применить переводы при загрузке
	currentChallengeParams = getChallengeParamsFromURL() // Проверить наличие челленджа в URL

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

	startGame() // Начать игру при загрузке (либо обычную, либо челлендж)
})
