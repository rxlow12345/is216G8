<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="leaflet-map"></div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-overlay">
      <p>Loading map...</p>
    </div>

    <!-- Search box (uses OpenCage) -->
    <div v-if="!isLoadingMarkers" class="search-box">
      <input
        v-model="searchQuery"
        @keyup.enter="searchAddress"
        placeholder="Search location..."
        class="search-input"
      />
      <button @click="searchAddress" class="search-btn">Search</button>
    </div>

    <div v-if="!isLoadingMarkers" class="re-center">
      <button @click="recenterMap(true)" class="recenter-btn" title="Recenter to Singapore">
        <span>🎯</span>
      </button>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
// import markerIcon2x from '../public/assets/locationMarker2x.png'
// import markerIcon from '../public/assets/locationMarker.png'


delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  
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
    isLoadingMarkers: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      map: null,
      markers: [],
      loading: true,
      searchQuery: '',
      mapReadyResolve: null,
      mapReadyPromise: null,
      lastOpenMarkerId: null,
      _reopenPopupAfterZoom: false,
      _isInitialLoad: true,
      _isUserDragging: false,
      _dragEndTimeout: null,
    }
  },
  async mounted() {
    await this.initMap()
    this.loading = false
    
    // Handle window resize to ensure map stays interactive
    window.addEventListener('resize', this.handleResize)
    
    // Ensure markers are created after map is ready
    this.$nextTick(() => {
      if (this.map && this.reports && this.reports.length > 0) {
        if (this.markers.length === 0) {
          this.updateMarkers()
        }
      }
    })
    
    // Also check again after a delay in case reports are loaded asynchronously
    setTimeout(() => {
      if (this.map && this.reports && this.reports.length > 0 && this.markers.length === 0) {
        this.updateMarkers()
      }
    }, 1000)
  },
  watch: {
    reports: {
      handler(newReports, oldReports) {
        // Always update markers on initial load (when oldReports is undefined/null or empty)
        if (!oldReports || oldReports.length === 0) {
          if (this.map) {
            this.updateMarkers()
          }
          return
        }
        
        // If no new reports, clear markers but don't prevent display
        if (!newReports || newReports.length === 0) {
          if (this.map) {
            this.markers.forEach((marker) => this.map.removeLayer(marker))
            this.markers = []
          }
          return
        }
        
        // Only update markers if the array length or IDs changed, not on property updates
        // This prevents unnecessary updates when report properties change
        const newIds = new Set((newReports || []).map(r => r.reportId || r.id).filter(Boolean))
        const oldIds = new Set((oldReports || []).map(r => r.reportId || r.id).filter(Boolean))
        
        // Check if reports were added/removed (not just updated)
        const idsChanged = newIds.size !== oldIds.size || 
          [...newIds].some(id => !oldIds.has(id)) ||
          [...oldIds].some(id => !newIds.has(id))
        
        // Always update if IDs changed OR if we have no markers but have reports
        // Also update if markers array is empty but we have reports (safety check)
        const shouldUpdate = idsChanged || 
                            this._isInitialLoad || 
                            (this.markers.length === 0 && newReports.length > 0) ||
                            (!this.map || this.markers.some(m => !this.map.hasLayer(m)))
        
        if (shouldUpdate) {
          this.updateMarkers()
        }
        // If only properties changed and user is dragging, skip update to avoid resetting map position
        else if (!this._isUserDragging) {
          // Only update popup content if needed, don't recreate markers
          this.updatePopupContents(newReports || [])
        }
      },
      deep: true,
      immediate: true, // Trigger immediately to handle initial reports
    },
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this._dragEndTimeout) {
      clearTimeout(this._dragEndTimeout)
    }
    if (this.map) {
      this.map.remove()
    }
  },
  methods: {
    async initMap() {
      // Promise so external callers can await map readiness
      this.mapReadyPromise = new Promise(resolve => {
        this.mapReadyResolve = resolve
      })
      try {
        // Create Leaflet map
        this.map = L.map(this.$refs.mapContainer, { zoomControl: false }).setView(
          [this.center.lat, this.center.lng],
          10, // zoom level
        )

        // Add OpenStreetMap tiles 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Ac OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(this.map)

        // Zoom position 
        L.control.zoom({ position: 'bottomleft' }).addTo(this.map)
        
        // Critical: Invalidate size to ensure map renders correctly and interactions work
        this.$nextTick(() => {
          if (this.map) {
            this.map.invalidateSize()
            // Force a resize event to ensure proper initialization
            setTimeout(() => {
              this.map.invalidateSize()
            }, 100)
          }
        })
        
        // Track user dragging to prevent auto-recentering
        this.map.on('dragstart', () => {
          this._isUserDragging = true
          this._isInitialLoad = false // Immediately disable auto-fit once user starts dragging
          // Close any open popups to prevent autoPan from interfering
          this.map.closePopup()
        })
        
        this.map.on('dragend', () => {
          // After drag ends, mark that initial load should be disabled
          // This prevents any future auto-fit operations
          this._isInitialLoad = false
          // After drag ends, wait longer before resetting dragging flag to prevent auto-recenter
          clearTimeout(this._dragEndTimeout)
          this._dragEndTimeout = setTimeout(() => {
            this._isUserDragging = false
          }, 2000) // Wait 2 seconds after drag ends to be safe
        })
        
        // Also track move events to detect programmatic moves vs user drags
        this.map.on('moveend', (e) => {
          // If this move was programmatic (not from user drag), it's okay
          // But we should still prevent auto-recenter if user was dragging recently
          if (this._isUserDragging) {
          }
        })
        
        if (this.mapReadyResolve) this.mapReadyResolve()

        // Add markers for existing reports after a short delay to ensure map is fully ready
        this.$nextTick(() => {
          if (this.map && this.reports && this.reports.length > 0) {
            this.updateMarkers()
          }
        })

        // Keep popups anchored during zoom by closing then reopening
        this.map.on('zoomstart', () => {
          if (this.lastOpenMarkerId != null) {
            this._reopenPopupAfterZoom = true
            this.map.closePopup()
          } else {
            this._reopenPopupAfterZoom = false
          }
        })
        this.map.on('zoomend', () => {
          if (this._reopenPopupAfterZoom) {
            const m = this.markers.find(m => m.reportId === this.lastOpenMarkerId)
            if (m) m.openPopup()
            this._reopenPopupAfterZoom = false
          }
        })
      } catch (error) {
        alert('Failed to load map')
      }
    },

    // Expose a way for parent to await the map
    async getMap() {
      if (this.map) return this.map
      if (this.mapReadyPromise) await this.mapReadyPromise
      return this.map
    },
    async addPin(coordinates, { popupContent = null, persistent = true, icon = null, variant = 'svg' } = {}) {
      if (!coordinates) return null
      const lat = Number(coordinates.lat)
      const lng = Number(coordinates.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
      await this.getMap()
      let marker
      if (variant === 'circle') {
        marker = L.circleMarker([lat, lng], {
          radius: 12,
          color: '#111827',
          weight: 2,
          fillColor: '#f59e0b',
          fillOpacity: 0.95,
        }).addTo(this.map)
        marker.bringToFront()
      } else {
        const usedIcon = icon || this.createCustomIcon({ severity: 'moderate', incidentType: 'unknown' })
        marker = L.marker([lat, lng]).addTo(this.map)
      }
      
      if (popupContent) marker.bindPopup(popupContent, {
        autoPan: true,
        keepInView: true,
        maxWidth: 360,
        autoPanPaddingTopLeft: [360, 120],
        autoPanPaddingBottomRight: [120, 80],
      })
      if (persistent) this.markers.push(marker)
      return marker
    },

    async openMarkerPopup(reportId, report = null) {
      // Find by attached reportId to avoid floating point equality issues
      const marker = this.markers.find(m => m.reportId === reportId)
      if (marker) { 
        // Only pan to marker if explicitly requested and user is not currently dragging
        // By default, don't pan to avoid resetting user's map position
        if (shouldPan && !this._isUserDragging && this.map) {
          // Check if marker is already visible in current view
          const bounds = this.map.getBounds()
          const markerLatLng = marker.getLatLng()
          if (!bounds.contains(markerLatLng)) {
            // Only pan if marker is outside current view
            this.map.setView(markerLatLng, this.map.getZoom(), {
              animate: false // Don't animate to avoid conflicting with user's drag
            })
          }
        }
        marker.openPopup()
        return true 
      }
      // Fallback: if report and coordinates are provided, drop a temp marker and open
      if (report && report.coordinates) {
        const content = this.createPopupContent(report)
        await this.addPin(report.coordinates, { popupContent: content, persistent: false })
        return true
      }
      return false
    },
    
    async panToLocation(coordinates, zoom = 15) {
      if (this.map && coordinates) {
        this.map.setView([coordinates.lat, coordinates.lng], zoom, {
          animate: true,
          duration: 0.5
        });
      }
    },


    updateMarkers() {
      if (!this.map) {
        return
      }

      // Ensure map is properly sized before updating markers
      this.map.invalidateSize();

      // Remove old markers
      this.markers.forEach((marker) => this.map.removeLayer(marker))
      this.markers = []

      // Add new markers
      let created = 0
      let skipped = 0
      
      if (!this.reports || this.reports.length === 0) {
        return
      }
      
      this.reports.forEach((report, index) => {
        const coords = report.coordinates;
        const lat = coords ? Number(coords.lat) : NaN
        const lng = coords ? Number(coords.lng) : NaN
        
        if (!coords || Number.isNaN(lat) || Number.isNaN(lng)){
          skipped += 1
          return;
        }
        // Use high-visibility circle markers to ensure pins are unmistakable
        // const marker = L.circleMarker([lat, lng], {
        //   radius: 12,
        //   color: '#111827',
        //   weight: 2,
        //   fillColor: '#f59e0b',
        //   fillOpacity: 0.95,
        // }).addTo(this.map)
        const marker = L.marker([lat, lng]).addTo(this.map)

        marker.reportId = report.reportId || report.id;
        // Store coordinates on marker for later use
        marker.coordinates = { lat, lng };

        // Create popup content
        const popupContent = this.createPopupContent(report)
        marker.bindPopup(popupContent, {
          autoPan: false, // Disable autoPan to prevent map movement when user is dragging
          keepInView: false, // Don't auto-adjust view when popup opens
          maxWidth: 360,
          autoPanPaddingTopLeft: [360, 120],
          autoPanPaddingBottomRight: [120, 80],
        })

        marker.on('popupopen', () => {
          const reportId = report.reportId || report.id
          this.lastOpenMarkerId = reportId
          
          // Get the latest report object from the reports array (in case it was updated)
          const currentReport = this.reports.find(r => (r.reportId || r.id) === reportId) || report
          
          // Ensure report has coordinates when popup opens (refresh scenario)
          if (!currentReport.coordinates || !currentReport.coordinates.lat || !currentReport.coordinates.lng) {
            if (marker.coordinates) {
              currentReport.coordinates = marker.coordinates
            } else {
              const markerLatLng = marker.getLatLng()
              if (markerLatLng) {
                currentReport.coordinates = { lat: markerLatLng.lat, lng: markerLatLng.lng }
              }
            }
            // Update popup content with coordinates
            const updatedContent = this.createPopupContent(currentReport)
            marker.setPopupContent(updatedContent)
          }
          const button = document.getElementById(`accept-btn-${reportId}`)
          if (button) {
            button.addEventListener('click', () => {
              this.handleAcceptCase(currentReport)
            })
          }
        })

        marker.on('click', () => {
          this.$emit('marker-click', report)
        })

        this.markers.push(marker)
        created += 1
      })
      
      // Check for duplicate positions
      const markerPositions = this.markers.map(m => {
        const pos = m.getLatLng();
        return { reportId: m.reportId, lat: pos.lat, lng: pos.lng };
      });
      const positionMap = new Map();
      markerPositions.forEach(pos => {
        const key = `${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
        if (!positionMap.has(key)) {
          positionMap.set(key, []);
        }
        positionMap.get(key).push(pos.reportId);
      });
      
      // Verify markers are actually on the map
      const markersOnMap = this.markers.filter(m => this.map.hasLayer(m)).length
      if (markersOnMap !== this.markers.length) {
        // Re-add missing markers
        this.markers.forEach(marker => {
          if (!this.map.hasLayer(marker)) {
            marker.addTo(this.map)
          }
        })
      }

      // Only auto-fit bounds on the very first load, never again after that
      // This prevents the map from snapping back to original position after user drags
      if (this.markers.length > 0 && this._isInitialLoad) {
        const group = L.featureGroup(this.markers)
        this.map.fitBounds(group.getBounds().pad(0.1), {
          paddingTopLeft: [300, 70], // leave space for search box
          paddingBottomRight: [70, 40], // leave space for recenter button
        })
        // Mark as no longer initial load - never auto-fit again
        this._isInitialLoad = false
      } else {
      }
    },
    
    // Update popup contents without recreating markers (for property updates only)
    updatePopupContents(reports) {
      if (!this.map) return
      reports.forEach((report) => {
        const marker = this.markers.find(m => m.reportId === report.reportId)
        if (marker) {
          // Ensure report has coordinates - prefer marker's stored coordinates, then getLatLng()
          if (!report.coordinates || !report.coordinates.lat || !report.coordinates.lng) {
            if (marker.coordinates) {
              report.coordinates = marker.coordinates
            } else {
              const markerLatLng = marker.getLatLng()
              if (markerLatLng) {
                report.coordinates = { lat: markerLatLng.lat, lng: markerLatLng.lng }
              }
            }
          }
          const newContent = this.createPopupContent(report)
          marker.setPopupContent(newContent)
        }
      })
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
      const svgIcon = `
        <svg width="44" height="60" xmlns="http://www.w3.org/2000/svg">
          <path d="M22,58 Q8,44 8,30 A14,14 0 1,1 36,30 Q36,44 22,58"
            fill="${color}"
            stroke="white"
            stroke-width="3"
          <circle cx="22" cy="32" r="6" fill="white"/>
        </svg>
      `;

      return L.divIcon({
        html: svgIcon,
        className: 'leaflet-div-icon custom-marker custom-marker-bounce',
        iconSize: [44, 60],
        iconAnchor: [22, 60],
        popupAnchor: [0, -56],
      })
    },

    handleAcceptCase(report){
      this.$emit('acceptCase', report);
    },

    createPopupContent(report) {
      const species = report.speciesName || 'Unknown';
      const displayLocation = typeof report.location === 'object' 
    ? report.location.address 
    : report.location;
      
      // Ensure coordinates exist - try to get from marker if report doesn't have them
      let coordinates = report.coordinates;
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        // Try to find marker and get coordinates from it
        const reportId = report.reportId || report.id;
        if (reportId) {
          const marker = this.markers.find(m => m.reportId === reportId);
          if (marker) {
            if (marker.coordinates) {
              coordinates = marker.coordinates;
            } else {
              const markerLatLng = marker.getLatLng();
              if (markerLatLng) {
                coordinates = { lat: markerLatLng.lat, lng: markerLatLng.lng };
              }
            }
          }
        }
      }
      
      // Format coordinates if available
      let coordinatesDisplay = '';
      if (coordinates && coordinates.lat != null && coordinates.lng != null) {
        const lat = Number(coordinates.lat);
        const lng = Number(coordinates.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinatesDisplay = `
            <p style="margin: 3px 0; color: #9ca3af; font-size: 11px; display: flex; align-items: center;">
              <span style="margin-right: 6px;">🗺️</span>
              <span>${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
            </p>`;
        }
      }
      
      return `
        <div style="min-width: 280px; max-width: 320px; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h3 style="margin: 0 0 12px; color: #065f46; font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">
            ${species}
          </h3>
          
          <div style="margin: 8px 0; display: flex; align-items: center;">
            <span style="font-weight: 600; color: #374151; font-size: 13px;">Severity:</span>
            <span style="
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.5px;
              white-space: nowrap;
              background: ${this.severityColor(report).background};
              color: ${this.severityColor(report).text};
              margin-left: 8px;
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

          <div style="margin: 12px 0 8px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 4px; color: #4B5563; font-size: 13px; line-height: 1.5;">
              ${report.description}
            </p>
          </div>
            
            
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6;">
            <p style="margin: 0 0 3px; color: #6b7280; font-size: 12px; display: flex; align-items: center;">
              <span style="margin-right: 6px;">📍</span>
              <span>${displayLocation}</span>
            </p>

            ${coordinatesDisplay}

            <p style="margin: 3px 0 0; color: #9ca3af; font-size: 11px; display: flex; align-items: center;">
              <span style="margin-right: 6px;">🕐</span>
              <span>${this.formatReportTime(report.createdAt)}</span>
            </p>
          </div>

         <button 
            id="accept-btn-${report.reportId}"
            style="
              width: 100%;
              margin-top: 14px;
              padding: 10px;
              background: #059669;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
              transition: all 0.2s ease;
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(16, 185, 129, 0.3)';"
          >
            <span style="font-size: 16px; font-weight: bold; margin-right: 6px;">✓</span>
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

    recenterMap(force = false) {
      if (!this.map) return;
      
      // Only allow recenter if forced (button click) or it's the initial load
      // Once user interacts with map, don't auto-recenter unless forced
      if (!force && this._isInitialLoad === false) {
        return;
      }
      
      // Invalidate size before recentering to ensure proper calculations
      this.map.invalidateSize();
      
      // If there are markers, fit bounds to show all of them
      if (this.markers.length > 0) {
        const group = L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1), {
          paddingTopLeft: [300, 70],
          paddingBottomRight: [70, 40],
        });
      } else {
        // Default: center on Singapore with default zoom
        this.map.setView([this.center.lat, this.center.lng], 11);
      }
      
      // After manual recenter, mark as no longer initial load
      if (force) {
        this._isInitialLoad = false
      }
    },

    handleResize() {
      if (this.map) {
        // Debounce resize handling
        clearTimeout(this._resizeTimeout);
        this._resizeTimeout = setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
            // Re-enable dragging in case it was disabled
            if (!this.map.dragging.enabled()) {
              this.map.dragging.enable();
            }
            if (!this.map.touchZoom.enabled()) {
              this.map.touchZoom.enable();
            }
          }
        }, 150);
      }
    },

    // Public method to re-enable dragging if it gets disabled
    enableDragging() {
      if (this.map) {
        this.map.dragging.enable();
        this.map.touchZoom.enable();
        this.map.doubleClickZoom.enable();
        this.map.scrollWheelZoom.enable();
        this.map.invalidateSize();
      }
    },
    
  },
}
</script>

