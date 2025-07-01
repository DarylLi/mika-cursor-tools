<template>
  <div class="favicon-generator-container">
    <div class="tool-header">
      <h2>🏠 Favicon Maker</h2>
      <p>生成多尺寸网站图标</p>
    </div>

    <div class="upload-section">
      <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
        <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" style="display: none;">
        <div v-if="!originalImage" class="upload-placeholder">
          <span class="upload-icon">📁</span>
          <p>点击或拖拽图片到此处</p>
          <small>支持 PNG, JPG, SVG 格式</small>
        </div>
        <div v-else class="image-preview">
          <img :src="originalImage" alt="原图" class="preview-img">
        </div>
      </div>
    </div>

    <div v-if="originalImage" class="settings-section">
      <div class="setting-group">
        <label>背景颜色</label>
        <div class="color-control">
          <input type="color" v-model="backgroundColor" @input="generateFavicons">
          <input type="text" v-model="backgroundColor" @input="generateFavicons" class="color-text">
        </div>
      </div>

      <div class="setting-group">
        <label>内边距 ({{ padding }}px)</label>
        <input type="range" v-model="padding" min="0" max="50" @input="generateFavicons">
      </div>

      <div class="setting-group">
        <label>
          <input type="checkbox" v-model="roundCorners" @change="generateFavicons">
          圆角处理
        </label>
      </div>
    </div>

    <div v-if="originalImage" class="favicon-preview">
      <h3>预览效果</h3>
      <div class="preview-grid">
        <div 
          v-for="size in faviconSizes" 
          :key="size.name"
          class="preview-item"
        >
          <canvas 
            :ref="`canvas-${size.size}`"
            :width="size.size" 
            :height="size.size"
            class="favicon-canvas"
          ></canvas>
          <div class="size-info">
            <span class="size-name">{{ size.name }}</span>
            <span class="size-dimension">{{ size.size }}×{{ size.size }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="originalImage" class="download-section">
      <h3>下载图标</h3>
      <div class="download-options">
        <button @click="downloadSingle" class="download-btn">📥 下载选中尺寸</button>
        <button @click="downloadAll" class="download-btn">📦 下载全部尺寸</button>
        <button @click="generateHTML" class="download-btn">📄 生成HTML代码</button>
      </div>
      
      <div class="size-selector">
        <label>选择下载尺寸:</label>
        <div class="size-checkboxes">
          <label v-for="size in faviconSizes" :key="size.name" class="size-checkbox">
            <input type="checkbox" v-model="selectedSizes" :value="size">
            {{ size.name }}
          </label>
        </div>
      </div>
    </div>

    <div v-if="htmlCode" class="html-output">
      <h3>HTML 代码</h3>
      <textarea v-model="htmlCode" readonly class="html-textarea" @click="copyHTML"></textarea>
      <button @click="copyHTML" class="copy-btn">📋 复制HTML</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'FaviconGenerator',
  setup() {
    const fileInput = ref(null)
    const originalImage = ref(null)
    const backgroundColor = ref('#FFFFFF')
    const padding = ref(10)
    const roundCorners = ref(false)
    const selectedSizes = ref([])
    const htmlCode = ref('')

    const faviconSizes = [
      { name: 'Favicon', size: 16 },
      { name: 'Favicon', size: 32 },
      { name: 'Apple Touch', size: 57 },
      { name: 'Apple Touch', size: 72 },
      { name: 'Apple Touch', size: 114 },
      { name: 'Apple Touch', size: 144 },
      { name: 'Apple Touch', size: 180 },
      { name: 'Android', size: 192 },
      { name: 'Android', size: 512 }
    ]

    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          originalImage.value = e.target.result
          generateFavicons()
        }
        reader.readAsDataURL(file)
      }
    }

    const handleDrop = (event) => {
      const file = event.dataTransfer.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          originalImage.value = e.target.result
          generateFavicons()
        }
        reader.readAsDataURL(file)
      }
    }

    const generateFavicons = () => {
      if (!originalImage.value) return

      const img = new Image()
      img.onload = () => {
        faviconSizes.forEach(size => {
          const canvas = document.querySelector(`canvas[width="${size.size}"]`)
          if (canvas) {
            const ctx = canvas.getContext('2d')
            
            // 清空画布
            ctx.clearRect(0, 0, size.size, size.size)
            
            // 绘制背景
            ctx.fillStyle = backgroundColor.value
            if (roundCorners.value) {
              drawRoundedRect(ctx, 0, 0, size.size, size.size, size.size * 0.1)
            } else {
              ctx.fillRect(0, 0, size.size, size.size)
            }
            
            // 计算图片位置和大小
            const p = padding.value * (size.size / 100)
            const imgSize = size.size - p * 2
            
            // 保持宽高比
            const scale = Math.min(imgSize / img.width, imgSize / img.height)
            const scaledWidth = img.width * scale
            const scaledHeight = img.height * scale
            const x = (size.size - scaledWidth) / 2
            const y = (size.size - scaledHeight) / 2
            
            // 绘制图片
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
          }
        })
      }
      img.src = originalImage.value
    }

    const drawRoundedRect = (ctx, x, y, width, height, radius) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      ctx.fill()
    }

    const downloadSingle = () => {
      if (selectedSizes.value.length === 0) {
        alert('请选择要下载的尺寸')
        return
      }

      selectedSizes.value.forEach(size => {
        const canvas = document.querySelector(`canvas[width="${size.size}"]`)
        if (canvas) {
          const link = document.createElement('a')
          link.download = `favicon-${size.size}x${size.size}.png`
          link.href = canvas.toDataURL()
          link.click()
        }
      })
    }

    const downloadAll = () => {
      faviconSizes.forEach(size => {
        const canvas = document.querySelector(`canvas[width="${size.size}"]`)
        if (canvas) {
          const link = document.createElement('a')
          link.download = `favicon-${size.size}x${size.size}.png`
          link.href = canvas.toDataURL()
          link.click()
        }
      })
    }

    const generateHTML = () => {
      let html = '<!-- Favicon HTML 代码 -->\n'
      html += '<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">\n'
      html += '<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">\n'
      html += '<link rel="apple-touch-icon" sizes="57x57" href="favicon-57x57.png">\n'
      html += '<link rel="apple-touch-icon" sizes="72x72" href="favicon-72x72.png">\n'
      html += '<link rel="apple-touch-icon" sizes="114x114" href="favicon-114x114.png">\n'
      html += '<link rel="apple-touch-icon" sizes="144x144" href="favicon-144x144.png">\n'
      html += '<link rel="apple-touch-icon" sizes="180x180" href="favicon-180x180.png">\n'
      html += '<link rel="icon" type="image/png" sizes="192x192" href="favicon-192x192.png">\n'
      html += '<link rel="icon" type="image/png" sizes="512x512" href="favicon-512x512.png">\n'
      html += '<meta name="msapplication-TileImage" content="favicon-144x144.png">\n'
      
      htmlCode.value = html
    }

    const copyHTML = async () => {
      try {
        await navigator.clipboard.writeText(htmlCode.value)
        console.log('HTML已复制')
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    onMounted(() => {
      selectedSizes.value = faviconSizes.slice(0, 3) // 默认选择前3个
    })

    return {
      fileInput,
      originalImage,
      backgroundColor,
      padding,
      roundCorners,
      selectedSizes,
      htmlCode,
      faviconSizes,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      generateFavicons,
      downloadSingle,
      downloadAll,
      generateHTML,
      copyHTML
    }
  }
}
</script>

