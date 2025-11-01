<template>
  <section class="container my-5">
    <div class="row g-4 align-items-center">
      <!-- Left: Summary -->
      <h2 class=" text-center fw-bold text-success">Impact of Your Donations</h2>
      <p class="text-muted">
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



        <div class="text-center-custom mb-3 px-2">
          <button type="button" class="custom-collapse-btn" @click="toggleCollapse">
            {{ isContentVisible ? 'Show Less' : 'Show Full Impact' }}
          </button>
        </div>
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
                    <p class="mb-2">{{ s.body }}</p>
                    <small class="text-muted">Funded by {{ s.fundedBy }} · {{ s.date }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  </section>
</template>

<script setup>
import { computed, reactive, onMounted, ref, watch, onBeforeUnmount } from 'vue'
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
      { key: 'medical', label: 'Medical Care', emoji: '', goal: 20000, raised: 14000, short: 'Vet bills, meds, supplies' },
      { key: 'response', label: 'Field Response', emoji: '', goal: 18000, raised: 12000, short: 'Transport, equipment, fuel' },
      { key: 'edu', label: 'Community Education', emoji: '', goal: 12000, raised: 5250, short: 'Workshops, materials' },
    ])
  },
  stories: {
    type: Array,
    default: () => ([
      { id: 'pangolin', title: 'Pangolin safely released', body: 'Your donations funded rehab and a GPS tag to ensure post-release monitoring.', fundedBy: '52 donors', date: 'Oct 2025' },
      { id: 'owl', title: 'Rescuing an Injured Owl', body: 'Swift response and care led to a full recovery.', fundedBy: '11 donors', date: 'Sep 2025' },
      { id: 'hornbill', title: 'Hornbill wing recovery', body: 'Micro-surgery and physiotherapy covered by the medical fund.', fundedBy: '31 donors', date: 'Sep 2025' },
      { id: 'civet', title: 'Civet family relocation', body: 'Field team humanely relocated a family from a risky construction site.', fundedBy: '24 donors', date: 'Aug 2025' },
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
.accordion-button {
  font-weight: 600;
}

.collapse-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease-in-out;
}

.collapse-content.visible {
  max-height: 700px;
  /* Needs to be larger than the content */
}

/* Replace the existing .custom-collapse-btn styles with these */
.custom-collapse-btn {
  /* Color Properties (Matching your image) */
  background-color: #5a511e;
  /* Light tan/khaki background */
  color: #ffffff;
  /* Darker olive text color */

  /* Shape and Sizing */
  border: none;
  padding: 15px 30px;
  margin-top: 30px;
  /* Increased horizontal padding for the pill shape */
  font-size: 1.25rem;
  font-weight: bold;
  border-radius: 50px;
  /* Large border-radius creates the pill shape */

  /* Interaction & Display */
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  display: inline-block;
}

.custom-collapse-btn:hover {
  background-color: #d1ccb0;
  /* Slightly darker background on hover */
  /* Optional: Add a subtle shadow on hover */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-slider-container {
  display: flex;
  /* Arranges items in a row */
  overflow-x: scroll;
  /* Enables horizontal scrolling */
  scroll-snap-type: x mandatory;
  /* Makes it snap to individual items */
  gap: 20px;
  /* Space between images */
  padding: 20px;
  /* Padding around the entire scrolling area */
  max-width: 100vw;
  /* Ensures it doesn't overflow the viewport */
  box-sizing: border-box;
  /* Include padding in width */
  -webkit-overflow-scrolling: touch;
  /* Improves scrolling performance on iOS */
}

/* Hide Scrollbar (Optional - common for sliders) */
.image-slider-container::-webkit-scrollbar {
  display: none;
  /* For Chrome, Safari, Opera */
}

.image-slider-container {
  -ms-overflow-style: none;
  /* For IE and Edge */
  scrollbar-width: none;
  /* For Firefox */
}

.image-slide {
  flex: 0 0 auto;
  /* Prevent items from shrinking, let them take their natural width */
  scroll-snap-align: center;
  /* Snap the center of the item to the center of the container */

  /* You might want to define a specific width for each slide, e.g.: */
  width: calc(min(45vw, 280px));
  /* Take up to 45% of viewport width, max 280px */
  height: calc(min(45vw, 280px));
  /* Keep it square */

  background-color: transparent;
  /* Card background is handled by the image's rounded corners */
  display: flex;
  /* For centering content if needed, though img fills it */
  justify-content: center;
  align-items: center;
}

.rounded-image {
  width: 100%;
  /* Make image fill its parent .image-slide div */
  height: 100%;
  object-fit: cover;
  /* Ensures the image covers the area without distortion */
  border-radius: 20px;
  /* Adjust this value for desired roundness */
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
  /* Optional subtle shadow */
}

.counter-wrap {
  min-height: 60px;
  /* ensure it has height so it can intersect */
  display: flex;
  align-items: center;
}

.counter {
  font-size: 2rem;
  font-weight: 700;
}
</style>
