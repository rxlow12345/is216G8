<script>
  import { number } from 'mathjs';
import animalsData from '../../../src/public/guidebook.json'

  export default {
    data() {
      return {
        allAnimals: animalsData, 
        difficultyLevel: ['easy', 'medium', 'hard'],
        selectedDifficulty: 'easy', 
        gameAnimals: [],
        numberOfPairs: 8,
        rows: 4, 
        gameStarted: false,
        timer: 0,
        timerInterval: null,
        matchedPairs: 0,
        moves: 0,
        flippedCards: [],
        matchedCardIDs: new Set(),
        isProcessing: false,
      }
    },
    methods: {
      shuffleArray(array) {
        let currentIndex = array.length;
        let randomIndex;

        while (currentIndex != 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
          ];
        }

        return array;
      },

      startGame() {
        if (!this.selectedDifficulty) {
          alert('Please select a difficulty level first!');
          return;
        }

        // to reset everything 
        this.timer = 0;
        this.matchedPairs = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.matchedCardIDs = new Set();
        this.isProcessing = false;

        // To generate a new set of animals 
        this.generateGameAnimals();

        // Start timer
        this.startTimer();

        this.gameStarted = true;
      },

      restartGame() {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
        this.gameStarted = false;
        this.timer = 0;
        this.matchedPairs = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.matchedCardIDs = new Set();
        this.isProcessing = false;
        this.gameAnimals = [];
        this.selectedDifficulty = 'easy';
      },

      generateGameAnimals() {
        const shuffled = this.shuffleArray([...this.allAnimals]);
        const selectedAnimals = shuffled.slice(0, this.numberOfPairs);
        
        const gameSet = selectedAnimals.flatMap((animal) => {
          const pairID = `${animal.category}-${animal.scientific_name}`;
          
          return [
            // CARD 1: The Image Card
            {
              ...animal,
              cardID: `${pairID}-image`,
              pairID: pairID,
              type: 'image',
              isFlipped: false,
              isMatched: false
            },
            // CARD 2: The Text Card (changes based on difficulty)
            {
              ...animal,
              cardID: `${pairID}-text`,
              pairID: pairID,
              type: this.getTextCardType(),
              isFlipped: false,
              isMatched: false
            }
          ];
        });

        this.gameAnimals = this.shuffleArray(gameSet);
      },

      getTextCardType() {
        if (this.selectedDifficulty === 'easy') return 'name';
        if (this.selectedDifficulty === 'medium') return 'description';
        if (this.selectedDifficulty === 'hard') return 'scientific';
        return 'name';
      },

      cardClicked(card) {
        if (
          card.isFlipped || 
          card.isMatched || 
          this.flippedCards.length >= 2 ||
          this.isProcessing
        ) {
          return;
        }

        card.isFlipped = true;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
          this.moves++;
          this.isProcessing = true;
          this.checkForMatch();
        }
      },

      checkForMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.pairID === card2.pairID) {
          // If Match found
          setTimeout(() => {
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedCardIDs.add(card1.cardID);
            this.matchedCardIDs.add(card2.cardID);
            this.matchedPairs++;

            this.flippedCards = [];
            this.isProcessing = false;

            if (this.matchedPairs === this.numberOfPairs) {
              this.gameWon();
            }
          }, 500);
        } else {
          setTimeout(() => {
            card1.isFlipped = false;
            card2.isFlipped = false;
            this.flippedCards = [];
            this.isProcessing = false;
          }, 800);
        }
      },

      startTimer() {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
          this.timer++;
        }, 1000);
      },

      gameWon() {
        clearInterval(this.timerInterval);
        setTimeout(() => {
          alert(`🎉 Congratulations! You won!\n⏱️ Time: ${this.timer}s\n🔄 Moves: ${this.moves}`);
        }, 500);
      },

      isCardFlipped(card) {
        return card.isFlipped || card.isMatched;
      }
    },

    beforeUnmount() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
    }
  }
</script>

