<template>
  <div class="container-fluid p-0">
    <!-- Logo Section
    <div id="logo">
      <header class="text-center">
        <img src="../src/public/assets/logo.png" alt="Logo">
      </header>
    </div>
  -->

    <!-- Top Banner -->
    <div id="topBanner">
      <header class="text-center mb-2">
        <h1>🌿 Wildlife Guidebook 🌿</h1>
        <p>Discover the amazing biodiversity of Singapore</p>
      </header>
    </div>

     <!-- Search Box -->
    <div class="search-section">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          @input="filterBySearch"
          type="text"
          id="searchInput"
          placeholder="🔍 Search for a species..."
        >
        <button @click="filterBySearch" id="searchBtn">Search</button>
      </div>
    </div>

    <!-- Game Button -->
    <RouterLink to="/guidebook/game" class="floating-game-btn">🎮 Play Game!</RouterLink>


    <!-- Category Tabs -->
    <ul class="nav nav-tabs justify-content-center mb-4" id="categoryTabs">
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'All' }"
          href="#" 
          @click.prevent="filterByCategory('All')"
        >
          All
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Mammals' }"
          href="#" 
          @click.prevent="filterByCategory('Mammals')"
        >
          🦊 Mammals
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Birds' }"
          href="#" 
          @click.prevent="filterByCategory('Birds')"
        >
          🦜 Birds
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Reptiles' }"
          href="#" 
          @click.prevent="filterByCategory('Reptiles')"
        >
          🦎 Reptiles
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Amphibians' }"
          href="#" 
          @click.prevent="filterByCategory('Amphibians')"
        >
          🐸 Amphibians
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Marine' }"
          href="#" 
          @click.prevent="filterByCategory('Marine')"
        >
          🐙 Marine
        </a>
      </li>
    </ul>

    <!-- Cards Container -->
    <div id="cardsContainer">
      <p v-if="filteredAnimals.length === 0" class="text-center text-muted">
        No animals found.
      </p>
      <div 
        v-for="animal in paginatedAnimals" 
        :key="animal.scientific_name" 
        class="card"
      >
        <img :src="animal.image_url" :alt="animal.common_name">
        <div class="card-body">
          <h5 class="card-title">{{ animal.common_name }}</h5>
          <p class="scientific-name">{{ animal.scientific_name }}</p>
          <p class="card-text">{{ animal.description }}</p>
          <a :href="animal.learn_more_url" target="__blank" class="btn btn-success btn-sm"> 
            Learn More
          </a>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div id="pagination" class="pagination-buttons">
      <button id="prevBtn" @click="prevPage" :disabled="currentPage === 1">
        Previous
      </button>
      <span id="pageIndicator">Page {{ currentPage }}</span>
      <button id="nextBtn" @click="nextPage" :disabled="currentPage === totalPages">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import animalsData from '../src/public/guidebook.json'
import '../pages/css/guidebook.css'

export default {
  name: 'Guidebook',
  data() {
    return {
      allAnimals: animalsData,
      filteredAnimals: animalsData,
      currentPage: 1,
      animalsPerPage: 9,
      selectedCategory: 'All',
      searchQuery: ''
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredAnimals.length / this.animalsPerPage) || 1
    },
    paginatedAnimals() {
      const start = (this.currentPage - 1) * this.animalsPerPage
      return this.filteredAnimals.slice(start, start + this.animalsPerPage)
    }
  },
  methods: {
    filterByCategory(category) {
      this.selectedCategory = category
      this.searchQuery = ''
      
      if (category === 'All') {
        this.filteredAnimals = this.allAnimals
      } else {
        this.filteredAnimals = this.allAnimals.filter(a => a.category === category)
      }
      this.currentPage = 1
    },
    filterBySearch() {
      const query = this.searchQuery.trim().toLowerCase()
      
      let animals = this.selectedCategory === 'All' 
        ? this.allAnimals 
        : this.allAnimals.filter(a => a.category === this.selectedCategory)
      
      if (query) {
        animals = animals.filter(
          a => a.common_name.toLowerCase().includes(query) ||
               a.scientific_name.toLowerCase().includes(query)
        )
      }
      
      this.filteredAnimals = animals
      this.currentPage = 1
    },
    updateAnimalsPerPage() {
      const width = window.innerWidth
      if (width <= 520) {
        this.animalsPerPage = 6  
      } else if (width <= 1027) {
        this.animalsPerPage = 9  
      } else {
        this.animalsPerPage = 12 
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    }
  },
  mounted() {
    this.updateAnimalsPerPage()
    window.addEventListener('resize', this.updateAnimalsPerPage)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateAnimalsPerPage)
  }
}
</script>