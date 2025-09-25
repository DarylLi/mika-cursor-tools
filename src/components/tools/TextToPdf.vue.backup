<template>
  <div class="tool-container">
    <div class="tool-header">
      <div class="header-icon">📄</div>
      <h2>文本转PDF</h2>
      <p>将文本内容转换为PDF格式文档，支持自定义格式和样式</p>
    </div>

    <div class="input-card">
      <div class="card-header">
        <h3><i class="fas fa-edit"></i> 输入文本内容</h3>
      </div>
      
      <div class="input-section">
        <textarea
          v-model="textContent"
          placeholder="请输入要转换为PDF的文本内容..."
          class="text-input"
          @input="updateStats"
        ></textarea>
        
        <div class="stats">
          <span>字符数: {{ charCount }}</span>
          <span>单词数: {{ wordCount }}</span>
          <span>行数: {{ lineCount }}</span>
        </div>
      </div>

      <div class="file-upload">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          accept=".txt,.md"
          style="display: none"
        />
        <button @click="$refs.fileInput.click()" class="secondary-btn">
          <i class="fas fa-upload"></i> 上传文本文件
        </button>
      </div>
    </div>

    <div class="config-card">
      <div class="card-header">
        <h3><i class="fas fa-cog"></i> 配置选项</h3>
      </div>
      
      <div class="options-grid">
        <div class="option-item">
          <label>文件名</label>
          <input v-model="fileName" type="text" placeholder="PDF文档" class="text-input" />
        </div>
        
        <div class="option-item">
          <label>字体大小</label>
          <select v-model="fontSize" class="styled-select">
            <option value="10">10pt</option>
            <option value="12">12pt</option>
            <option value="14">14pt</option>
            <option value="16">16pt</option>
            <option value="18">18pt</option>
          </select>
        </div>

        <div class="option-item">
          <label>页面方向</label>
          <select v-model="pageOrientation" class="styled-select">
            <option value="portrait">纵向</option>
            <option value="landscape">横向</option>
          </select>
        </div>

        <div class="option-item">
          <label>字体家族</label>
          <select v-model="fontFamily" class="styled-select">
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="SimSun">宋体</option>
            <option value="Microsoft YaHei">微软雅黑</option>
          </select>
        </div>
      </div>

      <div class="checkbox-options">
        <label class="checkbox-label">
          <input type="checkbox" v-model="addPageNumbers" />
          <span class="checkmark"></span>
          添加页码
        </label>
        
        <label class="checkbox-label">
          <input type="checkbox" v-model="addTimestamp" />
          <span class="checkmark"></span>
          添加时间戳
        </label>
        
        <label class="checkbox-label">
          <input type="checkbox" v-model="preserveLineBreaks" />
          <span class="checkmark"></span>
          保持换行
        </label>
      </div>
    </div>

    <div class="action-section">
      <button @click="generatePdf" class="primary-btn" :disabled="!textContent.trim() || isGenerating">
        <i :class="isGenerating ? 'fas fa-spinner fa-spin' : 'fas fa-file-pdf'"></i>
        {{ isGenerating ? '生成中...' : '生成PDF' }}
      </button>
      
      <button @click="previewContent" class="secondary-btn" :disabled="!textContent.trim()">
        <i class="fas fa-eye"></i> 预览
      </button>
      
      <button @click="clearAll" class="danger-btn">
        <i class="fas fa-trash"></i> 清空
      </button>
    </div>

    <div v-if="error" class="error-card">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>

    <div v-if="success" class="success-card">
      <i class="fas fa-check-circle"></i> {{ success }}
    </div>

    <div v-if="showPreview" class="preview-card">
      <div class="card-header">
        <h3><i class="fas fa-eye"></i> 预览</h3>
        <button @click="showPreview = false" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="preview-content" :style="previewStyle">
        <div v-if="addTimestamp" class="preview-timestamp">
          生成时间: {{ currentTimestamp }}
        </div>
        <div class="preview-text">{{ formattedText }}</div>
      </div>
    </div>

    <div class="help-card">
      <h4><i class="fas fa-info-circle"></i> 使用说明</h4>
      <ul>
        <li>输入或上传文本内容</li>
        <li>配置PDF格式选项</li>
        <li>点击"生成PDF"按钮</li>
        <li>在弹出的打印对话框中选择"保存为PDF"</li>
        <li>支持.txt和.md文件上传</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'TextToPdf',
  setup() {
    const textContent = ref('')
    const fileName = ref('')
    const fontSize = ref('14')
    const pageOrientation = ref('portrait')
    const fontFamily = ref('Arial')
    const addPageNumbers = ref(false)
    const addTimestamp = ref(false)
    const preserveLineBreaks = ref(true)
    const error = ref('')
    const success = ref('')
    const isGenerating = ref(false)
    const showPreview = ref(false)

    const charCount = computed(() => textContent.value.length)
    const wordCount = computed(() => textContent.value.trim().split(/\s+/).filter(word => word.length > 0).length)
    const lineCount = computed(() => textContent.value.split('\n').length)
    
    const currentTimestamp = computed(() => {
      return new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    })

    const formattedText = computed(() => {
      return preserveLineBreaks.value ? textContent.value : textContent.value.replace(/\n/g, ' ')
    })

    const previewStyle = computed(() => ({
      fontFamily: fontFamily.value,
      fontSize: fontSize.value + 'pt',
      whiteSpace: preserveLineBreaks.value ? 'pre-wrap' : 'normal'
    }))

    const updateStats = () => {
      // 触发计算属性更新
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        textContent.value = e.target.result
        fileName.value = file.name.replace(/\.[^/.]+$/, "")
        updateStats()
      }
      reader.readAsText(file)
    }

    const previewContent = () => {
      showPreview.value = true
    }

    const generatePdf = () => {
      try {
        isGenerating.value = true
        error.value = ''
        success.value = ''

        // 创建新窗口用于打印
        const printWindow = window.open('', '_blank')
        
        // 构建HTML内容
        const htmlParts = []
        htmlParts.push('<!DOCTYPE html>')
        htmlParts.push('<html><head>')
        htmlParts.push('<meta charset="UTF-8">')
        htmlParts.push('<title>' + (fileName.value || 'PDF文档') + '</title>')
        
        // 添加样式
        htmlParts.push('<style>')
        htmlParts.push('body { font-family: ' + fontFamily.value + '; font-size: ' + fontSize.value + 'pt; line-height: 1.6; margin: 0; padding: 20mm; color: #333; background: white; }')
        if (preserveLineBreaks.value) {
          htmlParts.push('body { white-space: pre-wrap; }')
        }
        htmlParts.push('.header { text-align: right; font-size: 10pt; color: #666; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }')
        htmlParts.push('.content { margin-bottom: 40px; }')
        htmlParts.push('@media print { body { margin: 0; } @page { margin: 20mm; size: ' + (pageOrientation.value === 'landscape' ? 'A4 landscape' : 'A4 portrait') + '; } }')
        htmlParts.push('</style>')
        
        htmlParts.push('</head><body>')
        
        if (addTimestamp.value) {
          htmlParts.push('<div class="header">生成时间: ' + currentTimestamp.value + '</div>')
        }
        
        htmlParts.push('<div class="content">' + formattedText.value.replace(/\n/g, '<br>') + '</div>')
        
        htmlParts.push('<script>')
        htmlParts.push('window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); }')
        htmlParts.push('</scr' + 'ipt>')
        
        htmlParts.push('</body></html>')

        printWindow.document.write(htmlParts.join('\n'))
        printWindow.document.close()
        printWindow.focus()

        success.value = 'PDF生成成功！请在打印对话框中选择"保存为PDF"'
        setTimeout(() => success.value = '', 5000)

      } catch (err) {
        error.value = 'PDF生成失败: ' + err.message
      } finally {
        isGenerating.value = false
      }
    }

    const clearAll = () => {
      textContent.value = ''
      fileName.value = ''
      error.value = ''
      success.value = ''
      showPreview.value = false
    }

    return {
      textContent,
      fileName,
      fontSize,
      pageOrientation,
      fontFamily,
      addPageNumbers,
      addTimestamp,
      preserveLineBreaks,
      error,
      success,
      isGenerating,
      showPreview,
      charCount,
      wordCount,
      lineCount,
      currentTimestamp,
      formattedText,
      previewStyle,
      updateStats,
      handleFileUpload,
      previewContent,
      generatePdf,
      clearAll
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tool-header {
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
}

.header-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.tool-header h2 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
}

