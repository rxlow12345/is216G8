<template>
  <!-- Emergency strip -->
  <div class="emergency-strip py-3 px-3 px-md-4 text-white">
    <div class="container d-flex flex-column flex-md-row align-items-center gap-3 justify-content-between">
      <div class="d-flex align-items-start gap-2">
        <span class="fs-4"></span>
        <div>
          <div class="fw-semibold">{{ emergency.title }}</div>
          <small class="opacity-75">{{ emergency.note }}</small>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <a
          v-if="emergency.primaryNumber"
          class="btn btn-light btn-sm fw-semibold rounded-pill"
          :href="`tel:${emergency.primaryNumber}`"
        >
          {{ emergency.primaryLabel }}: {{ emergency.primaryNumber }}
        </a>

        <a
          v-if="emergency.secondaryNumber"
          class="btn btn-outline-light btn-sm rounded-pill"
          :href="`tel:${emergency.secondaryNumber}`"
        >
          {{ emergency.secondaryLabel }}: {{ emergency.secondaryNumber }}
        </a>

        <a
          v-if="emergency.wildlifeNumber"
          class="btn btn-outline-light btn-sm rounded-pill"
          :href="`tel:${emergency.wildlifeNumber}`"
        >
          {{ emergency.wildlifeLabel }}: {{ emergency.wildlifeNumber }}
        </a>
      </div>
    </div>
  </div>

  <!-- Main footer -->
  <footer class="footer-body py-5">
    <div class="container">
      <div class="row g-4">
        <!-- Brand / about -->
        <div class="col-12 col-sm-6">
          <div class="d-flex align-items-center gap-2 mb-2">
            <img :src="logoSrc" alt="CritterConnect logo" style="height:40px; width:auto;" />
            <h5 class="m-0">{{ orgName }}</h5>
          </div>
          <p class="text-muted mb-3">
            Helping people and wildlife coexist through reporting, rescue coordination, and education.
          </p>
          <div class="d-flex gap-2">
            <a
              v-if="socials.facebook"
              :href="socials.facebook"
              target="_blank"
              rel="noopener"
              class="btn btn-outline-success btn-sm rounded-pill"
              aria-label="Facebook"
            >Facebook</a>
            <a
              v-if="socials.instagram"
              :href="socials.instagram"
              target="_blank"
              rel="noopener"
              class="btn btn-outline-success btn-sm rounded-pill"
              aria-label="Instagram"
            >Instagram</a>
            <a
              v-if="socials.youtube"
              :href="socials.youtube"
              target="_blank"
              rel="noopener"
              class="btn btn-outline-success btn-sm rounded-pill"
              aria-label="YouTube"
            >YouTube</a>
            <a
              v-if="socials.tiktok"
              :href="socials.tiktok"
              target="_blank"
              rel="noopener"
              class="btn btn-outline-success btn-sm rounded-pill"
              aria-label="TikTok"
            >TikTok</a>
          </div>
        </div>

        <!-- Quick links -->
        <!-- <div class="col-6 col-md-4">
          <h6 class="text-uppercase text-muted">Quick Links</h6>
          <ul class="list-unstyled m-0">
            <li v-for="l in links" :key="l.label" class="my-2">
              <RouterLink class="link-dark text-decoration-none" :to="l.to">
                {{ l.label }}
              </RouterLink>
            </li>
          </ul>
        </div> -->

        <!-- Contact -->
        <div class="col-12 col-sm-6">
          <h6 class="text-uppercase text-muted">Contact</h6>
          <ul class="list-unstyled m-0">
            <li v-if="contact.email" class="my-2">
              <a class="link-dark text-decoration-none" :href="`mailto:${contact.email}`">
                {{ contact.email }}
              </a>
            </li>
            <li v-if="contact.phone" class="my-2">
              <a class="link-dark text-decoration-none" :href="`tel:${contact.phone}`">
                {{ contact.phone }}
              </a>
            </li>
            <li v-if="contact.address" class="my-2 text-muted">
              {{ contact.address }}
            </li>
            <li v-if="contact.hours" class="my-2 text-muted">
              {{ contact.hours }}
            </li>
          </ul>
        </div>
      </div>

      <hr class="my-4" />
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
        <small class="text-muted">© {{ year }} {{ orgName }}. All rights reserved.</small>
        <small class="text-muted">
          <RouterLink class="link-secondary text-decoration-none me-3" to="/privacy">Privacy</RouterLink>
          <RouterLink class="link-secondary text-decoration-none" to="/terms">Terms</RouterLink>
        </small>
      </div>
    </div>
  </footer>
</template>

<script setup>
const props = defineProps({
  orgName: { type: String, default: 'CritterConnect' },
  logoSrc: { type: String, default: '../src/public/assets/logo.png' }, // from public/assets or import if in src/assets
  year: { type: [String, Number], default: new Date().getFullYear() },
  emergency: {
    type: Object,
    default: () => ({
      title: 'Emergency Or Life-threatening?',
      primaryLabel: 'Life-threatening',
      primaryNumber: '999',         // set as needed
      secondaryLabel: 'Ambulance/Fire',
      secondaryNumber: '995',       // set as needed
      wildlifeLabel: 'Wildlife hotline',
      wildlifeNumber: '',           // e.g., your partner hotline; leave blank to hide
      note: 'Keep a safe distance. Do not attempt to handle the animal.'
    })
  },
  contact: {
    type: Object,
    default: () => ({
      email: 'hello@critterconnect.org',
      phone: '',
      address: '',
      hours: 'Mon–Sun, 9am–6pm'
    })
  },
//   links: {
//     type: Array,
//     default: () => ([
//       { label: 'Home', to: '/' },
//       { label: 'Report', to: '/report' },
//       { label: 'Donate', to: '/donate' },
//       { label: 'Guidebook', to: '/guidebook' },
//       { label: 'About', to: '/about' },
//     ])
//   },
  socials: {
    type: Object,
    default: () => ({
      facebook: '',
      instagram: '',
      youtube: '',
      tiktok: ''
    })
  }
})
</script>

<style scoped>
.emergency-strip {
  background: #064301; /* fallback */
  background: linear-gradient(90deg, #064301 0%, #0a6b05 100%);
 
}
.footer-body {
  background: #f8faf8;
}
</style>
