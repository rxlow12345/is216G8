<template>
  <div :id="id" class="carousel slide rounded-4 overflow-hidden shadow" data-bs-ride="carousel">
    <!-- Indicators -->
    <div class="carousel-indicators">
      <button v-for="(s, i) in slides" :key="i"
              type="button"
              :data-bs-target="'#' + id"
              :data-bs-slide-to="i"
              :class="{ active: i === 0 }"
              :aria-current="i === 0 ? 'true' : undefined"
              :aria-label="`Slide ${i+1}`"></button>
    </div>

    <!-- Slides -->
    <div class="carousel-inner">
      <div v-for="(src, i) in slides" :key="src" class="carousel-item" :class="{ active: i === 0 }">
        <img :src="src" class="d-block w-100" :alt="`Slide ${i+1}`" style="object-fit:cover; max-height:420px;">
        <div v-if="captions?.[i]" class="carousel-caption d-none d-md-block">
          <h5>{{ captions[i].title }}</h5>
          <p>{{ captions[i].text }}</p>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <button class="carousel-control-prev" type="button" :data-bs-target="'#' + id" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" :data-bs-target="'#' + id" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, default: 'donateCarousel' },
  slides: { type: Array, required: true },            // array of image urls/imports
  captions: { type: Array, default: null }            // optional [{title,text}, ...]
})
</script>
