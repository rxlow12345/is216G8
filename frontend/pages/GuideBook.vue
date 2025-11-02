<template>
  <div class="container-fluid p-0">

    <!--Moving Cursor-->
    <OtterCursor animal="🦦" :speed="0.08"/>

    <!-- Floating Background -->
     <FloatingBackground/>

    <!-- Back To Top -->
     <BackToTop/>

    <!-- Top Banner -->
    <div class="bannerTitles">
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
    <RouterLink to="/guidebook/game" class="floating-game-btn">🎮 Play Game! 🎮</RouterLink>


    <!-- Category Tabs -->
    <ul class="nav nav-tabs justify-content-center mb-4" id="categoryTabs">
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'All' }"
          href="#" 
          @click.prevent="filterByCategory('All')"
        >
        <span class="tab-content">
          <span class="tab-emoji">🌍</span>
          <span class="tab-text">All</span>
        </span>
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Mammals' }"
          href="#" 
          @click.prevent="filterByCategory('Mammals')"
        >
        <span class="tab-content">
          <span class="tab-emoji">🦊</span>
          <span class="tab-text">Mammals</span>
        </span>
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Birds' }"
          href="#" 
          @click.prevent="filterByCategory('Birds')"
        >
        <span class="tab-content">
          <span class="tab-emoji">🦜</span>
          <span class="tab-text">Birds</span>
        </span>
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Reptiles' }"
          href="#" 
          @click.prevent="filterByCategory('Reptiles')"
        >
        <span class="tab-content">
          <span class="tab-emoji">🦎</span>
          <span class="tab-text">Reptiles</span>
        </span>

        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Amphibians' }"
          href="#" 
          @click.prevent="filterByCategory('Amphibians')"
        >
        <span class="tab-content">
          <span class="tab-emoji">🐸</span>
          <span class="tab-text">Amphibians</span>
        </span>
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: selectedCategory === 'Marine' }"
          href="#" 
          @click.prevent="filterByCategory('Marine')"
        >
        <span class="tab-content">
          <span class="tab-emoji">🐙</span>
          <span class="tab-text">Marine</span>
        </span>
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
          <a :href="animal.learn_more_url" target="__blank" class="learnMoreBtn"> 
            Learn More
          </a>
        </div>
      </div>
    </div>
    
  <!-- Pagination -->
  <div 
    id="pagination" 
    class="pagination-buttons d-flex justify-content-center align-items-center mt-4"
    v-show="showPagination"
  >
    <button class="btn btn-outline-success me-2" @click="goToFirstPage" :disabled="currentPage === 1">
      «
    </button>

    <button class="btn btn-outline-success me-2" @click="prevPage" :disabled="currentPage === 1">
      ‹ Prev
    </button>

    <span id="pageIndicator" class="mx-2">
      Page {{ currentPage }} of {{ totalPages }}
    </span>

    <button class="btn btn-outline-success ms-2" @click="nextPage" :disabled="currentPage === totalPages">
      › Next
    </button>

    <button class="btn btn-outline-success ms-2" @click="goToLastPage" :disabled="currentPage === totalPages">
      »
    </button>
</div>
</div>
</template>

<script>
import animalsData from '../src/public/guidebook.json'
import '../pages/css/common.css'
import '../pages/css/guidebook.css'
import OtterCursor from '../src/components/OtterCursor.vue';
import FloatingBackground from '../src/components/FloatingBackground.vue';
import BackToTop from '../src/components/BackToTop.vue';

export default {
  name: 'Guidebook',
  components:{OtterCursor, FloatingBackground, BackToTop},
  data() {
    return {
      allAnimals: animalsData,
      filteredAnimals: animalsData,
      currentPage: 1,
      animalsPerPage: 9,
      selectedCategory: 'All',
      searchQuery: '',
      showPagination: false,
    }
  },
  computed: {
    totalPages() {
      if (this.selectedCategory === 'All') return 1
      return Math.ceil(this.filteredAnimals.length / this.animalsPerPage) || 1
    },
    paginatedAnimals() {
      if (this.selectedCategory === 'All') {
        return this.filteredAnimals
      }
      const start = (this.currentPage - 1) * this.animalsPerPage
      return this.filteredAnimals.slice(start, start + this.animalsPerPage)
    },

    shouldShowPagination() {
      return this.selectedCategory !== 'All' && this.showPagination && this.totalPages > 1
    },

    isFirstPage() {
      return this.currentPage === 1
    },

    isLastPage() {
      return this.currentPage === this.totalPages
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
      this.showPagination = false
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

    goToFirstPage(){
      this.currentPage = 1
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    goToLastPage(){
      this.currentPage = this.totalPages
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
  },

  mounted() {
    this.updateAnimalsPerPage()
    window.addEventListener('resize', this.updateAnimalsPerPage)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.updateAnimalsPerPage)
    document.removeEventListener('mousemove', this.handleMouseMove)
  }
}
</script>