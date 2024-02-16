// DOM elements
const elements = {
  playerNameInput: document.querySelector("#player-name"),
  startGameButton: document.querySelector("#start-game"),
  modalStart: document.querySelector("#modal-start"),
  playerNameError: document.querySelector("#player-name-error"),
  gameContainer: document.querySelector("#game-container"),
  modalEnd: document.querySelector("#modal-end"),
  playAgainButton: document.querySelector("#play-again"),
  topicSelected: document.querySelector("#topics-select"),
  scoreBoard: document.querySelector("#scoreboard"),
  playerScore: document.querySelector("#player-score")
};

// game variables
let playerMoves = 0;
let playerMatches = 0;
let firstCard = null;
let secondCard = null;
let score = 0;
let consecutiveMatches = 0;

// Unsplash const for API
const clientId = "bfdH9o6tt3oLJSqx04FZILvH3vS0WJQKCmIqJXbxdgo";
const UNSPLASH_ROOT = "https://api.unsplash.com";
const countCards = 8;

// focus input field on load
window.onload = () => {
  elements.playerNameInput.focus();
};

// Get the player name and the topic from local storage
const playerName = localStorage.getItem("playerName");
if (playerName) {
  elements.playerNameInput.value = playerName;
}
const topic = localStorage.getItem("topicSelected");
if (topic) {
  elements.topicSelected.value = topic;
}

// start events
elements.startGameButton.addEventListener("click", () => {
  createCardElements();
  startGame();
});

const isEnterPressed = (e) => {
  if (e.key === "Enter") {
    createCardElements();
    startGame();
  }
}

elements.playerNameInput.addEventListener("keyup", (e) => {
  isEnterPressed(e);
});

elements.topicSelected.addEventListener("keyup", (e) => {
  isEnterPressed(e);
});

const startGame = () => {
  const playerName = elements.playerNameInput.value.trim();
  const topic = elements.topicSelected.value;

  if (playerName) {
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("topicSelected", topic);
    updateScoreBoard();
    elements.modalStart.style.display = "none";
    elements.playerNameError.style.display = "none";
    elements.gameContainer.style.display = "flex";
    elements.scoreBoard.style.display = "block";
    flipAllCards();
  } else {
    elements.playerNameError.style.display = "block";
  }
}


// play again event
elements.playAgainButton.addEventListener("click", () => {
  elements.modalEnd.style.display = "none";
  elements.modalStart.style.display = "flex";
  elements.playerNameInput.focus();
});


// Function to create the card elements
const createCardElements = async() => {
  try {
    const unsplashResults = await fetchResults(elements.topicSelected.value);
    const randomImages = unsplashResults.slice(0, countCards * 2);

    const combinedCards = [...randomImages, ...randomImages];
    combinedCards.sort(() => Math.random() - 0.5);

    const container = document.createElement("div");
    container.classList.add("container");

    combinedCards.forEach((card, index) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");

      const image = document.createElement("img");
      image.src = card;

      cardElement.appendChild(image);
      container.appendChild(cardElement);
    });

    elements.gameContainer.appendChild(container);
    flipAllCards();
    addCardClickListeners();
  } catch (err) {
    console.log(err);
    alert("Failed to search Unsplash");
  }
}

// Function to flip all the cards after 3 seconds and get the first and second cards to compare
const flipAllCards = () => {
  const cards = document.querySelectorAll(".card");
  setTimeout(() => {
    cards.forEach((card) => {
      card.classList.toggle("flipped");
      card.addEventListener("click", function () {
        if (!secondCard && firstCard) {
          secondCard = card;
        }
        if (!firstCard) {
          firstCard = card;
        }
        if (firstCard && secondCard) {
          checkMatch();
          playerMoves++;
          updateScoreBoard();
        }
      });
    });
  }, 2000); // 2000ms = 2 seconds
}

// Function to add click listeners to the cards
const addCardClickListeners = () => {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
  });
}

// Function to check if the cards match
const checkMatch = () => {
  if (
    firstCard?.querySelector("img")?.src ===
    secondCard?.querySelector("img")?.src
  ) {
    playerMatches++;
    score += 10;
    consecutiveMatches++;
    firstCard.style.pointerEvents = "none";
    secondCard.style.pointerEvents = "none";
    firstCard = null;
    secondCard = null;
  }
  if (consecutiveMatches >= 2) {
    score += 5;
  }
  if (
    firstCard?.querySelector("img")?.src !==
    secondCard?.querySelector("img")?.src
  ) {
    consecutiveMatches = 0;
    setTimeout(() => {
      firstCard.classList.toggle("flipped");
      secondCard.classList.toggle("flipped");
      firstCard = null;
      secondCard = null;
    }, 500);
  }
  if (playerMatches === 8) {
    setTimeout(() => {
      elements.playerScore.innerHTML = `Score: ${score}`;
      playerMatches = 0;
      score = 0;
      consecutiveMatches = 0;
      playerMoves = 0;
      const cards = document.querySelectorAll(".card");
      cards.forEach((card) => {
        card.style.pointerEvents = "auto";
      });
      firstCard = null;
      secondCard = null;
      elements.gameContainer.style.display = "none";
      elements.scoreBoard.style.display = "none";
      elements.modalEnd.style.display = "flex";
    }, 500);
  }
}

// Function to update the score board
const updateScoreBoard = () => {
  let bestPlayer =
    localStorage.getItem("bestPlayerName") || "No best player yet";
  let bestPlayerScore = parseInt(localStorage.getItem("bestPlayerScore")) || 0;
  const playerName = localStorage.getItem("playerName");

  if (score > bestPlayerScore) {
    localStorage.setItem("bestPlayerName", playerName);
    localStorage.setItem("bestPlayerScore", score);
  }

  elements.scoreBoard.innerHTML = `<br><p>Movements: ${playerMoves}</p> 
    <p>Matches: ${playerMatches}</p>
    <p>Score: ${score}</p>`;

  if (bestPlayer && bestPlayerScore) {
    elements.scoreBoard.innerHTML += `<p><u>Best score</u><br>By : ${bestPlayer} <br> Score : ${bestPlayerScore}</p>`;
  }
}

// Function to search Unsplash for images
const searchUnsplash = async(searchQuery) => {
  let endpoint;
  searchQuery === 'random' ? endpoint = `${UNSPLASH_ROOT}/photos/random?query='${searchQuery}&client_id=${clientId}&count=${countCards}` : endpoint = `${UNSPLASH_ROOT}/photos/random?query='${searchQuery}&client_id=${clientId}&count=${countCards}`;
  
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw Error(response.statusText);
  }

  const json = await response.json();
  return json;
}

// Function to fetch the results from Unsplash
const fetchResults = async(searchQuery) => {
  try {
    const results = await searchUnsplash(searchQuery);
    return results.map((result) => result.urls.regular);
  } catch (err) {
    console.log(err);
    alert("Failed to search Unsplash");
  }
}
