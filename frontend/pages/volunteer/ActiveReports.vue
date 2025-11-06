<template>
  <div class="container-fluid p-0 reporterDashboard">
    <div id="topBanner" class="bannerTitles">
      <header class="text-center mb-2">
        <h1>🌿 Active Reports 🌿</h1>
        <p class="hero-subtitle">Track ongoing wildlife rescue operations</p>
      </header>
    </div>

    <main class="report-container">
      <div class="search-section">
        <div class="search-bar">
          <input v-model="search" type="text" id="searchInput"
            placeholder="🔍 Search by Report ID or Animal">
          <button @click="() => {}" id="searchBtn">Search</button>
        </div>
      </div>

      <div v-if="!loading && reports.length > 0" class="controls-section">
        <div class="sort-group">
          <span class="section-label">Sort:</span>
          <button 
            @click="sortBy = 'urgency'" 
            :class="{ active: sortBy === 'urgency' }"
            class="control-btn"
          >
            Urgency
          </button>
          <button 
            @click="sortBy = 'progress'" 
            :class="{ active: sortBy === 'progress' }"
            class="control-btn"
          >
            Progress
          </button>
          <button 
            @click="sortBy = 'time'" 
            :class="{ active: sortBy === 'time' }"
            class="control-btn"
          >
            Latest
          </button>
        </div>

        <div class="filter-group">
          <button 
            @click="stageFilter = 'all'" 
            :class="{ active: stageFilter === 'all' }"
            class="control-btn"
          >
            All ({{ filteredBySearch.length }})
          </button>
          <button 
            @click="stageFilter = 'arriving'" 
            :class="{ active: stageFilter === 'arriving' }"
            class="control-btn"
          >
            Arriving
          </button>
          <button 
            @click="stageFilter = 'handling'" 
            :class="{ active: stageFilter === 'handling' }"
            class="control-btn"
          >
            Handling
          </button>
          <button 
            @click="stageFilter = 'treating'" 
            :class="{ active: stageFilter === 'treating' }"
            class="control-btn"
          >
            Treating
          </button>
          <button 
            @click="stageFilter = 'recovery'" 
            :class="{ active: stageFilter === 'recovery' }"
            class="control-btn"
          >
            Recovery
          </button>
        </div>
      </div>
      <div v-if="loading" class="loading-box">Loading active reports...</div>

      <div v-else-if="reports.length === 0" class="empty-state">
        <p>No active reports yet.</p>
      </div>

      <div v-else class="reports-grid">
        <section
          v-for="r in sortedReports"
          :key="r.id"
          class="report-card"
          :data-severity="r.data.severity || 'medium'"
        >
          <div class="report-id">{{ r.data.reportId }}</div>
          
          <!-- Animal Info -->
          <div class="animal-info">
            <span class="species">{{ r.data.speciesName || 'Unknown Animal' }}</span>
            <span class="incident-type" v-if="r.data.incidentType">({{ r.data.incidentType }})</span>
          </div>

          <!-- Location -->
          <div class="location" v-if="r.data.location?.address">
            📍 {{ formatLocation(r.data.location.address) }}
          </div>

          <div class="status-badge-wrapper">
            <span class="status-pill" :class="getStatusClass(r.data)">{{ getShortStatus(r.data) }}</span>
          </div>

          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: r.data.progressPercentage + '%' }"></div>
            </div>
            <div class="progress-text">{{ r.data.progressPercentage }}%</div>
          </div>

          <div class="timestamp">Accepted {{ formatSince(r.data.acceptedAt) }}</div>

          <button class="view-details-btn" @click="openDetailsModal(r)">
            Rescue Checkpoints
          </button>
          <button class="view-original-btn" @click="viewOriginal(r)">
            View Original Report
          </button>
        </section>
      </div>
    </main>
  </div>

  <!-- Details Modal -->
  <transition name="modal-fade">
  <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal" @keydown.esc="closeDetailsModal">
    <div class="modal-container">
      
      <!-- Header Section -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="report-id">{{ selectedReport?.data?.reportId || '' }}</h2>
          <p class="report-meta">
            {{ selectedReport?.data?.speciesName || selectedReport?.data?.reportData?.speciesName || 'Unknown Animal' }} • {{ formatLocation(selectedReport?.data?.location?.address || selectedReport?.data?.reportData?.location?.address || selectedReport?.data?.location) }}
          </p>
        </div>
        <button @click="closeDetailsModal" class="close-button" aria-label="Close">
          ×
        </button>
      </div>

      <!-- Progress Section -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Rescue Progress</span>
          <span class="progress-percentage">{{ selectedReport?.data?.progressPercentage || 0 }}%</span>
        </div>
        <div class="progress-bar-track">
          <div 
            class="progress-bar-fill" 
            :style="{ width: (selectedReport?.data?.progressPercentage || 0) + '%' }"
          ></div>
        </div>
        <p class="progress-status">{{ getProgressStatus(selectedReport?.data?.progressPercentage || 0) }}</p>
      </div>

      <!-- Timeline Section -->
      <div class="timeline-section">
        
        <!-- Arrived Checkpoint -->
        <div 
          class="timeline-item" 
          :class="{ 
            completed: selectedReport?.data?.checkpoints?.arrived?.completed,
            current: !selectedReport?.data?.checkpoints?.arrived?.completed 
          }"
        >
          <div class="timeline-icon">
            <span v-if="selectedReport?.data?.checkpoints?.arrived?.completed" class="icon-check">✓</span>
            <span v-else class="icon-number">1</span>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="timeline-title">Arrived at Location</h3>
              <span v-if="selectedReport?.data?.checkpoints?.arrived?.completed && selectedReport?.data?.checkpoints?.arrived?.completedAt" class="timeline-timestamp">
                {{ formatRelativeTime(selectedReport.data.checkpoints.arrived.completedAt) }}
              </span>
            </div>
            <div v-if="selectedReport?.data?.checkpoints?.arrived?.completed && selectedReport?.data?.checkpoints?.arrived?.notes" class="timeline-details">
              <div class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">{{ selectedReport.data.checkpoints.arrived.notes }}</span>
              </div>
            </div>
            <button 
              v-if="!selectedReport?.data?.checkpoints?.arrived?.completed"
              @click="markComplete(selectedReport, 'arrived')"
              class="mark-complete-btn"
              :disabled="updatingId === selectedReport?.id"
            >
              <span v-if="updatingId === selectedReport?.id" class="spinner"></span>
              {{ updatingId === selectedReport?.id ? 'Updating...' : 'Mark as Complete' }}
            </button>
            <span v-if="selectedReport?.data?.checkpoints?.arrived?.completed === false && (selectedReport?.data?.progressPercentage || 0) > 0" class="pending-text">
              Pending
            </span>
          </div>
        </div>

        <!-- Handled Checkpoint -->
        <div 
          class="timeline-item" 
          :class="{ 
            completed: selectedReport?.data?.checkpoints?.handled?.completed,
            current: selectedReport?.data?.checkpoints?.arrived?.completed && !selectedReport?.data?.checkpoints?.handled?.completed
          }"
        >
          <div class="timeline-icon">
            <span v-if="selectedReport?.data?.checkpoints?.handled?.completed" class="icon-check">✓</span>
            <span v-else class="icon-number">2</span>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="timeline-title">Animal Secured</h3>
              <span v-if="selectedReport?.data?.checkpoints?.handled?.completed && selectedReport?.data?.checkpoints?.handled?.completedAt" class="timeline-timestamp">
                {{ formatRelativeTime(selectedReport.data.checkpoints.handled.completedAt) }}
              </span>
            </div>
            <div v-if="selectedReport?.data?.checkpoints?.handled?.completed" class="timeline-details">
              <div v-if="selectedReport?.data?.checkpoints?.handled?.condition" class="detail-row">
                <span class="detail-label">Condition:</span>
                <span class="detail-value">{{ selectedReport.data.checkpoints.handled.condition }}</span>
              </div>
              <div v-if="selectedReport?.data?.checkpoints?.handled?.notes" class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">{{ selectedReport.data.checkpoints.handled.notes }}</span>
              </div>
            </div>
            <button 
              v-if="selectedReport?.data?.checkpoints?.arrived?.completed && !selectedReport?.data?.checkpoints?.handled?.completed"
              @click="markComplete(selectedReport, 'handled')"
              class="mark-complete-btn"
              :disabled="updatingId === selectedReport?.id"
            >
              <span v-if="updatingId === selectedReport?.id" class="spinner"></span>
              {{ updatingId === selectedReport?.id ? 'Updating...' : 'Mark as Complete' }}
            </button>
            <span v-if="!selectedReport?.data?.checkpoints?.handled?.completed && !selectedReport?.data?.checkpoints?.arrived?.completed" class="pending-text">
              Complete previous step first
            </span>
          </div>
        </div>

        <!-- Treated Checkpoint -->
        <div 
          class="timeline-item" 
          :class="{ 
            completed: selectedReport?.data?.checkpoints?.treated?.completed,
            current: selectedReport?.data?.checkpoints?.handled?.completed && !selectedReport?.data?.checkpoints?.treated?.completed
          }"
        >
          <div class="timeline-icon">
            <span v-if="selectedReport?.data?.checkpoints?.treated?.completed" class="icon-check">✓</span>
            <span v-else class="icon-number">3</span>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="timeline-title">Treatment Completed</h3>
              <span v-if="selectedReport?.data?.checkpoints?.treated?.completed && selectedReport?.data?.checkpoints?.treated?.completedAt" class="timeline-timestamp">
                {{ formatRelativeTime(selectedReport.data.checkpoints.treated.completedAt) }}
              </span>
            </div>
            <div v-if="selectedReport?.data?.checkpoints?.treated?.completed" class="timeline-details">
              <div v-if="selectedReport?.data?.checkpoints?.treated?.diagnosis" class="detail-row">
                <span class="detail-label">Diagnosis:</span>
                <span class="detail-value">{{ selectedReport.data.checkpoints.treated.diagnosis }}</span>
              </div>
              <div v-if="selectedReport?.data?.checkpoints?.treated?.treatment" class="detail-row">
                <span class="detail-label">Treatment:</span>
                <span class="detail-value">{{ selectedReport.data.checkpoints.treated.treatment }}</span>
              </div>
              <div v-if="selectedReport?.data?.checkpoints?.treated?.notes" class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">{{ selectedReport.data.checkpoints.treated.notes }}</span>
              </div>
            </div>
            <button 
              v-if="selectedReport?.data?.checkpoints?.handled?.completed && !selectedReport?.data?.checkpoints?.treated?.completed"
              @click="markComplete(selectedReport, 'treated')"
              class="mark-complete-btn"
              :disabled="updatingId === selectedReport?.id"
            >
              <span v-if="updatingId === selectedReport?.id" class="spinner"></span>
              {{ updatingId === selectedReport?.id ? 'Updating...' : 'Mark as Complete' }}
            </button>
            <span v-if="!selectedReport?.data?.checkpoints?.treated?.completed && !selectedReport?.data?.checkpoints?.handled?.completed" class="pending-text">
              Complete previous step first
            </span>
          </div>
        </div>

        <!-- Reconciled Checkpoint -->
        <div 
          class="timeline-item" 
          :class="{ 
            completed: selectedReport?.data?.checkpoints?.reconciled?.completed,
            current: selectedReport?.data?.checkpoints?.treated?.completed && !selectedReport?.data?.checkpoints?.reconciled?.completed
          }"
        >
          <div class="timeline-icon">
            <span v-if="selectedReport?.data?.checkpoints?.reconciled?.completed" class="icon-check">✓</span>
            <span v-else class="icon-number">4</span>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="timeline-title">Case Resolved</h3>
              <span v-if="selectedReport?.data?.checkpoints?.reconciled?.completed && selectedReport?.data?.checkpoints?.reconciled?.completedAt" class="timeline-timestamp">
                {{ formatRelativeTime(selectedReport.data.checkpoints.reconciled.completedAt) }}
              </span>
            </div>
            <div v-if="selectedReport?.data?.checkpoints?.reconciled?.completed" class="timeline-details">
              <div v-if="selectedReport?.data?.checkpoints?.reconciled?.outcome" class="detail-row">
                <span class="detail-label">Outcome:</span>
                <span class="detail-value">{{ formatOutcome(selectedReport.data.checkpoints.reconciled.outcome) }}</span>
              </div>
              <div v-if="selectedReport?.data?.checkpoints?.reconciled?.notes" class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">{{ selectedReport.data.checkpoints.reconciled.notes }}</span>
              </div>
            </div>
            <button 
              v-if="selectedReport?.data?.checkpoints?.treated?.completed && !selectedReport?.data?.checkpoints?.reconciled?.completed"
              @click="markComplete(selectedReport, 'reconciled')"
              class="mark-complete-btn"
              :disabled="updatingId === selectedReport?.id"
            >
              <span v-if="updatingId === selectedReport?.id" class="spinner"></span>
              {{ updatingId === selectedReport?.id ? 'Updating...' : 'Mark as Complete' }}
            </button>
            <span v-if="!selectedReport?.data?.checkpoints?.reconciled?.completed && !selectedReport?.data?.checkpoints?.treated?.completed" class="pending-text">
              Complete previous step first
            </span>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="viewOriginalReport" class="secondary-button">
          📄 View Original Report
        </button>
        <button @click="closeDetailsModal" class="primary-button">
          Done
        </button>
      </div>

    </div>
  </div>
  </transition>

  <!-- Checkpoint Form Modal (existing) -->
  <CheckpointModal
    :visible="modalVisible"
    :title="modalTitle"
    :fields="modalFields"
    :warning="modalWarning"
    confirm-text="Submit"
    cancel-text="Cancel"
    :submitting="modalSubmitting"
    @submit="onSubmitModal"
    @close="onCloseModal"
  />
  <div class="toast-stack" :class="toastPositionClass">
    <div 
      v-for="t in toasts" 
      :key="t.id" 
      class="toast"
      :class="[ t.type, t.position, { entering: t.entering, leaving: t.leaving } ]"
    >
      <span v-if="t.type==='success'" class="toast-icon">✓</span>
      <span class="toast-message">{{ t.message }}</span>
      <button class="toast-close" @click="dismissToast(t.id)" aria-label="Close">×</button>
    </div>
  </div>

  <!-- Centered Success Modal -->
  <transition name="success-backdrop">
    <div 
      v-if="successVisible" 
      class="success-backdrop" 
      @click.self="hideSuccess"
      @keydown.esc.prevent="hideSuccess"
      role="dialog" 
      aria-modal="true" 
      aria-label="Case successfully resolved"
      :style="{ zIndex: 9999 }"
    >
      <transition name="success-card">
        <div 
          class="success-card" 
          v-if="successVisible"
          ref="successCardRef"
          tabindex="-1"
        >
          <div class="success-icon" aria-hidden="true">✓</div>
          <h2 class="success-title">Successfully Resolved</h2>
          <p class="success-body">
            Thank you for your dedication to helping this animal reach a safe outcome. <span aria-hidden="true">🐾</span>
          </p>
          <div class="success-case">Case {{ lastResolvedCaseId }}</div>
          <button class="success-button" @click="hideSuccess">Continue</button>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import '../css/common.css'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '../../src/firebase.js'
