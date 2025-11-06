<template>
  <div v-if="!error">

    <!-- Timeline as Simple Cards -->
    <div class="timeline-cards">
      <!-- Stage 1: Case Accepted - Based on volunteerId/assignedVolunteerID -->
      <div class="timeline-card-item" :class="{
        completed: hasVolunteer,
        pending: !hasVolunteer
      }">
        <div class="timeline-card-header">
          <span class="timeline-badge" :class="{
            completed: hasVolunteer,
            pending: !hasVolunteer
          }">
            <i :class="{
              'bi bi-check-circle-fill': hasVolunteer,
              'bi bi-hourglass': !hasVolunteer
            }"></i>
            {{ hasVolunteer ? 'Completed' : 'Pending' }}
          </span>
          <h3 class="timeline-title">
            <i class="bi bi-person-check-fill"></i>
            Case Accepted
          </h3>
          <div class="timeline-meta" v-if="hasVolunteer && timeAccepted">
            <i class="bi bi-calendar-event"></i>
            <span>{{ toGMT8String(timeAccepted) }}</span>
          </div>
        </div>
        <!-- Stage 1 Details -->
        <div class="timeline-info">
            <template v-if="hasVolunteer">
              <!-- Completed State -->
              <div class="detail-item" v-if="volunteerInfo?.name || reportData?.volunteerName || reportData?.assignedVolunteerName">
                <span class="detail-label">Volunteer Name:</span>
                <span class="detail-value">{{ volunteerInfo?.name || reportData?.assignedVolunteerName || reportData?.volunteerName || 'Unknown' }}</span>
              </div>
              <div class="detail-item" v-if="timeAccepted">
                <span class="detail-label">Acceptance Time:</span>
                <span class="detail-value">{{ toGMT8String(timeAccepted) }}</span>
              </div>
          </template>
          <template v-else>
              <!-- Pending State -->
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value">Waiting for volunteer to accept</span>
              </div>
          </template>
          </div>
        </div>

      <!-- Loop through checkpoint stages (Stage 2-5) -->
      <div v-for="(stage, index) in checkpointStages" :key="index" class="timeline-card-item" :class="{
          completed: checkpoints[stage]?.completed,
        current: checkpointCurrentIndex === index && !checkpoints[stage]?.completed,
        pending: checkpointCurrentIndex < index && !checkpoints[stage]?.completed
        }">
        <div class="timeline-card-header">
          <span class="timeline-badge" :class="{
            current: checkpointCurrentIndex === index && !checkpoints[stage]?.completed,
            pending: checkpointCurrentIndex < index && !checkpoints[stage]?.completed,
            completed: checkpoints[stage]?.completed,
          }">
            <i :class="{
              'bi bi-check-circle-fill': checkpoints[stage]?.completed,
              'bi bi-clock-fill': checkpointCurrentIndex === index && !checkpoints[stage]?.completed,
              'bi bi-hourglass': checkpointCurrentIndex < index && !checkpoints[stage]?.completed,
            }"></i>
            {{ getStatusLabel(stage) }}
          </span>
          <h3 class="timeline-title">
            <i :class="stageIcons[stage]"></i>
            {{ stageTitles[stage] }}
          </h3>
          <div class="timeline-meta" v-if="checkpoints[stage]?.completed && checkpoints[stage]?.completedAt">
              <i class="bi bi-calendar-event"></i>
            <span>{{ convertDate(checkpoints[stage].completedAt) }}</span>
            </div>
          </div>
        <!-- Details Section -->
        <div class="timeline-info">
            <!-- Stage 2: Volunteer Arrival -->
            <template v-if="stage === 'arrived'">
              <template v-if="!checkpoints[stage]?.completed">
                <!-- Pending State -->
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">Volunteer is en route / has not arrived yet</span>
                </div>
                <div class="detail-item" v-if="calculatedETA">
                  <span class="detail-label">Estimated Arrival:</span>
                  <span class="detail-value">{{ calculatedETA }}</span>
                </div>
              </template>
              <template v-else>
                <!-- Completed State -->
                <div class="detail-item" v-if="checkpoints[stage]?.completedAt">
                  <span class="detail-label">Arrival Time:</span>
                  <span class="detail-value">{{ convertDate(checkpoints[stage].completedAt) }}</span>
                </div>
                <div class="detail-item" v-if="volunteerInfo?.name || reportData?.volunteerName || reportData?.assignedVolunteerName">
                  <span class="detail-label">Volunteer Name:</span>
                  <span class="detail-value">{{ volunteerInfo?.name || reportData?.assignedVolunteerName || reportData?.volunteerName || 'Unknown' }}</span>
                </div>
                <div class="detail-item" v-if="checkpoints[stage]?.notes">
                  <span class="detail-label">Notes:</span>
                  <span class="detail-value">{{ checkpoints[stage].notes }}</span>
                </div>
              </template>
            </template>

            <!-- Stage 3: Animal Secured -->
            <template v-if="stage === 'handled'">
              <template v-if="!checkpoints[stage]?.completed">
                <!-- Pending State -->
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">Awaiting animal capture/containment</span>
                </div>
              </template>
              <template v-else>
                <!-- Completed State -->
                <div class="detail-item" v-if="checkpoints[stage]?.completedAt">
                  <span class="detail-label">Secured Time:</span>
                  <span class="detail-value">{{ convertDate(checkpoints[stage].completedAt) }}</span>
                </div>
                <div class="detail-item" v-if="checkpoints[stage]?.condition">
                  <span class="detail-label">Animal Condition:</span>
                  <span class="detail-value">{{ checkpoints[stage].condition }}</span>
                </div>
                <div class="detail-item" v-if="checkpoints[stage]?.notes">
                  <span class="detail-label">Notes:</span>
                  <span class="detail-value">{{ checkpoints[stage].notes }}</span>
                </div>
              </template>
            </template>

            <!-- Stage 4: Medical Assessment - checkpoints.treated -->
            <template v-if="stage === 'treated'">
              <template v-if="!checkpoints[stage]?.completed">
                <!-- Pending State -->
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">Awaiting veterinary examination</span>
                </div>
              </template>
              <template v-else>
                <!-- Completed State -->
                <div class="detail-item" v-if="checkpoints[stage]?.completedAt">
                  <span class="detail-label">Assessment Time:</span>
                  <span class="detail-value">{{ convertDate(checkpoints[stage].completedAt) }}</span>
            </div>
                <div class="detail-item" v-if="checkpoints[stage]?.diagnosis">
                  <span class="detail-label">Diagnosis:</span>
                  <span class="detail-value">{{ checkpoints[stage].diagnosis }}</span>
            </div>
                <div class="detail-item" v-if="checkpoints[stage]?.treatment">
                  <span class="detail-label">Treatment Provided:</span>
                  <span class="detail-value">{{ checkpoints[stage].treatment }}</span>
            </div>
                <div class="detail-item" v-if="checkpoints[stage]?.notes">
                  <span class="detail-label">Notes:</span>
                  <span class="detail-value">{{ checkpoints[stage].notes }}</span>
            </div>
              </template>
            </template>

            <!-- Stage 5: Case Resolved - checkpoints.reconciled -->
            <template v-if="stage === 'reconciled'">
              <template v-if="!checkpoints[stage]?.completed">
                <!-- Pending State -->
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">Case is still in progress</span>
            </div>
              </template>
              <template v-else>
                <!-- Completed State -->
                <div class="detail-item" v-if="checkpoints[stage]?.completedAt">
                  <span class="detail-label">Resolution Time:</span>
                  <span class="detail-value">{{ convertDate(checkpoints[stage].completedAt) }}</span>
            </div>
                <div class="detail-item" v-if="checkpoints[stage]?.outcome">
                  <span class="detail-label">Outcome:</span>
                  <span class="detail-value">{{ capitalize(checkpoints[stage].outcome) }}</span>
            </div>
                <div class="detail-item" v-if="checkpoints[stage]?.notes">
                  <span class="detail-label">Notes:</span>
                  <span class="detail-value">{{ checkpoints[stage].notes }}</span>
          </div>
              </template>
            </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../src/api/reportApi.js';
