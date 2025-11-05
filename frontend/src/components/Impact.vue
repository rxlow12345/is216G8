<template>
  <section class="container my-5">
    <div class="row g-4 align-items-center">
      <!-- Left: Summary -->
      <h2 class="impactTitle text-center fw-bold">Impact of Your Donations</h2>
      <p class="supportText text-center">
        See how your support fuels rescue operations, medical care, and community education adds up so far.
      </p>
      <div class="col-12">

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
            <div class="progress-bar bg-success" role="progressbar" :style="{ width: pct + '%' }" :aria-valuenow="pct"
              aria-valuemin="0" aria-valuemax="100"></div>
          </div>

          <div class="d-flex justify-content-between mt-2">
            <small class="text-muted">{{ pct }}% funded</small>
            <small class="text-success fw-bold">Need S${{ fmt(goal - raised) }}</small>
          </div>
        </div>
        <section ref="counterSection" class="stats">

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
        </section>



        
      </div>

      <div class="collapse-content" :class="{ 'visible': isContentVisible }">

        <div id="impact-content">

          <div class="col-12">
            <div class="row g-3">
              <div v-for="b in breakdown" :key="b.key" class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 p-3">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <div class="d-flex align-items-center gap-2">
                      <span class="fs-5">{{ b.emoji }}</span>
                      <strong>{{ b.label }}</strong>
                    </div>
                    <small class="text-muted">S${{ fmt(b.raised) }} / S${{ fmt(b.goal) }}</small>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div class="progress-bar" :class="barClass(b)" role="progressbar" :style="{ width: bPct(b) + '%' }"
                      :aria-valuenow="bPct(b)" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                  <div class="d-flex justify-content-between mt-2 small">
                    <span class="text-muted">{{ b.short }}</span>
                    <span :class="bPct(b) >= 100 ? 'text-success' : 'text-muted'">{{ bPct(b) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        <!-- /Right -->

        <!-- Stories accordion -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="accordion shadow-sm rounded-4 overflow-hidden" id="impactStories">
              <div class="accordion-item" v-for="(s, i) in stories" :key="s.id">
                <h2 class="accordion-header">
                  <button class="accordion-button" :class="{ collapsed: i !== 0 }" type="button"
                    data-bs-toggle="collapse" :data-bs-target="`#story-${s.id}`"
                    :aria-expanded="i === 0 ? 'true' : 'false'">
                    {{ s.title }}
                  </button>
                </h2>
                <div :id="`story-${s.id}`" class="accordion-collapse collapse" :class="{ show: i === 0 }"
                  data-bs-parent="#impactStories">
                  <div class="accordion-body">
                    <div class="row g-3">
                      <div class="col-md-4" v-if="s.image">
                        <img :src="s.image" :alt="s.title" class="img-fluid rounded"
                          style="width: 100%; height: 200px; object-fit: cover;">
                      </div>
                      <div :class="s.image ? 'col-md-8' : 'col-12'">
                        <p class="mb-2">{{ s.body }}</p>
                        <small class="fundedText">Funded by {{ s.fundedBy }} · {{ s.date }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            </div>
          </div>
        </div>
      
        <div class="text-center-custom mb-3 px-1 py-5">
          <button type="button" class="btn custom-collapse-btn" @click="toggleCollapse">
            {{ isContentVisible ? 'Show Less' : 'Show Full Impact' }}
          </button>
        </div>
  </section>
</template>

<script setup>
import { computed, reactive, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { getAssetUrl } from '../utils/getAssetUrl.js'
// 1. State: Use ref to track the visibility state
const isContentVisible = ref(false);

// 2. Method: Function to flip the state when the button is clicked
const toggleCollapse = () => {
  isContentVisible.value = !isContentVisible.value;
};

const props = defineProps({
  goal: { type: Number, default: 50000 },   // overall goal (SGD)
  raised: { type: Number, default: 31250 }, // current raised (SGD)
  counters: {
    type: Object,
    default: () => ({ rescues: 0, treatments: 0, training: 0 })
  },
  durationMs: { type: Number, default: 2000 },
  triggerOnce: { type: Boolean, default: true }, // set false to re-run on every re-entry

  breakdown: {
    type: Array,
    default: () => ([
      { key: 'medical', label: 'Medical Care', emoji: '🧰', goal: 20000, raised: 14000, short: 'Vet bills, meds, supplies' },
      { key: 'response', label: 'Field Response', emoji: '📑', goal: 18000, raised: 12000, short: 'Transport, equipment, fuel' },
      { key: 'edu', label: 'Community Education', emoji: '📚', goal: 12000, raised: 5250, short: 'Workshops, materials' },
    ])
  },
  stories: {
    type: Array,
    default: () => ([
      { id: 'pangolin', title: 'Pangolin safely released', body: 'Your donations funded rehab and a GPS tag to ensure post-release monitoring.', fundedBy: '22 donors', date: 'Oct 2025', image: getAssetUrl('SundaPangolin.png') },
      { id: 'deer', title: 'Rescuing an Injured Deer', body: 'Swift response and care led to a full recovery.', fundedBy: '12 donors', date: 'Sep 2025', image: getAssetUrl('GreaterMouseDeer.png') },
      { id: 'junglefowl', title: 'Red Junglefowl wing recovery', body: 'Micro-surgery and physiotherapy covered by the medical fund.', fundedBy: '11 donors', date: 'Sep 2025', image: getAssetUrl('RedJunglefowl.png') },
      { id: 'otter', title: 'Otter family relocation', body: 'Field team humanely relocated a family from a risky construction site.', fundedBy: '22 donors', date: 'Aug 2025', image: getAssetUrl('SmoothOtter.png') },
    ])
  },
  counters: {
    type: Object,
    default: () => ({ rescues: 168, treatments: 342, training: 890 })
  }
})


const pct = computed(() => Math.min(100, Math.round((props.raised / props.goal) * 100)))

function bPct(b) {
  return Math.min(100, Math.round((b.raised / b.goal) * 100))
}
function barClass(b) {
  const p = bPct(b)
  if (p >= 100) return 'bg-success'
  if (p >= 60) return 'bg-success'
  if (p >= 30) return 'bg-success'
  return 'bg-secondary'
}
function fmt(n) {
  return n.toLocaleString('en-SG', { maximumFractionDigits: 0 })
}


const counterSection = ref(null)
const animated = reactive({ rescues: 0, treatments: 0, training: 0 })

let rafId = null
let observer = null
let hasRun = false
let running = false

function startAnimation() {
  if (running) return
  if (props.triggerOnce && hasRun) return
  hasRun = true
  running = true

  const start = performance.now()
  const asNum = (v, fallback = 0) => {
    if (v == null) return fallback;
    // strip commas/spaces and trailing plus sign
    const cleaned = String(v).replace(/[, ]+/g, '').replace(/\+$/, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : fallback;
  };

  // when you snapshot
  const from = {
    rescues: asNum(animated.rescues),
    treatments: asNum(animated.treatments),
    training: asNum(animated.training),
  };

  const to = {
    rescues: asNum(props.counters?.rescues),
    treatments: asNum(props.counters?.treatments),
    training: asNum(props.counters?.training),
  };
  const easeOutCubic = x => 1 - Math.pow(1 - x, 3)

  const tick = t => {
    const k = Math.min(1, Math.max(0, (t - start) / props.durationMs))
    const e = easeOutCubic(k)
    animated.rescues = Math.round(from.rescues + (to.rescues - from.rescues) * e)
    animated.treatments = Math.round(from.treatments + (to.treatments - from.treatments) * e)
    animated.training = Math.round(from.training + (to.training - from.training) * e)
    if (k < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      running = false
    }
  }

  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAnimation()
          if (props.triggerOnce) observer.unobserve(entry.target)
        }
      })
    },
    {
      // Start a bit before it fully enters
      root: null,
      rootMargin: '0px 0px -20% 0px',
      threshold: 0.2,
    }
  )
  if (counterSection.value) observer.observe(counterSection.value)
})

