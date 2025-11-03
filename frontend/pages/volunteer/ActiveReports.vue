<template>
  <div class="container-fluid p-0 reporterDashboard">
    <div id="topBanner" class="bannerTitles">
      <header class="text-center mb-2">
        <h1>Active Reports</h1>
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
          <option value="progress">Progress %</option>
        </select>
        <select class="select" v-model="filterBy">
          <option value="all">All</option>
          <option value="inprogress">In progress</option>
          <option value="near">Near completion</option>
        </select>
      </div>
      <div v-if="loading" class="loading-box">Loading active reports...</div>

      <div v-else-if="reports.length === 0" class="empty-state">
        <p>No active reports yet.</p>
      </div>

      <div v-else class="cards">
        <section
          v-for="r in displayedReports"
          :key="r.id"
          class="report-card"
        >
          <div class="card-top">
            <div class="id-and-time">
              <div class="report-id">{{ r.data.reportId }}</div>
              <div class="accepted-time">Accepted {{ formatSince(r.data.acceptedAt) }}</div>
            </div>

            <div class="progress-wrap">
              <div class="progress-label">{{ r.data.progressPercentage }}%</div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: r.data.progressPercentage + '%' }"></div>
              </div>
            </div>

            <div class="status-pill" :class="getStatusClass(r.data)">{{ currentStatus(r.data) }}</div>

            <button class="toggle-btn" @click="toggle(r.id)">
              {{ expanded.has(r.id) ? 'Hide details' : 'View details' }}
            </button>
            <div class="quick-actions">
              <router-link class="qa-btn" :to="`/status/${r.data.reportId}`">View Original Report</router-link>
            </div>
          </div>

          <transition name="expand">
            <div v-if="expanded.has(r.id)" class="details">
              <div class="step" 
                   v-for="(step, idx) in steps" 
                   :key="step.key"
                   :class="{ completed: r.data.checkpoints[step.key].completed, pending: !r.data.checkpoints[step.key].completed }">
                <div class="step-left">
                  <div class="step-icon-wrapper" :class="{ completed: r.data.checkpoints[step.key].completed }">
                    <span v-if="r.data.checkpoints[step.key].completed" class="check-icon">✓</span>
                    <span v-else class="step-icon">{{ step.icon }}</span>
                  </div>
                  <div class="step-info">
                    <div class="step-title" :class="{ completed: r.data.checkpoints[step.key].completed }">
                      {{ step.title }}
                    </div>
                    <div v-if="r.data.checkpoints[step.key].completed" class="meta completed-meta">
                      <span class="meta-time">📅 Completed {{ formatSince(r.data.checkpoints[step.key].completedAt) }}</span>
                      <span v-if="r.data.checkpoints[step.key].notes" class="meta-notes">📝 {{ r.data.checkpoints[step.key].notes }}</span>
                    </div>
                    <div v-else class="meta muted">⏳ Pending</div>
                  </div>
                </div>

                <div class="step-right">
                  <button
                    v-if="!r.data.checkpoints[step.key].completed"
                    class="complete-btn"
                    :disabled="!canComplete(r.data, idx) || updatingId === r.id"
                    @click="markComplete(r, step.key)"
                  >
                    <span v-if="updatingId === r.id" class="spinner"></span>
                    {{ updatingId === r.id ? 'Updating...' : 'Mark Complete' }}
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </section>
      </div>
    </main>
  </div>
  <BackToTop/>
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
  <div class="toast-stack">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="{ error: t.isError }">{{ t.message }}</div>
  </div>
</template>

<script setup>
import '../css/common.css'
import BackToTop from '../../src/components/BackToTop.vue';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { db } from '../../src/firebase.js'
import { collection, query, where, onSnapshot, Timestamp, doc, updateDoc, serverTimestamp, getDoc, getDocs } from 'firebase/firestore'
import { getCurrentUser } from '../../src/api/auth.js'
import { formatDistanceToNow } from 'date-fns'
import CheckpointModal from '../../src/components/CheckpointModal.vue'

const loading = ref(true)
const reports = ref([]) // [{ id, data }]
const expanded = ref(new Set())
const unsubRef = ref(null)
const updatingId = ref('')
const modalVisible = ref(false)
const modalTitle = ref('')
const modalWarning = ref('')
const modalFields = ref([])
const modalSubmitting = ref(false)
let currentAction = { report:null, key:'' }
const search = ref('')
const sortBy = ref('newest')
const filterBy = ref('all')
const toasts = ref([])

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

