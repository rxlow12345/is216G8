<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="leaflet-map"></div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-overlay">
      <p>Loading map...</p>
    </div>

    <!-- Search box (uses OpenCage) -->
    <div class="search-box">
      <input
        v-model="searchQuery"
        @keyup.enter="searchAddress"
        placeholder="Search location..."
        class="search-input"
      />
      <button @click="searchAddress" class="search-btn">Search</button>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// TODO Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export default {
  name: 'MapView',
  props: {
    reports: {
      type: Array,
      required: true,
      default: () => [],
    },
    center: {
      type: Object,
      default: () => ({ lat: 1.3521, lng: 103.8198 }), // Singapore
    },
  },
  data() {
    return {
      map: null,
      markers: [],
      loading: true,
      searchQuery: '',
    }
  },
  async mounted() {
    await this.initMap()
    this.loading = false
  },
  watch: {
    reports: {
      handler() {
        this.updateMarkers()
      },
      deep: true,
    },
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove()
    }
  },
  methods: {
    async initMap() {
      try {
        // Create Leaflet map
        this.map = L.map(this.$refs.mapContainer).setView(
          [this.center.lat, this.center.lng],
          10, // zoom level
        )

        // Add OpenStreetMap tiles 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(this.map)

        // Add markers for existing reports
        this.updateMarkers()
      } catch (error) {
        console.error('Error loading map:', error)
        alert('Failed to load map')
      }
    },

    updateMarkers() {
      if (!this.map) return

      // Remove old markers
      this.markers.forEach((marker) => this.map.removeLayer(marker))
      this.markers = []

      // Add new markers
      this.reports.forEach((report) => {
        const coords = report.coordinates;
        if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number'){
          console.log(`Report ${report.id} skipped due to invalid coordinates`, report);
          return;
        }
        const icon = this.createCustomIcon(report)

        const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(
          this.map,
        )

        // Create popup content
        const popupContent = this.createPopupContent(report)
        marker.bindPopup(popupContent)

        marker.on('popupopen', () => {
          const button = document.getElementById(`accept-btn-${report.id}`);
          if (button) {
            button.addEventListener('click', () => {
              this.handleAcceptCase(report);
            });
          }
        });

        marker.on('click', () => {
          this.$emit('marker-click', report)
        })

        this.markers.push(marker)
      })

      // Fit map to show all markers
      if (this.markers.length > 0) {
        const group = L.featureGroup(this.markers)
        this.map.fitBounds(group.getBounds().pad(0.1))
      }
    },
    severityColor(report){
      // colour of icon determined based on severity
      let color = {'background':'#6B7280', 'text':''} // light, dark
  
      if (report.severity === 'urgent') {
        color = {'background':'#fee2e2', 'text':'#991b1b'}
      } else if (report.severity === 'moderate') {
        color = {'background':'#fef3cf', 'text':'#92400e'}
      } else {
        color = {'background':'#bbf7d0', 'text':'#065f46'}
      }
      return color;
    },
    incidentColor(report){
      // colour of icon determined based on severity
      let color = {'background':'#6B7280', 'text':''} // light, dark
  
      if (report.incidentType=== 'dead') {
        color = {'background':'#fee2e2', 'text':'#991b1b'}
      } else if (report.incidentType === 'injured') {
        color = {'background':'#fef3cf', 'text':'#92400e'}
      } else if (report.incidentType === 'trapped') {
        color = {'background':'#fef3c7', 'text':'#78350f'}
      } else {
        color = {'background':'#ede9fe', 'text':'#6b21a8'}
      }
      return color;
    },

    createCustomIcon(report) {
      let color = this.severityColor(report).text;
      // Create custom map pin icon
      const svgIcon = `
        <svg width="30" height="40" xmlns="http://www.w3.org/2000/svg">
          <path d="M15,40 Q5,30 5,20 A10,10 0 1,1 25,20 Q25,30 15,40" 
            fill="${color}" 
            stroke="white" 
            stroke-width="2"/>
          <circle cx="15" cy="22" r="5" fill="white"/>
        </svg>
      `;

      return L.divIcon({
        html: svgIcon,
        className: 'custom-marker',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
      })
    },

    handleAcceptCase(report){
      this.$emit('acceptCase', report);
    },

    createPopupContent(report) {
      return `
        <div style="min-width: 250px; padding: 8px;">
          <h3 style="margin: 0 0 8px; color: #1F2937; font-size: 16px; font-weight: 600;">
            ${report.speciesName}
          </h3>
          
          <div style="margin: 6px 0;">
            <span style="font-weight: 500; color: #1F2937 ; font-size: 13px;">Severity:</span>
            <span style="
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.5px;
              white-space: nowrap;
              flex-shrink: 0;
              background: ${this.severityColor(report).background};
              color: ${this.severityColor(report).text};
              margin-left: 6px;
            ">
              ${report.severity.toUpperCase()}
            </span>
          </div>
          <div style="margin: 6px 0;">
            <span style="font-weight: 500; color: #1F2937 ; font-size: 13px;">Incident Type:</span>
            <span style="
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.5px;
              white-space: nowrap;
              flex-shrink: 0;
              background: ${this.incidentColor(report).background} ;
              color: ${this.incidentColor(report).text} ;
              margin-left: 6px;
            ">
              ${report.incidentType.toUpperCase()}
            </span>
          </div>

          <p style="margin: 8px 0; color: #4B5563; font-size: 13px;">
            ${report.description}
          </p>

          <p style="margin: 6px 0; color: #9CA3AF; font-size: 12px;">
            📍 ${report.location}
          </p>

          <p style="margin: 6px 0; color: #9CA3AF; font-size: 12px;">
            🕐 ${this.formatReportTime(report.createdAt)}
          </p>

          <button 
            id = "accept-btn-${report}"
            style="
              width: 100%;
              margin-top: 10px;
              padding: 8px;
              background: #10B981;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              font-size: 13px;
            "
          >
            <span style="font-size: 16px; font-weight: bold;" >✓</span>
            Accept Case
          </button>
        </div>
      `
    },

    // Search address using OpenCage API
    async searchAddress() {
      if (!this.searchQuery.trim()) return

      try {
        const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(this.searchQuery)}&key=${apiKey}&limit=1&countrycode=sg`,
        )

        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry
          this.map.setView([location.lat, location.lng], 15)

          // Add temporary marker
          const tempMarker = L.marker([location.lat, location.lng])
            .addTo(this.map)
            .bindPopup(`<b>${data.results[0].formatted}</b>`)
            .openPopup()

          // Remove after 5 seconds
          setTimeout(() => {
            this.map.removeLayer(tempMarker)
          }, 5000)
        } else {
          alert('Location not found')
        }
      } catch (error) {
        console.error('Geocoding error:', error)
        alert('Failed to search location')
      }
    },

    toDate(timestamp) {
      if (!timestamp || typeof timestamp._seconds !== "number") {
        return null;
      }
      // Convert seconds to milliseconds
      return new Date(timestamp._seconds * 1000);
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
  },
}
</script>

<style scoped>
* {
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #6b7280;
  z-index: 1000;
}

.search-box {
  position: absolute;
  top: 10px;
  left: 50px;
  z-index: 1000;
  display: flex;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: white;
}

.search-input {
  padding: 10px 16px;
  border: none;
  border-radius: 8px 0 0 8px;
  font-size: 14px;
  width: 250px;
  outline: none;
}

.search-btn {
  padding: 10px 16px;
  border: none;
  background: #10b981;
  color: white;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-size: 16px;
}

.search-btn:hover {
  background: #059669;
}

/* Custom marker styling */
:deep(.custom-marker) {
  background: none;
  border: none;
}
</style>