<style scoped>
.favicon-generator-container {
  padding: 1rem;
}

.tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.tool-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.upload-section {
  margin-bottom: 2rem;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: var(--accent-color);
}

.upload-placeholder {
  color: var(--text-muted);
}

.upload-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.image-preview {
  max-width: 200px;
  margin: 0 auto;
}

.preview-img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

.settings-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.color-control {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-control input[type="color"] {
  width: 50px;
  height: 30px;
  border: none;
  border-radius: 4px;
}

.color-text {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: monospace;
}

.favicon-preview {
  margin-bottom: 2rem;
}

.favicon-preview h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.preview-item {
  text-align: center;
  padding: 1rem;
  background: var(--bg-surface);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.favicon-canvas {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.size-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.size-name {
  font-weight: 500;
  color: var(--text-primary);
}

.size-dimension {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.download-section {
  margin-bottom: 2rem;
}

.download-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.download-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.download-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background: var(--bg-hover);
}

.size-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.size-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.size-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.html-output {
  margin-bottom: 2rem;
}

.html-output h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.html-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  background: var(--bg-surface);
  color: var(--text-primary);
  resize: vertical;
  height: 200px;
  margin-bottom: 0.5rem;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background: var(--bg-hover);
}

@media (max-width: 768px) {
  .settings-section {
    grid-template-columns: 1fr;
  }
  
  .download-options {
    flex-direction: column;
  }
  
  .size-checkboxes {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}
</style> 