import { collection, query, where, onSnapshot, Timestamp, doc, updateDoc, serverTimestamp, getDoc, getDocs } from 'firebase/firestore'
import { getCurrentUser } from '../../src/api/auth.js'
import { formatDistanceToNow } from 'date-fns'
import api from '../../src/api/reportApi.js'
import CheckpointModal from '../../src/components/CheckpointModal.vue'

const router = useRouter()
const route = useRoute()
const initialCaseId = ref(route.query.caseId || '')
const loading = ref(true)
const reports = ref([]) // [{ id, data }]
const unsubRef = ref(null)
const updatingId = ref('')
const modalVisible = ref(false)
const modalTitle = ref('')
const modalWarning = ref('')
const modalFields = ref([])
const modalSubmitting = ref(false)
let currentAction = { report:null, key:'' }
const search = ref('')
const toasts = ref([])
const toastPosition = ref('bottom-right')
const successVisible = ref(false)
const lastResolvedCaseId = ref('')
const successCardRef = ref(null)
const showDetailsModal = ref(false)
const selectedReport = ref(null)
const stageFilter = ref('all')
const sortBy = ref('urgency')

const steps = [
  { key: 'arrived',     title: 'Arrived at Location',      icon: '📍' },
  { key: 'handled',     title: 'Animal Handled',           icon: '🤲' },
  { key: 'treated',     title: 'Treatment Received',       icon: '💊' },
  { key: 'reconciled',  title: 'Reconciliation Complete',  icon: '✅' },
]

