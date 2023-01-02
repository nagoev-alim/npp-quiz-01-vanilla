// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { showNotification } from './modules/showNotification.js';
import { getRandomNumber } from './modules/getRandomNumber.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='quiz'>
    <div class='body' data-body=''>
      <h2>Quiz</h2>
      <p class='h5' data-count=''>Question 1/10</p>
      <p data-question=''>Question</p>
      <ul>
        ${Array.from({ length: 4 }).map(i => `
          <li>
            <label>
              <input type='radio' name='answer' data-answer=''>
              <span class='radio'></span>
              <span class='label'>Answer</span>
            </label>
          </li>
        `).join('')}
      </ul>
    </div>
    <button data-submit=''>Submit</button>

    <div class='finish hide' data-finish=''>
      <h2>Finish</h2>
      <p>You answered 0/10 questions correctly</p>
      <button>Reload</button>
    </div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      questionLabel: document.querySelector('[data-question]'),
      questionCount: document.querySelector('[data-count]'),
      answerFields: document.querySelectorAll('[data-answer]'),
      button: document.querySelector('[data-submit]'),
      quizBody: document.querySelector('[data-body]'),
      quiz: document.querySelector('.quiz'),
      finish: document.querySelector('[data-finish]'),
    };

    this.PROPS = {
      axios: axios.create({
        baseURL: 'https://opentdb.com/api.php?amount=10&category=18&difficulty=easy&type=multiple&encode=url3986',
      }),
      currentQuestion: 0,
      correctAnswer: null,
      score: 0,
      quizData: null,
    };

    this.fetchQuiz();

    this.DOM.button.addEventListener('click', this.onSubmit);
    this.DOM.finish.querySelector('button').addEventListener('click', () => location.reload());
  }

  /**
   * @function fetchQuiz - Fetch quiz questions
   * @returns {Promise<void>}
   */
  fetchQuiz = async () => {
    try {
      this.DOM.quiz.classList.add('disabled');
      const { data: { results } } = await this.PROPS.axios.get();
      this.PROPS.quizData = results;
      this.renderQuiz(this.PROPS.quizData);
      this.DOM.quiz.classList.remove('disabled');
    } catch (e) {
      showNotification('danger', 'Something went wrong, open dev console.');
      console.log(e);
    }
  };

  /**
   * @function renderQuiz - Render quiz HTML
   * @param data
   */
  renderQuiz = (data) => {
    this.DOM.questionCount.innerHTML = `Question ${this.PROPS.currentQuestion + 1}/${data.length}`;
    this.DOM.questionLabel.textContent = decodeURIComponent(data[this.PROPS.currentQuestion].question);
    const answers = this.shuffle([...data[this.PROPS.currentQuestion].incorrect_answers, data[this.PROPS.currentQuestion].correct_answer]);
    this.correctAnswer = decodeURIComponent(data[this.PROPS.currentQuestion].correct_answer);
    console.log(`⭐️ Correct answer: ${this.correctAnswer}`);

    this.DOM.answerFields.forEach((radio, radioIdx) => {
      radio.checked = false;
      answers.forEach((answer, answerIdx) => {
        answerIdx === radioIdx ? radio.value = radio.nextElementSibling.nextElementSibling.textContent = decodeURIComponent(answer) : false;
      });
    });
  };

  /**
   * @function onSubmit - Submit event handler
   */
  onSubmit = () => {
    let checkedAnswer = null;
    this.DOM.answerFields.forEach(field => {
      if (field.checked) checkedAnswer = field.nextElementSibling.nextElementSibling.textContent;
    });

    if (checkedAnswer) {
      if (checkedAnswer === this.correctAnswer) this.PROPS.score++;
      this.PROPS.currentQuestion++;
      if (this.PROPS.currentQuestion < this.PROPS.quizData.length) {
        this.renderQuiz(this.PROPS.quizData);
      } else {
        confetti({
          angle: getRandomNumber(55, 125),
          spread: getRandomNumber(50, 70),
          particleCount: getRandomNumber(50, 100),
          origin: { y: 0.6 },
        });

        this.DOM.quizBody.classList.add('hide');
        this.DOM.button.classList.add('hide');
        this.DOM.finish.classList.remove('hide');
        this.DOM.finish.querySelector('p').innerHTML = `You answered ${this.PROPS.score}/${this.PROPS.quizData.length} questions correctly`;
      }
    } else {
      showNotification('warning', 'Please check some answer.');
    }
  };

  /**
   * @function shuffle - Shuffle array
   * @param array
   * @returns {*}
   */
  shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };
}

// ⚡️Class instance
new App();
