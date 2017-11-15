/* global $
*/

'use strict';


class Render {
  constructor() {
    this.TOP_LEVEL_COMPONENTS = [
      'js-intro', 'js-question', 'js-question-feedback', 
      'js-outro', 'js-quiz-status'
    ];
  }
  hideAll() {
    this.TOP_LEVEL_COMPONENTS.forEach(component => $(`.${component}`).hide());
  }
  generateQuestionHtml(question) {
    const answers = question.answers
      .map((answer, index) => this.generateAnswerItemHtml(answer, index))
      .join('');
  
    return `
      <form>
        <fieldset>
          <legend class="question-text">${question.text}</legend>
            ${answers}
            <button type="submit">Submit</button>
        </fieldset>
      </form>
    `;
  }
  generateAnswerItemHtml(answer) {
    return `
      <li class="answer-item">
        <input type="radio" name="answers" value="${answer}" />
        <span class="answer-text">${answer}</span>
      </li>
    `;
  }
  generateFeedbackHtml(feedback) {
    return `
      <p>
        ${feedback}
      </p>
      <button class="continue js-continue">Continue</button>
    `;
  }
  render() {
    let html;
    this.hideAll();
    const question = quiz.getCurrentQuestion();
    const { feedback } = new Store; 
    const { current, total } = quiz.getProgress();
  
    $('.js-score').html(`<span>Score: ${quiz.getScore()}</span>`);
    $('.js-progress').html(`<span>Question ${current} of ${total}`);
    
    switch (quiz.page) {
    case 'intro':
      $('.js-intro').show();
      break;
      
    case 'question':
      html = this.generateQuestionHtml(question);
      $('.js-question').html(html);
      $('.js-question').show();
      $('.quiz-status').show();
      break;
  
    case 'answer':
      html = this.generateFeedbackHtml(feedback);
      $('.js-question-feedback').html(html);
      $('.js-question-feedback').show();
      $('.quiz-status').show();
      break;
  
    case 'outro':
      $('.js-outro').show();
      $('.quiz-status').show();
      break;
  
    default:
      return;
    }
  }
}



//start here
class TriviaAPI {
  constructor() {
    this.BASE_API_URL = 'https://opentdb.com';
    this.sessionToken = null;
  }

  buildBaseUrl(amt = 10, query = {}) {
    const url = new URL(this.BASE_API_URL + '/api.php');
    const queryKeys = Object.keys(query);
    url.searchParams.set('amount', amt);
  
    if (this.sessionToken) {
      url.searchParams.set('token', this.sessionToken);
    }
    queryKeys.forEach(key => url.searchParams.set(key, query[key]));
    return url;
  }
  buildTokenUrl() {
    return new URL(this.BASE_API_URL + '/api_token.php');
  }

  fetchToken(callback) {
    if (this.sessionToken) {
      return callback;
    }
            
    const url = this.buildTokenUrl();
    url.searchParams.set('command', 'request');
            
    $.getJSON(url, res => {
      console.log(res);
      this.sessionToken = res.token;
      console.log(this.sessionToken);
      callback();
    }, err => console.log(err));
  }
  fetchQuestions(amt, query, callback) {
    $.getJSON(this.buildBaseUrl(amt, query), callback, err => console.log(err.message));
  }
  fetchAndSeedQuestions(amt, query, callback) {
    this.fetchQuestions(amt, query, res => {
      this.seedQuestions(res.results);
      callback();
    });
  }
  
  
}

const retrieveToken = new TriviaAPI();
const fetchAndSeedQs = new TriviaAPI();
 

class Store {
  constructor() 
  {
    this.page = 'intro';
    this.currentQuestionIndex = null,
    this.userAnswers = [];
    this.feedback = null;
    this.QUESTIONS = [];
    
  }
  
  seedQuestions(questions) {
    this.QUESTIONS.length = 0;
    questions.forEach(q => this.QUESTIONS.push(this.createQuestion(q)));
  }
  createQuestion(question) {
    return {
      text: question.question,
      answers: [ ...question.incorrect_answers, question.correct_answer ],
      correctAnswer: question.correct_answer
    };
  }
  getScore() {
    return this.userAnswers.reduce((accumulator, userAnswer, index) => {
      const question = this.getQuestion(index);
  
      if (question.correctAnswer === userAnswer) {
        return accumulator + 1;
      } else {
        return accumulator;
      }
    }, 0);
  }
  getProgress() {
    return {
      current: this.currentQuestionIndex + 1,
      total: this.QUESTIONS.length
    };
  }
  getCurrentQuestion() {
    return this.QUESTIONS[this.currentQuestionIndex];
  }
  getQuestion(index) {
    return this.QUESTIONS[index];
  }
  handleSubmitAnswer(e) {
    e.preventDefault();
    const question = this.getCurrentQuestion();
    const selected = $('input:checked').val();
    this.userAnswers.push(selected);
    
    if (selected === question.correctAnswer) {
      this.feedback = 'You got it!';
    } else {
      this.feedback = `Too bad! The correct answer was: ${question.correctAnswer}`;
    }
  
    this.page = 'answer';
    mainRendering.render();
  }
  handleNextQuestion() {
    if (this.currentQuestionIndex === this.QUESTIONS.length - 1) {
      this.page = 'outro';
      mainRendering.render();
      return;
    }
  
    this.currentQuestionIndex++;
    this.page = 'question';
    mainRendering.render();
   
  }
}

// const submitAns = new Store();



// const seedQs = new Store();

// const page = new Store();


// const score = new Store();
// score.getScore();

// const progress = new Store();
// progress.getProgress();

// const currentQ = new Store();
// currentQ.getCurrentQuestion();
const quiz = new Store();


const mainRendering = new Render();

mainRendering.render();

// const topLevel = new Render();
// console.log(topLevel.hideAll());

//create new instances in the global space to reference 
// const quiz = new Store();



// const handleSubmitAnswer = function(e) {
//   e.preventDefault();
//   const question = currentQ.getCurrentQuestion();
//   const selected = $('input:checked').val();
//   userAnswers.push(selected);
  
//   if (selected === question.correctAnswer) {
//     this.feedback = 'You got it!';
//   } else {
//     this.feedback = `Too bad! The correct answer was: ${question.correctAnswer}`;
//   }

//   this.page = 'answer';
//   mainRendering.render();
// };

function handleNextQuestion() {
  if (this.currentQuestionIndex === this.QUESTIONS.length - 1) {
    this.page = 'outro';
    mainRendering.render();
    return;
  }

  this.currentQuestionIndex++;
  this.page = 'question';
  mainRendering.render();
 
}


// On DOM Ready, run render() and add event listeners
$(() => {
  // Run first render
  mainRendering.render();
  retrieveToken.fetchToken(function(){
    $('.js-start').attr('disabled', false);
  });
//do not invoke the function here; just have it recieve the event object
  $('.js-intro, .js-outro').on('click', '.js-start', quiz);
  $('.js-question').on('submit', quiz.handleSubmitAnswer);
  $('.js-question-feedback').on('click', '.js-continue', quiz.handleNextQuestion);
});