import '../css/common.css';

export default {
  name: 'Timeline',
  props: ['reportId', 'volunteerETA', 'timeAccepted', 'volunteerInfo', 'hasVolunteer', 'reportData'],
  data() {
    return {
      error: null,
      activeSummary: {},
      // Stage 2-5: Checkpoint stages in correct order
      checkpointStages: ['arrived', 'handled', 'treated', 'reconciled'],
      stageTitles: {
        arrived: 'Volunteer Arrival',
        handled: 'Animal Secured',
        treated: 'Medical Assessment', // Stage 4
        reconciled: 'Case Resolved', // Stage 5
      },
      stageDescriptions: {
        arrived: 'Volunteer is en route / has arrived on scene',
        handled: 'Animal has been safely captured/contained',
        treated: 'Veterinary examination/treatment provided', // Stage 4
        reconciled: 'Final outcome recorded (released/transferred/etc)', // Stage 5
      },
      stageIcons: {
        arrived: 'bi bi-geo-alt-fill',
        handled: 'bi bi-hand-thumbs-up-fill',
        treated: 'bi bi-heart-pulse-fill', // Stage 4: Medical Assessment
        reconciled: 'bi bi-house-check-fill', // Stage 5: Case Resolved
      },
      defaultDescriptions: {
        arrived: 'Team on-site has assessed the situation.',
        handled: 'The animal has been safely secured.',
        treated: 'Veterinary assessment and care has been provided.', // Stage 4
        reconciled: 'A final outcome for the animal has been determined.', // Stage 5
      },
      defaultUncompletedDescriptions: {
        arrived: 'Team is en route to the location.',
        handled: 'Preparing to safely secure the animal.',
        treated: 'Awaiting veterinary assessment and care.', // Stage 4
        reconciled: 'The animal\'s long-term outcome is being evaluated.', // Stage 5
      }
    };
  },
  computed: {
    checkpoints() {
      return this.activeSummary.checkpoints || {};
    },
    checkpointCurrentIndex() {
      // Calculate current checkpoint index
      // Stage 1 (Case Accepted) is handled separately, so we track checkpoints (Stage 2-5)
      let completedCount = 0;
      this.checkpointStages.forEach((stage) => {
        if (this.checkpoints[stage]?.completed) completedCount++;
      });
      return completedCount - 1 >= 0 ? completedCount - 1 : -1;
    },
    isCaseAccepted() {
      // Stage 1: Check if volunteer is assigned
      return this.hasVolunteer;
    },
    calculatedETA() {
      // Calculate ETA from timeAccepted + estimatedDurationMinutes
      // Priority: use volunteerETA if available, otherwise calculate from timeAccepted + estimatedDurationMinutes
      if (this.volunteerETA) {
        try {
          // Handle Firestore Timestamp
          let etaDate;
          if (this.volunteerETA && typeof this.volunteerETA.toDate === 'function') {
            etaDate = this.volunteerETA.toDate().toISOString();
          } else if (this.volunteerETA && this.volunteerETA._seconds) {
            // Handle Firestore Timestamp object with _seconds
            etaDate = new Date(this.volunteerETA._seconds * 1000).toISOString();
          } else {
            etaDate = this.volunteerETA;
          }
          return this.toGMT8String(etaDate);
        } catch (e) {
          console.warn("Error formatting volunteerETA:", e);
        }
      }
      
      // Fallback: calculate from timeAccepted + estimatedDurationMinutes
      if (this.timeAccepted) {
        let acceptedTime;
        // Handle Firestore Timestamp
        if (this.timeAccepted && typeof this.timeAccepted.toDate === 'function') {
          acceptedTime = this.timeAccepted.toDate();
        } else if (this.timeAccepted && this.timeAccepted._seconds) {
          acceptedTime = new Date(this.timeAccepted._seconds * 1000);
        } else {
          acceptedTime = new Date(this.timeAccepted);
        }
        
        // Try reportData first
        if (this.reportData?.estimatedDurationMinutes) {
          try {
            const minutes = Number(this.reportData.estimatedDurationMinutes);
            if (!isNaN(acceptedTime.getTime()) && !isNaN(minutes) && minutes > 0) {
              const etaTime = new Date(acceptedTime.getTime() + minutes * 60000);
              return this.toGMT8String(etaTime.toISOString());
            }
          } catch (e) {
            console.warn("Error calculating ETA:", e);
          }
        }
        
        // Also check activeSummary for estimatedDurationMinutes
        if (this.activeSummary?.estimatedDurationMinutes) {
          try {
            const minutes = Number(this.activeSummary.estimatedDurationMinutes);
            if (!isNaN(acceptedTime.getTime()) && !isNaN(minutes) && minutes > 0) {
              const etaTime = new Date(acceptedTime.getTime() + minutes * 60000);
              return this.toGMT8String(etaTime.toISOString());
            }
          } catch (e) {
            console.warn("Error calculating ETA from activeSummary:", e);
          }
        }
      }
      
      return null;
    },
  },
  methods: {
    async fetchActiveSummary(reportId) {
      try {
        this.activeSummary = await api.getActiveSummary(reportId);
      } catch (e) {
        this.error = e.message;
      }
    },
    getStatusLabel(stage) {
      if (this.checkpoints[stage]?.completed) return 'Completed';
      if (this.checkpointCurrentIndex === this.checkpointStages.indexOf(stage))
        return 'In Progress';
      return 'Pending';
    },
    convertDate(timeStamp) {
      const date = new Date(timeStamp._seconds * 1000);
      const options = {
        timeZone: 'Asia/Singapore', // This sets the timezone to GMT+8
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      const formattedDate = date.toLocaleString('en-US', options);
      return formattedDate;
    },
    toGMT8String(utcString) {
      const date = new Date(utcString);
      return date.toLocaleString('en-SG', {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    ,
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
  },
  async mounted() {
    await this.fetchActiveSummary(this.reportId);
    // Re-fetch if volunteerETA or estimatedDurationMinutes might be in activeSummary
    if (this.activeSummary && !this.volunteerETA && this.activeSummary.volunteerETA) {
      // volunteerETA might be a Firestore Timestamp, convert to ISO string
      if (this.activeSummary.volunteerETA && typeof this.activeSummary.volunteerETA.toDate === 'function') {
        this.$emit('update:volunteerETA', this.activeSummary.volunteerETA.toDate().toISOString());
      } else if (this.activeSummary.volunteerETA) {
        this.$emit('update:volunteerETA', this.activeSummary.volunteerETA);
      }
    }
  },
};
</script>


<style scoped>
:root {
  --primary-color: #086143;
  --primary-dark: #046949;
  --secondary-color: #16cb59;
  --accent-color: #BC6C25;
  --light-bg: #f8f9fa;
  --text-primary: #285436;
  --text-secondary: #606C38;
}

/* Custom Cards */
.custom-card {
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15) !important;
}

/* Timeline */

.timeline-header {
  text-align: center;
  margin-bottom: 3rem;
}

.timeline-header h1 {
  color: #285436;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.timeline-header p {
  color: #606C38;
  font-size: 1.1rem;
}

/* Timeline Cards Container */
.timeline-cards {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* Timeline Card Item */
.timeline-card-item {
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  overflow: hidden;
}

.timeline-card-item.completed {
  border-color: rgba(8, 97, 67, 0.3);
}

.timeline-card-item.current {
  border-color: #BC6C25;
  box-shadow: 0 4px 12px rgba(188, 108, 37, 0.2);
}

.timeline-card-item.pending {
  border-color: #e5e7eb;
  opacity: 0.8;
}

.timeline-card-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Timeline Card Header */
.timeline-card-header {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  background: #fafbfc;
}

.timeline-card-item.completed .timeline-card-header {
  background: #f0fdf4;
}

.timeline-card-item.current .timeline-card-header {
  background: #fffbeb;
}

/* Timeline Card Content */
.timeline-card-content {
  padding: 1rem 1.25rem;
}

/* Timeline Badge */
.timeline-badge {
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.timeline-badge.completed {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.timeline-badge.current {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.timeline-badge.pending {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
}

/* Timeline Title & Meta */
.timeline-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #606C38;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.timeline-meta i {
  color: #086143;
  font-size: 0.9rem;
}

.timeline-description {
  color: #64748b;
  line-height: 1.6;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.timeline-info .info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.timeline-info strong {
  color: #285436;
}

.timeline-info span {
  flex: 1;
  text-align: right;
  color: #555;
}

/* Detail Items Styling */
.timeline-info {
  padding: 0.875rem 1rem;
  background: #fafbfc;
  border-top: 1px solid #f3f4f6;
}

.timeline-info .detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.timeline-info .detail-item:last-child {
  margin-bottom: 0;
}

.timeline-info .detail-label {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timeline-info .detail-value {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  line-height: 1.5;
  word-wrap: break-word;
}

/* Responsive Design */
@media (max-width: 768px) {
  .timeline-card-header,
  .timeline-info {
    padding: 0.875rem 1rem;
  }

  .timeline-title {
    font-size: 1.05rem;
  }

  .timeline-meta {
    font-size: 0.8rem;
  }
}
</style>