<template>
  <!-- Top Banner -->
  <div id="topBanner">
    <header class="text-center mb-2">
      <h1>🌿 Wildlife Guidebook Game 🌿</h1>
    </header>
  </div>

  <!-- Selecting Difficulty -->
  
  <div id="difficultyLevel" class="col-6">
    <p class="difficulty-label">Please select your difficulty level:</p>
    <select name="difficulty" id="difficulty" v-model="selectedDifficulty" @click="restartGame()">
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>

    <p class="subtitle" v-if="selectedDifficulty == 'easy'">Match animals to their common name</p>
    <p class="subtitle" v-else-if="selectedDifficulty == 'medium'">Match animals to their description</p>
    <p class="subtitle" v-else-if="selectedDifficulty == 'hard'">Match animals to their scientific name</p>
  </div>

  <!-- Selecting Board Size --> 
   <div id="boardSize">
        <p class = "difficulty-label"> Please select the size of your board: </p>
        <select name="boardSize" id="board-size" v-model="numberOfPairs" @click="restartGame()">
            <option value=""></option>
        </select>

   </div>

  <!-- Game Statistics -->
  <div class="gameStats col-6" v-if="gameStarted">
    <div class="stat">
      <span class="label">⏱️ Time:</span>
      <span class="value">{{ timer }}s</span>
    </div>
    <div class="stat">
      <span class="label">🎯 Matches:</span>
      <span class="value">{{ matchedPairs }} / {{ numberOfPairs }}</span>
    </div>
    <div class="stat">
      <span class="label">🔄 Moves:</span>
      <span class="value">{{ moves }}</span>
    </div>
  </div>

  <!-- Start/Restart Game Button -->
  <div class="button-container">
    <button v-if="!gameStarted" class="start-button" @click="startGame">
      Start Game
    </button>
    <button v-else class="start-button" @click="restartGame">
      Restart Game
    </button>
  </div>

  <!-- Generated Board -->
  <div class="generatingGameBoard" v-if="gameStarted && gameAnimals.length > 0">
    <div 
      v-for="card in gameAnimals"
      :key="card.cardID"
      class="gameCard"
      :class="{ 
        'flipped': isCardFlipped(card), 
        'matched': card.isMatched,
        'clickable': !card.isFlipped && !card.isMatched && !isProcessing
      }"
      @click="cardClicked(card)">
      
      <div class="card-inner">
        <!-- Card Back (Hidden) -->
        <div class="card-back">
          <span class="card-back-icon">🌿</span>
        </div>

        <!-- Card Front -->
        <div class="card-front">
          <template v-if="card.type === 'image'">
            <img :src="card.image_url" :alt="card.common_name" class="card-image">
          </template>
          
          <template v-else-if="card.type === 'name'">
            <div class="card-text">
              <p class="common-name">{{ card.common_name }}</p>
            </div>
          </template>

          <template v-else-if="card.type === 'description'">
            <div class="card-text">
              <p class="description">{{ card.description }}</p>
            </div>
          </template>

          <template v-else-if="card.type === 'scientific'">
            <div class="card-text">
              <p class="scientific-name">{{ card.scientific_name }}</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body {
  font-family: Georgia, 'Times New Roman', Times, serif;
}

/* Top Banner */
h1 {
  color: rgb(254, 250, 224);
  font-family: Georgia, 'Times New Roman', Times, serif;
}

#topBanner {
  width: 100%;
  background-color: rgb(40, 54, 24);
  color: white;
  padding: 15px;
  margin-bottom: 15px;
}

#topBanner h1 {
  font-size: 35px;
}

/* Difficulty Selection */
#boardCustomisation {
/* , #difficultyLevel, #boardSize, #difficultyDisplay, .subtitle { */
  text-align: center;
  margin: 30px auto;
  max-width: 600px;
}

.difficulty-label, .board-size {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: rgb(40, 54, 24);
}

#difficulty, #board {
  padding: 12px 24px;
  font-size: 18px;
  border: 2px solid rgb(40, 54, 24);
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  margin-bottom: 15px;
}

#difficulty:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.subtitle {
  font-size: 16px;
  color: #666;
  font-style: italic;
  margin-top: 10px;
  /* text-align: center; */
}

/* Game Statistics */
.gameStats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 30px auto;
  padding: 20px;
  background-color: rgb(254, 250, 224);
  border-radius: 12px;
  max-width: 800px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat .label {
  font-size: 18px;
  font-weight: bold;
  color: rgb(40, 54, 24);
}

.stat .value {
  font-size: 24px;
  color: rgb(60, 80, 40);
}

/* Button */
.button-container {
  text-align: center;
  margin: 30px auto;
}

.start-button {
  padding: 15px 40px;
  font-size: 20px;
  font-weight: bold;
  background-color: rgb(40, 54, 24);
  color: rgb(254, 250, 224);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-button:hover {
  background-color: rgb(60, 80, 40);
  transform: scale(1.05);
}

.start-button:active {
  transform: scale(0.98);
}

/* Game Board */
.generatingGameBoard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1000px;
  margin: 30px auto;
  padding: 20px;
}

/* Game Card */
.gameCard {
  aspect-ratio: 1;
  perspective: 1000px;
  cursor: pointer;
}

.gameCard.clickable:hover {
  transform: scale(1.02);
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.gameCard.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-back,
.card-front {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.card-back {
  background: linear-gradient(135deg, rgb(40, 54, 24), rgb(60, 80, 40));
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-back-icon {
  font-size: 60px;
}

.card-front {
  background-color: rgb(254, 250, 224);
  border: 3px solid rgb(40, 54, 24);
  transform: rotateY(180deg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.gameCard.matched .card-front {
  opacity: 0.6;
  border-color: #4ade80;
  background-color: #f0fdf4;
}

/* Card Content */
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.card-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.common-name {
  font-size: 18px;
  font-weight: bold;
  color: rgb(40, 54, 24);
}

.scientific-name {
  font-size: 16px;
  font-style: italic;
  color: rgb(60, 80, 40);
}

.description {
  font-size: 14px;
  line-height: 1.4;
  color: rgb(40, 54, 24);
  overflow-y: auto;
  max-height: 100%;
  padding: 5px;
}

/* Initial Message */
.initial-message {
  text-align: center;
  margin: 50px auto;
  padding: 30px;
  background-color: rgb(254, 250, 224);
  border-radius: 12px;
  max-width: 600px;
}

.initial-message p {
  font-size: 20px;
  color: rgb(40, 54, 24);
}

/* Responsive Design */
@media (max-width: 768px) {
  .generatingGameBoard {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    padding: 15px;
  }

  .gameStats {
    flex-direction: column;
    gap: 20px;
  }

  #topBanner h1 {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .generatingGameBoard {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 10px;
  }
}
</style>