<template>
  <div class="tool-container">
    <div class="tool-header">
      <div class="header-icon">
        <i class="fas fa-code"></i>
      </div>
      <h2>JSON → CSV 转换器</h2>
      <p>将JSON数据转换为CSV格式，支持嵌套对象展平和自定义分隔符</p>
      
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
              <input type="checkbox" v-model="includeHeaders" />
              <span class="checkmark"></span>
              包含标题行
            </label>
          </div>
          <div class="option-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="flattenObjects" />
              <span class="checkmark"></span>
              展平嵌套对象
            </label>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-card">
        <div class="card-header">
          <h3><i class="fas fa-upload"></i> JSON 数据输入</h3>
          <div class="upload-area">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".json,.txt"
              style="display: none"
            />
            <button @click="$refs.fileInput.click()" class="upload-btn">
              <i class="fas fa-cloud-upload-alt"></i>
              选择文件
            </button>
            <span class="file-info" v-if="fileName">
              <i class="fas fa-file-code"></i>
              {{ fileName }}
            </span>
          </div>
        </div>
        
        <div class="input-area">
          <textarea
            v-model="jsonText"
            placeholder="在此粘贴JSON数据，可以是数组或单个对象..."
            class="styled-textarea"
            rows="8"
          ></textarea>
          
          <!-- 输入提示 -->
          <div class="input-hints" v-if="!jsonText.trim()">
            <div class="hint-item">
              <i class="fas fa-lightbulb"></i>
              <span>支持JSON数组和单个对象</span>
            </div>
            <div class="hint-item">
              <i class="fas fa-info-circle"></i>
              <span>嵌套对象可自动展平</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button 
          @click="convertToCsv" 
          class="primary-btn"
          :disabled="!jsonText.trim()"
          :class="{ 'loading': isConverting }"
        >
          <i :class="isConverting ? 'fas fa-spinner fa-spin' : 'fas fa-exchange-alt'"></i>
          {{ isConverting ? '转换中...' : '转换为 CSV' }}
        </button>
        <button @click="clearAll" class="secondary-btn">
          <i class="fas fa-trash"></i>
          清空
        </button>
      </div>

      <!-- 输出区域 -->
      <div class="output-card" v-if="csvResult">
        <div class="card-header">
          <h3><i class="fas fa-table"></i> CSV 输出结果</h3>
          <div class="output-actions">
            <span class="result-info">
              <i class="fas fa-check-circle"></i>
              成功转换 {{ rowCount }} 条记录
            </span>
            <button @click="copyCsv" class="action-btn" :class="{ 'success': copyText === '已复制!' }">
              <i :class="copyText === '已复制!' ? 'fas fa-check' : 'fas fa-copy'"></i>
              {{ copyText }}
            </button>
            <button @click="downloadCsv" class="action-btn">
              <i class="fas fa-download"></i>
              下载
            </button>
          </div>
        </div>
        
        <div class="output-content">
          <pre class="csv-output">{{ csvResult }}</pre>
          
          <!-- 预览表格 -->
          <div class="preview-section" v-if="previewData.length > 0">
            <h4><i class="fas fa-table"></i> 数据预览</h4>
            <div class="table-container">
              <table class="preview-table">
                <thead v-if="includeHeaders">
                  <tr>
                    <th v-for="header in previewHeaders" :key="header">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in previewData.slice(0, 5)" :key="index">
                    <td v-for="cell in row" :key="cell">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="previewData.length > 5" class="more-rows">
                还有 {{ previewData.length - 5 }} 行数据...
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
              <i class="fas fa-file-code"></i>
            </div>
            <div class="help-content">
              <h4>支持格式</h4>
              <p>JSON数组或单个对象</p>
            </div>
          </div>
          <div class="help-item">
            <div class="help-icon">
              <i class="fas fa-project-diagram"></i>
            </div>
            <div class="help-content">
              <h4>嵌套处理</h4>
              <p>自动展平复杂嵌套结构</p>
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
  name: 'JsonToCsv',
  setup() {
    const jsonText = ref('')
    const csvResult = ref('')
    const fileName = ref('')
    const delimiter = ref(',')
    const includeHeaders = ref(true)
    const flattenObjects = ref(true)
    const error = ref('')
    const copyText = ref('复制')
    const rowCount = ref(0)
    const isConverting = ref(false)

    const previewData = computed(() => {
      if (!csvResult.value) return []
      const lines = csvResult.value.split('\n').filter(line => line.trim())
      if (lines.length === 0) return []
      
      const startIndex = includeHeaders.value ? 1 : 0
      return lines.slice(startIndex).map(line => {
        return line.split(delimiter.value).map(cell => cell.trim().replace(/"/g, ''))
      })
    })

    const previewHeaders = computed(() => {
      if (!csvResult.value || !includeHeaders.value) return []
      const lines = csvResult.value.split('\n').filter(line => line.trim())
      if (lines.length === 0) return []
      return lines[0].split(delimiter.value).map(header => header.trim().replace(/"/g, ''))
    })

    const loadExample = () => {
      jsonText.value = JSON.stringify([
        {
          "id": 1,
          "姓名": "张三",
          "年龄": 28,
          "城市": "北京",
          "职业": "工程师",
          "技能": ["JavaScript", "Vue.js", "Node.js"],
          "联系方式": {
            "电话": "138-0000-0001",
            "邮箱": "zhangsan@example.com"
          }
        },
        {
          "id": 2,
          "姓名": "李四",
          "年龄": 32,
          "城市": "上海",
          "职业": "设计师",
          "技能": ["Photoshop", "Figma", "Sketch"],
          "联系方式": {
            "电话": "138-0000-0002",
            "邮箱": "lisi@example.com"
          }
        },
        {
          "id": 3,
          "姓名": "王五",
          "年龄": 25,
          "城市": "广州",
          "职业": "产品经理",
          "技能": ["需求分析", "原型设计", "数据分析"],
          "联系方式": {
            "电话": "138-0000-0003",
            "邮箱": "wangwu@example.com"
          }
        }
      ], null, 2)
      delimiter.value = ','
      includeHeaders.value = true
      flattenObjects.value = true
      error.value = ''
      csvResult.value = ''
      rowCount.value = 0
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        fileName.value = file.name
        const reader = new FileReader()
        reader.onload = (e) => {
          jsonText.value = e.target.result
        }
        reader.readAsText(file)
      }
    }

    const flattenObject = (obj, prefix = '') => {
      const flattened = {}
      Object.keys(obj).forEach(key => {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (obj[key] === null || obj[key] === undefined) {
          flattened[newKey] = ''
        } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          if (flattenObjects.value) {
            Object.assign(flattened, flattenObject(obj[key], newKey))
          } else {
            flattened[newKey] = JSON.stringify(obj[key])
          }
        } else if (Array.isArray(obj[key])) {
          flattened[newKey] = obj[key].join(';')
        } else {
          flattened[newKey] = obj[key].toString()
        }
      })
      return flattened
    }

    const escapeCsvValue = (value) => {
      const str = value.toString()
      if (str.includes(delimiter.value) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const convertToCsv = () => {
      try {
        isConverting.value = true
        error.value = ''
        
        setTimeout(() => {
          try {
            const parsed = JSON.parse(jsonText.value)
            
            let data = Array.isArray(parsed) ? parsed : [parsed]
            
            if (data.length === 0) {
              csvResult.value = ''
              rowCount.value = 0
              return
            }

            // 展开对象
            const flattenedData = data.map(item => flattenObject(item))
            
            // 获取所有列名
            const allKeys = new Set()
            flattenedData.forEach(item => {
              Object.keys(item).forEach(key => allKeys.add(key))
            })
            const headers = Array.from(allKeys)

            // 构建CSV
            const rows = []
            
            if (includeHeaders.value) {
              rows.push(headers.map(header => escapeCsvValue(header)).join(delimiter.value))
            }

            flattenedData.forEach(item => {
              const row = headers.map(header => {
                const value = item[header] || ''
                return escapeCsvValue(value)
              })
              rows.push(row.join(delimiter.value))
            })

            csvResult.value = rows.join('\n')
            rowCount.value = includeHeaders.value ? rows.length - 1 : rows.length
            
          } catch (err) {
            error.value = '转换失败: 请检查JSON格式是否正确'
            csvResult.value = ''
            rowCount.value = 0
          } finally {
            isConverting.value = false
          }
        }, 300)
      } catch (err) {
        error.value = '转换失败: ' + err.message
        csvResult.value = ''
        rowCount.value = 0
        isConverting.value = false
      }
    }

    const copyCsv = () => {
      navigator.clipboard.writeText(csvResult.value).then(() => {
        copyText.value = '已复制!'
        setTimeout(() => copyText.value = '复制', 2000)
      })
    }

    const downloadCsv = () => {
      const blob = new Blob([csvResult.value], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const clearAll = () => {
      jsonText.value = ''
      csvResult.value = ''
      fileName.value = ''
      error.value = ''
      copyText.value = '复制'
      rowCount.value = 0
    }

    return {
      jsonText,
      csvResult,
      fileName,
      delimiter,
      includeHeaders,
      flattenObjects,
      error,
      copyText,
      rowCount,
      isConverting,
      previewData,
      previewHeaders,
      loadExample,
      handleFileUpload,
      convertToCsv,
      copyCsv,
      downloadCsv,
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(240, 147, 251, 0.3);
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
  border-color: #f093fb;
  box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
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
  background: #f093fb;
  border-color: #f093fb;
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  box-shadow: 0 8px 20px rgba(240, 147, 251, 0.3);
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
  border-color: #f093fb;
  box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(240, 147, 251, 0.4);
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
  border-color: #f093fb;
  color: #f093fb;
}

.action-btn.success {
  border-color: #10b981;
  color: #10b981;
  background: #f0fdf4;
}

.csv-output {
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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