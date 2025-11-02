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
    <!-- TODO decide if still want icon  -->
    <!-- Status Icon -->
    <div class="status-icon" :class="`status-${report.status}`">⏳</div>

    <!-- Report Content -->
    <div class="report-content">
      <div class="report-header">
        <h3 class="animal-type">{{ report.speciesName }}</h3>
        <span class="severity-badge" :class="`severity-${report.severity}`">
          {{ report.severity }}
        </span>
        <p class="timestamp"> {{ formatReportTime(report.createdAt) }} </p>
      </div>

      <!-- todo - create css class for incidenttype -->
      <p class="incidentType">{{ report.incidentType }}</p>
      <p class="description">{{ report.description }}</p>

      <div class="report-meta">
        <span class="location">📍 {{ report.location }}</span>
        <span class="time">🕐 {{ timeAgo(report.createdAt) }}</span>
      </div>

      <button @click.stop="handleAcceptCase" class="accept-button">
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
  methods: {
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
.report-card {
  padding: 16px;
  border-left: 4px solid #e5e7eb;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  gap: 12px;
}

.report-card:hover {
  background: #f9fafb;
}

.report-card.selected {
  background: #ecfdf5;
  border-left-color: #10b981;
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

.status-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-icon.status-pending {
  background: #fee2e2;
}

.status-icon.status-in-progress {
  background: #fef3c7;
}

.status-icon.status-resolved {
  background: #d1fae5;
}

.report-content {
  flex: 1;
  min-width: 0;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.animal-type {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.accept-button {
  margin-top: 12px;
  width: 100%;
  padding: 8px 16px;
  background: #10B981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.accept-button:hover {
  background: #059669;
}

.severity-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.severity-badge.severity-urgent {
  background: #fee2e2;
  color: #991b1b;
}

.severity-badge.severity-moderate {
  background: #fef3c7;
  color: #92400e;
}

.severity-badge.severity-low {
  background: #d1fae5;
  color: #065f46;
}

.description {
  margin: 8px 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.4;
}

.report-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
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
