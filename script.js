document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quiz-form');
    const addQuestionButton = document.getElementById('add-question-button');
    const quizQuestionsContainer = document.getElementById('quiz-questions');
    const createQuizButton = document.getElementById('create-quiz-button');
    const resetQuizButton = document.getElementById('reset-quiz-button');
    const submitQuizButton = document.getElementById('submit-quiz-button');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result');
    const backButton = document.getElementById('back-button');
    const savedQuizzesContainer = document.getElementById('saved-quizzes');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const timerElement = document.getElementById('time');
    const modal = document.querySelector('.modal');
    const modalContent = document.querySelector('.modal-content');
    const resultText = document.getElementById('result-text');
    const toggleQuizzesButton = document.getElementById('toggle-quizzes-button'); 
    const helpButton = document.getElementById('help-button');
    const helpText = document.getElementById('help-text');

    let timer;
    let timeLeft;

    if (form) {
        addQuestionButton.addEventListener('click', (e) => {
            e.preventDefault();

            const questionText = document.getElementById('question-text').value;
            const questions = parseQuestionsText(questionText);

            const quiz = getQuizFromLocalStorage();
            questions.forEach(q => quiz.questions.push(q));
            saveQuizToLocalStorage(quiz);
            displayQuizQuestions();
            form.reset();
        });

        createQuizButton.addEventListener('click', () => {
            const time = parseInt(document.getElementById('timer').value, 10);
            saveCurrentQuiz(time);
            window.location.href = 'index.html';
        });

        resetQuizButton.addEventListener('click', () => {
            localStorage.removeItem('currentQuiz');
            displayQuizQuestions();
            createQuizButton.style.display = 'none';
            resetQuizButton.style.display = 'none';
        });

        displayQuizQuestions();
        displaySavedQuizzes();
    }

    if (quizContainer) {
        const quiz = getQuizFromLocalStorage();
        timeLeft = quiz.time;
        timerElement.textContent = timeLeft;
        displayQuiz();
        startTimer();

        submitQuizButton.addEventListener('click', () => {
            clearInterval(timer);
            const answers = document.querySelectorAll('input[type="radio"]:checked');
            let score = 0;
            let totalQuestions = quiz.questions.length;

            answers.forEach((answer, index) => {
                const questionElement = quizContainer.children[index];
                const correctAnswer = quiz.questions[index].correctAnswer;

                const userAnswer = answer ? answer.value : 'Не отвечено';
                const isCorrect = userAnswer === correctAnswer;

                if (isCorrect) {
                    score++;
                }

                const resultElement = document.createElement('p');
                resultElement.innerHTML = `
                    Ваш ответ: ${userAnswer}<br>
                    Правильный ответ: ${correctAnswer}
                `;
                resultElement.style.color = isCorrect ? 'green' : 'red';
                questionElement.appendChild(resultElement);
            });

            let percentage = (score / totalQuestions) * 100;
            let resultTextContent = '';
            function confettis () {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                  });
            }
            function unicornConfettis () {
                const defaults = {
                    spread: 360,
                    ticks: 100,
                    gravity: 0,
                    decay: 0.94,
                    startVelocity: 30,
                  };
                  
                  function shoot() {
                    confetti({
                      ...defaults,
                      particleCount: 30,
                      scalar: 1.2,
                      shapes: ["circle", "square"],
                      colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
                    });
                  
                    confetti({
                      ...defaults,
                      particleCount: 20,
                      scalar: 2,
                      shapes: ["emoji"],
                      shapeOptions: {
                        emoji: {
                          value: ["🦄", "🌈"],
                        },
                      },
                    });
                  }
                  
                  setTimeout(shoot, 0);
                  setTimeout(shoot, 100);
                  setTimeout(shoot, 200);
            }

            if (percentage === 100) {
                resultTextContent = 'НУ ТЫ ГЕНИЙ';
                unicornConfettis ();
            } else if (percentage >= 80) {
                resultTextContent = 'ТЫ МОЛОДЕЦ!';
                confettis();
                  // запускаем салют
            } else if (percentage >= 50) {
                resultTextContent = 'НЕ ПЛОХО НЕ ПЛОХО';
            } else {
                resultTextContent = 'НАДО УЧИТСЯ';
            }

            resultText.innerHTML = `<p>${resultTextContent}</p><p>Вы ответили правильно на ${score} из ${totalQuestions} вопросов (${percentage.toFixed(2)}%).</p>`;

            modal.style.display = 'block';
        });

        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        const closeModal = modalContent.querySelector('.close');
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            updateProgressBar();
            if (timeLeft <= 0) {
                clearInterval(timer);
                submitQuizButton.click();
            }
        }, 1000);
    }

    function updateProgressBar() {
        const totalTime = getQuizFromLocalStorage().time;
        const percentage = ((totalTime - timeLeft) / totalTime) * 100;
        progressBarFill.style.width = `${percentage}%`;
    }

    function parseQuestionsText(text) {
        const questions = text.split('&').map(part => part.trim()).filter(part => part);
        return questions.map(part => parseQuestionText(part));
    }

    function parseQuestionText(text) {
        const parts = text.split('*');
        const question = parts[0].trim();
        const answers = parts[1].split('\n').map(line => line.trim()).filter(line => line);
        const correctAnswer = answers.find(answer => answer.includes(' +')).replace(' +', '');

        return { question, answers: answers.map(answer => answer.replace(' +', '')), correctAnswer };
    }

    function getQuizFromLocalStorage() {
        const quiz = localStorage.getItem('currentQuiz');
        return quiz ? JSON.parse(quiz) : { questions: [], time: 60 };
    }

    function saveQuizToLocalStorage(quiz) {
        localStorage.setItem('currentQuiz', JSON.stringify(quiz));
    }

    function saveCurrentQuiz(time) {
        const quizzes = getSavedQuizzesFromLocalStorage();
        const currentQuiz = getQuizFromLocalStorage();
        currentQuiz.time = time;
        quizzes.push(currentQuiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        localStorage.removeItem('currentQuiz');
    }

    function getSavedQuizzesFromLocalStorage() {
        const quizzes = localStorage.getItem('quizzes');
        return quizzes ? JSON.parse(quizzes) : [];
    }

    function displayQuizQuestions() {
        const quiz = getQuizFromLocalStorage();
        quizQuestionsContainer.innerHTML = '';

        if (quiz.questions.length > 0) {
            createQuizButton.style.display = 'block';
            resetQuizButton.style.display = 'block';
        } else {
            createQuizButton.style.display = 'none';
            resetQuizButton.style.display = 'none';
        }

        quiz.questions.forEach((item, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('quiz-item');
            questionElement.innerHTML = `
                <h3>${index + 1}. ${item.question}</h3>
                <ul>
                    ${item.answers.map(answer => `<li>${answer}</li>`).join('')}
                </ul>
            `;
            quizQuestionsContainer.appendChild(questionElement);
        });
    }

    function displayQuiz() {
        const quiz = getQuizFromLocalStorage();
        quizContainer.innerHTML = '';

        quiz.questions.forEach((item, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('quiz-item');
            questionElement.innerHTML = `
                <h3>${index + 1}. ${item.question}</h3>
                <ul>
                    ${item.answers.map((answer, answerIndex) => `
                        <li>
                            <label>
                                <input type="radio" name="question${index}" value="${answer}">
                                ${answer}
                            </label>
                        </li>`).join('')}
                </ul>
            `;
            quizContainer.appendChild(questionElement);
        });
    }

    function displaySavedQuizzes() {
        const quizzes = getSavedQuizzesFromLocalStorage();
        savedQuizzesContainer.innerHTML = '';

        if (quizzes.length > 0) {
            quizzes.forEach((quiz, index) => {
                const quizElement = document.createElement('div');
                quizElement.classList.add('saved-quiz-item');
                quizElement.innerHTML = `
                    <h3>Квиз ${index + 1}</h3>
                    <button onclick="loadQuiz(${index})" class="btn btnq"><i class="fas fa-play-circle"></i> Загрузить</button>
                    <button onclick="deleteQuiz(${index})" class="btn btnq"><i class="fas fa-trash-alt"></i> Удалить</button>
                `;
                savedQuizzesContainer.appendChild(quizElement);
            });
        }
    }

    toggleQuizzesButton.addEventListener('click', () => {
        savedQuizzesContainer.classList.toggle('show');
    });

    helpButton.addEventListener('click', () => {
        helpText.classList.toggle('hidden');
    });
});

function loadQuiz(index) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    localStorage.setItem('currentQuiz', JSON.stringify(quizzes[index]));
    window.location.href = 'quiz.html';
}

function deleteQuiz(index) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    quizzes.splice(index, 1);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    document.location.reload();
}
