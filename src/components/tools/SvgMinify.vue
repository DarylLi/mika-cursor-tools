<template>
  <div class="svg-minify-container">
    <div class="tool-header">
      <h3>SVG 压缩优化器</h3>
      <p>移除冗余代码，优化SVG文件大小，保持质量</p>
    </div>

    <div class="input-section">
      <div class="input-methods">
        <div class="input-tabs">
          <button 
            @click="inputMethod = 'upload'"
            :class="['tab-btn', { active: inputMethod === 'upload' }]"
          >
            📁 上传文件
          </button>
          <button 
            @click="inputMethod = 'paste'"
            :class="['tab-btn', { active: inputMethod === 'paste' }]"
          >
            📋 粘贴代码
          </button>
          <button 
            @click="inputMethod = 'url'"
            :class="['tab-btn', { active: inputMethod === 'url' }]"
          >
            🔗 URL 链接
          </button>
        </div>

        <div class="input-content">
          <div v-if="inputMethod === 'upload'" class="upload-area">
            <div 
              class="upload-zone"
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
                <div class="upload-icon">📁</div>
                <p>点击选择或拖拽 SVG 文件</p>
                <small>支持批量处理多个文件</small>
              </div>
            </div>
          </div>

          <div v-if="inputMethod === 'paste'" class="paste-area">
            <textarea 
              v-model="pastedSvg"
              placeholder="粘贴 SVG 代码..."
              class="svg-textarea"
              @input="processPastedSvg"
            ></textarea>
            <button @click="processPastedSvg" class="process-btn" :disabled="!pastedSvg.trim()">
              处理 SVG
            </button>
          </div>

          <div v-if="inputMethod === 'url'" class="url-area">
            <div class="url-input-group">
              <input 
                v-model="svgUrl"
                type="url"
                placeholder="输入 SVG 文件的 URL..."
                class="url-input"
                @keyup.enter="fetchSvgFromUrl"
              />
              <button @click="fetchSvgFromUrl" class="fetch-btn" :disabled="!svgUrl.trim() || loading">
                {{ loading ? '加载中...' : '获取 SVG' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="optimization-settings" v-if="svgFiles.length > 0">
      <h4>优化选项</h4>
      <div class="settings-grid">
        <label class="setting-item">
          <input type="checkbox" v-model="options.removeComments" />
          <span>移除注释</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="options.removeMetadata" />
          <span>移除元数据</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="options.removeEditorsData" />
          <span>移除编辑器数据</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="options.removeEmptyAttrs" />
          <span>移除空属性</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="options.removeEmptyText" />
          <span>移除空文本</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="options.removeEmptyContainers" />
          <span>移除空容器</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="options.minifyStyles" />
          <span>压缩样式</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="options.removeUnusedNS" />
          <span>移除未使用命名空间</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="options.sortAttrs" />
          <span>排序属性</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="options.removeDimensions" />
          <span>移除宽高属性</span>
        </label>
      </div>
      
      <div class="batch-actions">
        <button @click="optimizeAll" class="optimize-all-btn" :disabled="processing">
          {{ processing ? '优化中...' : '批量优化' }}
        </button>
        <button @click="downloadAll" class="download-all-btn" v-if="optimizedFiles.length > 0">
          下载全部
        </button>
        <button @click="clearAll" class="clear-btn">清空</button>
      </div>
    </div>

    <div class="files-section" v-if="svgFiles.length > 0">
      <div class="files-grid">
        <div 
          v-for="(file, index) in svgFiles" 
          :key="index"
          class="file-item"
        >
          <div class="file-preview">
            <div class="svg-preview" v-if="file.content">
              <div v-html="file.content" class="svg-display"></div>
            </div>
            <div class="processing-overlay" v-if="file.processing">
              <div class="loading-spinner"></div>
              <span>优化中...</span>
            </div>
          </div>
          
          <div class="file-info">
            <h5>{{ file.name }}</h5>
            <div class="size-info">
              <span>原始: {{ formatFileSize(file.originalSize) }}</span>
              <span v-if="file.optimizedSize">
                优化后: {{ formatFileSize(file.optimizedSize) }}
              </span>
            </div>
            <div class="compression-info" v-if="file.optimizedSize">
              <span class="reduction-percentage">
                减少 {{ calculateReduction(file.originalSize, file.optimizedSize) }}%
              </span>
            </div>
          </div>

          <div class="file-actions">
            <button 
              @click="optimizeFile(index)" 
              class="optimize-btn"
              :disabled="file.processing || file.optimized"
            >
              {{ file.processing ? '优化中' : (file.optimized ? '已优化' : '优化') }}
            </button>
            <button 
              @click="previewFile(index)" 
              class="preview-btn"
            >
              预览
            </button>
            <button 
              @click="downloadFile(index)" 
              class="download-btn"
              v-if="file.optimized"
            >
              下载
            </button>
            <button @click="removeFile(index)" class="remove-btn">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="preview-modal" v-if="previewModal.show" @click.self="closePreview">
      <div class="modal-content">
        <div class="modal-header">
          <h4>{{ previewModal.title }}</h4>
          <button @click="closePreview" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="preview-tabs">
            <button 
              @click="previewModal.tab = 'visual'"
              :class="['tab-btn', { active: previewModal.tab === 'visual' }]"
            >
              视觉预览
            </button>
            <button 
              @click="previewModal.tab = 'code'"
              :class="['tab-btn', { active: previewModal.tab === 'code' }]"
            >
              代码对比
            </button>
          </div>
          <div class="preview-content">
            <div v-if="previewModal.tab === 'visual'" class="visual-preview">
              <div class="preview-item">
                <h5>原始</h5>
                <div v-html="previewModal.original" class="svg-display"></div>
              </div>
              <div class="preview-item" v-if="previewModal.optimized">
                <h5>优化后</h5>
                <div v-html="previewModal.optimized" class="svg-display"></div>
              </div>
            </div>
            <div v-if="previewModal.tab === 'code'" class="code-preview">
              <div class="code-item">
                <h5>原始代码 ({{ formatFileSize(previewModal.originalSize) }})</h5>
                <pre><code>{{ previewModal.original }}</code></pre>
              </div>
              <div class="code-item" v-if="previewModal.optimized">
                <h5>优化后代码 ({{ formatFileSize(previewModal.optimizedSize) }})</h5>
                <pre><code>{{ previewModal.optimized }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h4>💡 优化说明</h4>
      <div class="optimization-tips">
        <div class="tip-category">
          <h5>基础优化</h5>
          <ul>
            <li>移除注释和元数据</li>
            <li>清理空白字符</li>
            <li>删除无用属性</li>
          </ul>
        </div>
        <div class="tip-category">
          <h5>高级优化</h5>
          <ul>
            <li>合并重复路径</li>
            <li>简化数值精度</li>
            <li>优化变换属性</li>
          </ul>
        </div>
        <div class="tip-category">
          <h5>注意事项</h5>
          <ul>
            <li>优化可能影响动画效果</li>
            <li>建议保留原始文件备份</li>
            <li>测试优化后的兼容性</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SvgMinify',
  data() {
    return {
      inputMethod: 'upload',
      svgFiles: [],
      optimizedFiles: [],
      isDragOver: false,
      pastedSvg: '',
      svgUrl: '',
      loading: false,
      processing: false,
      options: {
        removeComments: true,
        removeMetadata: true,
        removeEditorsData: true,
        removeEmptyAttrs: true,
        removeEmptyText: true,
        removeEmptyContainers: true,
        minifyStyles: true,
        removeUnusedNS: true,
        sortAttrs: false,
        removeDimensions: false
      },
      previewModal: {
        show: false,
        title: '',
        tab: 'visual',
        original: '',
        optimized: '',
        originalSize: 0,
        optimizedSize: 0
      }
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
        await this.addSvgFile(file)
      }
    },

    async addSvgFile(file) {
      const content = await this.readFileAsText(file)
      
      this.svgFiles.push({
        file,
        name: file.name,
        content,
        originalSize: new Blob([content]).size,
        processing: false,
        optimized: false,
        optimizedContent: null,
        optimizedSize: null
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

    async processPastedSvg() {
      if (!this.pastedSvg.trim()) return
      
      const blob = new Blob([this.pastedSvg], { type: 'image/svg+xml' })
      const file = new File([blob], 'pasted.svg', { type: 'image/svg+xml' })
      
      await this.addSvgFile(file)
      this.pastedSvg = ''
    },

    async fetchSvgFromUrl() {
      if (!this.svgUrl.trim()) return
      
      this.loading = true
      
      try {
        const response = await fetch(this.svgUrl)
        if (!response.ok) {
          throw new Error('无法获取 SVG 文件')
        }
        
        const content = await response.text()
        const filename = this.svgUrl.split('/').pop() || 'downloaded.svg'
        
        const blob = new Blob([content], { type: 'image/svg+xml' })
        const file = new File([blob], filename, { type: 'image/svg+xml' })
        
        await this.addSvgFile(file)
        this.svgUrl = ''
      } catch (error) {
        this.$message.success('获取 SVG 失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    async optimizeFile(index) {
      const file = this.svgFiles[index]
      file.processing = true

      try {
        const optimizedContent = await this.performOptimization(file.content)
        file.optimizedContent = optimizedContent
        file.optimizedSize = new Blob([optimizedContent]).size
        file.optimized = true
        
        this.optimizedFiles.push({
          name: file.name,
          content: optimizedContent
        })
      } catch (error) {
        console.error('优化失败:', error)
        this.$message.success('优化失败: ' + error.message)
      } finally {
        file.processing = false
      }
    },

    async performOptimization(svgContent) {
      let optimized = svgContent

      if (this.options.removeComments) {
        optimized = optimized.replace(/<!--[\s\S]*?-->/g, '')
      }

      if (this.options.removeMetadata) {
        optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
        optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, '')
        optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, '')
      }

      if (this.options.removeEditorsData) {
        optimized = optimized.replace(/xmlns:sketch="[^"]*"/gi, '')
        optimized = optimized.replace(/sketch:\w+="[^"]*"/gi, '')
        optimized = optimized.replace(/xmlns:figma="[^"]*"/gi, '')
        optimized = optimized.replace(/figma:\w+="[^"]*"/gi, '')
      }

      if (this.options.removeEmptyAttrs) {
        optimized = optimized.replace(/\s+\w+=""\s*/g, ' ')
      }

      if (this.options.removeEmptyText) {
        optimized = optimized.replace(/<text[^>]*>\s*<\/text>/gi, '')
      }

      if (this.options.removeEmptyContainers) {
        optimized = optimized.replace(/<g[^>]*>\s*<\/g>/gi, '')
        optimized = optimized.replace(/<defs[^>]*>\s*<\/defs>/gi, '')
      }

      if (this.options.minifyStyles) {
        optimized = optimized.replace(/\s*:\s*/g, ':')
        optimized = optimized.replace(/\s*;\s*/g, ';')
        optimized = optimized.replace(/\s*,\s*/g, ',')
      }

      if (this.options.removeUnusedNS) {
        const usedNamespaces = new Set()
        const namespacePattern = /xmlns:(\w+)="[^"]*"/g
        let match
        
        while ((match = namespacePattern.exec(optimized)) !== null) {
          const prefix = match[1]
          if (optimized.includes(`${prefix}:`)) {
            usedNamespaces.add(prefix)
          }
        }
        
        optimized = optimized.replace(/xmlns:(\w+)="[^"]*"/g, (match, prefix) => {
          return usedNamespaces.has(prefix) ? match : ''
        })
      }

      if (this.options.removeDimensions) {
        optimized = optimized.replace(/\s+(width|height)="[^"]*"/gi, '')
      }

      // 移除多余的空白字符
      optimized = optimized.replace(/\s+/g, ' ')
      optimized = optimized.replace(/>\s+</g, '><')
      optimized = optimized.trim()

      return optimized
    },

    async optimizeAll() {
      this.processing = true
      
      for (let i = 0; i < this.svgFiles.length; i++) {
        if (!this.svgFiles[i].optimized) {
          await this.optimizeFile(i)
        }
      }
      
      this.processing = false
    },

    downloadFile(index) {
      const file = this.svgFiles[index]
      if (file.optimizedContent) {
        const blob = new Blob([file.optimizedContent], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `optimized_${file.name}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    },

    async downloadAll() {
      if (this.optimizedFiles.length === 0) return

      if (this.optimizedFiles.length === 1) {
        const file = this.optimizedFiles[0]
        const blob = new Blob([file.content], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `optimized_${file.name}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      try {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        this.optimizedFiles.forEach(file => {
          zip.file(`optimized_${file.name}`, file.content)
        })

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'optimized-svgs.zip'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        this.$message.success('批量下载失败，请逐个下载')
      }
    },

    previewFile(index) {
      const file = this.svgFiles[index]
      this.previewModal = {
        show: true,
        title: file.name,
        tab: 'visual',
        original: file.content,
        optimized: file.optimizedContent || '',
        originalSize: file.originalSize,
        optimizedSize: file.optimizedSize || 0
      }
    },

    closePreview() {
      this.previewModal.show = false
    },

    removeFile(index) {
      this.svgFiles.splice(index, 1)
    },

    clearAll() {
      this.svgFiles = []
      this.optimizedFiles = []
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    calculateReduction(originalSize, optimizedSize) {
      return Math.round(((originalSize - optimizedSize) / originalSize) * 100)
    }
  }
}
</script>

<style scoped>
.svg-minify-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.input-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 10px;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 10px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
}

.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
}

.upload-zone:hover,
.upload-zone.dragover {
  border-color: var(--primary-color);
  background: var(--bg-primary);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.svg-textarea {
  width: 100%;
  height: 200px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 10px;
}

.process-btn {
  padding: 10px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.url-input-group {
  display: flex;
  gap: 10px;
}

.url-input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.fetch-btn {
  padding: 10px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.optimization-settings {
  margin: 30px 0;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary);
}

input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}

.setting-item input[type="checkbox"] {
  accent-color: var(--primary-color);
}

.batch-actions {
  display: flex;
  gap: 10px;
}

.optimize-all-btn,
.download-all-btn,
.clear-btn {
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.optimize-all-btn {
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

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.file-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
}

.file-preview {
  position: relative;
  height: 200px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 10px;
  overflow: hidden;
}

.svg-display {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-display svg {
  max-width: 100%;
  max-height: 100%;
}

.processing-overlay {
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

.file-info h5 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.size-info {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.reduction-percentage {
  color: var(--success-color);
  font-weight: 600;
  font-size: 12px;
}

.file-actions {
  display: flex;
  gap: 6px;
  margin-top: 15px;
}

.optimize-btn,
.preview-btn,
.download-btn,
.remove-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
}

.optimize-btn {
  background: var(--primary-color);
  color: white;
}

.preview-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.download-btn {
  background: var(--success-color);
  color: white;
}

.remove-btn {
  background: var(--danger-color);
  color: white;
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-primary);
}

.modal-body {
  padding: 10px;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
}

.preview-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.visual-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.preview-item {
  text-align: center;
}

.preview-item h5 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.code-preview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.code-item pre {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 8px;
  max-height: 300px;
  overflow: auto;
  font-size: 12px;
}

.tips-section {
  margin-top: 40px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.optimization-tips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.tip-category h5 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.tip-category ul {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .visual-preview {
    grid-template-columns: 1fr;
  }
  
  .optimization-tips {
    grid-template-columns: 1fr;
  }
  
  .file-actions {
    flex-direction: column;
  }
}
/* Input 输入框统一样式 */
/* Checkbox 统一样式 */
input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}
/* Checkbox 统一样式 */
input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}
/* Checkbox 统一样式 */
input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}
/* Input 和 Select 统一样式 */
input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
input[type="url"],
input[type="search"],
input[type="tel"],
select {
  background: #fff;
}
</style>
