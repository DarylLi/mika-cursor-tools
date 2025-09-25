<template>
  <div class="base64-image-tool">
    <!-- 工具头部 -->
    <div class="tool-header">
      <div class="header-gradient base64-gradient">
        <div class="header-content">
          <div class="tool-info">
            <h1><i class="fas fa-image"></i> Base64 Image Preview</h1>
            <p>Base64图片编码预览与转换工具</p>
          </div>
        </div>
      </div>
    </div>

    <div class="tool-content">
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="section-header">
          <h3><i class="fas fa-upload"></i> 图片输入</h3>
        </div>
        
        <!-- 文件上传 -->
        <div class="upload-area" 
             @drop="handleFileDrop" 
             @dragover.prevent 
             @dragenter.prevent>
          <input type="file" 
                 ref="fileInput" 
                 @change="handleFileSelect" 
                 accept="image/*" 
                 style="display: none;">
          <div class="upload-content" @click="$refs.fileInput.click()">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>点击选择图片或拖拽图片到此处</p>
            <small>支持 JPG, PNG, GIF, WebP 等格式</small>
          </div>
        </div>

        <!-- Base64输入 -->
        <div class="input-group">
          <label>或直接输入Base64编码:</label>
          <textarea v-model="base64Input" 
                    @input="processBase64"
                    placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    rows="6"></textarea>
        </div>

        <!-- 从剪贴板粘贴 -->
        <div class="paste-section">
          <button @click="pasteFromClipboard" class="paste-btn">
            <i class="fas fa-paste"></i> 从剪贴板粘贴
          </button>
        </div>

        <!-- 示例按钮 -->
        <div class="example-buttons">
          <button @click="loadExample('red-dot')" class="example-btn">
            <i class="fas fa-circle" style="color: red;"></i> 红点示例
          </button>
          <button @click="loadExample('blue-square')" class="example-btn">
            <i class="fas fa-square" style="color: blue;"></i> 蓝色方块
          </button>
          <button @click="loadExample('gradient')" class="example-btn">
            <i class="fas fa-palette"></i> 渐变示例
          </button>
        </div>
      </div>

      <!-- 预览区域 -->
      <div v-if="imageData.isValid" class="preview-section">
        <div class="section-header">
          <h3><i class="fas fa-eye"></i> 图片预览</h3>
          <div class="image-info">
            <span class="info-item">
              <i class="fas fa-file-image"></i> 
              {{ imageData.format.toUpperCase() }}
            </span>
            <span class="info-item">
              <i class="fas fa-expand-arrows-alt"></i> 
              {{ imageData.width }}×{{ imageData.height }}
            </span>
            <span class="info-item">
              <i class="fas fa-weight-hanging"></i> 
              {{ formatFileSize(imageData.size) }}
            </span>
          </div>
        </div>

        <!-- 图片显示 -->
        <div class="image-container">
          <div class="image-wrapper">
            <img :src="imageData.dataUrl" 
                 :alt="'Base64 Image Preview'"
                 :style="{ 
                   width: previewSize + '%',
                   maxWidth: '100%',
                   height: 'auto'
                 }"
                 @load="onImageLoad"
                 @error="onImageError">
          </div>
          
          <!-- 缩放控制 -->
          <div class="zoom-controls">
            <label>预览大小:</label>
            <input type="range" class="modern-slider" 
                   v-model="previewSize" 
                   min="10" 
                   max="200" 
                   step="10">
            <span>{{ previewSize }}%</span>
          </div>
        </div>

        <!-- 图片信息 -->
        <div class="image-details">
          <div class="detail-row">
            <strong>格式:</strong> {{ imageData.format.toUpperCase() }}
          </div>
          <div class="detail-row">
            <strong>尺寸:</strong> {{ imageData.width }} × {{ imageData.height }} 像素
          </div>
          <div class="detail-row">
            <strong>文件大小:</strong> {{ formatFileSize(imageData.size) }}
          </div>
          <div class="detail-row">
            <strong>Base64长度:</strong> {{ imageData.base64Length.toLocaleString() }} 字符
          </div>
          <div class="detail-row">
            <strong>MIME类型:</strong> {{ imageData.mimeType }}
          </div>
        </div>

        <!-- 转换功能 -->
        <div class="conversion-section">
          <div class="section-header">
            <h3><i class="fas fa-exchange-alt"></i> 格式转换</h3>
          </div>
          
          <div class="conversion-controls">
            <div class="format-options">
              <label>转换为:</label>
              <select v-model="targetFormat">
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            
            <div v-if="targetFormat === 'jpeg'" class="quality-control">
              <label>质量:</label>
              <input type="range" class="modern-slider" 
                     v-model="quality" 
                     min="0.1" 
                     max="1.0" 
                     step="0.1">
              <span>{{ Math.round(quality * 100) }}%</span>
            </div>
            
            <button @click="convertImage" class="convert-btn">
              <i class="fas fa-magic"></i> 转换
            </button>
          </div>

          <div v-if="convertedImage" class="converted-result">
            <h4>转换结果:</h4>
            <div class="conversion-info">
              <div class="info-item">
                <strong>原始大小:</strong> {{ formatFileSize(imageData.size) }}
              </div>
              <div class="info-item">
                <strong>转换后:</strong> {{ formatFileSize(convertedImage.size) }}
              </div>
              <div class="info-item">
                <strong>压缩比:</strong> {{ calculateCompressionRatio() }}%
              </div>
            </div>
            <img :src="convertedImage.dataUrl" 
                 alt="Converted Image" 
                 style="max-width: 200px; border: 1px solid var(--border-color); border-radius: 4px;">
          </div>
        </div>

        <!-- 导出功能 -->
        <div class="export-section">
          <button @click="copyBase64" class="export-btn">
            <i class="fas fa-copy"></i> 复制Base64
          </button>
          <button @click="downloadImage" class="export-btn">
            <i class="fas fa-download"></i> 下载图片
          </button>
          <button v-if="convertedImage" @click="downloadConverted" class="export-btn">
            <i class="fas fa-download"></i> 下载转换后图片
          </button>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="errorMessage" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>解析错误</h3>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="fas fa-image"></i>
        <h3>没有图片</h3>
        <p>请上传图片文件或输入Base64编码</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'Base64Image',
  setup() {
    const base64Input = ref('')
    const previewSize = ref(100)
    const targetFormat = ref('jpeg')
    const quality = ref(0.8)
    const errorMessage = ref('')
    const convertedImage = ref(null)

    const imageData = reactive({
      isValid: false,
      dataUrl: '',
      format: '',
      width: 0,
      height: 0,
      size: 0,
      base64Length: 0,
      mimeType: ''
    })

    // 处理Base64输入
    const processBase64 = () => {
      errorMessage.value = ''
      convertedImage.value = null
      
      if (!base64Input.value.trim()) {
        resetImageData()
        return
      }

      try {
        let base64Data = base64Input.value.trim()
        
        // 检查是否是完整的Data URL
        if (base64Data.startsWith('data:image/')) {
          const matches = base64Data.match(/^data:image\/([^;]+);base64,(.+)$/)
          if (matches) {
            imageData.format = matches[1]
            imageData.mimeType = `image/${matches[1]}`
            base64Data = matches[2]
          } else {
            throw new Error('无效的Data URL格式')
          }
        } else {
          // 尝试检测图片格式
          imageData.format = detectImageFormat(base64Data)
          imageData.mimeType = `image/${imageData.format}`
        }

        // 构造完整的Data URL
        imageData.dataUrl = `data:${imageData.mimeType};base64,${base64Data}`
        imageData.base64Length = base64Data.length
        imageData.size = Math.round(base64Data.length * 0.75) // 估算原始文件大小
        imageData.isValid = true

      } catch (error) {
        errorMessage.value = error.message
        resetImageData()
      }
    }

    // 检测图片格式
    const detectImageFormat = (base64) => {
      const header = base64.substring(0, 20)
      
      if (header.startsWith('/9j/')) return 'jpeg'
      if (header.startsWith('iVBORw0KGgo')) return 'png'
      if (header.startsWith('R0lGODlh') || header.startsWith('R0lGODdh')) return 'gif'
      if (header.startsWith('UklGR')) return 'webp'
      
      return 'unknown'
    }

    // 重置图片数据
    const resetImageData = () => {
      imageData.isValid = false
      imageData.dataUrl = ''
      imageData.format = ''
      imageData.width = 0
      imageData.height = 0
      imageData.size = 0
      imageData.base64Length = 0
      imageData.mimeType = ''
    }

    // 图片加载成功
    const onImageLoad = (event) => {
      const img = event.target
      imageData.width = img.naturalWidth
      imageData.height = img.naturalHeight
    }

    // 图片加载失败
    const onImageError = () => {
      errorMessage.value = '图片加载失败，请检查Base64编码是否正确'
      resetImageData()
    }

    // 文件上传处理
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        convertFileToBase64(file)
      }
    }

    const handleFileDrop = (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        convertFileToBase64(file)
      } else {
        errorMessage.value = '请选择有效的图片文件'
      }
    }

    const convertFileToBase64 = (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        base64Input.value = e.target.result
        processBase64()
      }
      reader.onerror = () => {
        errorMessage.value = '文件读取失败'
      }
      reader.readAsDataURL(file)
    }

    // 从剪贴板粘贴
    const pasteFromClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText()
        if (text.includes('base64') || text.startsWith('data:image/')) {
          base64Input.value = text
          processBase64()
        } else {
          errorMessage.value = '剪贴板中没有有效的Base64图片数据'
        }
      } catch (error) {
        errorMessage.value = '无法访问剪贴板'
      }
    }

    // 示例数据
    const loadExample = (type) => {
      const examples = {
        'red-dot': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYFCi4qTu7KPQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAc0lEQVQY02P8//8/Aw0BE5gAWu7/r+vr+5+BgYGB4f///wywAIP//0BFfn5+/1lYWBgYfn5+y8DAAGRgYGBgYGBgYPj//z8DYyMDA8Pv379hBhj+///PwMjIwPDv37//DL9//2f4+/cvwy9fvhgYGBgYAAD6JijNrgSHtwAAAABJRU5ErkJggg==',
        'blue-square': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYFCi4qTu7KPQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAN0lEQVQY02NkYGBg+P//PwM5gImBBGBkZGTABZjIVcjAwMDw69cvBqysrAwMv3//ZqDaQhQAAgYjzGwAAAABJRU5ErkJggg==',
        'gradient': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYFCjAH/Z8AmgAAABl0RVh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAz0lEQVRo3u2ZQQ6DMAxE30dP0Jv0JO1NepL2Jr1Jb9KT9Ca9STbIKJFIG7mAFEQrjVohOZ4Zz7MBgIiItDFGXEQkxpj4va9lWb7LshxrrUdKaVJK76XU+5RSr5T6Aq4BsA3ApgC2ArANwKYAtgKwDcCmALYCsA3ApgC2ArANwKYAtgKwDcCmALYCsA3ApgC2ArANwKYAtgKwDcCmALYCsA3ApgC2ArANwKYAtgKwDcCmALYCsA3ApgC2ArANwKYAtgKwDcCmALYCsA3ApgC2ArANwKYAtgKwDcCmPP8BcCVVFE3qhXgAAAAASUVORK5CYII='
      }
      
      base64Input.value = examples[type] || examples['red-dot']
      processBase64()
    }

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 计算压缩比
    const calculateCompressionRatio = () => {
      if (!convertedImage.value) return 0
      const ratio = ((imageData.size - convertedImage.value.size) / imageData.size) * 100
      return Math.round(ratio)
    }

    // 图片转换
    const convertImage = () => {
      if (!imageData.isValid) return

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const mimeType = `image/${targetFormat.value}`
        const qualityValue = targetFormat.value === 'jpeg' ? quality.value : undefined
        
        const convertedDataUrl = canvas.toDataURL(mimeType, qualityValue)
        const base64Data = convertedDataUrl.split(',')[1]
        const size = Math.round(base64Data.length * 0.75)

        convertedImage.value = {
          dataUrl: convertedDataUrl,
          base64: base64Data,
          size: size,
          format: targetFormat.value
        }
      }

      img.src = imageData.dataUrl
    }

    // 复制Base64
    const copyBase64 = async () => {
      try {
        await navigator.clipboard.writeText(imageData.dataUrl)
        // 这里可以添加提示
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    // 下载图片
    const downloadImage = () => {
      const link = document.createElement('a')
      link.href = imageData.dataUrl
      link.download = `image.${imageData.format}`
      link.click()
    }

    // 下载转换后的图片
    const downloadConverted = () => {
      if (!convertedImage.value) return
      
      const link = document.createElement('a')
      link.href = convertedImage.value.dataUrl
      link.download = `converted_image.${convertedImage.value.format}`
      link.click()
    }

    return {
      base64Input,
      imageData,
      previewSize,
      targetFormat,
      quality,
      errorMessage,
      convertedImage,
      processBase64,
      onImageLoad,
      onImageError,
      handleFileSelect,
      handleFileDrop,
      pasteFromClipboard,
      loadExample,
      formatFileSize,
      calculateCompressionRatio,
      convertImage,
      copyBase64,
      downloadImage,
      downloadConverted
    }
  }
}
</script>

