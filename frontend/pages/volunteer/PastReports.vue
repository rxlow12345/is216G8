<template>
  <div class="container-fluid p-0 reporterDashboard">
    <div id="topBanner" class="bannerTitles">
      <header class="text-center mb-2">
        <h1>🎉 Your Rescue Impact</h1>
      </header>
    </div>

    <main class="report-container">
      <div class="controls">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input class="search" v-model="search" placeholder="Search by Report ID" />
        </div>
      </div>

      <div v-if="!loading && resolvedReports.length > 0" class="controls-section">
        <div class="filter-group">
          <button 
            @click="timeFilter = 'all'" 
            :class="{ active: timeFilter === 'all' }"
            class="control-btn"
          >
            All time
          </button>
          <button 
            @click="timeFilter = '7days'" 
            :class="{ active: timeFilter === '7days' }"
            class="control-btn"
          >
            Last 7 days
          </button>
          <button 
            @click="timeFilter = '30days'" 
            :class="{ active: timeFilter === '30days' }"
            class="control-btn"
          >
            Last 30 days
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-box">Loading past reports...</div>

      <div v-else-if="resolvedReports.length === 0" class="empty-state">
        <p>No resolved reports yet.</p>
      </div>

      <div v-else>
        <!-- Statistics Cards -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-number">{{ totalResolved }}</div>
            <div class="stat-label">Animals Saved</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ avgResolutionTime }}</div>
            <div class="stat-label">Avg. Resolution Time</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ releasedPercentage }}%</div>
            <div class="stat-label">Released to Wild</div>
          </div>
        </div>

        <!-- Section Header -->
        <div class="section-header">
          <h2>Recent Success Stories</h2>
          <button @click="showAllReports" class="view-all-link">View All →</button>
        </div>

        <!-- Success Stories -->
        <div class="success-stories">
          <div 
            v-for="report in displayedReports" 
            :key="report.id"
            class="success-story"
          >
            <div class="story-header">
              <span class="animal-emoji">{{ getAnimalEmoji(report.data.speciesName) }}</span>
              <span class="story-title">
                {{ report.data.speciesName || 'Unknown Animal' }} → {{ getFinalOutcome(report.data) }}
              </span>
              <span class="outcome-emoji">{{ getOutcomeEmoji(report.data) }}</span>
            </div>
            
            <div class="story-meta">
              <span class="meta-item">{{ report.data.reportId }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-item">{{ formatLocation(report.data.location?.address) }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-item">{{ getResolutionDays(report.data) }} days</span>
              <span class="meta-separator">•</span>
              <span class="meta-item">{{ formatRelativeTime(report.data.checkpoints?.reconciled?.completedAt) }}</span>
            </div>
            
            <button @click="viewTimeline(report)" class="view-timeline-btn">
              View Timeline
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Timeline Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal" @keydown.esc="closeDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="report-id">{{ selectedReport?.data?.reportId || '' }}</h2>
          <button @click="closeDetailsModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          {{ selectedReport?.data?.speciesName || 'Unknown Animal' }} • {{ formatLocation(selectedReport?.data?.location?.address) }}
        </div>
        <div class="timeline-container">
          <!-- Timeline items -->
          <div class="timeline-item" :class="{ completed: selectedReport?.data?.checkpoints?.arrived?.completed }">
            <div class="timeline-icon">
              <span v-if="selectedReport?.data?.checkpoints?.arrived?.completed" class="icon-check">✓</span>
              <span v-else class="icon-number">1</span>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">Arrived at Location</span>
                <span v-if="selectedReport?.data?.checkpoints?.arrived?.completedAt" class="timeline-timestamp">
                  {{ formatRelativeTime(selectedReport.data.checkpoints.arrived.completedAt) }}
                </span>
              </div>
              <div v-if="selectedReport?.data?.checkpoints?.arrived?.notes" class="timeline-details">
                <span class="detail-value">{{ selectedReport.data.checkpoints.arrived.notes }}</span>
              </div>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: selectedReport?.data?.checkpoints?.handled?.completed }">
            <div class="timeline-icon">
              <span v-if="selectedReport?.data?.checkpoints?.handled?.completed" class="icon-check">✓</span>
              <span v-else class="icon-number">2</span>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">Animal Handled</span>
                <span v-if="selectedReport?.data?.checkpoints?.handled?.completedAt" class="timeline-timestamp">
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
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: selectedReport?.data?.checkpoints?.treated?.completed }">
            <div class="timeline-icon">
              <span v-if="selectedReport?.data?.checkpoints?.treated?.completed" class="icon-check">✓</span>
              <span v-else class="icon-number">3</span>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">Treatment Received</span>
                <span v-if="selectedReport?.data?.checkpoints?.treated?.completedAt" class="timeline-timestamp">
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
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: selectedReport?.data?.checkpoints?.reconciled?.completed }">
            <div class="timeline-icon">
              <span v-if="selectedReport?.data?.checkpoints?.reconciled?.completed" class="icon-check">✓</span>
              <span v-else class="icon-number">4</span>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">Reconciliation Complete</span>
                <span v-if="selectedReport?.data?.checkpoints?.reconciled?.completedAt" class="timeline-timestamp">
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <BackToTop/>
  </div>
