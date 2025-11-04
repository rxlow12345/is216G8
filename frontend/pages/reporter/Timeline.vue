<template>
  <div class="card custom-card border-0 shadow-sm rounded-4 p-4 mb-4" v-if="!error">
    <!-- Header -->
    <h5 class="mb-4 text-center fw-bold" style="color: #285436;">Rescue Journey Timeline</h5>

    <!-- Timeline -->
    <div class="timeline">
      <!-- Loop through all checkpoint stages -->
      <div v-for="(stage, index) in checkpointStages" :key="index" class="timeline-item">
        <!-- Timeline node -->
        <div class="timeline-node" :class="{
          current: checkpointCurrentIndex === index && !checkpoints[stage]?.completed,
          pending: checkpointCurrentIndex < index && !checkpoints[stage]?.completed,
          completed: checkpoints[stage]?.completed,
        }">
          <template v-if="checkpoints[stage]?.completed">
            <i class="bi bi-check-lg"></i>
          </template>
          <template v-else-if="checkpointCurrentIndex === index">
            <i class="bi bi-arrow-right"></i>
          </template>
          <template v-else>
            <span>{{ index + 1 }}</span>
          </template>
        </div>

        <!-- Connector -->
        <div class="timeline-connector" :class="{ active: index <= checkpointCurrentIndex }"
          v-if="index < checkpointStages.length - 1"></div>

        <!-- Timeline Content -->
        <div class="timeline-content" :class="{
          completed: checkpoints[stage]?.completed,
          current: checkpointCurrentIndex === index
        }">
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

          <div class="timeline-meta">
            <div class="timeline-meta-item">
              <i class="bi bi-calendar-event"></i>
              <span>
                {{
                  checkpoints[stage]?.completedAt
                    ? convertDate(checkpoints[stage]?.completedAt)
                    : 'Unknown'
                }}
              </span>
            </div>
          </div>


          <div v-if="checkpoints[stage]?.completed" class="timeline-info card border-0 bg-light p-3 mt-2">
            <div class="row mb-2" v-if="checkpoints[stage].diagnosis">
              <div class="col-12 col-sm-4 fw-semibold">Diagnosis:</div>
              <div class="col-12 col-sm-8">{{ checkpoints[stage].diagnosis }}</div>
            </div>

            <div class="row mb-2" v-if="checkpoints[stage].treatment">
              <div class="col-12 col-sm-4 fw-semibold">Treatment:</div>
              <div class="col-12 col-sm-8">{{ checkpoints[stage].treatment }}</div>
            </div>

            <div class="row mb-2" v-if="checkpoints[stage].condition">
              <div class="col-12 col-sm-4 fw-semibold">Condition:</div>
              <div class="col-12 col-sm-8">{{ checkpoints[stage].condition }}</div>
            </div>

            <div class="row mb-2" v-if="checkpoints[stage].notes">
              <div class="col-12 col-sm-4 fw-semibold">Notes:</div>
              <div class="col-12 col-sm-8">{{ checkpoints[stage].notes }}</div>
            </div>

            <div class="row mb-2" v-if="checkpoints[stage].outcome">
              <div class="col-12 col-sm-4 fw-semibold">Outcome:</div>
              <div class="col-12 col-sm-8">{{ capitalize(checkpoints[stage].outcome) }}</div>
            </div>
          </div>
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
  props: ['reportId'],
  data() {
    return {
      error: null,
      activeSummary: {},
      checkpointStages: ['arrived', 'handled', 'treated', 'reconciled'],
      stageTitles: {
        arrived: 'Arrival',
        handled: 'Securing The Animal',
        treated: 'Treatment',
        reconciled: 'Outcome',
      },
      stageIcons: {
        arrived: 'bi bi-geo-alt-fill',
        handled: 'bi bi-hand-thumbs-up-fill',
        treated: 'bi bi-heart-pulse-fill',
        reconciled: 'bi bi-house-check-fill',
      },
      defaultDescriptions: {
        arrived: 'Team on-site has assessed the situation.',
        handled: 'The animal has been safely secured.',
        treated: 'Veterinary assessment and care has been provided.',
        reconciled: 'A final outcome for the animal has been determined.',
      },
      defaultUncompletedDescriptions: {
        arrived: 'Team is en route to the location.',
        handled: 'Preparing to safely secure the animal.',
        treated: 'Awaiting veterinary assessment and care.',
        reconciled: 'The animal\'s long-term outcome is being evaluated.',
      }
    };
  },
  computed: {
    checkpoints() {
      return this.activeSummary.checkpoints || {};
    },
    checkpointCurrentIndex() {
      let completedCount = 0;
      this.checkpointStages.forEach((stage) => {
        if (this.checkpoints[stage]?.completed) completedCount++;
      });
      return completedCount - 1 >= 0 ? completedCount - 1 : -1;
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
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
  },
  async mounted() {
    await this.fetchActiveSummary(this.reportId);
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

/* Timeline Container */
.timeline {
  position: relative;
  padding: 2rem 0;
  margin: 0 auto;
}

/* Timeline Item */
.timeline-item {
  position: relative;
  margin-bottom: 3rem;
  padding-left: 90px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item:last-child .timeline-connector {
  display: none;
}

/* Timeline Node (Circle) */
.timeline-node {
  position: absolute;
  left: 0;
  top: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.3rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 3;
}

.timeline-node i {
  font-size: 1.5rem;
}

/* Node States */
.timeline-node.completed {
  background: #086143;
  animation: pulse 2.5s ease-in-out infinite;
}

.timeline-node.current {
  background: #BC6C25;
  box-shadow: 0 0 0 0 rgba(188, 108, 37, 0.7);
  animation: ripple 2s ease-out infinite;
}

.timeline-node.pending {
  background: #94a3b8;
  color: #475569;
}

@keyframes pulse {

  0%,
  100% {
    box-shadow: 0 4px 20px rgba(8, 97, 67, 0.3);
  }

  50% {
    box-shadow: 0 4px 30px rgba(22, 203, 89, 0.6);
  }
}

@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(188, 108, 37, 0.7);
  }

  70% {
    box-shadow: 0 0 0 20px rgba(188, 108, 37, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(188, 108, 37, 0);
  }
}

/* Timeline Connector (Line) */
.timeline-connector {
  position: absolute;
  left: 29px;
  top: 60px;
  width: 3px;
  height: calc(100% + 3rem);
  background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%);
  z-index: 1;
  transition: all 0.6s ease;
}

.timeline-connector.active {
  background: #086143;
  box-shadow: 0 0 10px rgba(8, 97, 67, 0.3);
}

/* Timeline Content Card */
.timeline-content {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
}

.timeline-content:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: #086143;
  ;
}