function formatSince(ts) {
  if (!ts) return '—'
  const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts)
  return formatDistanceToNow(date, { addSuffix: true })
}

function currentStatus(data) {
  for (const s of steps) {
    if (!data.checkpoints?.[s.key]?.completed) return s.title
  }
  return 'Completed'
}

function getShortStatus(data) {
  const progress = data.progressPercentage ?? 0
  if (progress === 0) return '📍 Arriving'
  if (progress === 25) return '🤲 Handling'
  if (progress === 50) return '💊 Treating'
  if (progress === 75) return '🏥 Recovery'
  return 'In Progress'
}

function getStatusClass(data) {
  const progress = data.progressPercentage ?? 0
  if (progress >= 75) return 'status-near-complete'
  return 'status-in-progress'
}

function openDetailsModal(report) {
  selectedReport.value = report
  showDetailsModal.value = true
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden'
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedReport.value = null
  // Restore body scroll
  document.body.style.overflow = ''
}

function viewOriginalReport() {
  if (!selectedReport.value?.data?.reportId) return
  
  // Close the modal first
  closeDetailsModal()
  
  // Navigate to the status page showing the original report
  router.push({ path: `/status/${selectedReport.value.data.reportId}` , query: { viewer: 'volunteer' } })
}

function viewOriginal(r){
  if (!r?.data?.reportId) return
  router.push({ path: `/status/${r.data.reportId}`, query: { viewer: 'volunteer' } })
}