</template>

<script setup>
import '../css/common.css'
import BackToTop from '../../src/components/BackToTop.vue';
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { db } from '../../src/firebase.js'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { getCurrentUser } from '../../src/api/auth.js'

const loading = ref(true)
const reports = ref([])
const unsubRef = ref(null)
const search = ref('')
const timeFilter = ref('all')
const showDetailsModal = ref(false)
const selectedReport = ref(null)

const resolvedReports = computed(() => {
  return reports.value.map(r => ({ id: r.id, data: r.data }))
})

const totalResolved = computed(() => resolvedReports.value.length)

const avgResolutionTime = computed(() => {
  if (resolvedReports.value.length === 0) return '0 days'
  const totalDays = resolvedReports.value.reduce((sum, report) => {
    return sum + getResolutionDays(report.data)
  }, 0)
  const avg = Math.round(totalDays / resolvedReports.value.length)
  return `${avg} days`
})

const releasedPercentage = computed(() => {
  if (resolvedReports.value.length === 0) return 0
  const released = resolvedReports.value.filter(report => {
    const outcome = (report.data.checkpoints?.reconciled?.outcome || '').toLowerCase()
    return outcome.includes('release')
  }).length
  return Math.round((released / resolvedReports.value.length) * 100)
})

function getResolutionDays(reportData) {
  const start = reportData.acceptedAt?.seconds ? reportData.acceptedAt.seconds * 1000 : (reportData.acceptedAt?.toMillis ? reportData.acceptedAt.toMillis() : Date.now())
  const end = reportData.checkpoints?.reconciled?.completedAt?.seconds ? reportData.checkpoints.reconciled.completedAt.seconds * 1000 : (reportData.checkpoints?.reconciled?.completedAt?.toMillis ? reportData.checkpoints.reconciled.completedAt.toMillis() : Date.now())
  return Math.round((end - start) / (1000 * 60 * 60 * 24))
}

function getAnimalEmoji(speciesName) {
  const name = (speciesName || '').toLowerCase()
  if (name.includes('cat')) return '🐱'
  if (name.includes('dog')) return '🐕'
  if (name.includes('bird')) return '🐦'
  if (name.includes('snake')) return '🐍'
  if (name.includes('monkey')) return '🐒'
  if (name.includes('turtle')) return '🐢'
  if (name.includes('squirrel')) return '🐿️'
  return '🐾'
}

function getOutcomeEmoji(reportData) {
  const outcome = (reportData.checkpoints?.reconciled?.outcome || '').toLowerCase()
  if (outcome.includes('release')) return '✨'
  if (outcome.includes('rehome')) return '🏡'
  if (outcome.includes('sanctuary')) return '🌿'
  return '✅'
}

function getFinalOutcome(reportData) {
  return formatOutcome(reportData.checkpoints?.reconciled?.outcome) || 'Resolved'
}

