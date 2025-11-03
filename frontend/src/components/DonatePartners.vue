<!-- DonatePartners.vue -->
<template>
  <section class="container my-5">
    <h2 class="fw-bold text-center mb-4">Support Our Trusted Partners</h2>

<div class="row g-4">
  <div class="col-6 col-md-4" v-for="org in orgs" :key="org.id">
    <div class="card h-100 shadow-sm border-0 rounded-4 partner-card">
      <div class="card-body d-flex flex-column">

        <!-- Header -->
        <div class="d-flex align-items-start gap-3 mb-2">
          <img
            :src="org.logo"
            :alt="org.name + ' logo'"
            class="rounded-3 flex-shrink-0"
            style="width:56px;height:56px;object-fit:contain;"
          />
          <div class="flex-grow-1 text-wrap">
            <h6 class="cardTitle mb-0 fw-semibold">{{ org.name }}</h6>
            <small class="text-muted d-block">{{ org.tagline }}</small>
          </div>
        </div>

        <!-- Description -->
        <p class="card-text text-muted small flex-grow-1 mb-4 text-break">
          {{ org.desc }}
        </p>

        <div class="mt-auto d-flex flex-wrap gap-2">
          <a
            :href="org.url"
            target="_blank"
            rel="noopener"
            class="btn btn-donate2 flex-fill"
            @click="trackClick(org.name)"
          >
            Donate
          </a>
          <a
            :href="org.urlMain"
            target="_blank"
            rel="noopener"
            class="btn btn-learn flex-fill"
            @click="trackClick(org.name)"
          >
            Learn
          </a>
        </div>

      </div>
    </div>
  </div>
</div>

  </section>
</template>

<script setup>
import { ref } from 'vue'
import '../../pages/css/common.css'

const orgs = ref([
  {
    id: 'acres',
    name: 'ACRES',
    tagline: 'Animal Concerns Research & Education Society',
    desc: 'Rescue, rehabilitation, and wildlife advocacy in Singapore.',
    url: 'https://acres.org.sg/donate/',
    urlMain: 'https://acres.org.sg',
    logo: 'https://acres.org.sg/wp-content/uploads/2024/09/COLOUR-Small.png'},
  {
    id: 'wwf',
    name: 'WWF Singapore',
    tagline: 'World Wide Fund for Nature',
    desc: 'Protecting endangered species and habitats across the region.',
    url: 'https://www.wwf.sg/donate/',
    urlMain: 'https://www.wwf.sg',
    logo: 'https://logos-world.net/wp-content/uploads/2020/11/World-Wide-Fund-for-Nature-Logo.png'},
  {
    id: 'nparks',
    name: 'NParks Garden City Fund',
    tagline: 'Biodiversity & Green Spaces',
    desc: 'Supports habitat restoration, conservation, and community outreach.',
    url: 'https://www.nparks.gov.sg/get-involved/donate',
    urlMain: 'https://www.nparks.gov.sg/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTNlW4QXnxclpiOHIwfmLrnta-T0h-6KOISQ&s',
  },
  {
    id: 'all',
    name: 'Animal Lovers League',
    tagline: 'Cats & Dogs Shelter',
    desc: 'Care for rescued cats and dogs through food, shelter, and vet bills.',
    url: 'https://www.animalloversleague.com/donate',
    urlMain: 'https://animalloversleague.com',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD9ceZSNpqgub4hex56jeoABMDWs7UClxJtw&s'
  },
  {
    id: 'spca',
    name: 'SPCA Singapore',
    tagline: 'Society for the Prevention of Cruelty to Animals',
    desc: 'Animal welfare, rescue services, and public education.',
    url: 'https://spca.org.sg/donate/',
    urlMain: 'https://spca.org.sg',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF7EjAwB7GOteDjRMS53pXX7ZiZX-g1ot5sg&s'}
])

</script>

<style scoped>
.min-w-0 { min-width: 0; }

.partner-card { 
  transition: transform .25s ease, box-shadow .25s ease; 
  background: linear-gradient(145deg,#f7fff7,#ecf8ee);
  display: flex; flex-direction:column; overflow:hidden  
}

.partner-card:hover { 
  transform: translateY(-4px); 
  box-shadow: 0 10px 24px rgba(25,135,84,.15); 
}

.cardTitle {
  color: #285436;
  font-size: 18px;
}

h2 {
    font-size: 40px;
    font-weight: 600;
    color:#285436;
    text-shadow: 0 4px 20px rgba(11, 155, 23, 0.3);
}

.btn-donate2 {
    padding: 8px 10px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    background-color: #285436;
    color: rgb(254, 250, 224);
    border: none;
}

.btn-donate2:hover{
    background-color: #606C38;
    color: #fff;
    border: none;
}

.btn-learn {
    padding: 8px 10px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    border: 2px solid #285436;
    color: #285436;
    background-color: rgb(254, 250, 224);
}

.btn-learn:hover{
    background-color: #606C38;
    color: #fff;
    border: 2px solid #285436;
}
</style>
