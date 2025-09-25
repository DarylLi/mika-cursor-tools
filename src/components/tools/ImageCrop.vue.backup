<template>
  <div class="image-crop-container">
    <div class="tool-header">
      <h3>图片裁剪工具</h3>
      <p>精确裁剪图片区域，支持多种比例预设</p>
    </div>

    <div class="upload-section" v-if="!originalImage">
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
          <div class="upload-icon">✂️</div>
          <p>点击选择或拖拽图片文件</p>
          <small>支持 JPG、PNG、WebP、GIF 格式</small>
        </div>
      </div>
    </div>

    <div class="crop-editor" v-if="originalImage">
      <div class="editor-container">
        <div class="crop-canvas-container">
          <canvas 
            ref="cropCanvas"
            @mousedown="startCrop"
            @mousemove="updateCrop"
            @mouseup="endCrop"
            @mouseleave="endCrop"
            class="crop-canvas"
          ></canvas>
          <div class="crop-info" v-if="cropArea.width > 0">
            {{ Math.round(cropArea.x) }}, {{ Math.round(cropArea.y) }} - 
            {{ Math.round(cropArea.width) }} × {{ Math.round(cropArea.height) }}
          </div>
        </div>

        <div class="controls-panel">
          <div class="aspect-ratios">
            <h4>宽高比</h4>
            <div class="ratio-buttons">
              <button 
                v-for="ratio in aspectRatios"
                :key="ratio.name"
                @click="setAspectRatio(ratio)"
                :class="['ratio-btn', { active: selectedRatio?.name === ratio.name }]"
              >
                {{ ratio.name }}
              </button>
            </div>
          </div>

          <div class="crop-controls">
            <div class="control-group">
              <label>X 坐标</label>
              <input 
                type="number" 
                v-model="cropArea.x" 
                @input="updateCropArea"
                min="0"
                :max="imageSize.width - cropArea.width"
                class="control-input"
              />
            </div>
            <div class="control-group">
              <label>Y 坐标</label>
              <input 
                type="number" 
                v-model="cropArea.y" 
                @input="updateCropArea"
                min="0"
                :max="imageSize.height - cropArea.height"
                class="control-input"
              />
            </div>
            <div class="control-group">
              <label>宽度</label>
              <input 
                type="number" 
                v-model="cropArea.width" 
                @input="updateCropArea"
                min="10"
                :max="imageSize.width"
                class="control-input"
              />
            </div>
            <div class="control-group">
              <label>高度</label>
              <input 
                type="number" 
                v-model="cropArea.height" 
                @input="updateCropArea"
                min="10"
                :max="imageSize.height"
                class="control-input"
              />
            </div>
          </div>

          <div class="preset-sizes">
            <h4>常用尺寸</h4>
            <div class="preset-buttons">
              <button 
                v-for="preset in presetSizes"
                :key="preset.name"
                @click="applyPreset(preset)"
                class="preset-btn"
              >
                {{ preset.name }}
                <small>{{ preset.width }}×{{ preset.height }}</small>
              </button>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="cropImage" class="crop-btn" :disabled="!canCrop">
              裁剪图片
            </button>
            <button @click="reset" class="reset-btn">重新选择</button>
          </div>

          <div class="preview-section" v-if="croppedImage">
            <h4>裁剪预览</h4>
            <div class="preview-container">
              <img :src="croppedImage" alt="裁剪预览" class="cropped-preview" />
              <button @click="downloadCropped" class="download-btn">
                下载裁剪图片
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageCrop',
  data() {
    return {
      originalImage: null,
      croppedImage: null,
      isDragOver: false,
      cropArea: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      imageSize: {
        width: 0,
        height: 0
      },
      canvasSize: {
        width: 0,
        height: 0
      },
      scale: 1,
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      selectedRatio: null,
      aspectRatios: [
        { name: '自由', ratio: null },
        { name: '1:1', ratio: 1 },
        { name: '4:3', ratio: 4/3 },
        { name: '3:2', ratio: 3/2 },
        { name: '16:9', ratio: 16/9 },
        { name: '3:4', ratio: 3/4 },
        { name: '2:3', ratio: 2/3 },
        { name: '9:16', ratio: 9/16 }
      ],
      presetSizes: [
        { name: '头像', width: 200, height: 200 },
        { name: '缩略图', width: 150, height: 150 },
        { name: 'Instagram', width: 1080, height: 1080 },
        { name: 'Facebook封面', width: 1200, height: 630 },
        { name: 'Twitter头图', width: 1500, height: 500 },
        { name: '微信头像', width: 300, height: 300 }
      ]
    }
  },
  computed: {
    canCrop() {
      return this.cropArea.width > 0 && this.cropArea.height > 0
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
          element: img,
          width: img.width,
          height: img.height
        }
        
        this.imageSize = {
          width: img.width,
          height: img.height
        }
        
        this.$nextTick(() => {
          this.initCanvas()
        })
      }
      
      img.src = preview
    },

    initCanvas() {
      const canvas = this.$refs.cropCanvas
      const container = canvas.parentElement
      
      // 计算适合的画布尺寸
      const maxWidth = container.clientWidth - 40
      const maxHeight = 400
      
      const scale = Math.min(
        maxWidth / this.imageSize.width,
        maxHeight / this.imageSize.height,
        1
      )
      
      this.scale = scale
      this.canvasSize = {
        width: this.imageSize.width * scale,
        height: this.imageSize.height * scale
      }
      
      canvas.width = this.canvasSize.width
      canvas.height = this.canvasSize.height
      
      // 初始化裁剪区域
      const margin = Math.min(this.canvasSize.width, this.canvasSize.height) * 0.1
      this.cropArea = {
        x: margin / this.scale,
        y: margin / this.scale,
        width: (this.canvasSize.width - margin * 2) / this.scale,
        height: (this.canvasSize.height - margin * 2) / this.scale
      }
      
      this.drawCanvas()
    },

    drawCanvas() {
      const canvas = this.$refs.cropCanvas
      const ctx = canvas.getContext('2d')
      
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制图片
      ctx.drawImage(
        this.originalImage.element,
        0, 0,
        this.canvasSize.width,
        this.canvasSize.height
      )
      
      // 绘制遮罩
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 清除裁剪区域
      ctx.clearRect(
        this.cropArea.x * this.scale,
        this.cropArea.y * this.scale,
        this.cropArea.width * this.scale,
        this.cropArea.height * this.scale
      )
      
      // 重新绘制裁剪区域的图片
      ctx.drawImage(
        this.originalImage.element,
        this.cropArea.x, this.cropArea.y, this.cropArea.width, this.cropArea.height,
        this.cropArea.x * this.scale, this.cropArea.y * this.scale,
        this.cropArea.width * this.scale, this.cropArea.height * this.scale
      )
      
      // 绘制裁剪框
      ctx.strokeStyle = '#007bff'
      ctx.lineWidth = 2
      ctx.strokeRect(
        this.cropArea.x * this.scale,
        this.cropArea.y * this.scale,
        this.cropArea.width * this.scale,
        this.cropArea.height * this.scale
      )
    },

    startCrop(e) {
      this.isDragging = true
      const rect = this.$refs.cropCanvas.getBoundingClientRect()
      this.dragStart = {
        x: (e.clientX - rect.left) / this.scale,
        y: (e.clientY - rect.top) / this.scale
      }
      
      this.cropArea.x = this.dragStart.x
      this.cropArea.y = this.dragStart.y
      this.cropArea.width = 0
      this.cropArea.height = 0
    },

    updateCrop(e) {
      if (!this.isDragging) return
      
      const rect = this.$refs.cropCanvas.getBoundingClientRect()
      const currentX = (e.clientX - rect.left) / this.scale
      const currentY = (e.clientY - rect.top) / this.scale
      
      this.cropArea.width = Math.abs(currentX - this.dragStart.x)
      this.cropArea.height = Math.abs(currentY - this.dragStart.y)
      
      if (currentX < this.dragStart.x) {
        this.cropArea.x = currentX
      }
      if (currentY < this.dragStart.y) {
        this.cropArea.y = currentY
      }
      
      // 应用宽高比限制
      if (this.selectedRatio && this.selectedRatio.ratio) {
        const ratio = this.selectedRatio.ratio
        if (this.cropArea.width / this.cropArea.height > ratio) {
          this.cropArea.width = this.cropArea.height * ratio
        } else {
          this.cropArea.height = this.cropArea.width / ratio
        }
      }
      
      this.constrainCropArea()
      this.drawCanvas()
    },

    endCrop() {
      this.isDragging = false
    },

    constrainCropArea() {
      // 确保裁剪区域在图片范围内
      if (this.cropArea.x < 0) this.cropArea.x = 0
      if (this.cropArea.y < 0) this.cropArea.y = 0
      if (this.cropArea.x + this.cropArea.width > this.imageSize.width) {
        this.cropArea.width = this.imageSize.width - this.cropArea.x
      }
      if (this.cropArea.y + this.cropArea.height > this.imageSize.height) {
        this.cropArea.height = this.imageSize.height - this.cropArea.y
      }
    },

    updateCropArea() {
      this.constrainCropArea()
      this.drawCanvas()
    },

    setAspectRatio(ratio) {
      this.selectedRatio = ratio
      
      if (ratio.ratio && this.cropArea.width > 0 && this.cropArea.height > 0) {
        // 调整现有裁剪区域以符合比例
        const currentRatio = this.cropArea.width / this.cropArea.height
        if (currentRatio > ratio.ratio) {
          this.cropArea.width = this.cropArea.height * ratio.ratio
        } else {
          this.cropArea.height = this.cropArea.width / ratio.ratio
        }
        this.constrainCropArea()
        this.drawCanvas()
      }
    },

    applyPreset(preset) {
      this.cropArea.width = Math.min(preset.width, this.imageSize.width)
      this.cropArea.height = Math.min(preset.height, this.imageSize.height)
      this.cropArea.x = (this.imageSize.width - this.cropArea.width) / 2
      this.cropArea.y = (this.imageSize.height - this.cropArea.height) / 2
      
      this.constrainCropArea()
      this.drawCanvas()
    },

    cropImage() {
      if (!this.canCrop) return
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = this.cropArea.width
      canvas.height = this.cropArea.height
      
      ctx.drawImage(
        this.originalImage.element,
        this.cropArea.x, this.cropArea.y, this.cropArea.width, this.cropArea.height,
        0, 0, this.cropArea.width, this.cropArea.height
      )
      
      this.croppedImage = canvas.toDataURL('image/jpeg', 0.9)
    },

    downloadCropped() {
      if (!this.croppedImage) return
      
      const a = document.createElement('a')
      a.href = this.croppedImage
      a.download = `cropped_${this.originalImage.file.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },

    reset() {
      if (this.originalImage) {
        URL.revokeObjectURL(this.originalImage.preview)
      }
      
      this.originalImage = null
      this.croppedImage = null
      this.cropArea = { x: 0, y: 0, width: 0, height: 0 }
      this.selectedRatio = null
    }
  },

  beforeUnmount() {
    this.reset()
  }
}
</script>

<style scoped>
.image-crop-container {
  max-width: 1400px;
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

.crop-editor {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.editor-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

.crop-canvas-container {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.crop-canvas {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: crosshair;
}

.crop-info {
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-secondary);
}

.controls-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.controls-panel h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.ratio-buttons,
.preset-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 25px;
}

.ratio-btn,
.preset-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.ratio-btn:hover,
.preset-btn:hover {
  border-color: var(--primary-color);
}

.ratio-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.preset-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preset-btn small {
  font-size: 10px;
  opacity: 0.8;
}

.crop-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.control-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.crop-btn,
.reset-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.crop-btn {
  background: var(--primary-color);
  color: white;
}

.crop-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.preview-section {
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.preview-container {
  text-align: center;
}

.cropped-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 15px;
}

.download-btn {
  padding: 10px 20px;
  background: var(--success-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr;
  }
  
  .crop-controls {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ratio-buttons,
  .preset-buttons {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
