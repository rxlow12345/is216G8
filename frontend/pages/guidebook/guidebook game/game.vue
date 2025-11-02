<script>
  //import { number } from 'mathjs';
import animalsData from '../../../src/public/guidebook.json'
import OtterCursor from '../../../src/components/OtterCursor.vue';
import FloatingBackground from '../../../src/components/FloatingBackground.vue';
import '../../css/common.css'
import '../../css/game.css'

  export default {
    components: {OtterCursor, FloatingBackground},
    data() {
      return {
        allAnimals: animalsData, 
        difficultyLevel: ['easy', 'medium', 'hard'],
        selectedDifficulty: '', 
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
        if (this.selectedDifficulty == ''){
          this.selectedDifficulty = 'easy';
        }
        if (this.selectedDifficulty == ''){
          this.selectedDifficulty = 'easy';
        }

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
  <!-- Otter Cursor -->
   <OtterCursor animal="🦦" :speed="0.08"/>

  <!-- Floating Background -->
   <FloatingBackground/>

  <!-- Top Banner -->
  <div class="bannerTitles">
    <header class="text-center mb-2">
      <h1>🌿 Match the Critter 🌿</h1>
      <p> Select difficulty level and match the cards! </p>
    </header>
  </div>

  <!-- Selecting Difficulty -->
  
  <div id="customisation" class="col-6">
    <p class="customisation-label">Please select your difficulty level:</p>
    <select name="difficulty" id="difficulty" v-model="selectedDifficulty" @click="restartGame()">
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>
    <p class="customisation-label">Please select your board size:</p>
    <select name="boardSize" id="boardSize" v-model="numberOfPairs" @click="restartGame()">
      <option value="8">Easy - 4 x 4</option>
      <option value="18">Medium - 6 x 6</option>
      <option value="32">Hard - 8 x 8</option>
    </select>


    <p class="subtitle" v-if="selectedDifficulty == 'easy'">Match animals to their common name</p>
    <p class="subtitle" v-else-if="selectedDifficulty == 'medium'">Match animals to their description</p>
    <p class="subtitle" v-else-if="selectedDifficulty == 'hard'">Match animals to their scientific name</p>
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
    <button v-if="!gameStarted" class="btn green-btn-lg" @click="startGame">
      Start Game
    </button>
    <button v-else class="btn green-btn-lg" @click="restartGame">
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