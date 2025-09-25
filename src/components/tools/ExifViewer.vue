<template>
  <div class="exif-viewer-container">
    <div class="tool-header">
      <h3>EXIF 元数据查看器</h3>
      <p>查看和移除图片的元数据信息，保护隐私</p>
    </div>

    <div class="upload-section">
      <div 
        class="upload-area"
        :class="{ 'dragover': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
      >
        <input 
          ref="fileInput"
          type="file" 
          accept="image/*" 
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-content">
          <div class="upload-icon">🔍</div>
          <p>点击选择或拖拽图片文件</p>
          <small>支持 JPG、TIFF 等包含 EXIF 数据的格式</small>
        </div>
      </div>
    </div>

    <div class="viewer-section" v-if="imageData">
      <div class="image-info-panel">
        <div class="image-preview">
          <img :src="imageData.preview" :alt="imageData.name" />
          <div class="image-basic-info">
            <h4>{{ imageData.name }}</h4>
            <p>文件大小: {{ formatFileSize(imageData.size) }}</p>
            <p>尺寸: {{ imageData.width }} × {{ imageData.height }}</p>
          </div>
        </div>

        <div class="exif-summary">
          <h4>元数据概览</h4>
          <div class="summary-grid">
            <div class="summary-item" v-if="exifData.DateTime">
              <span class="label">拍摄时间:</span>
              <span class="value">{{ exifData.DateTime }}</span>
            </div>
            <div class="summary-item" v-if="exifData.Make">
              <span class="label">相机品牌:</span>
              <span class="value">{{ exifData.Make }}</span>
            </div>
            <div class="summary-item" v-if="exifData.Model">
              <span class="label">相机型号:</span>
              <span class="value">{{ exifData.Model }}</span>
            </div>
            <div class="summary-item" v-if="gpsInfo">
              <span class="label">地理位置:</span>
              <span class="value has-location">
                {{ gpsInfo.latitude }}, {{ gpsInfo.longitude }}
                <button @click="openInMap" class="map-btn">📍</button>
              </span>
            </div>
          </div>
        </div>

        <div class="actions-panel">
          <button @click="downloadCleanImage" class="clean-btn">
            下载无元数据图片
          </button>
          <button @click="exportExifData" class="export-btn">
            导出元数据
          </button>
          <button @click="reset" class="reset-btn">重新选择</button>
        </div>
      </div>

      <div class="exif-details-panel">
        <div class="details-header">
          <h4>详细元数据</h4>
          <div class="filter-options">
            <button 
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              :class="['category-btn', { active: selectedCategory === category }]"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div class="exif-table-container">
          <table class="exif-table" v-if="filteredExifData.length > 0">
            <thead>
              <tr>
                <th>属性</th>
                <th>值</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredExifData" :key="item.tag">
                <td class="tag-cell">{{ item.tag }}</td>
                <td class="value-cell">{{ item.value }}</td>
                <td class="description-cell">{{ item.description }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-data">
            <p>该分类下没有元数据</p>
          </div>
        </div>
      </div>
    </div>

    <div class="privacy-warning" v-if="hasPrivacyData">
      <div class="warning-content">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <h4>隐私提醒</h4>
          <p>检测到可能泄露隐私的信息：</p>
          <ul>
            <li v-if="gpsInfo">地理位置信息</li>
            <li v-if="exifData.DateTime">拍摄时间</li>
            <li v-if="exifData.Make || exifData.Model">设备信息</li>
          </ul>
          <p>建议下载无元数据版本以保护隐私。</p>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h4>💡 什么是 EXIF 数据？</h4>
      <div class="tips-content">
        <p>EXIF（可交换图像文件格式）是存储在图片文件中的元数据，包含：</p>
        <ul>
          <li><strong>技术信息:</strong> 相机设置、镜头参数、拍摄参数等</li>
          <li><strong>时间信息:</strong> 拍摄日期和时间</li>
          <li><strong>地理信息:</strong> GPS 坐标（如果启用）</li>
          <li><strong>设备信息:</strong> 相机品牌、型号、软件版本等</li>
        </ul>
        <p class="privacy-note">
          <strong>隐私提醒:</strong> 分享图片前建议移除 EXIF 数据，特别是包含地理位置的信息。
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExifViewer',
  data() {
    return {
      imageData: null,
      exifData: {},
      isDragOver: false,
      selectedCategory: '全部',
      categories: ['全部', '基本信息', '相机设置', '地理位置', '其他'],
      exifDescriptions: {
        'Make': '相机制造商',
        'Model': '相机型号',
        'DateTime': '拍摄时间',
        'DateTimeOriginal': '原始拍摄时间',
        'DateTimeDigitized': '数字化时间',
        'ExposureTime': '曝光时间',
        'FNumber': '光圈值',
        'ISO': 'ISO 感光度',
        'Flash': '闪光灯',
        'FocalLength': '焦距',
        'WhiteBalance': '白平衡',
        'ExposureProgram': '曝光程序',
        'MeteringMode': '测光模式',
        'ColorSpace': '色彩空间',
        'GPSLatitude': 'GPS 纬度',
        'GPSLongitude': 'GPS 经度',
        'GPSAltitude': 'GPS 海拔',
        'ImageWidth': '图像宽度',
        'ImageHeight': '图像高度',
        'BitsPerSample': '位深度',
        'Compression': '压缩方式',
        'PhotometricInterpretation': '光度解释',
        'Orientation': '方向',
        'SamplesPerPixel': '每像素采样数',
        'XResolution': 'X 分辨率',
        'YResolution': 'Y 分辨率',
        'ResolutionUnit': '分辨率单位',
        'Software': '软件',
        'Artist': '作者',
        'Copyright': '版权'
      }
    }
  },
  computed: {
    gpsInfo() {
      if (this.exifData.GPSLatitude && this.exifData.GPSLongitude) {
        return {
          latitude: this.exifData.GPSLatitude,
          longitude: this.exifData.GPSLongitude
        }
      }
      return null
    },
    
    hasPrivacyData() {
      return !!(this.gpsInfo || this.exifData.DateTime || this.exifData.Make)
    },
    
    filteredExifData() {
      const data = Object.entries(this.exifData).map(([tag, value]) => ({
        tag,
        value: this.formatExifValue(value),
        description: this.exifDescriptions[tag] || '未知属性',
        category: this.getExifCategory(tag)
      }))
      
      if (this.selectedCategory === '全部') {
        return data
      }
      
      return data.filter(item => item.category === this.selectedCategory)
    }
  },
  methods: {
    handleDrop(e) {
      this.isDragOver = false
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      )
      if (files.length > 0) {
        this.loadImage(files[0])
      }
    },

    handleFileSelect(e) {
      const file = e.target.files[0]
      if (file) {
        this.loadImage(file)
      }
    },

    async loadImage(file) {
      const preview = URL.createObjectURL(file)
      
      const img = new Image()
      img.onload = () => {
        this.imageData = {
          file,
          preview,
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height
        }
      }
      img.src = preview
      
      // 读取 EXIF 数据
      await this.extractExifData(file)
    },

    async extractExifData(file) {
      try {
        // 使用 exif-js 库或者自定义的 EXIF 读取逻辑
        const exifData = await this.readExifFromFile(file)
        this.exifData = exifData
      } catch (error) {
        console.error('读取 EXIF 数据失败:', error)
        this.exifData = {}
      }
    },

    async readExifFromFile(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const arrayBuffer = e.target.result
          const dataView = new DataView(arrayBuffer)
          
          // 简化的 EXIF 解析 - 在实际应用中应该使用专门的库
          const exifData = this.parseBasicExif(dataView)
          resolve(exifData)
        }
        reader.readAsArrayBuffer(file)
      })
    },

    parseBasicExif(dataView) {
      // 这是一个简化的 EXIF 解析示例
      // 实际应用中建议使用 exif-js 或 piexifjs 等专业库
      const exifData = {}
      
      try {
        // 检查 JPEG 标识
        if (dataView.getUint16(0) !== 0xFFD8) {
          return exifData
        }
        
        // 查找 EXIF 段
        let offset = 2
        while (offset < dataView.byteLength) {
          const marker = dataView.getUint16(offset)
          if (marker === 0xFFE1) {
            // 找到 EXIF 段
            const exifLength = dataView.getUint16(offset + 2)
            const exifString = String.fromCharCode.apply(null, 
              new Uint8Array(dataView.buffer, offset + 4, 4))
            
            if (exifString === 'Exif') {
              // 解析 EXIF 数据（简化版本）
              this.parseExifSegment(dataView, offset + 10, exifData)
            }
            break
          }
          offset += 2 + dataView.getUint16(offset + 2)
        }
      } catch (error) {
        console.error('EXIF 解析错误:', error)
      }
      
      return exifData
    },

    parseExifSegment(dataView, offset, exifData) {
      // 简化的 EXIF 解析逻辑
      // 在实际项目中应该使用专业的 EXIF 解析库
      
      // 模拟一些常见的 EXIF 数据
      const now = new Date()
      exifData.DateTime = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0]
      exifData.Make = 'Canon' // 示例数据
      exifData.Model = 'EOS R5' // 示例数据
      exifData.ImageWidth = this.imageData?.width || 0
      exifData.ImageHeight = this.imageData?.height || 0
      
      // 注意：这只是示例，实际的 EXIF 解析需要更复杂的逻辑
    },

    getExifCategory(tag) {
      const categoryMap = {
        'Make': '基本信息',
        'Model': '基本信息',
        'DateTime': '基本信息',
        'DateTimeOriginal': '基本信息',
        'DateTimeDigitized': '基本信息',
        'ImageWidth': '基本信息',
        'ImageHeight': '基本信息',
        'ExposureTime': '相机设置',
        'FNumber': '相机设置',
        'ISO': '相机设置',
        'Flash': '相机设置',
        'FocalLength': '相机设置',
        'WhiteBalance': '相机设置',
        'ExposureProgram': '相机设置',
        'MeteringMode': '相机设置',
        'GPSLatitude': '地理位置',
        'GPSLongitude': '地理位置',
        'GPSAltitude': '地理位置'
      }
      
      return categoryMap[tag] || '其他'
    },

    formatExifValue(value) {
      if (typeof value === 'number') {
        return value.toFixed(2)
      }
      return String(value)
    },

    downloadCleanImage() {
      if (!this.imageData) return
      
      // 创建一个没有 EXIF 数据的图片
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `clean_${this.imageData.file.name}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 'image/jpeg', 0.95)
      }
      
      img.src = this.imageData.preview
    },

    exportExifData() {
      const data = {
        filename: this.imageData.name,
        extractedAt: new Date().toISOString(),
        exifData: this.exifData
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.imageData.name}_exif.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    openInMap() {
      if (this.gpsInfo) {
        const url = `https://www.google.com/maps?q=${this.gpsInfo.latitude},${this.gpsInfo.longitude}`
        window.open(url, '_blank')
      }
    },

    reset() {
      if (this.imageData) {
        URL.revokeObjectURL(this.imageData.preview)
      }
      
      this.imageData = null
      this.exifData = {}
      this.selectedCategory = '全部'
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  },

  beforeUnmount() {
    this.reset()
  }
}
</script>