<style scoped>
.base64-image-tool {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tool-header {
  margin-bottom: 10px;
  padding: 10px;
}

.base64-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-gradient {
  padding: 10px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><circle cx="10" cy="10" r="8" fill="url(%23a)"/><circle cx="90" cy="10" r="8" fill="url(%23a)"/></svg>') repeat;
  opacity: 0.1;
}

.header-content {
  position: relative;
  z-index: 1;
}

.tool-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.tool-info p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.tool-content {
  padding: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.section-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.3rem;
}

.image-info {
  display: flex;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: var(--hover-bg);
}

.upload-content {
  text-align: center;
  color: var(--text-muted);
}

.upload-content i {
  font-size: 3rem;
  margin-bottom: 10px;
  color: var(--primary-color);
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.input-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-color);
  font-family: 'Courier New', monospace;
  resize: vertical;
}

.paste-section {
  margin-bottom: 1.5rem;
}

.paste-btn {
  padding: 0.7rem 1.2rem;
  background: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.paste-btn:hover {
  background: var(--secondary-hover);
}

.example-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 10px;
}

.example-btn {
  padding: 0.7rem 1.2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.example-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.image-container {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.image-wrapper {
  text-align: center;
  margin-bottom: 10px;
}

.image-wrapper img {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.zoom-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-color);
}

.zoom-controls input[type="range"].modern-slider {
  width: 200px;
}

.image-details {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.detail-row {
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.detail-row:last-child {
  margin-bottom: 0;
}

.conversion-section {
  margin-bottom: 10px;
}

.conversion-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.format-options, .quality-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.format-options select,
.quality-control input[type="range"].modern-slider {
  padding: 0.3rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-color);
}

.convert-btn {
  padding: 0.7rem 1.2rem;
  background: var(--success-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.convert-btn:hover {
  background: var(--success-hover);
}

.converted-result {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.converted-result h4 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.conversion-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.export-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.export-btn {
  padding: 0.8rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.empty-state, .error-state {
  text-align: center;
  padding: 10px;
  color: var(--text-muted);
}

.empty-state i, .error-state i {
  font-size: 4rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.error-state i {
  color: var(--error-color);
}

.empty-state h3, .error-state h3 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p, .error-state p {
  margin: 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .conversion-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .image-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .export-section {
    flex-direction: column;
  }
  
  .zoom-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .zoom-controls input[type="range"].modern-slider {
    width: 100%;
  }
}
</style> 