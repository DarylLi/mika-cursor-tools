<template>
  <div class="icon-spriter-container">
    <div class="tool-header">
      <h3>SVG 雪碧图生成器</h3>
      <p>将多个 SVG 图标合并为一个雪碧图文件</p>
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
          accept=".svg" 
          multiple
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-content">
          <div class="upload-icon">🎨</div>
          <p>点击选择或拖拽 SVG 图标文件</p>
          <small>支持批量上传多个 SVG 文件</small>
        </div>
      </div>
    </div>

    <div class="sprite-settings" v-if="svgIcons.length > 0">
      <div class="settings-panel">
        <h4>雪碧图设置</h4>
        
        <div class="layout-settings">
          <div class="setting-group">
            <label>布局方式:</label>
            <select v-model="layout" class="setting-select">
              <option value="horizontal">水平排列</option>
              <option value="vertical">垂直排列</option>
              <option value="grid">网格排列</option>
            </select>
          </div>

          <div class="setting-group" v-if="layout === 'grid'">
            <label>每行图标数:</label>
            <input 
              type="number" 
              v-model="gridColumns" 
              min="1" 
              :max="svgIcons.length"
              class="setting-input"
            />
          </div>

          <div class="setting-group">
            <label>图标间距 (px):</label>
            <input 
              type="number" 
              v-model="iconSpacing" 
              min="0" 
              max="50"
              class="setting-input"
            />
          </div>

          <div class="setting-group">
            <label>图标尺寸 (px):</label>
            <input 
              type="number" 
              v-model="iconSize" 
              min="16" 
              max="128"
              class="setting-input"
            />
          </div>
        </div>

        <div class="output-settings">
          <div class="setting-group">
            <label>输出格式:</label>
            <div class="format-options">
              <label class="checkbox-option">
                <input type="checkbox" v-model="generateSvg" />
                <span>SVG 雪碧图</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="generateCss" />
                <span>CSS 样式文件</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="generateHtml" />
                <span>HTML 示例</span>
              </label>
            </div>
          </div>

          <div class="setting-group">
            <label>CSS 类名前缀:</label>
            <input 
              type="text" 
              v-model="cssPrefix" 
              placeholder="icon-"
              class="setting-input"
            />
          </div>
        </div>

        <div class="action-buttons">
          <button @click="generateSprite" class="generate-btn" :disabled="processing">
            {{ processing ? '生成中...' : '生成雪碧图' }}
          </button>
          <button @click="downloadSprite" class="download-btn" v-if="spriteGenerated">
            下载文件
          </button>
          <button @click="clearAll" class="clear-btn">清空</button>
        </div>
      </div>
    </div>

    <div class="icons-preview" v-if="svgIcons.length > 0">
      <h4>图标预览 ({{ svgIcons.length }} 个)</h4>
      <div class="icons-grid">
        <div 
          v-for="(icon, index) in svgIcons" 
          :key="index"
          class="icon-item"
        >
          <div class="icon-preview" v-html="icon.content"></div>
          <div class="icon-info">
            <h6>{{ icon.name }}</h6>
            <small>{{ icon.size }} bytes</small>
          </div>
          <button @click="removeIcon(index)" class="remove-icon-btn">×</button>
        </div>
      </div>
    </div>

    <div class="sprite-preview" v-if="spriteGenerated">
      <h4>雪碧图预览</h4>
      <div class="preview-container">
        <div class="sprite-display" v-html="spriteContent"></div>
        <div class="sprite-info">
          <p>尺寸: {{ spriteWidth }} × {{ spriteHeight }}</p>
          <p>图标数量: {{ svgIcons.length }}</p>
          <p>文件大小: {{ formatFileSize(spriteSize) }}</p>
        </div>
      </div>
    </div>

    <div class="css-preview" v-if="cssContent">
      <h4>CSS 样式预览</h4>
      <div class="code-container">
        <pre><code>{{ cssContent }}</code></pre>
        <button @click="copyCss" class="copy-btn">复制 CSS</button>
      </div>
    </div>

    <div class="usage-guide">
      <h4>💡 使用指南</h4>
      <div class="guide-content">
        <div class="guide-section">
          <h5>1. 上传图标</h5>
          <p>选择或拖拽多个 SVG 图标文件到上传区域</p>
        </div>
        <div class="guide-section">
          <h5>2. 配置设置</h5>
          <p>选择布局方式、图标尺寸和间距等参数</p>
        </div>
        <div class="guide-section">
          <h5>3. 生成雪碧图</h5>
          <p>点击生成按钮创建 SVG 雪碧图和 CSS 文件</p>
        </div>
        <div class="guide-section">
          <h5>4. 下载使用</h5>
          <p>下载生成的文件并在项目中引用</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IconSpriter',
  data() {
    return {
      svgIcons: [],
      isDragOver: false,
      processing: false,
      spriteGenerated: false,
      layout: 'grid',
      gridColumns: 4,
      iconSpacing: 10,
      iconSize: 24,
      generateSvg: true,
      generateCss: true,
      generateHtml: false,
      cssPrefix: 'icon-',
      spriteContent: '',
      cssContent: '',
      htmlContent: '',
      spriteWidth: 0,
      spriteHeight: 0,
      spriteSize: 0
    }
  },
  methods: {
    handleDrop(e) {
      this.isDragOver = false
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.name.toLowerCase().endsWith('.svg')
      )
      this.processFiles(files)
    },

    handleFileSelect(e) {
      const files = Array.from(e.target.files)
      this.processFiles(files)
    },

    async processFiles(files) {
      for (const file of files) {
        await this.addSvgIcon(file)
      }
    },

    async addSvgIcon(file) {
      const content = await this.readFileAsText(file)
      const cleanedContent = this.cleanSvgContent(content)
      
      this.svgIcons.push({
        file,
        name: file.name.replace('.svg', ''),
        content: cleanedContent,
        size: file.size,
        originalContent: content
      })
    },

    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsText(file)
      })
    },

    cleanSvgContent(svgContent) {
      // 移除 XML 声明和注释
      let cleaned = svgContent.replace(/<\?xml[^>]*\?>/, '')
      cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')
      
      // 确保有 viewBox
      if (!cleaned.includes('viewBox')) {
        const widthMatch = cleaned.match(/width="([^"]*)"/)
        const heightMatch = cleaned.match(/height="([^"]*)"/)
        
        if (widthMatch && heightMatch) {
          const width = parseFloat(widthMatch[1])
          const height = parseFloat(heightMatch[1])
          cleaned = cleaned.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`)
        }
      }
      
      return cleaned.trim()
    },

    async generateSprite() {
      if (this.svgIcons.length === 0) return
      
      this.processing = true
      
      try {
        await this.createSpriteContent()
        this.spriteGenerated = true
      } catch (error) {
        console.error('生成雪碧图失败:', error)
        alert('生成失败')
      } finally {
        this.processing = false
      }
    },

    async createSpriteContent() {
      const { width, height, positions } = this.calculateLayout()
      
      this.spriteWidth = width
      this.spriteHeight = height
      
      // 生成 SVG 雪碧图
      let svgSprite = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">\n`
      
      this.svgIcons.forEach((icon, index) => {
        const pos = positions[index]
        const iconId = `${this.cssPrefix}${icon.name}`
        
        // 提取 SVG 内容
        const svgContent = icon.content.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')
        
        svgSprite += `  <g id="${iconId}" transform="translate(${pos.x}, ${pos.y})">\n`
        svgSprite += `    <g transform="scale(${this.iconSize / 24})">\n`
        svgSprite += `      ${svgContent}\n`
        svgSprite += `    </g>\n`
        svgSprite += `  </g>\n`
      })
      
      svgSprite += '</svg>'
      
      this.spriteContent = svgSprite
      this.spriteSize = new Blob([svgSprite]).size
      
      // 生成 CSS
      if (this.generateCss) {
        this.createCssContent(positions)
      }
      
      // 生成 HTML
      if (this.generateHtml) {
        this.createHtmlContent()
      }
    },

    calculateLayout() {
      const iconCount = this.svgIcons.length
      let width, height, positions = []
      
      if (this.layout === 'horizontal') {
        width = iconCount * (this.iconSize + this.iconSpacing) - this.iconSpacing
        height = this.iconSize
        
        this.svgIcons.forEach((icon, index) => {
          positions.push({
            x: index * (this.iconSize + this.iconSpacing),
            y: 0
          })
        })
      } else if (this.layout === 'vertical') {
        width = this.iconSize
        height = iconCount * (this.iconSize + this.iconSpacing) - this.iconSpacing
        
        this.svgIcons.forEach((icon, index) => {
          positions.push({
            x: 0,
            y: index * (this.iconSize + this.iconSpacing)
          })
        })
      } else { // grid
        const cols = this.gridColumns
        const rows = Math.ceil(iconCount / cols)
        
        width = cols * (this.iconSize + this.iconSpacing) - this.iconSpacing
        height = rows * (this.iconSize + this.iconSpacing) - this.iconSpacing
        
        this.svgIcons.forEach((icon, index) => {
          const row = Math.floor(index / cols)
          const col = index % cols
          
          positions.push({
            x: col * (this.iconSize + this.iconSpacing),
            y: row * (this.iconSize + this.iconSpacing)
          })
        })
      }
      
      return { width, height, positions }
    },

    createCssContent(positions) {
      let css = `.${this.cssPrefix}sprite {\n`
      css += `  background-image: url('sprite.svg');\n`
      css += `  background-repeat: no-repeat;\n`
      css += `  display: inline-block;\n`
      css += `  width: ${this.iconSize}px;\n`
      css += `  height: ${this.iconSize}px;\n`
      css += `}\n\n`
      
      this.svgIcons.forEach((icon, index) => {
        const pos = positions[index]
        css += `.${this.cssPrefix}${icon.name} {\n`
        css += `  background-position: -${pos.x}px -${pos.y}px;\n`
        css += `}\n\n`
      })
      
      this.cssContent = css
    },

    createHtmlContent() {
      let html = '<!DOCTYPE html>\n<html>\n<head>\n'
      html += '  <meta charset="UTF-8">\n'
      html += '  <title>SVG Sprite Icons</title>\n'
      html += '  <link rel="stylesheet" href="sprite.css">\n'
      html += '</head>\n<body>\n'
      html += '  <h1>SVG Sprite Icons</h1>\n'
      html += '  <div class="icons-demo">\n'
      
      this.svgIcons.forEach(icon => {
        html += `    <div class="icon-item">\n`
        html += `      <span class="${this.cssPrefix}sprite ${this.cssPrefix}${icon.name}"></span>\n`
        html += `      <span class="icon-name">${icon.name}</span>\n`
        html += `    </div>\n`
      })
      
      html += '  </div>\n</body>\n</html>'
      
      this.htmlContent = html
    },

    async downloadSprite() {
      const files = []
      
      if (this.generateSvg) {
        files.push({
          name: 'sprite.svg',
          content: this.spriteContent,
          type: 'image/svg+xml'
        })
      }
      
      if (this.generateCss) {
        files.push({
          name: 'sprite.css',
          content: this.cssContent,
          type: 'text/css'
        })
      }
      
      if (this.generateHtml) {
        files.push({
          name: 'demo.html',
          content: this.htmlContent,
          type: 'text/html'
        })
      }
      
      if (files.length === 1) {
        const file = files[0]
        const blob = new Blob([file.content], { type: file.type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        try {
          const JSZip = (await import('jszip')).default
          const zip = new JSZip()

          files.forEach(file => {
            zip.file(file.name, file.content)
          })

          const zipBlob = await zip.generateAsync({ type: 'blob' })
          const url = URL.createObjectURL(zipBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'svg-sprite.zip'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } catch (error) {
          alert('下载失败')
        }
      }
    },

    copyCss() {
      navigator.clipboard.writeText(this.cssContent).then(() => {
        alert('CSS 已复制到剪贴板')
      })
    },

    removeIcon(index) {
      this.svgIcons.splice(index, 1)
      this.spriteGenerated = false
    },

    clearAll() {
      this.svgIcons = []
      this.spriteGenerated = false
      this.spriteContent = ''
      this.cssContent = ''
      this.htmlContent = ''
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.icon-spriter-container {
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

.sprite-settings {
  margin: 30px 0;
  padding: 25px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.settings-panel h4 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.layout-settings,
.output-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.setting-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-select,
.setting-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.format-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.generate-btn,
.download-btn,
.clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.generate-btn {
  background: var(--primary-color);
  color: white;
}

.download-btn {
  background: var(--success-color);
  color: white;
}

.clear-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.icons-preview {
  margin: 30px 0;
}

.icons-preview h4 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.icon-item {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.icon-preview {
  width: 48px;
  height: 48px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-preview svg {
  max-width: 100%;
  max-height: 100%;
}

.icon-info h6 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
  font-size: 12px;
}

.icon-info small {
  color: var(--text-secondary);
  font-size: 10px;
}

.remove-icon-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border: none;
  background: var(--danger-color);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

.sprite-preview {
  margin: 30px 0;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.sprite-preview h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.preview-container {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 20px;
  align-items: start;
}

.sprite-display {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  min-height: 200px;
  overflow: auto;
}

.sprite-info {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 15px;
}

.sprite-info p {
  margin: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.css-preview {
  margin: 30px 0;
}

.css-preview h4 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

.code-container {
  position: relative;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.code-container pre {
  margin: 0;
  padding: 20px;
  overflow: auto;
  max-height: 300px;
  font-size: 14px;
  color: var(--text-primary);
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.usage-guide {
  margin-top: 40px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.usage-guide h4 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.guide-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.guide-section {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 15px;
}

.guide-section h5 {
  margin: 0 0 8px 0;
  color: var(--primary-color);
}

.guide-section p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

@media (max-width: 768px) {
  .layout-settings,
  .output-settings {
    grid-template-columns: 1fr;
  }
  
  .preview-container {
    grid-template-columns: 1fr;
  }
  
  .guide-content {
    grid-template-columns: 1fr;
  }
  
  .icons-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