function formatLocation(address) {
  if (!address) return 'Unknown Location'
  const firstPart = address.split(',')[0]
  return firstPart.replace(/\d+/g, '').trim() || 'Singapore'
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const now = Date.now()
  let then
  if (timestamp.seconds) {
    then = timestamp.seconds * 1000
  } else if (timestamp.toMillis) {
    then = timestamp.toMillis()
  } else if (timestamp instanceof Timestamp) {
    then = timestamp.toMillis()
  } else {
    then = new Date(timestamp).getTime()
  }
  const diff = now - then
  
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days/7)}w ago`
  return `${Math.floor(days/30)}mo ago`
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

function viewTimeline(report) {
  selectedReport.value = report
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedReport.value = null
}

function showAllReports() {
  search.value = ''
  timeFilter.value = 'all'
}

function isWithinTimeRange(resolvedDate, days) {
  if (!resolvedDate) return false
  const date = resolvedDate instanceof Timestamp ? resolvedDate.toDate() : new Date(resolvedDate)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return diffDays <= days
}

const displayedReports = computed(() => {
  let rows = [...resolvedReports.value]
  
  // Filter by search
  if (search.value.trim()){
    const q = search.value.trim().toLowerCase()
    rows = rows.filter(r => String(r.data.reportId).toLowerCase().includes(q))
  }
  
  // Filter by time range
  if (timeFilter.value === '7days') {
    rows = rows.filter(r => {
      const resolvedDate = r.data.checkpoints?.reconciled?.completedAt || r.data.lastUpdated
      return isWithinTimeRange(resolvedDate, 7)
    })
  } else if (timeFilter.value === '30days') {
    rows = rows.filter(r => {
      const resolvedDate = r.data.checkpoints?.reconciled?.completedAt || r.data.lastUpdated
      return isWithinTimeRange(resolvedDate, 30)
    })
  }
  
  // Sort by newest (most recently resolved)
  rows.sort((a,b) => {
    const aDate = a.data.checkpoints?.reconciled?.completedAt?.seconds ?? a.data.lastUpdated?.seconds ?? 0
    const bDate = b.data.checkpoints?.reconciled?.completedAt?.seconds ?? b.data.lastUpdated?.seconds ?? 0
    return bDate - aDate
  })
  
  return rows
})

// Add/remove body class to blur navbar when modal is open
watch(showDetailsModal, (isOpen) => {
  if (isOpen) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})

onMounted(async () => {
  const user = await getCurrentUser()
  if (!user) {
    loading.value = false
    return
  }
  const q = query(collection(db, 'activeStatusSummary'), where('volunteerID', '==', user.uid))
  unsubRef.value = onSnapshot(q, (snap) => {
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
        console.warn('[PastReports] Skipping doc without full checkpoints structure:', d.id, data?.checkpoints)
        return
      }
      
      // Only show 100% completed reports (reconciled)
      const progress = data.progressPercentage ?? 0
      const isReconciled = data.checkpoints?.reconciled?.completed === true
      if (progress >= 100 && isReconciled) {
        rows.push({ id: d.id, data })
      }
    })
    // sort by resolved date desc
    rows.sort((a, b) => {
      const aDate = a.data.checkpoints?.reconciled?.completedAt?.seconds ?? a.data.lastUpdated?.seconds ?? 0
      const bDate = b.data.checkpoints?.reconciled?.completedAt?.seconds ?? b.data.lastUpdated?.seconds ?? 0
      return bDate - aDate
    })
    reports.value = rows
    loading.value = false
  }, (err) => {
    console.error(err)
    loading.value = false
  })
})

onBeforeUnmount(() => {
  document.body.classList.remove('modal-open')
  if (unsubRef.value) unsubRef.value()
})
</script>

<style scoped>
/* Header Section */
.bannerTitles {
  width: 100% !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 48px 20px !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
  background: linear-gradient(135deg, #4a6a4a 0%, #5a7a5a 100%) !important;
}

.bannerTitles header {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  text-align: center !important;
}

.bannerTitles h1 {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  color: white !important;
  font-size: 36px !important;
  font-weight: 700 !important;
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

.search-wrapper {
  flex: 0 1 500px;
  position: relative;
  display: flex;
  align-items: center;
  min-width: 280px;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 14px;
  color: #6b7280;
  pointer-events: none;
  z-index: 1;
}

.search { 
  width: 100%;
  height: 36px;
  border: 1px solid #dbe5d9; 
  border-radius: 8px; 
  padding: 8px 8px 8px 32px;
  font-size: 13px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search:focus {
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

.filter-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
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
  margin-top: 40px;
}

/* Statistics Cards */
.stats-container {
  display: flex;
  gap: 24px;
  margin: 40px 0 32px;
}

.stat-card {
  flex: 1;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 28px 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.stat-number {
  font-size: 40px;
  font-weight: 700;
  color: #5a7a5a;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.view-all-link {
  background: none;
  border: none;
  color: #5a7a5a;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  padding: 0;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* Success Stories */
.success-stories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.success-story {
  background: white;
  border: 1px solid #e0e0e0;
  border-left: 4px solid #5a7a5a;
  border-radius: 8px;
  padding: 20px 24px;
  transition: all 0.2s ease;
}

.success-story:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.story-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.animal-emoji {
  font-size: 24px;
}

.story-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.outcome-emoji {
  font-size: 20px;
}

.story-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
}

.meta-item {
  white-space: nowrap;
}

.meta-separator {
  color: #ddd;
}

.view-timeline-btn {
  padding: 8px 18px;
  background: white;
  border: 2px solid #5a7a5a;
  color: #5a7a5a;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-timeline-btn:hover {
  background: #5a7a5a;
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header .report-id {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 12px 20px;
  color: #666;
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
}

.timeline-container {
  padding: 16px 20px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 14px;
  top: 36px;
  bottom: -20px;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item.completed::after {
  background: #5a7a5a;
}

.timeline-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #999;
  font-weight: 600;
}

.timeline-item.completed .timeline-icon {
  background: #5a7a5a;
  color: white;
}

.icon-check {
  font-size: 18px;
  line-height: 1;
}

.icon-number {
  font-size: 14px;
  line-height: 1;
}

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
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.timeline-timestamp {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.timeline-details {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 8px;
  border: 1px solid #f0f0f0;
}

.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1.4;
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

/* Responsive Design */
@media (max-width: 768px) {
  .bannerTitles {
    padding: 32px 16px !important;
  }

  .bannerTitles h1 {
    font-size: 28px !important;
  }
  
  .controls { 
    flex-direction: column; 
    align-items: stretch; 
    gap: 8px;
  }
  
  .search-wrapper {
    flex: 1 1 auto;
  }

  .stats-container {
    flex-direction: column;
    gap: 16px;
    margin: 32px 0 24px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .story-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .meta-separator {
    display: none;
  }
}
</style>

<style>
/* Navbar blur effect when modal is open (non-scoped) */
body.modal-open header {
  filter: blur(2px);
  opacity: 0.6;
  transition: filter 0.2s ease, opacity 0.2s ease;
  pointer-events: none;
}
</style>
