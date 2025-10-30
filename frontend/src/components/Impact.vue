<template>
  <section class="container my-5">
    <div class="row g-4 align-items-center">
      <!-- Left: Summary -->
      <div class="col-12 col-lg-5">
        <h2 class="fw-bold text-success mb-2">Impact of Your Donations</h2>
        <p class="text-muted">
          See how your support fuels rescue operations, medical care, and community education adds up so far.
        </p>

        <!-- Goal progress -->
        <div class="card border-0 shadow-sm rounded-4 p-3">
          <div class="d-flex justify-content-between mb-1 small">
            <span class="text-muted">Raised</span>
            <span class="text-muted">Goal</span>
          </div>
          <div class="d-flex justify-content-between align-items-baseline mb-2">
            <div class="fs-4 fw-bold">S${{ fmt(raised) }}</div>
            <div class="text-muted">S${{ fmt(goal) }}</div>
          </div>

          <div class="progress" style="height: 12px;">
            <div
              class="progress-bar bg-success"
              role="progressbar"
              :style="{ width: pct + '%' }"
              :aria-valuenow="pct"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>

          <div class="d-flex justify-content-between mt-2">
            <small class="text-success fw-semibold">{{ pct }}% funded</small>
            <small class="text-muted">Need S${{ fmt(goal - raised) }}</small>
          </div>
        </div>

        <!-- Toggle -->
        <div class="d-flex justify-content-center justify-content-lg-start mt-3">
          <button
            class="btn btn-outline-success rounded-pill px-4"
            @click="expanded = !expanded"
            :aria-expanded="expanded.toString()"
            aria-controls="impact-details"
          >
            <span v-if="!expanded">Show full impact</span>
            <span v-else>Hide full impact</span>
          </button>
        </div>
      </div>

      <!-- Right: Impact breakdown + counters (hidden until expanded) -->
      <div class="col-12 col-lg-7" id="impact-details" v-show="expanded">
        <div class="row g-3">
          <div v-for="b in breakdown" :key="b.key" class="col-12">
            <div class="card border-0 shadow-sm rounded-4 p-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <div class="d-flex align-items-center gap-2">
                  <span class="fs-5">{{ b.emoji }}</span>
                  <strong>{{ b.label }}</strong>
                </div>
                <small class="text-muted">S${{ fmt(b.raised) }} / S${{ fmt(b.goal) }}</small>
              </div>
              <div class="progress" style="height: 10px;">
                <div
                  class="progress-bar"
                  :class="barClass(b)"
                  role="progressbar"
                  :style="{ width: bPct(b) + '%' }"
                  :aria-valuenow="bPct(b)"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div class="d-flex justify-content-between mt-2 small">
                <span class="text-muted">{{ b.short }}</span>
                <span :class="bPct(b) >= 100 ? 'text-success' : 'text-muted'">{{ bPct(b) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Animated counters -->
        <div class="card border-0 shadow-sm rounded-4 p-3 mt-3">
          <div class="row text-center">
            <div class="col-4">
              <div class="fs-3 fw-bold text-success">{{ animated.rescues }}</div>
              <div class="small text-muted">Rescues funded</div>
            </div>
            <div class="col-4">
              <div class="fs-3 fw-bold text-success">{{ animated.treatments }}</div>
              <div class="small text-muted">Animals treated</div>
            </div>
            <div class="col-4">
              <div class="fs-3 fw-bold text-success">{{ animated.training }}</div>
              <div class="small text-muted">Training hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <!-- /Right -->
      
      <!-- Stories accordion -->
      <div class="row mt-4" v-show="expanded">
        <div class="col-12">
          <div class="accordion shadow-sm rounded-4 overflow-hidden" id="impactStories">
            <div class="accordion-item" v-for="(s, i) in stories" :key="s.id">
              <h2 class="accordion-header">
                <button class="accordion-button" :class="{ collapsed: i !== 0 }"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="`#story-${s.id}`"
                :aria-expanded="i === 0 ? 'true' : 'false'">
                {{ s.title }}
              </button>
            </h2>
            <div :id="`story-${s.id}`" class="accordion-collapse collapse" :class="{ show: i === 0 }" data-bs-parent="#impactStories">
              <div class="accordion-body">
                <p class="mb-2">{{ s.body }}</p>
                <small class="text-muted">Funded by {{ s.fundedBy }} · {{ s.date }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, onMounted, ref } from 'vue'

const props = defineProps({
  goal: { type: Number, default: 50000 },   // overall goal (SGD)
  raised: { type: Number, default: 31250 }, // current raised (SGD)
  breakdown: {
    type: Array,
    default: () => ([
      { key: 'medical',  label: 'Medical Care',        emoji: '', goal: 20000, raised: 14000, short: 'Vet bills, meds, supplies' },
      { key: 'response', label: 'Field Response',      emoji: '', goal: 18000, raised: 12000, short: 'Transport, equipment, fuel' },
      { key: 'edu',      label: 'Community Education', emoji: '', goal: 12000, raised: 5250,  short: 'Workshops, materials' },
    ])
  },
  stories: {
    type: Array,
    default: () => ([
      { id: 'pangolin', title: 'Pangolin safely released', body: 'Your donations funded rehab and a GPS tag to ensure post-release monitoring.', fundedBy: '52 donors', date: 'Oct 2025' },
      { id: 'owl', title: 'Rescuing an Injured Owl', body: 'Swift response and care led to a full recovery.', fundedBy: '11 donors', date: 'Sep 2025' },
      { id: 'hornbill', title: 'Hornbill wing recovery',   body: 'Micro-surgery and physiotherapy covered by the medical fund.', fundedBy: '31 donors', date: 'Sep 2025' },
      { id: 'civet',    title: 'Civet family relocation',  body: 'Field team humanely relocated a family from a risky construction site.', fundedBy: '24 donors', date: 'Aug 2025' },
    ])
  },
  counters: {
    type: Object,
    default: () => ({ rescues: 168, treatments: 342, training: 890 })
  }
})

const expanded = ref(false) // 🔒 hidden by default

const pct = computed(() => Math.min(100, Math.round((props.raised / props.goal) * 100)))

function bPct(b) {
  return Math.min(100, Math.round((b.raised / b.goal) * 100))
}
function barClass(b) {
  const p = bPct(b)
  if (p >= 100) return 'bg-success'
  if (p >= 60)  return 'bg-info'
  if (p >= 30)  return 'bg-warning'
  return 'bg-secondary'
}
function fmt(n) {
  return n.toLocaleString('en-SG', { maximumFractionDigits: 0 })
}

/* simple animated counters */
const animated = reactive({ rescues: 0, treatments: 0, training: 0 })
onMounted(() => {
  const duration = 900
  const start = performance.now()
  const from = { ...animated }
  const to = props.counters
  function tick(t) {
    const k = Math.min(1, (t - start) / duration)
    animated.rescues    = Math.round((to.rescues    - from.rescues)    * k)
    animated.treatments = Math.round((to.treatments - from.treatments) * k)
    animated.training   = Math.round((to.training   - from.training)   * k)
    if (k < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})
</script>

<style scoped>
.accordion-button { font-weight: 600; }
</style>