function getStatusClass(data) {
  const status = currentStatus(data)
  if (status === 'Completed' || status === 'Reconciliation Complete') {
    return 'status-completed'
  }
  return 'status-in-progress'
}

function toggle(id) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
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

const displayedReports = computed(() => {
  let rows = [...reports.value]
  if (search.value.trim()){
    const q = search.value.trim().toLowerCase()
    rows = rows.filter(r => String(r.data.reportId).toLowerCase().includes(q))
  }
  if (filterBy.value === 'inprogress'){
    rows = rows.filter(r => (r.data.progressPercentage ?? 0) < 100)
  } else if (filterBy.value === 'near'){
    rows = rows.filter(r => (r.data.progressPercentage ?? 0) >= 75 && (r.data.progressPercentage ?? 0) < 100)
  }
  if (sortBy.value === 'oldest'){
    rows.sort((a,b) => (a.data.lastUpdated?.seconds ?? 0) - (b.data.lastUpdated?.seconds ?? 0))
  } else if (sortBy.value === 'progress'){
    rows.sort((a,b) => (b.data.progressPercentage ?? 0) - (a.data.progressPercentage ?? 0))
  } else {
    rows.sort((a,b) => (b.data.lastUpdated?.seconds ?? 0) - (a.data.lastUpdated?.seconds ?? 0)).reverse()
  }
  return rows
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

    // 1) Build update data with dot-notation
    const docRef = doc(db, 'activeStatusSummary', r.id)
    const updateData = {
      [`checkpoints.${key}.completed`]: true,
      [`checkpoints.${key}.completedAt`]: Timestamp.now(),
      lastUpdated: serverTimestamp(),
    }
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

    await updateDoc(docRef, updateData)

    // 2) If reconciled, update incidentReports
    if (key === 'reconciled'){
      const q2 = query(collection(db, 'incidentReports'), where('reportId','==', r.data.reportId))
      const rs = await getDocs(q2)
      const first = rs.docs[0]
      if (first){
        await updateDoc(doc(db, 'incidentReports', first.id), {
          status: 'resolved',
          resolvedAt: Timestamp.now(),
        })
      }
    }

    showToast('✓ Checkpoint updated successfully')
    modalVisible.value = false
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
        console.warn('[ActiveReports] Skipping doc without full checkpoints structure:', d.id, data?.checkpoints)
        return
      }
      rows.push({ id: d.id, data })
    })
    // sort by lastUpdated desc
    rows.sort((a, b) => (b.data.lastUpdated?.seconds ?? 0) - (a.data.lastUpdated?.seconds ?? 0))
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

function showToast(message, isError=false){
  const id = Math.random().toString(36).slice(2)
  toasts.value.push({ id, message, isError })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 2500)
}
</script>

<style scoped>
/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 0;
}
.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #285436;
  margin: 0 0 8px 0;
}
.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
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
  gap: 12px; 
  align-items: center; 
  margin-bottom: 24px; 
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
  left: 12px;
  font-size: 16px;
  color: #6b7280;
  pointer-events: none;
  z-index: 1;
}

.search { 
  width: 100%;
  border: 1px solid #dbe5d9; 
  border-radius: 8px; 
  padding: 12px 12px 12px 36px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search:focus {
  outline: none;
  border-color: #5a7a5a;
  box-shadow: 0 0 0 3px rgba(90, 122, 90, 0.1);
}

.select { 
  border: 1px solid #dbe5d9; 
  border-radius: 8px; 
  padding: 12px 16px;
  font-size: 14px;
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
  padding: 20px 24px; 
  border-radius: 12px; 
  text-align: center;
  font-size: 16px;
}

/* Cards */
.cards { 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
}

.report-card {
  background: #ffffff; 
  border: 1px solid #e0e0e0; 
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08); 
  padding: 24px; 
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.12); 
}

.card-top { 
  display: grid; 
  grid-template-columns: 1fr 1fr auto auto; 
  gap: 16px; 
  align-items: center; 
  margin-bottom: 8px;
}

.report-id { 
  font-weight: 700; 
  color: #285436; 
  font-size: 18px; 
  margin-bottom: 4px;
}

.accepted-time { 
  color: #6b7280; 
  font-size: 13px; 
}

/* Progress Bar */
.progress-wrap { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}

.progress-label { 
  font-weight: 700; 
  color: #285436; 
  min-width: 42px; 
  text-align: right;
  font-size: 16px;
}

