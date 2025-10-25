<template>
  <div 
    class="report-card"
    :class="[
      { 'selected': selected },
      `urgency-${report.urgency}`,
      `status-${report.status}`
    ]"
    @click="$emit('click', report)"
  >
    <!-- Status Icon -->
    <div class="status-icon" :class="`status-${report.status}`">
      <span v-if="report.status === 'pending'">⏳</span>
      <span v-else-if="report.status === 'in-progress'">🚑</span>
      <span v-else>✅</span>
    </div>

    <!-- Report Content -->
    <div class="report-content">
      <div class="report-header">
        <h3 class="animal-type">{{ report.animalType }}</h3>
        <span class="urgency-badge" :class="`urgency-${report.urgency}`">
          {{ report.urgency }}
        </span>
      </div>

      <p class="description">{{ report.description }}</p>

      <div class="report-meta">
        <span class="location">📍 {{ report.address }}</span>
        <span class="time">🕐 {{ timeAgo }}</span>
      </div>

      <div v-if="report.assignedTo" class="assigned">
        👤 Assigned to: {{ report.assignedTo }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportCard',
  props: {
    report: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    timeAgo() {
      const now = new Date();
      const reported = new Date(this.report.reportedAt);
      const diffMs = now - reported;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  }
};
</script>

<style scoped>
.report-card {
  padding: 16px;
  border-left: 4px solid #E5E7EB;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  gap: 12px;
}

.report-card:hover {
  background: #F9FAFB;
}

.report-card.selected {
  background: #ECFDF5;
  border-left-color: #10B981;
}

/* Urgency border colors */
.report-card.urgency-high {
  border-left-color: #DC2626;
}

.report-card.urgency-medium {
  border-left-color: #F59E0B;
}

.report-card.urgency-low {
  border-left-color: #10B981;
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
  background: #FEE2E2;
}

.status-icon.status-in-progress {
  background: #FEF3C7;
}

.status-icon.status-resolved {
  background: #D1FAE5;
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
  color: #1F2937;
}

.urgency-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.urgency-badge.urgency-high {
  background: #FEE2E2;
  color: #991B1B;
}

.urgency-badge.urgency-medium {
  background: #FEF3C7;
  color: #92400E;
}

.urgency-badge.urgency-low {
  background: #D1FAE5;
  color: #065F46;
}

.description {
  margin: 8px 0;
  font-size: 14px;
  color: #4B5563;
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
  color: #6B7280;
}

.assigned {
  margin-top: 8px;
  font-size: 12px;
  color: #059669;
  font-weight: 500;
}
</style>