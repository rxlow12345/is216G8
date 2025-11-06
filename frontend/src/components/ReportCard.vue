<template>
  <div
    class="report-card"
    :class="[
      { selected: selected },
      `severity-${report.severity}`,
      `status-${report.status}`,
    ]"
    @click="$emit('click', report)"
  >
    <!-- Report Content -->
    <div class="report-content">
      <!-- Header  -->
      <div class="card-header">
        <div class="header-row">
          <div class="thumb" v-if="resolvedPhotoUrl || photoUrl">
            <img :src="resolvedPhotoUrl || photoUrl" alt="Report photo" />
          </div>
          <div class="title-block">
            <div class="title-row">
              <h3 class="animal-type">{{ report.speciesName }}</h3>
              <span class="severity-badge" :class="`severity-${report.severity}`">
                {{ report.severity }}
              </span>
            </div>
            <span
              class="incident-badge"
              :class="`incident-${report.incidentType?.toLowerCase()}`"
            >
              {{ report.incidentType }}
            </span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="description">{{ report.description }}</p>

      <!-- Info -->
      <div class="report-meta">
        <div class="meta-item">
          <span class="icon">📍</span>
          <span class="text">{{ handleLocation(report) }}</span>
          <!-- <span class="text">{{ report.location.address }}</span> -->
        </div>
        <div class="meta-item">
          <span class="icon">🕐</span>
          <span class="text">{{ timeAgo(report.createdAt) }}, on {{ formatReportTime(report.createdAt) }}</span>
        </div>
      </div>

      <!-- Accept Button -->
      <button @click.stop="handleAcceptCase" class="accept-button">
        <span class="button-icon">✓</span>
        Accept Case
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ReportCard",
  props: {
    report: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    photoUrl() {
      const r = this.report || {}
      const pick = (arr) => Array.isArray(arr) && arr.length > 0 ? arr[0] : ""
      const candidates = [
        //  take first image of photos in the array 
        pick(r.photoURLs),
        pick(r.photosURL),
        pick(r.photosUrl),
        pick(r.photos),
        // object forms: { url, downloadURL, path }
        typeof r.photoURLs === 'object' && !Array.isArray(r.photoURLs) ? (r.photoURLs.url || r.photoURLs.downloadURL || r.photoURLs.path) : '',
        typeof r.photosURL === 'object' && !Array.isArray(r.photosURL) ? (r.photosURL.url || r.photosURL.downloadURL || r.photosURL.path) : '',
        r.photoURL,
        r.photoUrl,
        r.imageURL,
        r.imageUrl,
      ].filter(Boolean)
      const url = candidates.find(u => typeof u === 'string' && (u.startsWith('http') || u.startsWith('data:') || u.startsWith('/') || u.startsWith('gs://')))
      return url || ""
    }
  },
  data(){
    return { resolvedPhotoUrl: "" }
  },
  async mounted(){
    await this.resolvePhotoUrl()
  },
  watch:{
    report: { deep:true, handler(){ this.resolvePhotoUrl() } }
  },
  methods: {
    async resolvePhotoUrl(){
      try{
        if (this.photoUrl && (this.photoUrl.startsWith('http') || this.photoUrl.startsWith('data:') || this.photoUrl.startsWith('/'))){
          this.resolvedPhotoUrl = this.photoUrl
          return
        }
        const path = this.photoUrl
        if (path && (path.startsWith('gs://') || !path.startsWith('http'))){
          const { getStorage, ref, getDownloadURL } = await import('firebase/storage')
          const storage = getStorage()
          const storageRef = ref(storage, path)
          this.resolvedPhotoUrl = await getDownloadURL(storageRef)
          return
        }
        this.resolvedPhotoUrl = ""
      } catch(e){
        console.warn('Failed to resolve photo URL', e?.message)
        this.resolvedPhotoUrl = ""
      }
    },
    handleLocation(report){
      if (typeof report.location === 'object'){
        return report.location.address
      } else {
        return report.location
      }
    },
    toDate(timestamp) {
      if (!timestamp || typeof timestamp._seconds !== "number") {
        return null;
      }
      // Convert seconds to milliseconds
      return new Date(timestamp._seconds * 1000);
    },

    // calculates time difference between current time and timestamp
    timeAgo(firestoreTimestamp) {
      const date = this.toDate(firestoreTimestamp);
      if (!date) return "Unknown time";

      const now = Date.now();
      const seconds = Math.floor((now - date.getTime()) / 1000);

      // Define time units in seconds
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const years = Math.floor(days / 365.25);

      if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
      } else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      } else if (days < 30) {
        return `${days} day${days !== 1 ? "s" : ""} ago`;
      } else if (years >= 1) {
        return `${years} year${years !== 1 ? "s" : ""} ago`;
      } else {
        // Fallback for periods like months (using days as approximation)
        const months = Math.floor(days / 30);
        return `${months} month${months !== 1 ? "s" : ""} ago`;
      }
    },
    
    // makes timing readable
    formatReportTime(firestoreTimestamp) {
      const date = this.toDate(firestoreTimestamp);
      if (!date) return "Invalid Date";

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    },

    handleAcceptCase() {
      this.$emit('acceptCase', this.report);
    }
  },
};
</script>

<style scoped>
/* Header row layout */
.card-header .header-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-header .title-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.card-header .title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.animal-type { /* ensure long names don’t overflow */
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Thumbnail */
.thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  margin: 8px 0 10px;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* Thumbnail */
.thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  margin: 8px 0 10px;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.report-card {
  padding: 0;
  border-left: 5px solid #E5E7E8; 
  background:#F5F5F5;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  overflow: hidden;
  border-bottom: 2px solid #f3f4f6;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
    background: #f9fafb;
  }
}

/* severity border colors */
.report-card.severity-urgent {
  border-left-color: #dc2626;
}

.report-card.severity-moderate {
  border-left-color: #f59e0b;
}

.report-card.severity-low {
  border-left-color: #10b981;
}

.report-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

/* Header */
.report-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* justify-content: space-between;
  align-items: center;
  margin-bottom: 8px; */
}

.title-row{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.animal-type {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

/* badges */


.severity-badge, .incident-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.incident-badge {
  align-self: flex-start;
  font-size: 10px;
  padding: 3px 10px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}
.severity-badge {
  flex-shrink: 0;
}

.severity-badge.severity-urgent {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  
}

.severity-badge.severity-moderate {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #eacc55;
}

.severity-badge.severity-low {
  border: 1px solid #bbf7d0;
  background: #d1fae5;
  color: #065f46;
}

.incident-badge.incident-dead, .incident-badge.incident- {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.incident-badge.incident-trapped, .incident-badge.incident-vehicle {
  background: #fffbeb;
  color: #e36719;
  border-color: #fde68a;
}

.incident-badge.incident-orphaned, .incident-badge.incident-aggressive, .incident-badge.incident-displaced, .incident-badge.incident-conflict {
  background: #ede9fe;
  color: #6b21a8;
  border-color: #ddd6fe;
}

.description {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.accept-button {
  margin-top: 4px;
  width: 100%;
  padding: 10px 16px;
  background: #10B981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.accept-button:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.accept-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.button-icon {
  font-size: 16px;
  font-weight: bold;
}


.report-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.meta-item .icon {
  font-size: 14px;
  flex-shrink: 0;
}

.meta-item .text {
  line-height: 1.4;
}


.location,
.time {
  font-size: 12px;
  color: #6b7280;
}

.assigned {
  margin-top: 8px;
  font-size: 12px;
  color: #059669;
  font-weight: 500;
}
</style>