.progress-bar { 
  width: 180px; 
  height: 10px; 
  background: #eef3ee; 
  border-radius: 999px; 
  overflow: hidden; 
  border: 1px solid #dbe5d9;
}

.progress-fill { 
  height: 100%; 
  background: linear-gradient(90deg, #5a7a5a, #7aa87a);
  transition: width 0.3s ease;
  border-radius: 999px;
}

/* Status Pills */
.status-pill { 
  padding: 8px 14px; 
  border-radius: 999px; 
  font-size: 13px; 
  font-weight: 600; 
  white-space: nowrap; 
  text-align: center;
}

.status-pill.status-completed {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-pill.status-in-progress {
  background: #eaf5ea;
  color: #285436;
  border: 1px solid #cfe6cf;
}

/* Toggle Button */
.toggle-btn { 
  background: #285436; 
  color: #FEFAE0; 
  border: 1px solid #285436; 
  padding: 10px 16px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.toggle-btn:hover { 
  background: #1e3a26; 
}

/* Quick Actions */
.quick-actions { 
  display: flex; 
  gap: 8px; 
  justify-content: flex-end; 
  grid-column: 1 / -1; 
  margin-top: 8px;
}

.qa-btn { 
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

.qa-btn:hover {
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
  justify-content: space-between; 
  align-items: flex-start; 
  padding: 16px 12px; 
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background 0.2s;
}

.step.completed {
  background: #f0fdf4;
}

.step.pending {
  background: #f9fafb;
}

.step:last-child {
  margin-bottom: 0;
}

.step-left { 
  display: flex; 
  gap: 16px; 
  align-items: flex-start; 
  flex: 1;
}

.step-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #e5e7eb;
  transition: background 0.2s;
}

.step-icon-wrapper.completed {
  background: #10b981;
}

.step-icon { 
  font-size: 20px; 
}

.check-icon {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-title { 
  font-weight: 700; 
  color: #374151; 
  font-size: 15px;
  margin-bottom: 6px;
}

.step-title.completed {
  color: #065f46;
}

.meta { 
  font-size: 13px; 
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta.muted { 
  color: #9ca3af; 
}

.completed-meta {
  color: #059669;
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

.step-right {
  margin-left: 16px;
}

.complete-btn { 
  background: #7aa87a; 
  color: #ffffff; 
  border: none; 
  padding: 10px 16px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
}

.complete-btn:hover:not(:disabled) {
  background: #6a9a6a;
}

.complete-btn[disabled] { 
  opacity: 0.5; 
  cursor: not-allowed; 
}

.spinner { 
  width: 14px; 
  height: 14px; 
  border: 2px solid rgba(255,255,255,.4); 
  border-top-color: #fff; 
  border-radius: 50%; 
  display: inline-block; 
  margin-right: 6px; 
  animation: spin .7s linear infinite; 
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

/* Expand Animation */
.expand-enter-active, .expand-leave-active { 
  transition: all 0.3s ease; 
}

.expand-enter-from, .expand-leave-to { 
  opacity: 0; 
  transform: translateY(-10px); 
}

/* Toast Notifications */
.toast-stack { 
  position: fixed; 
  right: 18px; 
  bottom: 18px; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  z-index: 3000; 
}

.toast { 
  background: #285436; 
  color: #FEFAE0; 
  border: 1px solid #285436; 
  padding: 12px 16px; 
  border-radius: 10px; 
  min-width: 240px; 
  box-shadow: 0 6px 16px rgba(0,0,0,.2); 
  font-size: 14px;
}

.toast.error { 
  background: #b91c1c; 
  border-color: #7f1d1d; 
}

/* Responsive Design */
@media (max-width: 720px) {
  .header-section {
    padding: 1.5rem 0;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .report-container {
    padding: 0 1rem 2rem 1rem;
  }
  
  .controls { 
    flex-direction: column; 
    align-items: stretch; 
    gap: 10px;
  }
  
  .search-wrapper {
    flex: 1 1 auto;
  }
  
  .card-top { 
    grid-template-columns: 1fr; 
    gap: 12px; 
  }
  
  .progress-bar { 
    width: 100%; 
  }
  
  .progress-wrap {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .progress-label {
    text-align: left;
    min-width: auto;
  }
  
  .step {
    flex-direction: column;
    gap: 12px;
  }
  
  .step-right {
    margin-left: 0;
    width: 100%;
  }
  
  .complete-btn {
    width: 100%;
  }
}
</style>