// If counters change while visible, re-run (respects triggerOnce)
watch(
  () => props.counters,

  (val) => {
    if (!val) return;
    // startAnimation() here, using the `from`/`to` built with asNum()
  },
  { immediate: true, deep: true }
);

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (observer && counterSection.value) observer.unobserve(counterSection.value)
  observer?.disconnect()
})
</script>

<style scoped>
* {
  font-family: Georgia, 'Times New Roman', Times, serif;
}

h2 {
  font-size: 40px;
  font-weight: 600;
  color:#285436;
  text-shadow: 0 4px 20px rgba(11, 155, 23, 0.3);
}

.supportText {
  font-size: 18px;
  color: #606C38;
  font-weight: 500;
  padding-top: 0;
}

/* Accordion appearance */
.accordion-item {
  border: none;
  margin-bottom: 12px;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.accordion-button {
  background-color: #f0f4ec;
  color: #285436;
  font-weight: 600;
  font-size: 18px;
  padding: 15px 20px;
  border: none;
  box-shadow: none;
  transition: all 0.3s ease;
}

.accordion-button:not(.collapsed) {
  background-color: #285436;
  color: #fff;
  box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.15);
}

.accordion-button::after {
  filter: brightness(0.5);
}

.accordion-body {
  background-color: #fff;
  border-top: 1px solid #e0e4d9;
  padding: 20px;
  line-height: 1.6;
}

.story-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}



.collapse-content {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px);
  transition: 
    max-height 0.6s ease-in-out,
    opacity 0.5s ease-in,
    transform 0.5s ease-in;
}

.collapse-content.visible {
  max-height: 2000px; 
  opacity: 1;
  transform: translateY(0);
}



.custom-collapse-btn {
  background-color: #285436;
  color: rgb(254, 250, 224);


  /* Interaction & Display */
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  display: inline-block;
}

.custom-collapse-btn:hover {
  background-color: #d1ccb0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-slider-container {
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  gap: 20px;
  padding: 20px;
  max-width: 100vw;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.image-slider-container::-webkit-scrollbar {
  display: none;
}

.image-slider-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.image-slide {
  flex: 0 0 auto;
  scroll-snap-align: center;
  width: calc(min(45vw, 280px));
  height: calc(min(45vw, 280px));
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.rounded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
}

.counter-wrap {
  min-height: 60px;
  display: flex;
  align-items: center;
}

.counter {
  font-size: 2rem;
  font-weight: 700;
}
</style>