function formatOutcome(outcome) {
  const outcomes = {
    'released': 'Released to Wild',
    'rehomed': 'Rehomed/Adopted',
    'deceased': 'Deceased',
    'transferred': 'Transferred to Wildlife Center',
    'reunited_with_owner': 'Reunited with Owner',
    'other': 'Other'
  }
  return outcomes[outcome] || outcome
}

function formatLocation(address) {
  if (!address) return 'Unknown Location'
  // "589 Pasir Ris Green, Singapore 510589" → "Pasir Ris"
  const firstPart = address.split(',')[0]
  const cleaned = firstPart.replace(/\d+/g, '').trim()
  return cleaned || 'Singapore'
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp)
  const now = Date.now()
  const then = date.getTime()
  const diff = now - then
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function getProgressStatus(percentage) {
  if (percentage === 0) return 'Just started - volunteer on the way'
  if (percentage === 25) return 'Animal located and secured'
  if (percentage === 50) return 'Currently receiving treatment'
  if (percentage === 75) return 'Almost complete - finalizing case'
  return 'Completed'
}

function canComplete(data, idx) {
  // all previous must be completed
  for (let i = 0; i < idx; i++) {
    const prev = steps[i].key
    if (!data.checkpoints[prev].completed) return false
  }
  return true
}

function recalcProgress(cp) {
  const total = steps.length
  const done = steps.reduce((acc, s) => acc + (cp[s.key]?.completed ? 1 : 0), 0)
  return Math.round((done / total) * 100)
}

// Get reports filtered by search only (for "All" button count)
const filteredBySearch = computed(() => {
  let rows = [...reports.value]
  
  if (search.value.trim()){
    const q = search.value.trim().toLowerCase()
    rows = rows.filter(r => {
      const reportId = String(r.data.reportId || '').toLowerCase()
      const speciesName = String(r.data.speciesName || '').toLowerCase()
      const incidentType = String(r.data.incidentType || '').toLowerCase()
      return reportId.includes(q) || speciesName.includes(q) || incidentType.includes(q)
    })
  }
  
  return rows
})

const filteredByStage = computed(() => {
  let rows = [...filteredBySearch.value]
  
  // Filter by stage
  if (stageFilter.value !== 'all') {
    rows = rows.filter(r => {
      const cp = r.data.checkpoints
      switch(stageFilter.value) {
        case 'arriving':
          return !cp?.arrived?.completed
        case 'handling':
          return cp?.arrived?.completed && !cp?.handled?.completed
        case 'treating':
          return cp?.handled?.completed && !cp?.treated?.completed
        case 'recovery':
          return cp?.treated?.completed && !cp?.reconciled?.completed
        default:
          return true
      }
    })
  }
  
  return rows
})

const sortedReports = computed(() => {
  const rows = [...filteredByStage.value]
  
  switch(sortBy.value) {
    case 'urgency':
      return rows.sort((a, b) => {
        const order = { high: 0, medium: 1, moderate: 1, low: 2 }
        const severityA = order[a.data.severity] ?? 1
        const severityB = order[b.data.severity] ?? 1
        return severityA - severityB
      })
    case 'progress':
      return rows.sort((a, b) => {
        const progressA = a.data.progressPercentage ?? 0
        const progressB = b.data.progressPercentage ?? 0
        return progressA - progressB
      })
    case 'time':
      return rows.sort((a, b) => {
        const timeA = a.data.acceptedAt?.seconds ?? a.data.lastUpdated?.seconds ?? 0
        const timeB = b.data.acceptedAt?.seconds ?? b.data.lastUpdated?.seconds ?? 0
        return timeB - timeA
      })
    default:
      return rows
  }
})

const displayedReports = computed(() => {
  return sortedReports.value
})

async function markComplete(r, key) {
  currentAction = { report: r, key }
  // show first to avoid timing issues
  modalVisible.value = true
  modalWarning.value = ''
  if (key === 'arrived'){
    modalTitle.value = 'Mark Arrived at Location'
    modalFields.value = [ { key:'notes', label:'Notes', type:'textarea', required:true, placeholder:'Describe what you found at the scene...' } ]
  } else if (key === 'handled'){
    modalTitle.value = 'Mark Animal Handled'
    modalFields.value = [
      { key:'condition', label:'Condition', type:'text', required:true, placeholder:'e.g., Injured left wing, alert' },
      { key:'notes', label:'Notes', type:'textarea', required:true, placeholder:'Describe how you secured the animal...' }
    ]
  } else if (key === 'treated'){
    modalTitle.value = 'Mark Treatment Received'
    modalFields.value = [
      { key:'diagnosis', label:'Diagnosis', type:'text', required:true, placeholder:'e.g., Fractured tibia' },
      { key:'treatment', label:'Treatment Details', type:'textarea', required:true, placeholder:'Describe the treatment provided...' },
      { key:'notes', label:'Notes', type:'textarea', required:false, placeholder:'Additional observations...' }
    ]
  } else if (key === 'reconciled'){
    modalTitle.value = 'Finalize Reconciliation'
    modalWarning.value = '⚠️ This will mark the report as RESOLVED'
    modalFields.value = [
      { key:'outcome', label:'Outcome', type:'select', required:true, options:[
        { value:'released', label:'Released to Wild' },
        { value:'rehomed', label:'Rehomed/Adopted' },
        { value:'deceased', label:'Deceased' },
        { value:'transferred', label:'Transferred to Wildlife Center' },
        { value:'reunited_with_owner', label:'Reunited with Owner' },
        { value:'other', label:'Other' }
      ] },
      { key:'notes', label:'Detailed Notes', type:'textarea', required:true, placeholder:'Provide final outcome details...' }
    ]
  }
}

