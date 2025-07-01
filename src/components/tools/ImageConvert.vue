<template>
  <div class="image-convert-container">
    <div class="tool-header">
      <h3>图片格式转换</h3>
      <p>PNG ↔ WebP ↔ JPG 互相转换，保持最佳质量</p>
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
          multiple
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-content">
          <div class="upload-icon">🔄</div>
          <p>点击选择或拖拽图片文件</p>
          <small>支持 JPG、PNG、WebP、GIF、BMP 格式</small>
        </div>
      </div>
    </div>

    <div class="format-section" v-if="images.length > 0">
      <div class="format-controls">
        <div class="target-format">
          <label>目标格式</label>
          <div class="format-options">
            <button 
              v-for="format in outputFormats"
              :key="format.value"
              @click="outputFormat = format.value"
              :class="['format-btn', { active: outputFormat === format.value }]"
            >
              {{ format.label }}
            </button>
          </div>
        </div>

        <div class="quality-control" v-if="outputFormat !== 'png'">
          <label>输出质量</label>
          <div class="quality-slider">
            <input 
              type="range" 
              v-model="quality" 
              min="0.1" 
              max="1" 
              step="0.05"
            />
            <span>{{ Math.round(quality * 100) }}%</span>
          </div>
        </div>

        <div class="batch-actions">
          <button @click="convertAll" class="convert-all-btn" :disabled="converting">
            {{ converting ? '转换中...' : '批量转换' }}
          </button>
          <button @click="downloadAll" class="download-all-btn" v-if="convertedImages.length > 0">
            下载全部
          </button>
          <button @click="clearAll" class="clear-btn">清空</button>
        </div>
      </div>
    </div>

    <div class="images-section" v-if="images.length > 0">
      <div class="images-grid">
        <div 
          v-for="(image, index) in images" 
          :key="index"
          class="image-item"
        >
          <div class="image-preview">
            <img :src="image.preview" :alt="image.name" />
            <div class="format-badge">{{ image.format.toUpperCase() }}</div>
            <div class="image-overlay" v-if="image.converting">
              <div class="loading-spinner"></div>
              <span>转换中...</span>
            </div>
          </div>
          
          <div class="image-info">
            <h5>{{ image.name }}</h5>
            <div class="format-info">
              <span>{{ image.format.toUpperCase() }} → {{ outputFormat.toUpperCase() }}</span>
            </div>
            <div class="size-info">
              <span>原始: {{ formatFileSize(image.originalSize) }}</span>
              <span v-if="image.convertedSize">
                转换后: {{ formatFileSize(image.convertedSize) }}
              </span>
            </div>
            <div class="compression-info" v-if="image.convertedSize">
              <span :class="getSizeChangeClass(image.originalSize, image.convertedSize)">
                {{ getSizeChangeText(image.originalSize, image.convertedSize) }}
              </span>
            </div>
          </div>

          <div class="image-actions">
            <button 
              @click="convertImage(index)" 
              class="convert-btn"
              :disabled="image.converting"
            >
              {{ image.converting ? '转换中' : '转换' }}
            </button>
            <button 
              @click="downloadImage(index)" 
              class="download-btn"
              v-if="image.converted"
            >
              下载
            </button>
            <button @click="removeImage(index)" class="remove-btn">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h4>💡 格式说明</h4>
      <div class="format-tips">
        <div class="tip-item">
          <strong>JPEG:</strong> 适合照片，文件小，有损压缩
        </div>
        <div class="tip-item">
          <strong>PNG:</strong> 支持透明，无损压缩，适合图标
        </div>
        <div class="tip-item">
          <strong>WebP:</strong> 现代格式，压缩比最好，支持透明
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageConvert',
  data() {
    return {
      images: [],
      convertedImages: [],
      isDragOver: false,
      outputFormat: 'webp',
      quality: 0.9,
      converting: false,
      outputFormats: [
        { label: 'JPEG', value: 'jpeg' },
        { label: 'PNG', value: 'png' },
        { label: 'WebP', value: 'webp' }
      ]
    }
  },
  methods: {
    handleDrop(e) {
      this.isDragOver = false
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      )
      this.processFiles(files)
    },

    handleFileSelect(e) {
      const files = Array.from(e.target.files)
      this.processFiles(files)
    },

    async processFiles(files) {
      for (const file of files) {
        await this.addImage(file)
      }
    },

    async addImage(file) {
      const preview = URL.createObjectURL(file)
      const format = this.getImageFormat(file.type)
      
      this.images.push({
        file,
        name: file.name,
        preview,
        format,
        originalSize: file.size,
        converting: false,
        converted: false,
        convertedSize: null,
        convertedBlob: null
      })
    },

    getImageFormat(mimeType) {
      const formatMap = {
        'image/jpeg': 'jpeg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/bmp': 'bmp'
      }
      return formatMap[mimeType] || 'unknown'
    },

    async convertImage(index) {
      const image = this.images[index]
      image.converting = true

      try {
        const convertedBlob = await this.performConversion(image.file)
        image.convertedBlob = convertedBlob
        image.convertedSize = convertedBlob.size
        image.converted = true
        
        this.convertedImages.push({
          name: this.getConvertedFileName(image.name),
          blob: convertedBlob
        })
      } catch (error) {
        console.error('转换失败:', error)
        alert('转换失败: ' + error.message)
      } finally {
        image.converting = false
      }
    },

    async performConversion(file) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
          try {
            canvas.width = img.width
            canvas.height = img.height

            // 如果转换为 JPEG，先填充白色背景
            if (this.outputFormat === 'jpeg') {
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
            }

            ctx.drawImage(img, 0, 0)

            const mimeType = `image/${this.outputFormat}`
            const quality = this.outputFormat === 'png' ? undefined : this.quality

            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('转换失败'))
              }
            }, mimeType, quality)
          } catch (error) {
            reject(error)
          }
        }

        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = URL.createObjectURL(file)
      })
    },

    async convertAll() {
      this.converting = true
      
      for (let i = 0; i < this.images.length; i++) {
        if (!this.images[i].converted) {
          await this.convertImage(i)
        }
      }
      
      this.converting = false
    },

    downloadImage(index) {
      const image = this.images[index]
      if (image.convertedBlob) {
        const url = URL.createObjectURL(image.convertedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.getConvertedFileName(image.name)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    },

    async downloadAll() {
      if (this.convertedImages.length === 0) return

      if (this.convertedImages.length === 1) {
        const url = URL.createObjectURL(this.convertedImages[0].blob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.convertedImages[0].name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      try {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        this.convertedImages.forEach(img => {
          zip.file(img.name, img.blob)
        })

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'converted-images.zip'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        alert('批量下载失败，请逐个下载')
      }
    },

    removeImage(index) {
      URL.revokeObjectURL(this.images[index].preview)
      this.images.splice(index, 1)
    },

    clearAll() {
      this.images.forEach(img => URL.revokeObjectURL(img.preview))
      this.images = []
      this.convertedImages = []
    },

    getConvertedFileName(originalName) {
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
      const extension = this.outputFormat === 'jpeg' ? 'jpg' : this.outputFormat
      return `${nameWithoutExt}.${extension}`
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    getSizeChangeText(originalSize, convertedSize) {
      const diff = originalSize - convertedSize
      const percent = Math.round(Math.abs(diff) / originalSize * 100)
      
      if (diff > 0) {
        return `减少 ${percent}%`
      } else if (diff < 0) {
        return `增加 ${percent}%`
      } else {
        return '大小相同'
      }
    },

    getSizeChangeClass(originalSize, convertedSize) {
      const diff = originalSize - convertedSize
      
      if (diff > 0) {
        return 'size-decrease'
      } else if (diff < 0) {
        return 'size-increase'
      } else {
        return 'size-same'
      }
    }
  },

  beforeUnmount() {
    this.clearAll()
  }
}
</script>

<style scoped>
.image-convert-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 60px 20px;
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
  margin-bottom: 15px;
}

.format-section {
  margin: 30px 0;
  padding: 25px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.format-controls {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
  align-items: start;
}

.target-format label,
.quality-control label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.format-options {
  display: flex;
  gap: 10px;
}

.format-btn {
  padding: 8px 16px;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-btn:hover {
  border-color: var(--primary-color);
}

.format-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.quality-slider {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quality-slider input[type="range"] {
  flex: 1;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.quality-slider input[type="range"]:hover {
  height: 10px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.quality-slider input[type="range"]:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.quality-slider input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 22px;
  height: 22px;
  background: var(--primary-color);
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.quality-slider input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.quality-slider input[type="range"]::-webkit-slider-track {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  border: none;
}

.quality-slider input[type="range"]::-webkit-slider-runnable-track {
  height: 8px;
  background: linear-gradient(to right, 
    var(--primary-color) 0%, 
    var(--primary-color) var(--value, 0%), 
    var(--border-color) var(--value, 0%), 
    var(--border-color) 100%);
  border-radius: 4px;
}

/* Firefox样式 */
.quality-slider input[type="range"]::-moz-range-track {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  border: none;
}

.quality-slider input[type="range"]::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: var(--primary-color);
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.quality-slider input[type="range"]::-moz-range-progress {
  height: 8px;
  background: var(--primary-color);
  border-radius: 4px;
}

/* Edge样式 */
.quality-slider input[type="range"]::-ms-track {
  height: 8px;
  background: transparent;
  border-color: transparent;
  color: transparent;
}

.quality-slider input[type="range"]::-ms-fill-lower {
  background: var(--primary-color);
  border-radius: 4px;
}

.quality-slider input[type="range"]::-ms-fill-upper {
  background: var(--border-color);
  border-radius: 4px;
}

.quality-slider input[type="range"]::-ms-thumb {
  width: 22px;
  height: 22px;
  background: var(--primary-color);
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  cursor: pointer;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

.convert-all-btn,
.download-all-btn,
.clear-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.convert-all-btn {
  background: var(--primary-color);
  color: white;
}

.download-all-btn {
  background: var(--success-color);
  color: white;
}

.clear-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.image-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.image-preview {
  position: relative;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.format-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  gap: 10px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-info h5 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.format-info,
.size-info,
.compression-info {
  font-size: 12px;
  margin-bottom: 5px;
}

.format-info {
  color: var(--primary-color);
  font-weight: 600;
}

.size-info {
  color: var(--text-secondary);
}

.size-decrease {
  color: var(--success-color);
}

.size-increase {
  color: var(--danger-color);
}

.size-same {
  color: var(--text-secondary);
}

.image-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
}

.convert-btn,
.download-btn,
.remove-btn {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.convert-btn {
  background: var(--primary-color);
  color: white;
}

.download-btn {
  background: var(--success-color);
  color: white;
}

.remove-btn {
  background: var(--danger-color);
  color: white;
}

.tips-section {
  margin-top: 40px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.format-tips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.tip-item {
  padding: 15px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.tip-item strong {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .format-controls {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .images-grid {
    grid-template-columns: 1fr;
  }
  
  .format-tips {
    grid-template-columns: 1fr;
  }
}
</style>