.timeline-content.completed {
  border-color: rgba(8, 97, 67, 0.2);
}

.timeline-content::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 20px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 12px solid white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-content:hover::before {
  opacity: 1;
}

/* Timeline Badge */
.timeline-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
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
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  margin-left: 4px;
  flex-wrap: wrap;
}

.timeline-meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #606C38;
  font-size: 0.9rem;
}

.timeline-meta-item i {
  color: #086143;
  ;
}

.timeline-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.25rem;
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

/* Responsive Design */
@media (max-width: 768px) {
  .timeline-item {
    padding-left: 75px;
  }

  .timeline-node {
    width: 50px;
    height: 50px;
    font-size: 1.1rem;
  }

  .timeline-node i {
    font-size: 1.3rem;
  }

  .timeline-connector {
    left: 24px;
  }

  .timeline-title {
    font-size: 1.2rem;
  }

  .timeline-meta {
    gap: 1rem;
  }

  .modal-title {
    font-size: 1.4rem;
  }

  .modal-body {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  body {
    padding: 1.5rem 0;
  }

  .timeline-item {
    padding-left: 65px;
    margin-bottom: 2.5rem;
  }

  .timeline-node {
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }

  .timeline-connector {
    left: 21px;
  }

  .timeline-content {
    padding: 1.25rem;
  }

  .timeline-title {
    font-size: 1.1rem;
  }

  .btn-view-details {
    width: 100%;
    padding: 0.7rem;
  }
}

/* Loading Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-item {
  animation: fadeInUp 0.6s ease-out backwards;
}

.timeline-item:nth-child(1) {
  animation-delay: 0.1s;
}

.timeline-item:nth-child(2) {
  animation-delay: 0.2s;
}

.timeline-item:nth-child(3) {
  animation-delay: 0.3s;
}

.timeline-item:nth-child(4) {
  animation-delay: 0.4s;
}

.timeline-item:nth-child(5) {
  animation-delay: 0.5s;
}
</style>