<style scoped>
* {
  font-family: Georgia, 'Times New Roman', Times, serif;
}

/* Ensure the map always has a visible height */
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: pan-x pan-y;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  z-index: 1;
  touch-action: pan-x pan-y;
  -webkit-tap-highlight-color: transparent;
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
  right: 60px;
  left: auto;
  z-index: 1000;
  display: flex;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: white;
  pointer-events: auto;
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
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 0;
}
:deep(.leaflet-popup-content) {
  margin: 0;
  width: auto !important;
}

:deep(.leaflet-popup-content) {
  margin: 0;
  width: auto !important;
}

:deep(.leaflet-popup-close-button) {
  font-size: 28px !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  color: #6b7280 !important;
  font-weight: 300 !important;
  right: 8px !important;
  top: 8px !important;
  transition: all 0.2s ease;
}

:deep(.leaflet-popup-close-button:hover) {
  color: #1f2937 !important;
  background: #f3f4f6 !important;
  border-radius: 6px;
}

:deep(.leaflet-popup-tip-container) {
  display: none;
}

.recenter-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  width: 44px;
  height: 44px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s ease;
  pointer-events: auto;
}

.recenter-btn:hover {
  background: #f3f4f6;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.recenter-btn:active {
  transform: scale(0.95);
}

/* Keyframe definition for the subtle bounce/pulse effect */
@keyframes pulse {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-5px) scale(1.05); /* Lifts and slightly enlarges */
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Apply the animation to the custom marker */


/* Keep zoom controls clickable above overlays */
:deep(.leaflet-control-container .leaflet-control-zoom) {
  z-index: 1200;
}

/* Ensure Leaflet popups are not hidden behind UI overlays */
:deep(.leaflet-pane.leaflet-popup-pane) {
  z-index: 1200 !important;
}

/* Ensure all Leaflet map panes are interactive */
:deep(.leaflet-pane) {
  pointer-events: auto !important;
}

:deep(.leaflet-tile-pane),
:deep(.leaflet-overlay-pane),
:deep(.leaflet-shadow-pane),
:deep(.leaflet-marker-pane),
:deep(.leaflet-tooltip-pane),
:deep(.leaflet-map-pane) {
  pointer-events: auto !important;
  touch-action: pan-x pan-y;
}

/* Ensure map wrapper and container are interactive */
.map-wrapper,
.leaflet-map {
  pointer-events: auto !important;
  touch-action: pan-x pan-y;
}
</style>