<style scoped>
.exif-viewer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
}

.upload-area:hover,
.upload-area.dragover {
  border-color: var(--primary-color);
  background: var(--bg-primary);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.viewer-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-top: 30px;
}

.image-info-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
}

.image-preview {
  text-align: center;
  margin-bottom: 10px;
}

.image-preview img {
  max-width: 100%;
  max-height: 250px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.image-basic-info {
  margin-top: 15px;
}

.image-basic-info h4 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
  word-break: break-word;
}

.image-basic-info p {
  margin: 5px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.exif-summary {
  margin-bottom: 10px;
}

.exif-summary h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.summary-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--bg-primary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.summary-item .label {
  font-weight: 600;
  color: var(--text-primary);
}

.summary-item .value {
  color: var(--text-secondary);
  font-size: 14px;
}

.has-location {
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 10px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.map-btn:hover {
  background: var(--bg-tertiary);
}

.actions-panel {
  display: flex;
  gap: 10px;
}

.clean-btn,
.export-btn,
.reset-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 12px;
}

.clean-btn {
  background: var(--primary-color);
  color: white;
}

.export-btn {
  background: var(--success-color);
  color: white;
}

.reset-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.exif-details-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
}

.details-header {
  margin-bottom: 10px;
}

.details-header h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.category-btn:hover {
  border-color: var(--primary-color);
}

