class TriviaGameShow {
  constructor(element, options = {}) {

    // this.useCategoryIds = options.useCategoryIds || [102, 4483, 88, 218, 2098, 1000];
    this.useCategoryIds = Array.from({ length: 6 }, () => Math.floor(Math.random() * 1000));

    // DB

    this.categories = [];
    this.clues = {};


    // State

    this.currentClue = null;
    this.score = null;

    this.boardElement = element.querySelector("#board");
    this.scoreCountElement = element.querySelector("#score-count");
    this.formElement = element.querySelector("#form");
    this.inputElement = element.querySelector("input[id=user-answer]");
    this.modalElement = element.querySelector("#card-modal");
    this.clueTextElement = element.querySelector("#clue-text");
    this.resultElement = element.querySelector("#result");
    this.resultTextElement = element.querySelector("#result_correct-answer-text");
    this.successTextElement = element.querySelector("#result_success");
    this.failTextElement = element.querySelector("#result_fail");
    this.buttonElement = element.querySelector("#restart-button");

  }

  initializeGame() {
    this.scoreCountElement.textContent = this.score;
    this.fetchCategories();

    this.boardElement.addEventListener("click", event => {
      if (event.target.dataset.clueId) {
        this.handleClueClick(event);
      }
    });

    this.formElement.addEventListener('submit', event => {
      this.handleFormSubmit(event);
    })

    this.buttonElement.addEventListener('click', event => {
      this.handleRestart(event);
    })
    this.updateScore(0);
  }






  fetchCategories() {

    function shuffle(array) {
      let counter = array.length;

      while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        // console.log('INDEX', index);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
      }
      return array;
    }



    const categories = this.useCategoryIds.map(categoryId => {
      return new Promise((resolve, reject) => {
        fetch(`https://jservice.io/api/category?id=${categoryId}`)
          .then(response => response.json()).then(data => {

            resolve(data);
            console.log(categories)
          })
      })
    })
    Promise.all(categories).then(results => {

      results.forEach((category, categoryIndex) => {
        let newCategory = {
          title: category.title,
          clues: []
        }

        let clues = shuffle(category.clues).splice(0, 5).forEach((clue, index) => {
          let clueId = categoryIndex + "-" + index;
          newCategory.clues.push(clueId);

          this.clues[clueId] = {
            question: clue.question,
            answer: clue.answer,
            value: `$${(index + 1) * 100}`
          }
        })
        this.categories.push(newCategory);

      })
      console.log(this)
      this.categories.forEach(c => {
        this.renderCategory(c)
      })
    })
  }
  renderCategory(category) {
    let column = document.createElement("div");
    column.classList.add("column")

    column.innerHTML = (
      `<header>${category.title}</header><ul></ul>`
    )

    let ul = column.querySelector("ul");
    category.clues.forEach(clueId => {
      let clue = this.clues[clueId];
      ul.innerHTML += `<li><button data-clue-id=${clueId}>${clue.value}</button></li>`
    })
    this.boardElement.appendChild(column);
  }


  updateScore(change) {
    this.score += change;
    this.scoreCountElement.textContent = this.score;
  }


  handleClueClick(event) {
    let clue = this.clues[event.target.dataset.clueId];

    // mark button as clicked, hidding the button
    event.target.classList.add('clicked');

    // clear the numbers from the cell
    this.inputElement.value = "";

    // update the current clue in the constructor
    this.currentClue = clue;

    console.log('CURRENT CLUE question:', this.currentClue.question)
    console.log('CURRENT CLUE ANSWER:', this.currentClue.answer)
    console.log('CLUETEXTELEMENT:', this.clueTextElement);
    // update the text
    this.clueTextElement.textContent = this.currentClue.question;
    this.resultTextElement.textContent = this.currentClue.answer;

    // hide the result
    this.modalElement.classList.remove("showing-result");

    // show the modal
    this.modalElement.classList.add('clicked');
    this.inputElement.focus();
  }

  handleFormSubmit(event) {
    event.preventDefault();

    let isCorrect = this.cleanUpAnswer(this.inputElement.value) === this.cleanUpAnswer(this.currentClue.answer);
    if (isCorrect) {
      this.updateScore(this.currentClue.value)
    }
    this.revealAnswer(isCorrect);
  }

  cleanUpAnswer(input = "") {
    let lowerCaseAnswer = input.toLowerCase();
    lowerCaseAnswer = lowerCaseAnswer.replace("a", "");
    lowerCaseAnswer = lowerCaseAnswer.replace("an", "");
    lowerCaseAnswer = lowerCaseAnswer.replace("the", "");
    lowerCaseAnswer = lowerCaseAnswer.replace("<i>", "");
    lowerCaseAnswer = lowerCaseAnswer.replace("</i>", "");
    lowerCaseAnswer = lowerCaseAnswer.replace(/ /g, "");
    lowerCaseAnswer = lowerCaseAnswer.replace(/"/g, "");
    lowerCaseAnswer = lowerCaseAnswer.replace(/^a /, "");
    lowerCaseAnswer = lowerCaseAnswer.replace(/^an /, "");

    return lowerCaseAnswer.trim();
  }

  revealAnswer(isCorrect) {
    this.successTextElement.style.display = isCorrect ? "block" : "none";
    this.failTextElement.style.display = isCorrect ? "none" : "block";

    this.modalElement.classList.add("showing-result");

    setTimeout(() => {
      this.modalElement.classList.remove('clicked');
    }, 3000);
  }

  handleRestart(click) {
    window.location.reload();
  }
}

function randomRGB() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}

const letters = document.querySelectorAll('.letter');
const intervalId = setInterval(function () {
  for (let letter of letters) {
    letter.style.color = randomRGB();
  }
}, 1000);

const game = new TriviaGameShow(document.querySelector(".app"), {});
game.initializeGame();