async function onSubmitModal(payload){
  const { report: r, key } = currentAction
  if (!r || !key) {
    return
  }
  
  try {
    modalSubmitting.value = true
    updatingId.value = r.id

    // 1) Update activeStatusSummary: Store checkpoint data including outcome
    // This updates checkpoints.reconciled.outcome in activeStatusSummary collection
    const docRef = doc(db, 'activeStatusSummary', r.id)
    const updateData = {
      [`checkpoints.${key}.completed`]: true,
      [`checkpoints.${key}.completedAt`]: Timestamp.now(),
      lastUpdated: serverTimestamp(),
    }
    // Add all payload fields (outcome, notes, etc.) to the checkpoint
    Object.keys(payload || {}).forEach((fieldKey) => {
      updateData[`checkpoints.${key}.${fieldKey}`] = payload[fieldKey]
    })

    // Recalculate progress based on current server snapshot merged with this update
    const snap = await getDoc(docRef)
    const currentData = snap.data() || {}
    const cp = { ...(currentData.checkpoints || {}) }
    cp[key] = { ...(cp[key] || {}), ...payload, completed: true, completedAt: Timestamp.now() }
    const done = ['arrived','handled','treated','reconciled'].reduce((acc, k) => acc + (cp?.[k]?.completed ? 1 : 0), 0)
    updateData.progressPercentage = Math.round((done / 4) * 100)

    // Update activeStatusSummary with reconciled checkpoint data (including outcome)
    await updateDoc(docRef, updateData)

    // 2) If reconciled checkpoint is completed with outcome, update incidentReports status to 'resolved'
    // This ensures both collections are synchronized:
    // - activeStatusSummary: checkpoints.reconciled.outcome is stored
    // - incidentReports: status is set to 'resolved'
    if (key === 'reconciled' && payload?.outcome){
      const q2 = query(collection(db, 'incidentReports'), where('reportId','==', r.data.reportId))
      const rs = await getDocs(q2)
      const first = rs.docs[0]
      if (first){
        // Update incidentReports: Set status to 'resolved' and add resolvedAt timestamp
        await updateDoc(doc(db, 'incidentReports', first.id), {
          status: 'resolved',
          resolvedAt: Timestamp.now(),
        })
        // Also call backend API to ensure status update persists (handles any client-side rule restrictions)
        try {
          await api.updateReportFields(first.id, { status: 'resolved' })
        } catch (err) { 
          console.warn('Backend status update failed (non-critical):', err)
        }
      }
      // Immediately remove locally and show success toast, and close details modal
      reports.value = reports.value.filter(rep => rep.id !== r.id)
      modalVisible.value = false
      showDetailsModal.value = false
      selectedReport.value = null
      document.body.style.overflow = ''
      // Optional: keep toast if desired
      // showResolvedToast(r.data.reportId)
      showCenteredSuccess(r.data.reportId)
    }

    if (key !== 'reconciled') {
      showToast('✓ Checkpoint updated successfully')
      modalVisible.value = false
    }
    
    // Refresh the selected report in the details modal if it's open
    if (showDetailsModal.value && selectedReport.value && selectedReport.value.id === r.id) {
      // The onSnapshot will automatically update the report, but we need to refresh the selectedReport
      // Find the updated report in the reports array
      const updatedReport = reports.value.find(report => report.id === r.id)
      if (updatedReport) {
        selectedReport.value = updatedReport
      }
    }
  } catch (error) {
    showToast('Failed to update checkpoint: ' + (error?.message || 'Unknown error'), true)
  } finally {
    modalSubmitting.value = false
    updatingId.value = ''
    currentAction = { report:null, key:'' }
  }
}

function onCloseModal(){ modalVisible.value = false }

async function resolveIncident(reportId){
  try {
    const { getDocs } = await import('firebase/firestore')
    const q2 = query(collection(db, 'incidentReports'), where('reportId','==', reportId))
    const snap = await getDocs(q2)
    const first = snap.docs[0]
    if (first){ await updateDoc(doc(db,'incidentReports', first.id), { status:'resolved' }) }
  } catch(e){ console.warn('Failed to resolve incidentReports:', e?.message) }
}

onMounted(async () => {
  const user = await getCurrentUser()
  if (!user) {
    loading.value = false
    return
  }
  const q = query(collection(db, 'activeStatusSummary'), where('volunteerID', '==', user.uid))
  unsubRef.value = onSnapshot(q, async (snap) => {
    const rows = []
    snap.forEach((d) => {
      const data = d.data()
      const cp = data?.checkpoints
      const hasStructure = !!(cp && typeof cp === 'object' &&
        cp.hasOwnProperty('arrived') &&
        cp.hasOwnProperty('handled') &&
        cp.hasOwnProperty('treated') &&
        cp.hasOwnProperty('reconciled'))
      if (!hasStructure) {
        console.warn('[ActiveReports] Skipping doc without full checkpoints structure:', d.id, data?.checkpoints)
        return
      }
      
      // Filter out 100% completed reports (they should be in Past Reports)
      const progress = data.progressPercentage ?? 0
      const isReconciled = data.checkpoints?.reconciled?.completed === true
      if (progress >= 100 || isReconciled) {
        return // Skip completed reports
      }
      
      rows.push({ id: d.id, data })
    })
    
    // Enrich each report with data from incidentReports
    const enrichedReports = await Promise.all(
      rows.map(async (report) => {
        try {
          const incidentQuery = query(
            collection(db, 'incidentReports'),
            where('reportId', '==', report.data.reportId)
          )
          const incidentSnapshot = await getDocs(incidentQuery)
          
          if (!incidentSnapshot.empty) {
            const incidentData = incidentSnapshot.docs[0].data()
            return {
              ...report,
              data: {
                ...report.data,
                speciesName: incidentData.speciesName || null,
                incidentType: incidentData.incidentType || null,
                location: incidentData.location || null,
                severity: incidentData.severity || 'medium'
              }
            }
          }
          return report
        } catch (error) {
          console.error('Error fetching incident data for', report.data.reportId, error)
          return report
        }
      })
    )
    
    reports.value = enrichedReports
    // If a caseId is provided in URL, auto-open its details once data is ready
    if (initialCaseId.value) {
      const target = reports.value.find(r => r.data.reportId === initialCaseId.value)
      if (target) {
        openDetailsModal(target)
        // Optional: clean the URL so the modal doesn't reopen on refresh
        router.replace({ path: router.currentRoute.value.path })
        initialCaseId.value = ''
      }
    }
    loading.value = false
  }, (err) => {
    console.error(err)
    loading.value = false
  })
})

