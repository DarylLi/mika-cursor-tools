<template>
  <div class="image-resize-container">
    <div class="tool-header">
      <h3>图片尺寸调整</h3>
      <p>等比缩放或自定义尺寸，保持图片质量</p>
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
          <div class="upload-icon">🖼️</div>
          <p>点击选择或拖拽图片文件</p>
          <small>支持 JPG、PNG、WebP、GIF 格式</small>
        </div>
      </div>
    </div>

    <div class="editor-section" v-if="originalImage">
      <div class="image-preview-container">
        <div class="preview-panel">
          <h4>原始图片</h4>
          <div class="image-wrapper">
            <img :src="originalImage.preview" alt="原图" />
            <div class="image-info">
              <p>{{ originalImage.width }} × {{ originalImage.height }}</p>
              <p>{{ formatFileSize(originalImage.size) }}</p>
            </div>
          </div>
        </div>

        <div class="preview-panel" v-if="resizedImage">
          <h4>调整后</h4>
          <div class="image-wrapper">
            <img :src="resizedImage.preview" alt="调整后" />
            <div class="image-info">
              <p>{{ newWidth }} × {{ newHeight }}</p>
              <p>{{ formatFileSize(resizedImage.size) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="controls-section">
        <div class="resize-methods">
          <h4>调整方式</h4>
          <div class="method-options">
            <label class="method-option">
              <input 
                type="radio" 
                v-model="resizeMethod" 
                value="percentage"
              />
              <span>按百分比</span>
            </label>
            <label class="method-option">
              <input 
                type="radio" 
                v-model="resizeMethod" 
                value="pixels"
              />
              <span>按像素</span>
            </label>
            <label class="method-option">
              <input 
                type="radio" 
                v-model="resizeMethod" 
                value="preset"
              />
              <span>预设尺寸</span>
            </label>
          </div>
        </div>

        <div class="resize-controls" v-if="resizeMethod === 'percentage'">
          <div class="control-group">
            <label>缩放比例</label>
            <div class="percentage-control">
              <input 
                type="range" 
                v-model="scalePercentage" 
                min="10" 
                max="500" 
                step="5"
                @input="updateFromPercentage"
              />
              <input 
                type="number" 
                v-model="scalePercentage" 
                min="10" 
                max="500"
                @input="updateFromPercentage"
                class="percentage-input"
              />
              <span>%</span>
            </div>
          </div>
        </div>

        <div class="resize-controls" v-if="resizeMethod === 'pixels'">
          <div class="control-group">
            <label class="lock-ratio-label">
              <input 
                type="checkbox" 
                v-model="maintainRatio"
                @change="updateFromPixels"
              />
              <span>保持宽高比</span>
            </label>
          </div>
          <div class="pixel-controls">
            <div class="pixel-input-group">
              <label>宽度</label>
              <input 
                type="number" 
                v-model="newWidth" 
                min="1"
                @input="updateFromWidth"
                class="pixel-input"
              />
            </div>
            <div class="pixel-input-group">
              <label>高度</label>
              <input 
                type="number" 
                v-model="newHeight" 
                min="1"
                @input="updateFromHeight"
                class="pixel-input"
              />
            </div>
          </div>
        </div>

        <div class="resize-controls" v-if="resizeMethod === 'preset'">
          <div class="preset-grid">
            <button 
              v-for="preset in presetSizes"
              :key="preset.name"
              @click="applyPreset(preset)"
              class="preset-btn"
            >
              <strong>{{ preset.name }}</strong>
              <span>{{ preset.width }} × {{ preset.height }}</span>
            </button>
          </div>
        </div>

        <div class="quality-section">
          <div class="control-group">
            <label>输出质量</label>
            <div class="quality-control">
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
        </div>

        <div class="action-buttons">
          <button @click="processResize" class="resize-btn" :disabled="processing">
            {{ processing ? '处理中...' : '应用调整' }}
          </button>
          <button 
            @click="downloadImage" 
            class="download-btn"
            v-if="resizedImage"
          >
            下载图片
          </button>
          <button @click="reset" class="reset-btn">重置</button>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h4>💡 使用提示</h4>
      <ul>
        <li>保持宽高比可避免图片变形</li>
        <li>放大图片可能会降低清晰度</li>
        <li>缩小图片有助于减少文件大小</li>
        <li>建议质量设置在 80-95% 之间</li>
        <li>所有处理都在本地完成，不会上传到服务器</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageResize',
  data() {
    return {
      originalImage: null,
      resizedImage: null,
      isDragOver: false,
      resizeMethod: 'percentage',
      scalePercentage: 100,
      newWidth: 0,
      newHeight: 0,
      maintainRatio: true,
      quality: 0.9,
      processing: false,
      presetSizes: [
        { name: '头像', width: 256, height: 256 },
        { name: '缩略图', width: 150, height: 150 },
        { name: 'Instagram', width: 1080, height: 1080 },
        { name: 'Facebook封面', width: 1200, height: 630 },
        { name: 'Twitter头图', width: 1500, height: 500 },
        { name: '微信头像', width: 300, height: 300 },
        { name: '4K', width: 3840, height: 2160 },
        { name: '2K', width: 2560, height: 1440 },
        { name: 'Full HD', width: 1920, height: 1080 },
        { name: 'HD', width: 1280, height: 720 }
      ]
    }
  },
  computed: {
    aspectRatio() {
      if (!this.originalImage) return 1
      return this.originalImage.width / this.originalImage.height
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

    loadImage(file) {
      const preview = URL.createObjectURL(file)
      const img = new Image()
      
      img.onload = () => {
        this.originalImage = {
          file,
          preview,
          width: img.width,
          height: img.height,
          size: file.size
        }
        this.newWidth = img.width
        this.newHeight = img.height
        this.resizedImage = null
      }
      
      img.src = preview
    },

    updateFromPercentage() {
      if (!this.originalImage) return
      this.newWidth = Math.round(this.originalImage.width * this.scalePercentage / 100)
      this.newHeight = Math.round(this.originalImage.height * this.scalePercentage / 100)
    },

    updateFromWidth() {
      if (!this.originalImage || !this.maintainRatio) return
      this.newHeight = Math.round(this.newWidth / this.aspectRatio)
    },

    updateFromHeight() {
      if (!this.originalImage || !this.maintainRatio) return
      this.newWidth = Math.round(this.newHeight * this.aspectRatio)
    },

    updateFromPixels() {
      if (!this.originalImage) return
      if (this.maintainRatio) {
        this.updateFromWidth()
      }
    },

    applyPreset(preset) {
      this.newWidth = preset.width
      this.newHeight = preset.height
    },

    async processResize() {
      if (!this.originalImage) return
      
      this.processing = true
      
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = this.originalImage.preview
        })
        
        canvas.width = this.newWidth
        canvas.height = this.newHeight
        
        // 使用高质量绘制
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, this.newWidth, this.newHeight)
        
        const resizedBlob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', this.quality)
        })
        
        this.resizedImage = {
          preview: URL.createObjectURL(resizedBlob),
          blob: resizedBlob,
          size: resizedBlob.size
        }
        
      } catch (error) {
        console.error('处理失败:', error)
        alert('图片处理失败')
      } finally {
        this.processing = false
      }
    },

    downloadImage() {
      if (!this.resizedImage) return
      
      const url = URL.createObjectURL(this.resizedImage.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resized_${this.newWidth}x${this.newHeight}_${this.originalImage.file.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    reset() {
      if (this.originalImage) {
        URL.revokeObjectURL(this.originalImage.preview)
      }
      if (this.resizedImage) {
        URL.revokeObjectURL(this.resizedImage.preview)
      }
      
      this.originalImage = null
      this.resizedImage = null
      this.scalePercentage = 100
      this.newWidth = 0
      this.newHeight = 0
      this.resizeMethod = 'percentage'
      this.maintainRatio = true
      this.quality = 0.9
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
.image-resize-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h3 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.tool-header p {
  margin: 0;
  color: var(--text-secondary);
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
  transform: translateY(-2px);
}

.upload-content .upload-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.upload-content p {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: var(--text-primary);
}

.upload-content small {
  color: var(--text-secondary);
}

.editor-section {
  margin-top: 30px;
}

.image-preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.preview-panel h4 {
  margin: 0 0 15px 0;
  text-align: center;
  color: var(--text-primary);
}

.image-wrapper {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
}

.image-info {
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-secondary);
}

.image-info p {
  margin: 5px 0;
}

.controls-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 25px;
}

.resize-methods h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.method-options {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary);
}

.method-option input[type="radio"] {
  accent-color: var(--primary-color);
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.percentage-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.percentage-control input[type="range"] {
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

.percentage-control input[type="range"]:hover {
  height: 10px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.percentage-control input[type="range"]:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.percentage-control input[type="range"]::-webkit-slider-thumb {
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

.percentage-control input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.percentage-control input[type="range"]::-webkit-slider-track {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  border: none;
}

/* Firefox样式 */
.percentage-control input[type="range"]::-moz-range-track {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  border: none;
}

.percentage-control input[type="range"]::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: var(--primary-color);
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.percentage-input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  text-align: center;
}

.lock-ratio-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal !important;
}

.lock-ratio-label input[type="checkbox"] {
  accent-color: var(--primary-color);
}

.pixel-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.pixel-input-group label {
  margin-bottom: 8px;
}

.pixel-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.preset-btn {
  padding: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.preset-btn:hover {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
}

.preset-btn strong {
  display: block;
  margin-bottom: 4px;
}

.preset-btn span {
  font-size: 12px;
  color: var(--text-secondary);
}

.quality-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quality-control input[type="range"] {
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

.quality-control input[type="range"]:hover {
  height: 10px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.quality-control input[type="range"]:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.quality-control input[type="range"]::-webkit-slider-thumb {
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

.quality-control input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.quality-control input[type="range"]::-webkit-slider-track {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  border: none;
}

/* Firefox样式 */
.quality-control input[type="range"]::-moz-range-track {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  border: none;
}

.quality-control input[type="range"]::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: var(--primary-color);
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.resize-btn,
.download-btn,
.reset-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.resize-btn {
  background: var(--primary-color);
  color: white;
}

.resize-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn {
  background: var(--success-color);
  color: white;
}

.reset-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.tips-section {
  margin-top: 40px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.tips-section h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary);
}

.tips-section li {
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .image-resize-container {
    padding: 15px;
  }
  
  .image-preview-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .method-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .pixel-controls {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .preset-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 