<template>
  <div class="container-fluid p-0">

    <!--Moving Cursor-->
    <OtterCursor animal="🦦" :speed="0.08" />

    <!-- Floating Background -->
    <FloatingBackground />

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
        <input v-model="searchQuery" @input="filterBySearch" type="text" id="searchInput"
          placeholder="🔍 Search for a species...">
        <button @click="filterBySearch" id="searchBtn">Search</button>
      </div>
    </div>

    <!-- Game Button -->
    <RouterLink to="/guidebook/game" class="floating-game-btn">🎮 Play Game! 🎮</RouterLink>


    <!-- Category Tabs -->
    <ul class="nav nav-tabs justify-content-center mb-4" id="categoryTabs">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: selectedCategory === 'All' }" href="#"
          @click.prevent="filterByCategory('All')">
          <span class="tab-content">
            <span class="tab-emoji">🌍</span>
            <span class="tab-text">All</span>
          </span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: selectedCategory === 'Mammals' }" href="#"
          @click.prevent="filterByCategory('Mammals')">
          <span class="tab-content">
            <span class="tab-emoji">🦊</span>
            <span class="tab-text">Mammals</span>
          </span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: selectedCategory === 'Birds' }" href="#"
          @click.prevent="filterByCategory('Birds')">
          <span class="tab-content">
            <span class="tab-emoji">🦜</span>
            <span class="tab-text">Birds</span>
          </span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: selectedCategory === 'Reptiles' }" href="#"
          @click.prevent="filterByCategory('Reptiles')">
          <span class="tab-content">
            <span class="tab-emoji">🦎</span>
            <span class="tab-text">Reptiles</span>
          </span>

        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: selectedCategory === 'Amphibians' }" href="#"
          @click.prevent="filterByCategory('Amphibians')">
          <span class="tab-content">
            <span class="tab-emoji">🐸</span>
            <span class="tab-text">Amphibians</span>
          </span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: selectedCategory === 'Marine' }" href="#"
          @click.prevent="filterByCategory('Marine')">
          <span class="tab-content">
            <span class="tab-emoji">🐙</span>
            <span class="tab-text">Marine</span>
          </span>
        </a>
      </li>
    </ul>

    <div id="cardsContainer" class="cards-flex-container">
      <div v-for="animal in paginatedAnimals" :key="animal.scientific_name" class="card animal-card">
        <img :src="animal.image_url" :alt="animal.common_name" class="card-img-top">
        <div class="card-body">
          <h5 class="card-title">{{ animal.common_name }}</h5>
          <p class="scientific-name">{{ animal.scientific_name }}</p>
          <p class="card-text">{{ animal.description }}</p>
          <a :href="animal.learn_more_url" target="__blank" class="btn learnMoreBtn btn-sm">Learn More</a>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div id="pagination" class="pagination-buttons d-flex justify-content-center align-items-center mt-4"
      v-if="shouldShowPagination">

      <!-- First Page -->
      <button class="btn btn-outline-success mx-2" @click="goToFirstPage" :disabled="isFirstPage">
        « <span class="btn-text">First</span>
      </button>

      <!-- Previous Page -->
      <button class="btn btn-outline-success me-2" @click="prevPage" :disabled="isFirstPage">
        ‹ <span class="btn-text">Prev</span>
      </button>

      <!-- Page Indicator -->
      <span id="pageIndicator" class="mx-0 mx-sm-2 px-3 py-2">
        <span class="page-label">Page </span>{{ currentPage }} of {{ totalPages }}
      </span>

      <!-- Next Page -->
      <button class="btn btn-outline-success ms-2" @click="nextPage" :disabled="isLastPage">
        <span class="btn-text">Next</span> ›
      </button>

      <!-- Last Page -->
      <button class="btn btn-outline-success mx-2" @click="goToLastPage" :disabled="isLastPage">
        <span class="btn-text">Last</span> »
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
  components: { OtterCursor, FloatingBackground, BackToTop},

  data() {
    return {
      allAnimals: animalsData,
      filteredAnimals: animalsData,
      currentPage: 1,
      animalsPerPage: 12,
      selectedCategory: 'All',
      searchQuery: '',
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(this.filteredAnimals.length / this.animalsPerPage) || 1
    },

    paginatedAnimals() {
      // Slice for paginated categories
      const start = (this.currentPage - 1) * this.animalsPerPage
      return this.filteredAnimals.slice(start, start + this.animalsPerPage)
    },

    shouldShowPagination() {
      return this.totalPages > 1
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

      this.filteredAnimals =
        category === 'All'
          ? this.allAnimals
          : this.allAnimals.filter(a => a.category === category)

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
      let newCount = 10
      if (width <= 500) {
        newCount = 8       // very small screens → 1 card per page
      } else if (width <= 768) {
        newCount = 8       // small screens → 2 cards per page
      } else if (width <= 1027) {
        newCount = 12      // medium screens → 6 cards per page
      }

      if (this.animalsPerPage !== newCount) {
        this.animalsPerPage = newCount
        this.currentPage = 1 // reset page
      }
    },

    goToFirstPage() {
      this.currentPage = 1
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    goToLastPage() {
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

  watch: {
    filteredAnimals() {
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
    },
    animalsPerPage() {
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
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

<style>
.cards-flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  padding: 0 1rem;
}

.animal-card {
  flex: 0 1 100% !important;
  max-width: 100%;
}

/* Medium screens: 2 per row */
@media (min-width: 576px) {
  .animal-card {
    flex: 0 1 calc(50% - 1rem);
    max-width: calc(50% - 1rem);
  }
}

/* Medium-large screens: 3 per row */
@media (min-width: 768px) {
  .animal-card {
    flex: 0 1 calc(33.333% - 1rem);
    max-width: calc(33.333% - 1rem);
  }
}

/* Large screens: 4 per row */
@media (min-width: 1024px) {
  .animal-card {
    flex: 0 1 calc(25% - 1rem);
    max-width: calc(25% - 1rem);
  }
}

#pagination button.btn {
  font-size: 18px !important;
}

#pagination #pageIndicator {
  font-size: 18px !important;
}

/* Extra small screens */
@media (max-width:576px) {
  #pagination .btn-text {
    display: none;
  }

  #pagination button.btn {
    font-size: 1rem !important;
    /* padding: 0.2rem 0.4rem !important; */
  }

  #pagination #pageIndicator {
    font-size: 1rem !important;
    text-wrap: nowrap;
    margin: 0;
  }

  #pagination .page-label {
    display: none;
  }
}
</style>