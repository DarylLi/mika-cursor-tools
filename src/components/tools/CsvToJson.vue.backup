<template>
  <div class="tool-container">
    <div class="tool-header">
      <div class="header-icon">
        <i class="fas fa-table"></i>
      </div>
      <h2>CSV → JSON 转换器</h2>
      <p>将CSV文件或文本转换为JSON格式，支持自定义分隔符和标题行设置</p>
      
      <!-- 快速示例按钮 -->
      <div class="example-section">
        <span class="example-label">快速开始：</span>
        <button @click="loadExample" class="example-btn">
          <i class="fas fa-magic"></i> 加载示例数据
        </button>
      </div>
    </div>

    <div class="tool-content">
      <!-- 配置选项卡片 -->
      <div class="config-card">
        <h3><i class="fas fa-cog"></i> 配置选项</h3>
        <div class="options-grid">
          <div class="option-item">
            <label>分隔符</label>
            <select v-model="delimiter" class="styled-select">
              <option value=",">,（逗号）</option>
              <option value=";">；（分号）</option>
              <option value="\t">Tab（制表符）</option>
              <option value="|">|（管道符）</option>
            </select>
          </div>
          <div class="option-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="hasHeader" />
              <span class="checkmark"></span>
              首行为标题
            </label>
          </div>
          <div class="option-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formatOutput" />
              <span class="checkmark"></span>
              格式化输出
            </label>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-card">
        <div class="card-header">
          <h3><i class="fas fa-upload"></i> CSV 数据输入</h3>
          <div class="upload-area">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".csv,.txt"
              style="display: none"
            />
            <button @click="$refs.fileInput.click()" class="upload-btn">
              <i class="fas fa-cloud-upload-alt"></i>
              选择文件
            </button>
            <span class="file-info" v-if="fileName">
              <i class="fas fa-file-csv"></i>
              {{ fileName }}
            </span>
          </div>
        </div>
        
        <div class="input-area">
          <textarea
            v-model="csvText"
            placeholder="在此粘贴CSV文本数据，或使用上面的按钮上传文件..."
            class="styled-textarea"
            rows="8"
          ></textarea>
          
          <!-- 输入提示 -->
          <div class="input-hints" v-if="!csvText.trim()">
            <div class="hint-item">
              <i class="fas fa-lightbulb"></i>
              <span>支持逗号、分号、制表符等分隔符</span>
            </div>
            <div class="hint-item">
              <i class="fas fa-info-circle"></i>
              <span>首行可作为字段名（标题行）</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button 
          @click="convertToJson" 
          class="primary-btn"
          :disabled="!csvText.trim()"
          :class="{ 'loading': isConverting }"
        >
          <i :class="isConverting ? 'fas fa-spinner fa-spin' : 'fas fa-exchange-alt'"></i>
          {{ isConverting ? '转换中...' : '转换为 JSON' }}
        </button>
        <button @click="clearAll" class="secondary-btn">
          <i class="fas fa-trash"></i>
          清空
        </button>
      </div>

      <!-- 输出区域 -->
      <div class="output-card" v-if="jsonResult">
        <div class="card-header">
          <h3><i class="fas fa-code"></i> JSON 输出结果</h3>
          <div class="output-actions">
            <span class="result-info">
              <i class="fas fa-check-circle"></i>
              成功转换 {{ jsonArray.length }} 条记录
            </span>
            <button @click="copyJson" class="action-btn" :class="{ 'success': copyText === '已复制!' }">
              <i :class="copyText === '已复制!' ? 'fas fa-check' : 'fas fa-copy'"></i>
              {{ copyText }}
            </button>
            <button @click="downloadJson" class="action-btn">
              <i class="fas fa-download"></i>
              下载
            </button>
          </div>
        </div>
        
        <div class="output-content">
          <pre class="json-output">{{ jsonResult }}</pre>
          
          <!-- 预览表格 -->
          <div class="preview-section" v-if="jsonArray.length > 0">
            <h4><i class="fas fa-table"></i> 数据预览</h4>
            <div class="table-container">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th v-for="(value, key) in jsonArray[0]" :key="key">{{ key }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in jsonArray.slice(0, 5)" :key="index">
                    <td v-for="(value, key) in item" :key="key">{{ value }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="jsonArray.length > 5" class="more-rows">
                还有 {{ jsonArray.length - 5 }} 行数据...
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-card">
        <i class="fas fa-exclamation-triangle"></i>
        <div>
          <strong>转换失败</strong>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="help-card">
        <h3><i class="fas fa-question-circle"></i> 使用说明</h3>
        <div class="help-grid">
          <div class="help-item">
            <div class="help-icon">
              <i class="fas fa-file-csv"></i>
            </div>
            <div class="help-content">
              <h4>支持格式</h4>
              <p>CSV、TSV文件或纯文本</p>
            </div>
          </div>
          <div class="help-item">
            <div class="help-icon">
              <i class="fas fa-cogs"></i>
            </div>
            <div class="help-content">
              <h4>灵活配置</h4>
              <p>自定义分隔符和标题行</p>
            </div>
          </div>
          <div class="help-item">
            <div class="help-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="help-content">
              <h4>隐私保护</h4>
              <p>本地处理，数据不上传</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CsvToJson',
  setup() {
    const csvText = ref('')
    const jsonResult = ref('')
    const fileName = ref('')
    const delimiter = ref(',')
    const hasHeader = ref(true)
    const formatOutput = ref(true)
    const error = ref('')
    const copyText = ref('复制')
    const isConverting = ref(false)

    const jsonArray = computed(() => {
      if (!jsonResult.value) return []
      try {
        return JSON.parse(jsonResult.value)
      } catch {
        return []
      }
    })

    const loadExample = () => {
      csvText.value = `姓名,年龄,城市,职业
张三,28,北京,工程师
李四,32,上海,设计师
王五,25,广州,产品经理
赵六,30,深圳,数据分析师
钱七,27,杭州,前端开发`
      delimiter.value = ','
      hasHeader.value = true
      formatOutput.value = true
      error.value = ''
      jsonResult.value = ''
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        fileName.value = file.name
        const reader = new FileReader()
        reader.onload = (e) => {
          csvText.value = e.target.result
        }
        reader.readAsText(file)
      }
    }

    const parseCsv = (text, delimiter, hasHeader) => {
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length === 0) return []

      const result = []
      const headers = hasHeader ? 
        lines[0].split(delimiter).map(h => h.trim().replace(/"/g, '')) :
        lines[0].split(delimiter).map((_, i) => `column_${i + 1}`)

      const dataLines = hasHeader ? lines.slice(1) : lines

      dataLines.forEach(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
        const obj = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        result.push(obj)
      })

      return result
    }

    const convertToJson = () => {
      try {
        isConverting.value = true
        error.value = ''
        
        setTimeout(() => {
          try {
            const parsed = parseCsv(csvText.value, delimiter.value, hasHeader.value)
            jsonResult.value = formatOutput.value ? 
              JSON.stringify(parsed, null, 2) : 
              JSON.stringify(parsed)
          } catch (err) {
            error.value = '转换失败: ' + err.message
            jsonResult.value = ''
          } finally {
            isConverting.value = false
          }
        }, 300)
      } catch (err) {
        error.value = '转换失败: ' + err.message
        jsonResult.value = ''
        isConverting.value = false
      }
    }

    const copyJson = () => {
      navigator.clipboard.writeText(jsonResult.value).then(() => {
        copyText.value = '已复制!'
        setTimeout(() => copyText.value = '复制', 2000)
      })
    }

    const downloadJson = () => {
      const blob = new Blob([jsonResult.value], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const clearAll = () => {
      csvText.value = ''
      jsonResult.value = ''
      fileName.value = ''
      error.value = ''
      copyText.value = '复制'
    }

    return {
      csvText,
      jsonResult,
      jsonArray,
      fileName,
      delimiter,
      hasHeader,
      formatOutput,
      error,
      copyText,
      isConverting,
      loadExample,
      handleFileUpload,
      convertToJson,
      copyJson,
      downloadJson,
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
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
  margin: 0 0 24px 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
}

.example-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.example-label {
  font-size: 14px;
  opacity: 0.8;
}

.example-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.example-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* 卡片样式 */
.config-card, .input-card, .output-card, .help-card, .error-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.config-card:hover, .input-card:hover, .output-card:hover, .help-card:hover {
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

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 自定义复选框 */
.checkbox-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
  font-weight: 500 !important;
  color: #4a5568 !important;
  margin: 0 !important;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  margin-right: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.file-info {
  color: #10b981;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.styled-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.styled-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.input-hints {
  margin-top: 16px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
}

.hint-item i {
  color: #a0aec0;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 32px 0;
}

.primary-btn, .secondary-btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;
}

.primary-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.primary-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.primary-btn.loading {
  opacity: 0.8;
}

.secondary-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.secondary-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.output-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-info {
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.action-btn.success {
  border-color: #10b981;
  color: #10b981;
  background: #f0fdf4;
}

.json-output {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 24px;
}

.preview-section h4 {
  margin: 0 0 16px 0;
  color: #4a5568;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-container {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.preview-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #2d3748;
}

.preview-table tr:hover {
  background: #f8fafc;
}

.more-rows {
  padding: 12px 16px;
  text-align: center;
  color: #718096;
  font-style: italic;
  background: #f8fafc;
}

.error-card {
  background: #fef2f2 !important;
  border-color: #fecaca !important;
  color: #dc2626;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.error-card i {
  font-size: 20px;
  margin-top: 2px;
}

.error-card strong {
  display: block;
  margin-bottom: 4px;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.help-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.help-item:hover {
  background: #f1f5f9;
}

.help-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.help-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.help-content p {
  margin: 0;
  color: #718096;
  font-size: 14px;
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
  }
  
  .output-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .help-grid {
    grid-template-columns: 1fr;
  }
}
</style> 