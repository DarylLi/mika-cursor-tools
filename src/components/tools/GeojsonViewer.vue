<template>
  <div class="tool-container">
    <div class="tool-header">
      <div class="header-icon">🗺️</div>
      <h2>GeoJSON 地图查看器</h2>
      <p>可视化GeoJSON地理数据，支持点、线、面等地理要素的地图展示</p>
      
      <div class="example-section">
        <span class="example-label">快速开始：</span>
        <button @click="loadExample('point')" class="example-btn">
          <i class="fas fa-map-pin"></i> 点数据
        </button>
        <button @click="loadExample('polygon')" class="example-btn">
          <i class="fas fa-draw-polygon"></i> 面数据
        </button>
        <button @click="loadExample('line')" class="example-btn">
          <i class="fas fa-route"></i> 线数据
        </button>
      </div>
    </div>

    <div class="editor-layout">
      <div class="editor-card">
        <div class="card-header">
          <h3><i class="fas fa-code"></i> GeoJSON 数据</h3>
          <div class="header-actions">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".geojson,.json"
              style="display: none"
            />
            <button @click="$refs.fileInput.click()" class="action-btn">
              <i class="fas fa-upload"></i> 上传文件
            </button>
          </div>
        </div>
        
        <div class="editor-section">
          <textarea
            v-model="geojsonData"
            placeholder="在此粘贴GeoJSON数据..."
            class="geojson-editor"
            @input="validateAndRender"
          ></textarea>
          
          <div class="data-info">
            <div class="validation-status" :class="{ valid: isValidGeoJSON, invalid: !isValidGeoJSON && geojsonData.trim() }">
              <i :class="isValidGeoJSON ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
              {{ validationMessage }}
            </div>
            <div v-if="geoData" class="features-info">
              要素数量: {{ featureCount }}
            </div>
          </div>
        </div>

        <div v-if="geoData" class="features-list">
          <h4><i class="fas fa-list"></i> 地理要素</h4>
          <div class="feature-items">
            <div v-for="(feature, index) in geoData.features" :key="index" 
                 class="feature-item" 
                 @click="highlightFeature(index)"
                 :class="{ active: selectedFeature === index }">
              <div class="feature-type">
                <i :class="getFeatureIcon(feature.geometry.type)"></i>
                {{ feature.geometry.type }}
              </div>
              <div class="feature-props" v-if="feature.properties">
                <span v-for="(value, key) in feature.properties" :key="key" class="prop-item">
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="map-card">
        <div class="card-header">
          <h3><i class="fas fa-map"></i> 地图视图</h3>
          <div class="map-controls">
            <button @click="fitToData" class="action-btn" :disabled="!geoData">
              <i class="fas fa-expand-arrows-alt"></i> 适应数据
            </button>
            <button @click="downloadImage" class="action-btn" :disabled="!geoData">
              <i class="fas fa-download"></i> 下载图片
            </button>
          </div>
        </div>
        
        <div class="map-container" ref="mapContainer">
          <div v-if="!geojsonData.trim()" class="map-placeholder">
            <i class="fas fa-map"></i>
            <p>输入GeoJSON数据查看地图</p>
          </div>
          
          <div v-else-if="!isValidGeoJSON" class="map-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>GeoJSON格式错误</p>
          </div>
          
          <div v-else class="map-view">
            <svg ref="mapSvg" width="100%" height="100%" viewBox="0 0 600 400">
              <g ref="mapGroup">
                <!-- 地理要素将在这里渲染 -->
              </g>
            </svg>
          </div>
        </div>

        <div v-if="geoData" class="map-info">
          <div class="info-item">
            <strong>坐标系:</strong> {{ coordinateSystem }}
          </div>
          <div class="info-item">
            <strong>边界:</strong> {{ boundsInfo }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="success" class="success-card">
      <i class="fas fa-check-circle"></i> {{ success }}
    </div>

    <div class="help-card">
      <h4><i class="fas fa-info-circle"></i> 使用说明</h4>
      <div class="help-content">
        <div class="help-section">
          <h5>支持的几何类型：</h5>
          <ul>
            <li><strong>Point</strong> - 点要素</li>
            <li><strong>LineString</strong> - 线要素</li>
            <li><strong>Polygon</strong> - 面要素</li>
            <li><strong>MultiPoint</strong> - 多点要素</li>
            <li><strong>MultiLineString</strong> - 多线要素</li>
            <li><strong>MultiPolygon</strong> - 多面要素</li>
          </ul>
        </div>
        
        <div class="help-section">
          <h5>GeoJSON格式示例：</h5>
          <pre><code>{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [116.404, 39.915]
      },
      "properties": {
        "name": "北京"
      }
    }
  ]
}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'

