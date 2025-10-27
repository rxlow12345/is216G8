<script>
    
</script>

<template>
    <!-- Logo Section -->
    <div id="logo">
      <header class="text-center">
        <img src="../images/logo.png" alt="Logo">
      </header>
    </div>

    <!-- Top Banner -->
    <div id="topBanner">
      <header class="text-center mb-2">
        <h1>🌿 Wildlife Guidebook Game 🌿</h1>
      </header>
    </div>

    <div class="game-container">
    <!-- Header -->
    <div class="game-header">
      <h2>🎮 Animal Match Game</h2>
      <p class="subtitle">Match animals with their fun facts!</p>
      
      <div class="game-stats" v-if="gameStarted">
        <div class="stat">
          <span class="label">⏱️ Time:</span>
          <span class="value">{{ timer }}s</span>
        </div>
        <div class="stat">
          <span class="label">🎯 Matches:</span>
          <span class="value">{{ matchedPairs }} / {{ totalPairs }}</span>
        </div>
        <div class="stat">
          <span class="label">🔄 Moves:</span>
          <span class="value">{{ moves }}</span>
        </div>
      </div>
    </div>

    <!-- Start Button -->
    <div v-if="!gameStarted" class="start-screen">
      <button @click="startGame" class="btn-start">
        🎮 Start Game
      </button>
    </div>

    <!-- Game Board -->
    <div v-else class="game-board">
      <div
        v-for="card in cards"
        :key="card.uniqueId"
        @click="flipCard(card)"
        :class="['card', { flipped: card.flipped, matched: card.matched }]"
      >
        <div class="card-inner">
          <!-- Front -->
          <div class="card-front">
            <div class="card-pattern">🐾</div>
          </div>

          <!-- Back -->
          <div class="card-back">
            <div v-if="card.type === 'animal'">
              <div class="animal-emoji">{{ card.image }}</div>
              <div class="animal-name">{{ card.animal }}</div>
            </div>
            <div v-else class="fact-content">
              <div class="fact-icon">💡</div>
              <p class="fact-text">{{ card.fact }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="game-actions" v-if="gameStarted">
      <button @click="restartGame" class="btn-restart">
        🔄 Restart Game
      </button>
    </div>

    <!-- Win Modal -->
    <div v-if="gameWon" class="modal-overlay" @click="gameWon = false">
      <div class="win-modal" @click.stop>
        <h2>🎉 You Won!</h2>
        <p>Time: {{ timer }}s | Moves: {{ moves }}</p>
        <button @click="restartGame" class="btn-play-again">
          Play Again
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
    padding: 0;
    margin: 0;
}
/*GuideBook Title*/ 
h1 {
  color:rgb(254, 250, 224);
  font-family: Georgia, 'Times New Roman', Times, serif;
}
/*Logo & Top Banner*/
#topBanner, #logo {
    width: 100%;
}
#logo img{
    width: 270px;
}

#logo {
    background-color: rgb(254,250,224);
}

#topBanner{
    background-color: rgb(40,54,24);
    color:white;
}

h1{
    padding:25px;
    font-size: 35px;
}
</style>