<script>
import animalsData from '../../../src/public/guidebook.json'
import OtterCursor from '../../../src/components/OtterCursor.vue';
import FloatingBackground from '../../../src/components/FloatingBackground.vue';
import '../../css/common.css'
import '../../css/game.css'
import { getCurrentUser } from '../../../src/api/auth.js';
import { db } from '../../../src/firebase.js';
import confetti from 'canvas-confetti';
import { collection, addDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

export default {
  components: { OtterCursor, FloatingBackground },
  data() {
    return {
      allAnimals: animalsData,
      difficultyLevel: ['easy', 'medium', 'hard'],
      selectedDifficulty: '',
      gameAnimals: [],
      numberOfPairs: 8,
      gridColumns: 4, // Always 4 columns
      gameStarted: false,
      timer: 0,
      timerInterval: null,
      matchedPairs: 0,
      moves: 0,
      flippedCards: [],
      matchedCardIDs: new Set(),
      isProcessing: false,
      currentUser: null,
      leaderboard: [],
      showLeaderboard: false,
      showWinModal: false,
      leaderboardFilter: 'all', // Filter: all, easy, medium, hard
      winModalData: {
        isNewBest: false,
        time: 0,
        moves: 0,
        score: 0,
        needsLogin: false
      }
    }
  },
  async mounted() {
    try {
      this.currentUser = await getCurrentUser();
      await this.fetchLeaderboard();
    } catch (error) {
      console.error('Error loading user:', error);
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

    updateGridColumns() {
      // Always use 4 columns
      this.gridColumns = 4;
    },

    startGame() {
      if (!this.selectedDifficulty) {
        alert('Please select a difficulty level first!');
        return;
      }

      // Reset everything 
      this.timer = 0;
      this.matchedPairs = 0;
      this.moves = 0;
      this.flippedCards = [];
      this.matchedCardIDs = new Set();
      this.isProcessing = false;

      // Update grid columns based on board size
      this.updateGridColumns();

      // Generate a new set of animals 
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

      if (this.selectedDifficulty == '') {
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
          // CARD 2: The Text Card
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
        // Match found
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

    async gameWon() {
      clearInterval(this.timerInterval);

      // Calculate score (higher is better: based on speed and efficiency)
      const baseScore = 4000;
      const timePenalty = this.timer * 10;
      const movesPenalty = this.moves * 5;
      const score = Math.max(0, baseScore - timePenalty - movesPenalty);

      // Check if this beats the user's previous best for this difficulty/board size
      let shouldSave = false;
      let needsLogin = false;

      if (this.currentUser && this.currentUser.uid) {
        shouldSave = await this.checkIfNewBest(score);

        if (shouldSave) {
          await this.saveScore(score);
        }
      } else {
        needsLogin = true;
      }

      // Show win modal
      this.winModalData = {
        isNewBest: shouldSave,
        time: this.timer,
        moves: this.moves,
        score: score,
        needsLogin: needsLogin
      };

      confetti({
        particleCount: 150, spread: 70,origin: { y: 0.6 },
        particleCount: 150, spread: 70,origin: { y: 0.7 },
        particleCount: 150, spread: 70,origin: { y: 0.9 }
    });

      setTimeout(() => {
        this.showWinModal = true;
      }, 500);

      // Refresh leaderboard
      await this.fetchLeaderboard();
    },

    closeWinModal() {
      this.showWinModal = false;
    },

    async checkIfNewBest(newScore) {
      try {
        const scoresRef = collection(db, 'gameScores');
        // Get all scores for this user with same difficulty and board size
        const q = query(
          scoresRef,
          where('userId', '==', this.currentUser.uid),
          where('difficulty', '==', this.selectedDifficulty),
          where('boardSize', '==', this.numberOfPairs)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // No previous score for this difficulty/board combo - it's a new best!
          console.log('No previous scores found - NEW BEST!');
          return true;
        }

        // Find the highest previous score
        let previousBest = 0;
        querySnapshot.forEach((doc) => {
          const score = doc.data().score;
          if (score > previousBest) {
            previousBest = score;
          }
        });

        console.log(`Previous best: ${previousBest}, New score: ${newScore}`);
        return newScore > previousBest;
      } catch (error) {
        console.error('Error checking previous best:', error);
        // If error, don't save (be conservative)
        return false;
      }
    },

    async saveScore(score) {
      try {
        const scoresRef = collection(db, 'gameScores');
        const difficultyValue = {
          'easy': 1,
          'medium': 2,
          'hard': 3
        }[this.selectedDifficulty];

        await addDoc(scoresRef, {
          userId: this.currentUser.uid,
          username: this.currentUser.username || this.currentUser.email.split('@')[0],
          email: this.currentUser.email,
          score: score,
          time: this.timer,
          moves: this.moves,
          difficulty: this.selectedDifficulty,
          difficultyLevel: difficultyValue,
          boardSize: this.numberOfPairs,
          timestamp: new Date()
        });

        console.log('Score saved successfully!');
      } catch (error) {
        console.error('Error saving score:', error);
      }
    },

    async fetchLeaderboard() {
      try {
        const scoresRef = collection(db, 'gameScores');

        let q;
        if (this.leaderboardFilter === 'all') {
          // Sort by difficultyLevel descending (3,2,1 = hard,medium,easy)
          q = query(scoresRef, orderBy('difficultyLevel', 'desc'), orderBy('score', 'desc'), limit(10));
        } else {
          q = query(
            scoresRef,
            where('difficulty', '==', this.leaderboardFilter),
            orderBy('score', 'desc'),
            limit(10)
          );
        }
        const querySnapshot = await getDocs(q);

        this.leaderboard = [];
        querySnapshot.forEach((doc) => {
          this.leaderboard.push({
            id: doc.id,
            ...doc.data()
          });
        });

      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    },

    toggleLeaderboard() {
      this.showLeaderboard = !this.showLeaderboard;
      if (this.showLeaderboard) {
        this.fetchLeaderboard();
      }
    },

    isCardFlipped(card) {
      return card.isFlipped || card.isMatched;
    },

    getDifficultyColor(difficulty) {
      if (difficulty === 'easy') return '#4ade80';
      if (difficulty === 'medium') return '#fbbf24';
      if (difficulty === 'hard') return '#ef4444';
      return '#gray';
    },

    getBoardSizeLabel(size) {
      if (size == 8) return '4x4';
      if (size == 10) return '4x5';
      if (size == 12) return '4x6';
      return size;
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
  <OtterCursor animal="🦦" :speed="0.08" />

  <!-- Floating Background -->
  <FloatingBackground />

  <!-- Top Banner -->
  <div class="bannerTitles">
    <header class="text-center mb-2">
      <h1>🌿 Match the Critter 🌿</h1>
      <p> Select difficulty level and match the cards! </p>
    </header>
  </div>

  <!-- Leaderboard Button -->
  <div class="button-container">
    <button class="leaderboard-toggle-btn" @click="toggleLeaderboard">
      {{ showLeaderboard ? '🎮 Back to Game' : '🏆 View Leaderboard' }}
    </button>
  </div>

  <!-- Leaderboard Section -->
  <div v-if="showLeaderboard" class="leaderboard-container">
    <h2 class="leaderboard-title">🏆 Top Players</h2>

    <!-- Difficulty Filter -->
    <div class="filter-container">
      <button v-for="filter in ['all', 'easy', 'medium', 'hard']" :key="filter" class="filter-btn"
        :class="{ active: leaderboardFilter === filter }" @click="leaderboardFilter = filter; fetchLeaderboard()">
        {{ filter === 'all' ? '🌟 All' : filter.charAt(0).toUpperCase() + filter.slice(1) }}
      </button>
    </div>

    <div v-if="leaderboard.length === 0" class="no-scores">
      <p>No scores yet. Be the first to play!</p>
    </div>
    <div v-else class="leaderboard-list">
      <div v-for="(entry, index) in leaderboard" :key="entry.id" class="leaderboard-entry">
        <div class="rank">
          <span v-if="index === 0">🥇</span>
          <span v-else-if="index === 1">🥈</span>
          <span v-else-if="index === 2">🥉</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="player-info">
          <span class="player-name">{{ entry.username }}</span>
          <div class="game-details">
            <span class="difficulty-badge" :style="{ backgroundColor: getDifficultyColor(entry.difficulty) }">
              {{ entry.difficulty }}
            </span>
            <span class="board-size">{{ getBoardSizeLabel(entry.boardSize) }}</span>
          </div>
        </div>
        <div class="score-info">
          <span class="score">{{ entry.score.toLocaleString() }} pts</span>
          <span class="time-moves">⏱️ {{ entry.time }}s | 🔄 {{ entry.moves }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Game Section -->
  <div v-else>
    <!-- Selecting Difficulty -->
    <div id="customisation" class="col-6">
      <p class="customisation-label">Please select your difficulty level:</p>
      <select name="difficulty" id="difficulty" v-model="selectedDifficulty" @change="restartGame()">
        <option value="" disabled>Select difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <p class="customisation-label">Please select your board size:</p>
      <select name="boardSize" id="boardSize" v-model.number="numberOfPairs" @change="restartGame()">
        <option :value="8">Easy - 4 x 4 (8 pairs)</option>
        <option :value="10">Medium - 4 x 5 (10 pairs)</option>
        <option :value="12">Hard - 4 x 6 (12 pairs)</option>
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
    <div class="generatingGameBoard" v-if="gameStarted && gameAnimals.length > 0"
      :style="{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }">
      <div v-for="card in gameAnimals" :key="card.cardID" class="gameCard" :class="{
        'flipped': isCardFlipped(card),
        'matched': card.isMatched,
        'clickable': !card.isFlipped && !card.isMatched && !isProcessing
      }" @click="cardClicked(card)">

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
  </div>

  <!-- Win Modal -->
  <div v-if="showWinModal" class="modal-overlay" @click="closeWinModal">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="restartGame(); closeWinModal();">×</button>

      <div class="modal-header">
        <h2 v-if="winModalData.isNewBest" class="modal-title new-best">
          🎉 NEW HIGH SCORE! 🎉
        </h2>
        <h2 v-else class="modal-title">
          🎉 Congratulations! 🎉
        </h2>
      </div>

      <div class="modal-body">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-label">Time</div>
            <div class="stat-value">{{ winModalData.time }}s</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔄</div>
            <div class="stat-label">Moves</div>
            <div class="stat-value">{{ winModalData.moves }}</div>
          </div>
          <div class="stat-card highlight">
            <div class="stat-icon">📊</div>
            <div class="stat-label">Score</div>
            <div class="stat-value">{{ winModalData.score.toLocaleString() }}</div>
          </div>

          <button class="modal-btn primary" @click="restartGame(); closeWinModal();">
            ⟳ Restart Game
          </button>
        </div>

        <div v-if="!winModalData.isNewBest && !winModalData.needsLogin" class="encouragement">
          💡 Not your best score yet. Keep trying!
        </div>

        <div v-if="winModalData.needsLogin" class="login-prompt">
          💡 <router-link to="/login" class="login-link">Login</router-link> to save your score!
        </div>
      </div>

      <div class="modal-footer">
        <button class="modal-btn primary" @click="restartGame(); closeWinModal();">
          🔄 Play Again
        </button>
        <button class="modal-btn secondary" @click="closeWinModal">
          ✓ Continue
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Leaderboard */
.leaderboard-toggle-btn {
  padding: 12px 30px;
  font-size: 18px;
  font-weight: bold;
  background-color: #fbbf24;
  color: rgb(40, 54, 24);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.leaderboard-toggle-btn:hover {
  background-color: #f59e0b;
  transform: scale(1.05);
}

.leaderboard-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 30px;
  background-color: rgb(251, 247, 220);
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.leaderboard-title {
  text-align: center;
  color: rgb(40, 54, 24);
  font-size: 32px;
  margin-bottom: 30px;
}

.filter-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  background-color: white;
  color: rgb(40, 54, 24);
  border: 2px solid rgb(40, 54, 24);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background-color: rgb(40, 54, 24);
  color: white;
  transform: translateY(-2px);
}

.filter-btn.active {
  background-color: rgb(40, 54, 24);
  color: rgb(254, 250, 224);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.no-scores {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.leaderboard-entry {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  border: 2px solid rgb(40, 54, 24);
  transition: transform 0.2s;
}

.leaderboard-entry:hover {
  transform: translateX(5px);
}

.rank {
  font-size: 28px;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
  color: rgb(40, 54, 24);
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-name {
  font-size: 20px;
  font-weight: bold;
  color: rgb(40, 54, 24);
}

.game-details {
  display: flex;
  gap: 10px;
  align-items: center;
}

.difficulty-badge {
    padding: 16px 32px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    margin: 12px 12px;
}

.board-size {
  padding: 16px 32px;
  background-color: #e5e7eb;
  border-radius: 15px;
  font-size: 18px;
  font-weight: 500;
  color: rgb(40, 54, 24);
  cursor: pointer;
  margin: 12px 12px;
}

.score-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.score {
  font-size: 24px;
  font-weight: bold;
  color: rgb(60, 80, 40);
}

.time-moves {
  font-size: 14px;
  color: #666;
}

/* Difficulty Selection */


#difficulty,
#boardSize {
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


/* Game Board */
.generatingGameBoard {
  display: grid;
  gap: 15px;
  max-width: 1200px;
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

.card-back-icon {
  font-size: clamp(30px, 8vw, 60px);
}

.leaderboard-entry {
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.score-info {
  align-items: flex-start;
}

/* Better text sizing for mobile */
.common-name {
  font-size: clamp(12px, 4vw, 18px);
}

.scientific-name {
  font-size: clamp(11px, 3.5vw, 16px);
}

.description {
  font-size: clamp(9px, 2.5vw, 13px);
  line-height: 1.25;
}

.card-back,
.card-front {
  padding: 8px;
}


@media (max-width: 480px) {
  .generatingGameBoard {
    gap: 8px;
    padding: 10px;
  }

  .card-back-icon {
    font-size: 30px;
  }

  /* Even smaller text for very small screens */
  .common-name {
    font-size: clamp(11px, 4.5vw, 16px);
  }

  .scientific-name {
    font-size: clamp(10px, 4vw, 14px);
  }

  .description {
    font-size: clamp(8px, 3vw, 12px);
    line-height: 1.2;
  }

  .card-back,
  .card-front {
    padding: 6px;
  }

}

/* Win Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px 0; /* Add padding top and bottom */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: rgb(254, 250, 224);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  max-height: 85vh; /* Add max height */
  overflow-y: auto; /* Add scroll if content is too tall */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease;
  margin-top:20px;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 36px;
  cursor: pointer;
  color: rgb(40, 54, 24);
  line-height: 1;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.modal-close:hover {
  background-color: rgba(40, 54, 24, 0.1);
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
}

.modal-title {
  color: rgb(40, 54, 24);
  font-size: 32px;
  margin: 0;
}

.modal-title.new-best {
  color: #f59e0b;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-body {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  /* padding: 20px; */
  text-align: center;
  border: 2px solid rgb(40, 54, 24);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-color: #f59e0b;
}

.stat-card.highlight .stat-label,
.stat-card.highlight .stat-value {
  color: white;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  font-weight: 600;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: rgb(40, 54, 24);
}

.encouragement {
  text-align: center;
  padding: 15px;
  background-color: rgba(251, 191, 36, 0.2);
  border-radius: 10px;
  color: rgb(40, 54, 24);
  font-size: 16px;
  font-weight: 600;
}

.login-prompt {
  text-align: center;
  padding: 15px;
  background-color: rgba(74, 222, 128, 0.2);
  border-radius: 10px;
  color: rgb(40, 54, 24);
  font-size: 16px;
  font-weight: 600;
}

.login-link {
  color: #059669;
  font-weight: bold;
  text-decoration: underline;
}

.login-link:hover {
  color: #047857;
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: center;
}


.stats-grid {
  grid-template-columns: 1fr;
  gap: 10px;
}

.modal-footer {
  flex-direction: column;
}

.modal-btn {
  width: 100%;
}
</style>