// Handle ESC key to close modal
let escKeyHandler = null
onMounted(() => {
  escKeyHandler = (e) => {
    if (e.key === 'Escape' && showDetailsModal.value) {
      closeDetailsModal()
    }
  }
  window.addEventListener('keydown', escKeyHandler)
})

// Watch for report updates and sync selectedReport
watch(reports, (newReports) => {
  if (showDetailsModal.value && selectedReport.value) {
    const updatedReport = newReports.find(r => r.id === selectedReport.value.id)
    if (updatedReport) {
      selectedReport.value = updatedReport
    }
  }
}, { deep: true })

onBeforeUnmount(() => {
  if (unsubRef.value) unsubRef.value()
  if (escKeyHandler) {
    window.removeEventListener('keydown', escKeyHandler)
  }
  // Restore body scroll if modal was open
  document.body.style.overflow = ''
})

function showToast(message, isError=false){
  const id = Math.random().toString(36).slice(2)
  const toast = { id, message, type: isError ? 'error' : 'info', position: toastPosition.value, entering: true, leaving: false, duration: 2500 }
  toasts.value.push(toast)
  setTimeout(() => { toast.entering = false }, 10)
  setTimeout(() => dismissToast(id), toast.duration)
}

function showResolvedToast(caseId){
  toastPosition.value = 'top-center'
  const message = `Case ${caseId} Successfully Resolved! Thank you for your dedication in helping this animal reach a safe outcome. Your efforts make a real difference in wildlife conservation.`
  const id = Math.random().toString(36).slice(2)
  const toast = { id, message, type: 'success', position: 'top-center', entering: true, leaving: false, duration: 5000 }
  toasts.value.push(toast)
  setTimeout(() => { toast.entering = false }, 10)
  setTimeout(() => dismissToast(id), toast.duration)
}

function dismissToast(id){
  const t = toasts.value.find(x => x.id === id)
  if (!t) return
  t.leaving = true
  setTimeout(() => {
    toasts.value = toasts.value.filter(x => x.id !== id)
  }, 200)
}

const toastPositionClass = computed(() => {
  return toastPosition.value === 'top-center' ? 'top-center' : 'bottom-right'
})

function showCenteredSuccess(caseId){
  lastResolvedCaseId.value = caseId
  successVisible.value = true
  // Focus trap entry: focus the card after paint
  setTimeout(() => {
    successCardRef.value?.focus()
  }, 10)
  // Auto dismiss after 4s
  clearSuccessTimeout()
  _successTimer = window.setTimeout(() => hideSuccess(), 4000)
}

let _successTimer = null
function clearSuccessTimeout(){
  if (_successTimer){
    clearTimeout(_successTimer)
    _successTimer = null
  }
}

function hideSuccess(){
  clearSuccessTimeout()
  successVisible.value = false
}

/* 
 * DEBUG SCRIPT - Run this in browser console to find wide elements:
 * 
 * const findWideElements = () => {
 *   const all = document.querySelectorAll('*');
 *   const wide = [];
 *   all.forEach(el => {
 *     if (el.scrollWidth > window.innerWidth) {
 *       wide.push({
 *         element: el,
 *         width: el.scrollWidth,
 *         viewport: window.innerWidth,
 *         tagName: el.tagName,
 *         classes: el.className,
 *         id: el.id
 *       });
 *     }
 *   });
 *   console.table(wide);
 *   return wide;
 * };
 * findWideElements();
 */
</script>

<style scoped>
/* Prevent horizontal overflow - Nuclear fix */
* {
  box-sizing: border-box !important;
}

