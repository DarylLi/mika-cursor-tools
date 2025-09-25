<template>
  <div class="image-compress-container">
    <div class="tool-header">
      <h3>图片压缩器</h3>
      <p>客户端压缩 JPG/PNG/WebP，保护隐私，无需上传</p>
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
          <div class="upload-icon">📁</div>
          <p>点击选择或拖拽图片文件</p>
          <small>支持 JPG、PNG、WebP 格式</small>
        </div>
      </div>
    </div>

    <div class="settings-section" v-if="images.length > 0">
      <div class="setting-group">
        <label>压缩质量</label>
        <div class="quality-control">
          <input 
            type="range" 
            class="modern-slider quality-slider"
            v-model="quality" 
            min="0.1" 
            max="1" 
            step="0.05"
          />
          <span class="quality-value">{{ Math.round(quality * 100) }}%</span>
        </div>
      </div>

      <div class="setting-group">
        <label>输出格式</label>
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

      <div class="setting-group">
        <label>最大尺寸</label>
        <div class="size-control">
          <input 
            type="number" 
            v-model="maxWidth" 
            placeholder="宽度"
            class="size-input"
          />
          <span>×</span>
          <input 
            type="number" 
            v-model="maxHeight" 
            placeholder="高度"
            class="size-input"
          />
          <button @click="resetSize" class="reset-btn">重置</button>
        </div>
      </div>
    </div>

    <div class="images-section" v-if="images.length > 0">
      <div class="section-header">
        <h4>图片列表 ({{ images.length }})</h4>
        <div class="batch-actions">
          <button @click="compressAll" class="compress-all-btn" :disabled="processing">
            {{ processing ? '处理中...' : '批量压缩' }}
          </button>
          <button @click="downloadAll" class="download-all-btn" v-if="compressedImages.length > 0">
            下载全部
          </button>
          <button @click="clearAll" class="clear-btn">清空</button>
        </div>
      </div>

      <div class="images-grid">
        <div 
          v-for="(image, index) in images" 
          :key="index"
          class="image-item"
        >
          <div class="image-preview">
            <img :src="image.preview" :alt="image.name" />
            <div class="image-overlay" v-if="image.processing">
              <div class="loading-bounce">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="loading-text">压缩中...</div>
            </div>
          </div>
          
          <div class="image-info">
            <h5>{{ image.name }}</h5>
            <div class="size-info">
              <span>原始: {{ formatFileSize(image.originalSize) }}</span>
              <span v-if="image.compressedSize">
                压缩后: {{ formatFileSize(image.compressedSize) }}
              </span>
            </div>
            <div class="dimensions">
              {{ image.width }} × {{ image.height }}
            </div>
            <div class="compression-ratio" v-if="image.compressedSize">
              压缩率: {{ calculateCompressionRatio(image.originalSize, image.compressedSize) }}%
            </div>
          </div>

          <div class="image-actions">
            <button 
              @click="compressImage(index)" 
              class="compress-btn"
              :disabled="image.processing"
            >
              {{ image.processing ? '处理中' : '压缩' }}
            </button>
            <button 
              @click="downloadImage(index)" 
              class="download-btn"
              v-if="image.compressed"
            >
              下载
            </button>
            <button @click="removeImage(index)" class="remove-btn">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h4>💡 使用提示</h4>
      <ul>
        <li>所有处理都在本地完成，不会上传到服务器</li>
        <li>建议质量设置：照片 70-80%，图标 90-95%</li>
        <li>WebP 格式通常有更好的压缩效果</li>
        <li>设置最大尺寸可进一步减小文件大小</li>
        <li>支持批量处理多个文件</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageCompress',
  data() {
    return {
      images: [],
      compressedImages: [],
      isDragOver: false,
      quality: 0.8,
      outputFormat: 'jpeg',
      maxWidth: null,
      maxHeight: null,
      processing: false,
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
      
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          this.images.push({
            file,
            name: file.name,
            preview,
            originalSize: file.size,
            width: img.width,
            height: img.height,
            processing: false,
            compressed: false,
            compressedSize: null,
            compressedBlob: null
          })
          resolve()
        }
        img.src = preview
      })
    },

    async compressImage(index) {
      const image = this.images[index]
      image.processing = true

      try {
        const compressedBlob = await this.performCompression(image.file)
        image.compressedBlob = compressedBlob
        image.compressedSize = compressedBlob.size
        image.compressed = true
        this.compressedImages.push({
          name: this.getCompressedFileName(image.name),
          blob: compressedBlob
        })
      } catch (error) {
        console.error('压缩失败:', error)
        this.$message.success('压缩失败: ' + error.message)
      } finally {
        image.processing = false
      }
    },

    async performCompression(file) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
          try {
            // 计算压缩后的尺寸
            let { width, height } = this.calculateDimensions(img.width, img.height)
            
            canvas.width = width
            canvas.height = height

            // 绘制图片
            ctx.drawImage(img, 0, 0, width, height)

            // 转换为 blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('压缩失败'))
              }
            }, `image/${this.outputFormat}`, this.quality)
          } catch (error) {
            reject(error)
          }
        }

        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = URL.createObjectURL(file)
      })
    },

    calculateDimensions(originalWidth, originalHeight) {
      let width = originalWidth
      let height = originalHeight

      if (this.maxWidth && width > this.maxWidth) {
        height = (height * this.maxWidth) / width
        width = this.maxWidth
      }

      if (this.maxHeight && height > this.maxHeight) {
        width = (width * this.maxHeight) / height
        height = this.maxHeight
      }

      return { width: Math.round(width), height: Math.round(height) }
    },

    async compressAll() {
      this.processing = true
      
      for (let i = 0; i < this.images.length; i++) {
        if (!this.images[i].compressed) {
          await this.compressImage(i)
        }
      }
      
      this.processing = false
    },

    downloadImage(index) {
      const image = this.images[index]
      if (image.compressedBlob) {
        const url = URL.createObjectURL(image.compressedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.getCompressedFileName(image.name)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    },

    async downloadAll() {
      if (this.compressedImages.length === 0) return

      // 如果只有一个文件，直接下载
      if (this.compressedImages.length === 1) {
        const url = URL.createObjectURL(this.compressedImages[0].blob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.compressedImages[0].name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      // 多个文件时创建 ZIP
      try {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        this.compressedImages.forEach(img => {
          zip.file(img.name, img.blob)
        })

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'compressed-images.zip'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        this.$message.success('批量下载失败，请逐个下载')
      }
    },

    removeImage(index) {
      URL.revokeObjectURL(this.images[index].preview)
      this.images.splice(index, 1)
    },

    clearAll() {
      this.images.forEach(img => URL.revokeObjectURL(img.preview))
      this.images = []
      this.compressedImages = []
    },

    resetSize() {
      this.maxWidth = null
      this.maxHeight = null
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    calculateCompressionRatio(originalSize, compressedSize) {
      return Math.round(((originalSize - compressedSize) / originalSize) * 100)
    },

    getCompressedFileName(originalName) {
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
      const extension = this.outputFormat === 'jpeg' ? 'jpg' : this.outputFormat
      return `${nameWithoutExt}_compressed.${extension}`
    }
  },

  beforeUnmount() {
    this.clearAll()
  }
}
</script>

<style scoped>
.image-compress-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
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
  transform: translateY(-2px);
}

.upload-content .upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.upload-content p {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: var(--text-primary);
}

.upload-content small {
  color: var(--text-secondary);
}

.settings-section {
  margin: 30px 0;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.setting-group {
  margin-bottom: 10px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.quality-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quality-slider {
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

.quality-slider:hover {
  height: 10px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.quality-slider:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.quality-slider::-webkit-slider-thumb {
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

.quality-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.quality-slider::-webkit-slider-track {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  border: none;
}

.quality-slider::-webkit-slider-runnable-track {
  height: 8px;
  background: linear-gradient(to right, 
    var(--primary-color) 0%, 
    var(--primary-color) var(--value, 0%), 
    var(--border-color) var(--value, 0%), 
    var(--border-color) 100%);
  border-radius: 4px;
}

/* Firefox样式 */
.quality-slider::-moz-range-track {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  border: none;
}

.quality-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: var(--primary-color);
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.quality-slider::-moz-range-progress {
  height: 8px;
  background: var(--primary-color);
  border-radius: 4px;
}

/* Edge样式 */
.quality-slider::-ms-track {
  height: 8px;
  background: transparent;
  border-color: transparent;
  color: transparent;
}

.quality-slider::-ms-fill-lower {
  background: var(--primary-color);
  border-radius: 4px;
}

.quality-slider::-ms-fill-upper {
  background: var(--border-color);
  border-radius: 4px;
}

.quality-slider::-ms-thumb {
  width: 22px;
  height: 22px;
  background: var(--primary-color);
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  cursor: pointer;
}

.quality-value {
  min-width: 45px;
  text-align: center;
  font-weight: 600;
  color: var(--primary-color);
}

.format-options {
  display: flex;
  gap: 10px;
}

.format-btn {
  padding: 10px;
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

.size-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.size-input {
  width: 100px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.reset-btn {
  padding: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: var(--bg-secondary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.batch-actions {
  display: flex;
  gap: 10px;
}

.compress-all-btn,
.download-all-btn,
.clear-btn {
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.compress-all-btn {
  background: var(--primary-color);
  color: white;
}

.compress-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.image-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
  transition: all 0.3s ease;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.image-preview {
  position: relative;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-primary);
}

.image-preview img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
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

.loading-bounce {
  display: flex;
  gap: 5px;
}

.loading-bounce span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  animation: bounce 1.4s ease-in-out infinite;
}

.loading-bounce span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-bounce span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.loading-text {
  font-size: 14px;
  font-weight: 600;
}

.image-info h5 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.size-info,
.dimensions,
.compression-ratio {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.compression-ratio {
  color: var(--success-color);
  font-weight: 600;
}

.image-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
}

.compress-btn,
.download-btn,
.remove-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.compress-btn {
  background: var(--primary-color);
  color: white;
}

.compress-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  padding: 10px;
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
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .image-compress-container {
    padding: 10px;
  }
  
  .images-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .batch-actions {
    justify-content: center;
  }
}
</style> 