export default {
  name: 'GeojsonViewer',
  setup() {
    const geojsonData = ref('')
    const geoData = ref(null)
    const isValidGeoJSON = ref(false)
    const selectedFeature = ref(-1)
    const success = ref('')
    const mapContainer = ref(null)
    const mapSvg = ref(null)
    const mapGroup = ref(null)

    const validationMessage = computed(() => {
      if (!geojsonData.value.trim()) return '等待输入GeoJSON数据'
      return isValidGeoJSON.value ? 'GeoJSON格式正确' : 'GeoJSON格式错误'
    })

    const featureCount = computed(() => {
      return geoData.value ? geoData.value.features.length : 0
    })

    const coordinateSystem = computed(() => {
      if (!geoData.value) return 'WGS84'
      return geoData.value.crs ? geoData.value.crs.properties.name : 'WGS84 (默认)'
    })

    const boundsInfo = computed(() => {
      if (!geoData.value) return '无数据'
      const bounds = calculateBounds()
      if (!bounds) return '无法计算'
      return `${bounds.minX.toFixed(3)}, ${bounds.minY.toFixed(3)} 到 ${bounds.maxX.toFixed(3)}, ${bounds.maxY.toFixed(3)}`
    })

    const examples = {
      point: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [116.404, 39.915] },
            properties: { name: "北京", population: 21540000 }
          },
          {
            type: "Feature", 
            geometry: { type: "Point", coordinates: [121.472, 31.231] },
            properties: { name: "上海", population: 24280000 }
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [113.280, 23.125] },
            properties: { name: "广州", population: 14904000 }
          }
        ]
      },
      polygon: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[
                [116.3, 39.8], [116.5, 39.8], 
                [116.5, 40.0], [116.3, 40.0], 
                [116.3, 39.8]
              ]]
            },
            properties: { name: "区域A", area: 1000 }
          }
        ]
      },
      line: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [116.3, 39.9], [116.4, 39.95], 
                [116.5, 39.9], [116.6, 39.95]
              ]
            },
            properties: { name: "路线1", length: 10 }
          }
        ]
      }
    }

    const loadExample = (type) => {
      geojsonData.value = JSON.stringify(examples[type], null, 2)
      validateAndRender()
    }

    const validateAndRender = () => {
      try {
        if (!geojsonData.value.trim()) {
          isValidGeoJSON.value = false
          geoData.value = null
          return
        }

        const parsed = JSON.parse(geojsonData.value)
        
        // Basic GeoJSON validation
        if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
          geoData.value = parsed
          isValidGeoJSON.value = true
          selectedFeature.value = -1
          nextTick(() => renderMap())
        } else if (parsed.type === 'Feature') {
          geoData.value = {
            type: 'FeatureCollection',
            features: [parsed]
          }
          isValidGeoJSON.value = true
          selectedFeature.value = -1
          nextTick(() => renderMap())
        } else {
          isValidGeoJSON.value = false
          geoData.value = null
        }
      } catch (error) {
        isValidGeoJSON.value = false
        geoData.value = null
      }
    }

    const calculateBounds = () => {
      if (!geoData.value) return null
      
      let minX = Infinity, minY = Infinity
      let maxX = -Infinity, maxY = -Infinity
      
      geoData.value.features.forEach(feature => {
        const coords = extractCoordinates(feature.geometry)
        coords.forEach(coord => {
          minX = Math.min(minX, coord[0])
          maxX = Math.max(maxX, coord[0])
          minY = Math.min(minY, coord[1])
          maxY = Math.max(maxY, coord[1])
        })
      })
      
      return { minX, minY, maxX, maxY }
    }

    const extractCoordinates = (geometry) => {
      const coords = []
      
      switch (geometry.type) {
        case 'Point':
          coords.push(geometry.coordinates)
          break
        case 'LineString':
          coords.push(...geometry.coordinates)
          break
        case 'Polygon':
          coords.push(...geometry.coordinates[0])
          break
        case 'MultiPoint':
          coords.push(...geometry.coordinates)
          break
        case 'MultiLineString':
          geometry.coordinates.forEach(line => coords.push(...line))
          break
        case 'MultiPolygon':
          geometry.coordinates.forEach(polygon => coords.push(...polygon[0]))
          break
      }
      
      return coords
    }

    const renderMap = () => {
      if (!mapGroup.value || !geoData.value) return
      
      // Clear previous content
      mapGroup.value.innerHTML = ''
      
      const bounds = calculateBounds()
      if (!bounds) return
      
      // Calculate scale and offset
      const padding = 50
      const width = 600 - padding * 2
      const height = 400 - padding * 2
      
      const scaleX = width / (bounds.maxX - bounds.minX || 1)
      const scaleY = height / (bounds.maxY - bounds.minY || 1)
      const scale = Math.min(scaleX, scaleY) * 0.8
      
      const offsetX = padding + (width - (bounds.maxX - bounds.minX) * scale) / 2
      const offsetY = padding + (height - (bounds.maxY - bounds.minY) * scale) / 2
      
      // Transform coordinates
      const transform = (coord) => [
        offsetX + (coord[0] - bounds.minX) * scale,
        height + padding - offsetY - (coord[1] - bounds.minY) * scale
      ]
      
      // Render features
      geoData.value.features.forEach((feature, index) => {
        const element = renderFeature(feature, transform, index)
        if (element) {
          mapGroup.value.appendChild(element)
        }
      })
    }

    const renderFeature = (feature, transform, index) => {
      const geometry = feature.geometry
      const isSelected = selectedFeature.value === index
      
      switch (geometry.type) {
        case 'Point':
          return renderPoint(geometry.coordinates, transform, isSelected)
        case 'LineString':
          return renderLineString(geometry.coordinates, transform, isSelected)
        case 'Polygon':
          return renderPolygon(geometry.coordinates, transform, isSelected)
        default:
          return null
      }
    }

    const renderPoint = (coordinates, transform, isSelected) => {
      const [x, y] = transform(coordinates)
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', x)
      circle.setAttribute('cy', y)
      circle.setAttribute('r', isSelected ? 8 : 5)
      circle.setAttribute('fill', isSelected ? '#ef4444' : '#3b82f6')
      circle.setAttribute('stroke', '#ffffff')
      circle.setAttribute('stroke-width', '2')
      return circle
    }

    const renderLineString = (coordinates, transform, isSelected) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      let d = ''
      
      coordinates.forEach((coord, i) => {
        const [x, y] = transform(coord)
        d += (i === 0 ? 'M' : 'L') + x + ',' + y
      })
      
      path.setAttribute('d', d)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', isSelected ? '#ef4444' : '#8b5cf6')
      path.setAttribute('stroke-width', isSelected ? '4' : '2')
      return path
    }

    const renderPolygon = (coordinates, transform, isSelected) => {
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      const points = coordinates[0].map(coord => {
        const [x, y] = transform(coord)
        return `${x},${y}`
      }).join(' ')
      
      polygon.setAttribute('points', points)
      polygon.setAttribute('fill', isSelected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)')
      polygon.setAttribute('stroke', isSelected ? '#ef4444' : '#22c55e')
      polygon.setAttribute('stroke-width', '2')
      return polygon
    }

    const getFeatureIcon = (type) => {
      const icons = {
        Point: 'fas fa-map-pin',
        LineString: 'fas fa-route',
        Polygon: 'fas fa-draw-polygon',
        MultiPoint: 'fas fa-map-pin',
        MultiLineString: 'fas fa-route',
        MultiPolygon: 'fas fa-draw-polygon'
      }
      return icons[type] || 'fas fa-map-marker'
    }

    const highlightFeature = (index) => {
      selectedFeature.value = selectedFeature.value === index ? -1 : index
      renderMap()
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        geojsonData.value = e.target.result
        validateAndRender()
      }
      reader.readAsText(file)
    }

    const fitToData = () => {
      renderMap()
      success.value = '已适应数据范围'
      setTimeout(() => success.value = '', 3000)
    }

    const downloadImage = () => {
      if (!mapSvg.value) return
      
      const svgData = new XMLSerializer().serializeToString(mapSvg.value)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      canvas.width = 600
      canvas.height = 400
      
      img.onload = () => {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        
        const link = document.createElement('a')
        link.download = 'geojson-map.png'
        link.href = canvas.toDataURL()
        link.click()
        
        success.value = '地图图片已下载'
        setTimeout(() => success.value = '', 3000)
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }

    return {
      geojsonData,
      geoData,
      isValidGeoJSON,
      selectedFeature,
      success,
      mapContainer,
      mapSvg,
      mapGroup,
      validationMessage,
      featureCount,
      coordinateSystem,
      boundsInfo,
      loadExample,
      validateAndRender,
      getFeatureIcon,
      highlightFeature,
      handleFileUpload,
      fitToData,
      downloadImage
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 10px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
}

.header-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.9;
}

