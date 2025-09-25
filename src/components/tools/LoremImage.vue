<template>
  <div class="lorem-image-tool">
    <div class="tool-header">
      <h3><i class="fas fa-image"></i> 占位图片生成器</h3>
      <p>生成各种尺寸的占位图片，支持自定义颜色、文字</p>
    </div>

    <div class="tool-content">
      <div class="image-config">
        <div class="config-group">
          <label for="width">宽度 (px)</label>
          <input type="number" id="width" v-model.number="width" min="1" max="2000" />
        </div>
        
        <div class="config-group">
          <label for="height">高度 (px)</label>
          <input type="number" id="height" v-model.number="height" min="1" max="2000" />
        </div>
        
        <div class="config-group">
          <label for="bgColor">背景颜色</label>
          <input type="color" id="bgColor" v-model="bgColor" />
        </div>
        
        <div class="config-group">
          <label for="textColor">文字颜色</label>
          <input type="color" id="textColor" v-model="textColor" />
        </div>
        
        <div class="config-group">
          <label for="customText">自定义文字</label>
          <input type="text" id="customText" v-model="customText" placeholder="留空显示尺寸" />
        </div>
        
        <div class="config-group">
          <label for="format">图片格式</label>
          <select id="format" v-model="format">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>

      <div class="preset-sizes">
        <h4>常用尺寸</h4>
        <div class="preset-buttons">
          <button v-for="preset in presets" :key="preset.name" 
                  @click="applyPreset(preset)" class="preset-btn">
            {{ preset.name }}
            <span>{{ preset.width }}×{{ preset.height }}</span>
          </button>
        </div>
      </div>

      <div class="preview-section">
        <h4>预览</h4>
        <div class="image-preview">
          <canvas ref="previewCanvas" 
                  :width="width" 
                  :height="height"
                  :style="{ maxWidth: '100%', height: 'auto' }">
          </canvas>
        </div>
        
        <div class="actions">
          <button @click="generateImage" class="btn-primary">
            <i class="fas fa-magic"></i> 生成图片
          </button>
          <button @click="downloadImage" class="btn-secondary" :disabled="!generatedImage">
            <i class="fas fa-download"></i> 下载图片
          </button>
          <button @click="copyToClipboard" class="btn-secondary" :disabled="!generatedImage">
            <i class="fas fa-copy"></i> 复制图片
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'LoremImage',
  setup() {
    const instance = getCurrentInstance()
    const width = ref(300)
    const height = ref(200)
    const bgColor = ref('#cccccc')
    const textColor = ref('#666666')
    const customText = ref('')
    const format = ref('png')
    const previewCanvas = ref(null)
    const generatedImage = ref(null)

    const presets = [
      { name: '网站Banner', width: 1200, height: 400 },
      { name: '文章缩略图', width: 400, height: 300 },
      { name: '头像', width: 200, height: 200 },
      { name: '移动Banner', width: 750, height: 300 },
      { name: '桌面壁纸', width: 1920, height: 1080 },
      { name: '社交媒体', width: 1080, height: 1080 },
      { name: '名片', width: 350, height: 200 },
      { name: '小图标', width: 64, height: 64 }
    ]

    const applyPreset = (preset) => {
      width.value = preset.width
      height.value = preset.height
    }

    const generateImage = () => {
      const canvas = previewCanvas.value
      const ctx = canvas.getContext('2d')
      
      // 清空画布
      ctx.clearRect(0, 0, width.value, height.value)
      
      // 设置背景色
      ctx.fillStyle = bgColor.value
      ctx.fillRect(0, 0, width.value, height.value)
      
      // 设置文字
      const text = customText.value || `${width.value} × ${height.value}`
      ctx.fillStyle = textColor.value
      
      // 动态计算字体大小
      const maxFontSize = Math.min(width.value, height.value) / 8
      const fontSize = Math.max(12, Math.min(maxFontSize, 48))
      ctx.font = `${fontSize}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // 绘制文字
      ctx.fillText(text, width.value / 2, height.value / 2)
      
      // 保存生成的图片
      generatedImage.value = canvas.toDataURL(`image/${format.value}`, 0.9)
    }

    const downloadImage = () => {
      if (!generatedImage.value) return
      
      const link = document.createElement('a')
      link.download = `placeholder_${width.value}x${height.value}.${format.value}`
      link.href = generatedImage.value
      link.click()
    }

    const copyToClipboard = async () => {
      if (!generatedImage.value) return
      
      try {
        const canvas = previewCanvas.value
        canvas.toBlob(async (blob) => {
          const item = new ClipboardItem({ 'image/png': blob })
          await navigator.clipboard.write([item])
          instance.proxy.$message.success('图片已复制到剪贴板！')
        }, 'image/png')
      } catch (error) {
        console.error('复制失败:', error)
        instance.proxy.$message.success('复制失败，请使用下载功能')
      }
    }

    // 监听参数变化，自动重新生成
    watch([width, height, bgColor, textColor, customText, format], () => {
      generateImage()
    })

    onMounted(() => {
      generateImage()
    })

    return {
      width,
      height,
      bgColor,
      textColor,
      customText,
      format,
      previewCanvas,
      generatedImage,
      presets,
      applyPreset,
      generateImage,
      downloadImage,
      copyToClipboard
    }
  }
}
</script>

<style scoped>
.lorem-image-tool {
  max-width: 800px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.tool-header h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: var(--text-secondary);
}

.image-config {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 10px;
}

.config-group {
  display: flex;
  flex-direction: column;
}

.config-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.config-group input,
.config-group select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.preset-sizes {
  margin-bottom: 10px;
}

.preset-sizes h4 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.preset-btn:hover {
  background: var(--accent-color);
  color: white;
}

.preset-btn span {
  font-size: 0.75rem;
  opacity: 0.8;
}

.preview-section {
  text-align: center;
}

.preview-section h4 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.image-preview {
  margin-bottom: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 10px;
  background: var(--bg-secondary);
  display: inline-block;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 