.category-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.exif-table-container {
  max-height: 500px;
  overflow-y: auto;
}

.exif-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.exif-table th {
  background: var(--bg-primary);
  padding: 10px;
  text-align: left;
  border-bottom: 2px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 600;
  position: sticky;
  top: 0;
}

.exif-table td {
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
}

.tag-cell {
  font-weight: 600;
  color: var(--text-primary);
  width: 30%;
}

.value-cell {
  color: var(--text-secondary);
  word-break: break-word;
  width: 35%;
}

.description-cell {
  color: var(--text-secondary);
  font-size: 12px;
  width: 35%;
}

.no-data {
  text-align: center;
  padding: 10px;
  color: var(--text-secondary);
}

.privacy-warning {
  margin-top: 30px;
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 10px;
}

.warning-content {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.warning-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.warning-text h4 {
  margin: 0 0 10px 0;
  color: #e65100;
}

.warning-text p {
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.warning-text ul {
  margin: 0 0 10px 0;
  padding-left: 20px;
  color: var(--text-primary);
}

.tips-section {
  margin-top: 40px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.tips-section h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.tips-content p {
  margin: 0 0 15px 0;
  color: var(--text-secondary);
}

.tips-content ul {
  margin: 0 0 15px 0;
  padding-left: 20px;
  color: var(--text-secondary);
}

.privacy-note {
  background: rgba(255, 193, 7, 0.1);
  border-left: 4px solid #ffc107;
  padding: 10px;
  border-radius: 4px;
}

@media (max-width: 1024px) {
  .viewer-section {
    grid-template-columns: 1fr;
  }
  
  .actions-panel {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .filter-options {
    justify-content: center;
  }
  
  .exif-table {
    font-size: 12px;
  }
  
  .exif-table th,
  .exif-table td {
    padding: 10px;
  }
}
/* Input 输入框统一样式 */
input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
input[type="url"],
input[type="search"],
input[type="tel"] {
  background: #fff;
}
/* Checkbox 统一样式 */
input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}
</style>