.tool-header h2 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
}

.tool-header p {
  margin: 0 0 24px 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
}

.example-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.example-label {
  font-size: 14px;
  opacity: 0.8;
}

.example-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.example-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.editor-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  margin-bottom: 10px;
}

.editor-card, .map-card, .help-card, .success-card {
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f8fafc;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions, .map-controls {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.geojson-editor {
  width: 100%;
  height: 300px;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.geojson-editor:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  background: white;
}

.data-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 12px;
}

.validation-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.validation-status.valid {
  color: #059669;
}

.validation-status.invalid {
  color: #dc2626;
}

.features-info {
  color: #6b7280;
  font-weight: 500;
}

.features-list {
  margin-top: 24px;
}

.features-list h4 {
  margin: 0 0 16px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.feature-items {
  max-height: 300px;
  overflow-y: auto;
}

.feature-item {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-item:hover {
  border-color: #22c55e;
  background: #f0fdf4;
}

.feature-item.active {
  border-color: #ef4444;
  background: #fef2f2;
}

.feature-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.feature-props {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prop-item {
  font-size: 12px;
  color: #6b7280;
  background: #f8fafc;
  padding: 10px;
  border-radius: 4px;
}

.map-container {
  height: 500px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.map-placeholder, .map-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.map-placeholder i, .map-error i {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.map-error {
  color: #dc2626;
}

.map-view {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.map-info {
  margin-top: 16px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.info-item {
  font-size: 14px;
  color: #4a5568;
}

.success-card {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  margin-bottom: 10px;
}

.help-card h4 {
  margin: 0 0 20px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.help-section h5 {
  margin: 0 0 12px 0;
  color: #4a5568;
  font-size: 16px;
  font-weight: 600;
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 10px;
  color: #4a5568;
  line-height: 1.4;
}

.help-section pre {
  margin: 0;
  background: #1f2937;
  color: #f9fafb;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.4;
}

@media (max-width: 1200px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tool-container {
    padding: 10px;
  }
  
  .help-content {
    grid-template-columns: 1fr;
  }
  
  .example-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .data-info, .map-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style> 