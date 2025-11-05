<template>
  <div class="container-fluid p-0 reporterDashboard">
    <div id="topBanner" class="bannerTitles">
      <header class="header-flex">
        <h1>Past Reports</h1>
        <span v-if="!loading && reports.length > 0" class="report-count">{{ reports.length }} Resolved Cases</span>
      </header>
    </div>

    <main class="report-container">
      <div class="controls">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input class="search" v-model="search" placeholder="Search by Report ID" />
        </div>
        <select class="select" v-model="sortBy">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="recent">Recently resolved</option>
        </select>
        <select class="select" v-model="timeFilter">
          <option value="all">All time</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
        </select>
      </div>
      <div v-if="loading" class="loading-box">Loading past reports...</div>

      <div v-else-if="reports.length === 0" class="empty-state">
        <p>No resolved reports yet.</p>
      </div>

      <div v-else class="cards">
        <section
          v-for="r in displayedReports"
          :key="r.id"
          class="report-card"
        >
          <div class="card-header">
            <div class="report-header-left">
              <div class="report-id">{{ r.data.reportId }}</div>
              <div class="report-meta">
                Resolved {{ formatSince(r.data.checkpoints?.reconciled?.completedAt || r.data.lastUpdated) }}
              </div>
            </div>
            <div class="status-pill status-resolved">✅ Resolved</div>
          </div>

          <div class="outcome-section" v-if="r.data.checkpoints?.reconciled?.outcome">
            <div class="outcome-label">Final Outcome:</div>
            <div class="outcome-value">{{ formatOutcome(r.data.checkpoints.reconciled.outcome) }}</div>
          </div>

          <div class="progress-section">
            <div class="progress-label">100%</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 100%"></div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="toggle-btn" @click="toggle(r.id)">
              {{ expanded.has(r.id) ? 'Hide Details' : 'View Details' }}
            </button>
            <router-link class="view-btn" :to="`/status/${r.data.reportId}`">View Original</router-link>
          </div>

          <transition name="expand">
            <div v-if="expanded.has(r.id)" class="details">
              <div class="step completed" 
                   v-for="(step, idx) in steps" 
                   :key="step.key">
                <div class="step-left">
                  <div class="step-icon-wrapper completed">
                    <span class="check-icon">✓</span>
                  </div>
                  <div class="step-info">
                    <div class="step-title completed">
                      {{ step.title }}
                    </div>
                    <div class="meta completed-meta">
                      <span class="meta-time">📅 Completed {{ formatSince(r.data.checkpoints[step.key]?.completedAt) }}</span>
                      <span v-if="r.data.checkpoints[step.key]?.notes" class="meta-notes">📝 {{ r.data.checkpoints[step.key].notes }}</span>
                      <span v-if="step.key === 'reconciled' && r.data.checkpoints[step.key]?.outcome" class="meta-outcome">
                        🎯 Outcome: {{ formatOutcome(r.data.checkpoints[step.key].outcome) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </section>
      </div>
    </main>
  </div>
  <BackToTop/>
</template>

<script setup>
import '../css/common.css'
import BackToTop from '../../src/components/BackToTop.vue';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { db } from '../../src/firebase.js'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { getCurrentUser } from '../../src/api/auth.js'
import { formatDistanceToNow } from 'date-fns'

const loading = ref(true)
const reports = ref([])
const expanded = ref(new Set())
const unsubRef = ref(null)
const search = ref('')
const sortBy = ref('newest')
const timeFilter = ref('all')

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

function toggle(id) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
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
  let rows = [...reports.value]
  
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
  
  // Sort
  if (sortBy.value === 'oldest') {
    rows.sort((a,b) => {
      const aDate = a.data.checkpoints?.reconciled?.completedAt?.seconds ?? a.data.lastUpdated?.seconds ?? 0
      const bDate = b.data.checkpoints?.reconciled?.completedAt?.seconds ?? b.data.lastUpdated?.seconds ?? 0
      return aDate - bDate
    })
  } else if (sortBy.value === 'recent') {
    rows.sort((a,b) => {
      const aDate = a.data.checkpoints?.reconciled?.completedAt?.seconds ?? a.data.lastUpdated?.seconds ?? 0
      const bDate = b.data.checkpoints?.reconciled?.completedAt?.seconds ?? b.data.lastUpdated?.seconds ?? 0
      return bDate - aDate
    })
  } else {
    // newest (default)
    rows.sort((a,b) => {
      const aDate = a.data.checkpoints?.reconciled?.completedAt?.seconds ?? a.data.lastUpdated?.seconds ?? 0
      const bDate = b.data.checkpoints?.reconciled?.completedAt?.seconds ?? b.data.lastUpdated?.seconds ?? 0
      return bDate - aDate
    })
  }
  
  return rows
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
  if (unsubRef.value) unsubRef.value()
})
</script>

