<template>
  <div class="container-fluid p-0">
    <!-- Logo Section -->
    <div id="logo">
      <header class="text-center">
        <img src="../src/public/assets/logo.png" alt="Logo">
      </header>
    </div>

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
    padding: 20px 0;
    font-size: 35px;
}

/* Search Bar */
.search-section {
  display: flex;
  justify-content: center;
  margin: 30px 0 20px 0;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f6f8f3;
  border-radius: 40px;
  padding: 6px 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  width: 60%;
  max-width: 500px;
}

.search-bar:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

#searchInput {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  padding: 8px 12px;
  color: #2e4f2f;
}

#searchBtn {
  background-color: #285436;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 8px 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

#searchBtn:hover {
  background-color: #a8c686;
  color: #285436;
}


/* Tab Styles*/
#categoryTabs {
    padding-bottom: 10px;
    justify-content: center;
    display: flex;
    gap: 8px;
}

#categoryTabs .nav-item {
    flex: 0 0 auto;
    text-align: center;
}

#categoryTabs .nav-link {
    background-color: #eaf0df;  
    color: #285436;        
    border: 2px solid #a8c686; 
    border-radius: 12px;       
    padding: 0.5rem 1rem;    
    font-weight: 600;
    height: 55px;         
    display: flex;
    width: 120px;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

#categoryTabs .nav-link:hover {
    background-color: #a8c686;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

#categoryTabs .nav-link.active {
    background-color: #285436;
    color: white;
    border-color: #285436;
}

/* Game Button */
.floating-game-btn {
  position: fixed;
  top: 110px;
  right: 30px;
  background: linear-gradient(135deg, #285436, #3d714c);
  color: white;
  padding: 12px 20px;
  border-radius: 40px;
  font-weight: bold;
  text-decoration: none;
  font-size: 0.95rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  z-index: 1000;
}

.floating-game-btn:hover {
  transform: scale(1.07);
  background: linear-gradient(135deg, #3d714c, #4f8a5f);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
}


/* Cards */
#cardsContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-bottom: 80px;
  min-height: 400px;
  padding: 20px;
}

#cardsContainer p.text-center {
  width: 100%;
  font-size: 1rem;
  color: #777;
  margin-top: 40px;
}

/* Card Styling */
#cardsContainer .card {
  flex: 0 1 calc(33.333% - 16px);
  max-width: 300px;
  min-width: 250px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

#cardsContainer .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

#cardsContainer .card img {
  width: 100%;
  height: 250px; /* original height 180px*/
  object-fit: cover;
}

#cardsContainer .card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  text-align: center;
}

#cardsContainer .card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #285436;
}

.scientific-name {
  font-size: 0.85rem;
  font-style: italic;
  color: #888;
  margin-bottom: 12px;
}

#cardsContainer .card-text {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 12px;
  flex-grow: 1;
  line-height: 1.4;
}

#cardsContainer .btn {
  margin-top: auto;
  align-self: center;
}

/* Pagination */
#pagination {
  position: sticky;
  bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  z-index: 100;
}

#pagination button {
  border: none;
  background-color: #198754;
  color: white;
  border-radius: 25px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0;
}

#pagination button:hover:not(:disabled) {
  background-color: #145c33;
}

#pagination button:disabled {
  background-color: #94d3a2;
  cursor: not-allowed;
}

#pageIndicator {
  display: inline-block;
  padding: 8px 16px;
  background-color: #eaf0df; 
  color: #198754;           
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: 25px;
  border: 1px solid #198754;
  margin: 0 30px;             
}

/* Page Responsiveness */
@media (max-width: 768px) {
  #cardsContainer .card {
    flex: 0 1 calc(50% - 16px);
  }
}

@media (max-width: 520px) {
    #categoryTabs {
        display: grid !important;
        grid-template-columns: repeat(3, auto);
        grid-auto-rows: auto;
        justify-content: center;
        gap: 8px;
        max-width: 360px;
        margin: 0 auto;
    }

    #categoryTabs .nav-item {
        flex: unset;
    }

    #categoryTabs .nav-link {
        width: auto;
        padding: 0.5rem 0.8rem;
    }

    /* 2 cards per row for mobile */
    #cardsContainer .card {
        flex: 0 1 calc(50% - 16px);
        min-width: unset;
    }
      
}
</style>