.tool-header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
}

/* 卡片样式 */
.input-card, .config-card, .preview-card, .help-card, .error-card, .success-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-card:hover, .config-card:hover, .preview-card:hover, .help-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f8fafc;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s ease;
  font-family: inherit;
  resize: vertical;
}

.text-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.text-input[type="textarea"] {
  min-height: 200px;
}

.stats {
  display: flex;
  gap: 20px;
  margin-top: 12px;
  font-size: 14px;
  color: #6b7280;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.option-item label {
  display: block;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.styled-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #2d3748;
  font-size: 14px;
  transition: all 0.3s ease;
}

.styled-select:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.checkbox-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  transform: scale(1.2);
}

.action-section {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 32px 0;
}

.primary-btn, .secondary-btn, .danger-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-btn {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
}

.secondary-btn {
  background: #f8fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.secondary-btn:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.danger-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 2px solid #fecaca;
}

.danger-btn:hover {
  background: #fee2e2;
  transform: translateY(-2px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-card {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.success-card {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.preview-content {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.preview-timestamp {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.help-card h4 {
  margin: 0 0 16px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-card ul {
  margin: 0;
  padding-left: 20px;
}

.help-card li {
  margin-bottom: 8px;
  color: #4a5568;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 16px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .checkbox-options {
    flex-direction: column;
    gap: 12px;
  }
}
</style> 