/* Root container - ensure no overflow */
.container-fluid {
  width: 100% !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

.reporterDashboard {
  width: 100% !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

/* Green header banner - matching common.css */
#topBanner,
.bannerTitles {
  width: 100% !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 20px !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
  background-color: #285436 !important;
}

.bannerTitles header {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

.bannerTitles h1 {
  margin-top: 20px !important;
  margin-bottom: 0 !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

.bannerTitles .hero-subtitle,
.bannerTitles p {
  font-weight: 200 !important;
  color: rgb(254, 250, 224) !important;
  font-size: 20px !important;
  margin-top: 8px !important;
  margin-bottom: 0 !important;
}

/* Report Container */
.report-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 80px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Responsive padding for smaller screens */
@media (max-width: 1200px) {
  .report-container {
    padding: 40px 60px;
  }
}

@media (max-width: 768px) {
  .report-container {
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .report-container {
    padding: 30px 20px;
  }
}

/* Controls Section */
.controls {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
}

/* Search Bar - Matching Guidebook Style */
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
  cursor: pointer;
}

#searchBtn:hover {
  background-color: #a8c686;
  color: #285436;
}

.select { 
  height: 36px;
  border: 1px solid #dbe5d9; 
  border-radius: 8px; 
  padding: 8px 12px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.select:focus {
  outline: none;
  border-color: #5a7a5a;
  box-shadow: 0 0 0 3px rgba(90, 122, 90, 0.1);
}

/* Controls Section - Clean Standard Style */
.controls-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  width: 100%;
  max-width: 100%;
}

.sort-group,
.filter-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-right: 8px;
  white-space: nowrap;
}

/* Clean, simple button style */
.control-btn {
  padding: 9px 18px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

/* Hover - subtle green hint */
.control-btn:hover:not(.active) {
  border-color: #5a7a5a;
  color: #5a7a5a;
  background: #fafafa;
}

/* Active - clean green with white text */
.control-btn.active {
  background: #5a7a5a !important;
  border-color: #5a7a5a !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(90, 122, 90, 0.25);
}

/* Pressed effect */
.control-btn:active {
  transform: scale(0.98);
}

/* Loading & Empty States */
.loading-box, .empty-state { 
  background: #FEFAE0; 
  border: 1px solid #285436; 
  color: #285436; 
  padding: 16px 20px; 
  border-radius: 12px; 
  text-align: center;
  font-size: 14px;
}

/* Reports Grid - Flexible Card Layout */
.reports-grid {
  display: grid;
  gap: 20px;
  width: 100%;
  max-width: 100%;
  padding: 0;
  box-sizing: border-box;
  margin: 0;
  overflow-x: hidden;
  align-items: start; /* Cards align to top */
}

/* Desktop - 4 columns */
@media (min-width: 1200px) {
  .reports-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Tablet - 3 columns */
@media (min-width: 900px) and (max-width: 1199px) {
  .reports-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Small tablet - 2 columns */
@media (min-width: 600px) and (max-width: 899px) {
  .reports-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile - 1 column */
@media (max-width: 599px) {
  .reports-grid {
    grid-template-columns: 1fr;
    padding: 16px 0;
    gap: 12px;
  }
}

/* Flexible Card Styling */
.report-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-left: 4px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* Flexible height - allow cards to grow */
  min-height: 240px;
  height: auto;
}

/* Severity-based left border - only for actual severity */
.report-card[data-severity="high"] {
  border-left-color: #f44336;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.15);
}

.report-card[data-severity="high"]:hover {
  border-left-color: #d32f2f;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
  transform: translateY(-2px);
}

.report-card[data-severity="medium"],
.report-card[data-severity="moderate"] {
  border-left-color: #ff9800;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}

.report-card[data-severity="medium"]:hover,
.report-card[data-severity="moderate"]:hover {
  border-left-color: #f57c00;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
  transform: translateY(-2px);
}

.report-card[data-severity="low"] {
  border-left-color: #4caf50;
}

.report-card[data-severity="low"]:hover {
  border-left-color: #388e3c;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
  transform: translateY(-2px);
}

/* Default hover for cards without severity - use green, not orange */
.report-card:not([data-severity]):hover {
  border-left-color: #5a7a5a;
  box-shadow: 0 4px 12px rgba(90, 122, 90, 0.15);
  transform: translateY(-2px);
}

/* General hover enhancement for all cards */
.report-card:hover {
  transform: translateY(-2px);
}

.report-id {
  font-size: 15px;
  font-weight: 600;
  color: #2d5016;
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  flex-grow: 0;
}

/* Animal Info Styling */
.animal-info {
  font-size: 14px;
  margin-bottom: 8px;
  color: #666;
  line-height: 1.4;
  flex-grow: 0;
}

.species {
  font-weight: 600;
  color: #333;
}

.incident-type {
  font-style: italic;
  color: #999;
  font-size: 13px;
}

/* Location Styling */
.location {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
  flex-grow: 0;
}

/* Status Badge */
.status-badge-wrapper {
  margin-bottom: 16px;
  flex-grow: 0;
}

.status-pill {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-pill.status-in-progress {
  background: #eaf5ea;
  color: #285436;
  border: 1px solid #cfe6cf;
}

.status-pill.status-near-complete {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

/* Progress Section */
.progress-section {
  margin-bottom: 12px;
  flex-grow: 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #eef3ee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid #dbe5d9;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #5a7a5a, #7aa87a);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 18px;
  font-weight: 600;
  color: #5a7a5a;
}

/* Timestamp */
.timestamp {
  font-size: 12px;
  color: #666;
  margin-bottom: 16px;
  flex-grow: 1; /* Takes up remaining space */
}

/* View Details Button */
.view-details-btn {
  width: 100%;
  padding: 10px;
  background: #5a7a5a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: auto; /* Push button to bottom */
  flex-grow: 0;
}

.view-details-btn:hover {
  background: #4a6a4a;
}

.view-original-btn {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: white;
  color: #285436;
  border: 2px dashed #cfe6cf;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.view-original-btn:hover {
  background: #f6fbf6;
  border-color: #5a7a5a;
  color: #1f3b2a;
}

.doc-icon { font-size: 16px; }

/* Details Modal - Modern Design */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.2s ease;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Container */
.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  box-sizing: border-box;
  overflow: hidden;
}

/* Modal fade transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Centered Success Modal Styles */
.success-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; }
.success-card { width: 480px; max-width: 90vw; background: #fff; border-radius: 16px; padding: 48px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.15); outline: none; }
.success-icon { width: 64px; height: 64px; border-radius: 50%; background: #E8F5E9; color: #4CAF50; font-size: 48px; font-weight: 800; display:inline-flex; align-items:center; justify-content:center; margin: 0 auto; }
.success-title { font-size: 28px; font-weight: 600; color: #2C3E50; margin-top: 24px; }
.success-body { font-size: 16px; line-height: 1.6; color: #5A6C7D; margin-top: 16px; max-width: 380px; margin-left:auto; margin-right:auto; }
.success-case { font-size: 14px; font-weight: 500; color: #8B9CAD; margin-top: 24px; }
.success-button { margin-top: 24px; padding: 10px 20px; background: #5a7a5a; color:#fff; border:none; border-radius:8px; cursor:pointer; }

/* Entry/Exit animations */
.success-backdrop-enter-active { animation: sb-fade-in .2s forwards; }
.success-backdrop-leave-active { animation: sb-fade-out .2s forwards; }
@keyframes sb-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes sb-fade-out { from { opacity: 1; } to { opacity: 0; } }

.success-card-enter-active { animation: sc-in .3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.success-card-leave-active { animation: sc-out .2s ease forwards; }
@keyframes sc-in { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }
@keyframes sc-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(.95); } }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.report-id {
  font-size: 18px;
  font-weight: 700;
  color: #2d5016;
  margin: 0 0 4px 0;
}

.report-meta {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: #999;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: #f5f5f5;
  color: #333;
}

/* Progress Section */
.progress-section {
  padding: 18px 20px;
  background: linear-gradient(to bottom, #f9fdf9, white);
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.progress-percentage {
  font-size: 24px;
  font-weight: 700;
  color: #5a7a5a;
}

.progress-bar-track {
  height: 10px;
  background: #e8f0e8;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(to right, #5a7a5a, #7aa87a);
  border-radius: 5px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-status {
  font-size: 13px;
  color: #666;
  margin: 0;
  font-style: italic;
}

/* Timeline Section */
.timeline-section {
  padding: 20px 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

/* Vertical connecting line */
.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 19px;
  top: 40px;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item.completed::after {
  background: #5a7a5a;
}

/* Timeline Icon (circle) */
.timeline-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s;
  z-index: 1;
}

/* Not completed - gray circle */
.timeline-item:not(.completed):not(.current) .timeline-icon {
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  color: #999;
}

/* Completed - solid green circle with checkmark */
.timeline-item.completed .timeline-icon {
  background: #5a7a5a;
  border: 2px solid #5a7a5a;
  color: white;
}

.icon-check {
  font-size: 20px;
  line-height: 1;
}

/* Current step - white circle with green border */
.timeline-item.current .timeline-icon {
  background: white;
  border: 3px solid #5a7a5a;
  color: #5a7a5a;
  box-shadow: 0 0 0 4px rgba(90, 122, 90, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(90, 122, 90, 0.1);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(90, 122, 90, 0.05);
  }
}

.icon-number {
  font-size: 16px;
  line-height: 1;
}

/* Timeline Content */
.timeline-content {
  flex: 1;
  padding-top: 4px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.timeline-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.timeline-timestamp {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

/* Details Box (for completed checkpoints) */
.timeline-details {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px 14px;
  margin-top: 10px;
  border: 1px solid #f0f0f0;
}

.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #666;
  min-width: 85px;
  flex-shrink: 0;
}

.detail-value {
  color: #333;
  flex: 1;
}

/* Mark Complete Button */
.mark-complete-btn {
  margin-top: 12px;
  padding: 10px 20px;
  background: #5a7a5a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mark-complete-btn:hover:not(:disabled) {
  background: #4a6a4a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(90, 122, 90, 0.3);
}

.mark-complete-btn:active:not(:disabled) {
  transform: translateY(0);
}

.mark-complete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Pending Text */
.pending-text {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  color: #999;
  font-style: italic;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
  flex-shrink: 0;
}

.secondary-button {
  flex: 1;
  padding: 12px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.secondary-button:hover {
  border-color: #5a7a5a;
  color: #5a7a5a;
  background: #fafafa;
}

.primary-button {
  padding: 12px 32px;
  background: #5a7a5a;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button:hover {
  background: #4a6a4a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(90, 122, 90, 0.3);
}

.primary-button:active {
  transform: translateY(0);
}


/* Spinner for loading state */
.spinner { 
  width: 14px; 
  height: 14px; 
  border: 2px solid rgba(255,255,255,.4); 
  border-top-color: #fff; 
  border-radius: 50%; 
  display: inline-block; 
  animation: spin .7s linear infinite; 
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

/* Toast Notifications */
.toast-stack { 
  position: fixed; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  z-index: 3000; 
  pointer-events: none;
}
.toast-stack.bottom-right { right: 18px; bottom: 18px; }
.toast-stack.top-center { left: 50%; top: 16px; transform: translateX(-50%); align-items: center; }

.toast { 
  background: #285436; 
  color: #FEFAE0; 
  border: 1px solid #285436; 
  padding: 12px 16px; 
  border-radius: 10px; 
  min-width: 260px; 
  max-width: 720px;
  box-shadow: 0 6px 16px rgba(0,0,0,.2); 
  font-size: 14px;
  display: flex; align-items: center; gap: 10px;
  pointer-events: auto;
  transition: transform .2s ease, opacity .2s ease;
}
.toast.entering { transform: translateY(-8px); opacity: 0; }
.toast.entering:not(.leaving) { transform: translateY(0); opacity: 1; }
.toast.leaving { opacity: 0; }

.toast.success { 
  background: #E8F5E9; 
  color: #1b5e20; 
  border: 2px solid #4CAF50; 
  border-radius: 8px;
}
.toast-icon { color: #2e7d32; font-weight: 800; }
.toast-message { flex: 1; }
.toast-close { background: transparent; border: none; color: #2e7d32; font-size: 18px; cursor: pointer; }
.toast.error { background: #b91c1c; border-color: #7f1d1d; color: #fff; }

/* Responsive Design */
@media (max-width: 599px) {
  .report-container {
    padding: 0 16px 2rem 16px;
    max-width: 100vw;
  }
  
  .container-fluid,
  .reporterDashboard {
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }
  
  #topBanner,
  .bannerTitles {
    padding: 20px !important;
    max-width: 100vw !important;
  }
  
  .bannerTitles h1 {
    font-size: 40px !important;
    margin-top: 20px !important;
  }
  
  .bannerTitles .hero-subtitle,
  .bannerTitles p {
    font-size: 20px !important;
  }
  
  .search-section {
    margin: 20px 0 15px 0;
  }
  
  .search-bar {
    width: 90%;
    max-width: 100%;
  }
  
  #searchInput {
    max-width: 100%;
  }
  
  .report-card {
    padding: 16px;
    min-height: 180px;
    height: auto; /* Flexible height on mobile too */
    max-width: 100%;
  }
  
  .reports-grid {
    padding: 16px 0;
    gap: 12px;
    max-width: 100%;
  }
}

/* Responsive Modal Styles */
@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
    max-width: 95vw;
  }
  
  .modal-header {
    padding: 20px 16px;
  }
  
  .progress-section {
    padding: 20px 16px;
  }
  
  .timeline-section {
    padding: 24px 16px;
  }
  
  .modal-footer {
    flex-direction: column;
    padding: 16px;
  }
  
  .secondary-button,
  .primary-button {
    width: 100%;
  }
  
  .timeline-item {
    padding-bottom: 24px;
  }
}
</style>