<style scoped>
/* Header Section */
.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-flex h1 {
  font-size: 28px;
  font-weight: bold;
  color: #285436;
  margin: 0;
}

.report-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* Report Container */
.report-container { 
  max-width: 980px; 
  margin: 0 auto; 
  padding: 0 1.5rem 2rem 1.5rem; 
}

/* Controls Section */
.controls { 
  display: flex; 
  gap: 10px; 
  align-items: center; 
  margin-bottom: 16px; 
  flex-wrap: wrap; 
}

.search-wrapper {
  flex: 1 1 280px;
  position: relative;
  display: flex;
  align-items: center;
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

/* Cards */
.cards { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

.report-card {
  background: #ffffff; 
  border: 1px solid #e0e0e0; 
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); 
  padding: 16px; 
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover { 
  transform: translateY(-1px); 
  box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.report-header-left {
  flex: 1;
}

.report-id { 
  font-weight: 600; 
  color: #285436; 
  font-size: 16px; 
  margin-bottom: 4px;
}

.report-meta { 
  color: #6b7280; 
  font-size: 13px; 
}

.outcome-section {
  background: #f0fdf4;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.outcome-label {
  font-weight: 600;
  color: #065f46;
  font-size: 13px;
}

.outcome-value {
  color: #059669;
  font-weight: 500;
  font-size: 13px;
}

/* Progress Section */
.progress-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.progress-label { 
  font-weight: 600; 
  color: #285436; 
  min-width: 38px; 
  text-align: right;
  font-size: 14px;
}

.progress-bar { 
  flex: 1;
  height: 8px; 
  background: #eef3ee; 
  border-radius: 999px; 
  overflow: hidden; 
  border: 1px solid #dbe5d9;
}

.progress-fill { 
  height: 100%; 
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 999px;
}

/* Status Pills */
.status-pill { 
  padding: 6px 12px; 
  border-radius: 999px; 
  font-size: 12px; 
  font-weight: 600; 
  white-space: nowrap; 
  text-align: center;
}

.status-pill.status-resolved {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.toggle-btn { 
  background: #285436; 
  color: #FEFAE0; 
  border: 1px solid #285436; 
  padding: 8px 14px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
}

.toggle-btn:hover { 
  background: #1e3a26; 
}

.view-btn { 
  background: #eaf5ea; 
  color: #285436; 
  border: 1px solid #cfe6cf; 
  padding: 8px 14px; 
  border-radius: 8px; 
  text-decoration: none; 
  font-weight: 600;
  font-size: 13px;
  transition: background 0.2s, border-color 0.2s;
}

.view-btn:hover {
  background: #d1fae5;
  border-color: #a7f3d0;
}

/* Details Section */
.details { 
  padding-top: 16px; 
  margin-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.step { 
  display: flex; 
  align-items: flex-start; 
  padding: 12px; 
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f0fdf4;
}

.step:last-child {
  margin-bottom: 0;
}

.step-left { 
  display: flex; 
  gap: 12px; 
  align-items: flex-start; 
  flex: 1;
}

.step-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #10b981;
}

.check-icon {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-title { 
  font-weight: 600; 
  color: #065f46; 
  font-size: 14px;
  margin-bottom: 6px;
}

.meta { 
  font-size: 12px; 
  color: #059669;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-notes {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: 4px;
}

.meta-outcome {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-weight: 500;
}

/* Expand Animation */
.expand-enter-active, .expand-leave-active { 
  transition: all 0.3s ease; 
}

.expand-enter-from, .expand-leave-to { 
  opacity: 0; 
  transform: translateY(-10px); 
}

/* Responsive Design */
@media (max-width: 720px) {
  .header-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .header-flex h1 {
    font-size: 24px;
  }
  
  .report-container {
    padding: 0 1rem 2rem 1rem;
  }
  
  .controls { 
    flex-direction: column; 
    align-items: stretch; 
    gap: 8px;
  }
  
  .search-wrapper {
    flex: 1 1 auto;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .progress-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .progress-bar {
    width: 100%;
  }
  
  .progress-label {
    text-align: left;
    min-width: auto;
  }
  
  .action-buttons {
    width: 100%;
    flex-direction: column;
  }
  
  .toggle-btn, .view-btn {
    width: 100%;
  }
}
</style>
