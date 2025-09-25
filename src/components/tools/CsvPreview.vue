<template>
  <div class="csv-preview-tool">
    <!-- 工具头部 -->
    <div class="tool-header">
      <div class="header-gradient csv-gradient">
        <div class="header-content">
          <div class="tool-info">
            <h1><i class="fas fa-table"></i> CSV Viewer</h1>
            <p>CSV文件预览与分析工具</p>
          </div>
        </div>
      </div>
    </div>

    <div class="tool-content">
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="section-header">
          <h3><i class="fas fa-upload"></i> 数据输入</h3>
        </div>
        
        <!-- 文件上传 -->
        <div class="upload-area" 
             @drop="handleFileDrop" 
             @dragover.prevent 
             @dragenter.prevent>
          <input type="file" 
                 ref="fileInput" 
                 @change="handleFileSelect" 
                 accept=".csv,.txt" 
                 style="display: none;">
          <div class="upload-content" @click="$refs.fileInput.click()">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>点击选择文件或拖拽CSV文件到此处</p>
            <small>支持 .csv 和 .txt 格式</small>
          </div>
        </div>

        <!-- CSV设置 -->
        <div class="csv-settings">
          <div class="setting-row">
            <label>分隔符:</label>
            <select v-model="delimiter" @change="parseCSV">
              <option value=",">逗号 (,)</option>
              <option value=";">分号 (;)</option>
              <option value="\t">制表符 (\t)</option>
              <option value="|">竖线 (|)</option>
            </select>
          </div>
          <div class="setting-row">
            <label>编码:</label>
            <select v-model="encoding">
              <option value="UTF-8">UTF-8</option>
              <option value="GBK">GBK</option>
              <option value="ISO-8859-1">ISO-8859-1</option>
            </select>
          </div>
          <div class="setting-row">
            <label>
              <input type="checkbox" v-model="hasHeader" @change="parseCSV">
              首行为标题
            </label>
          </div>
        </div>

        <!-- 文本输入 -->
        <div class="input-group">
          <label>或直接输入CSV数据:</label>
          <textarea v-model="csvInput" 
                    @input="parseCSV"
                    placeholder="姓名,年龄,城市&#10;张三,25,北京&#10;李四,30,上海"
                    rows="8"></textarea>
        </div>

        <!-- 示例按钮 -->
        <div class="example-buttons">
          <button @click="loadExample('basic')" class="example-btn">
            <i class="fas fa-play"></i> 基础示例
          </button>
          <button @click="loadExample('sales')" class="example-btn">
            <i class="fas fa-chart-line"></i> 销售数据
          </button>
          <button @click="loadExample('employees')" class="example-btn">
            <i class="fas fa-users"></i> 员工信息
          </button>
        </div>
      </div>

      <!-- 表格显示 -->
      <div v-if="parsedData.length > 0" class="preview-section">
        <div class="section-header">
          <h3><i class="fas fa-table"></i> 数据预览</h3>
          <div class="table-info">
            <span class="info-item">
              <i class="fas fa-database"></i> 
              {{ parsedData.length }} 行数据
            </span>
            <span class="info-item">
              <i class="fas fa-columns"></i> 
              {{ headers.length }} 列
            </span>
          </div>
        </div>

        <!-- 搜索和过滤 -->
        <div class="table-controls">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input v-model="searchTerm" 
                   placeholder="搜索数据..."
                   @input="filterData">
          </div>
          <div class="page-controls">
            <button @click="previousPage" :disabled="currentPage === 1">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="(header, index) in headers" 
                    :key="index"
                    @click="sortBy(index)"
                    :class="{ 'sorted': sortColumn === index }">
                  {{ header }}
                  <i v-if="sortColumn === index" 
                     :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                  <i v-else class="fas fa-sort"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in paginatedData" 
                  :key="rowIndex"
                  :class="{ 'even': rowIndex % 2 === 0 }">
                <td v-for="(cell, cellIndex) in row" 
                    :key="cellIndex"
                    :title="cell">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 导出按钮 -->
        <div class="export-section">
          <button @click="exportJSON" class="export-btn">
            <i class="fas fa-download"></i> 导出为JSON
          </button>
          <button @click="exportCSV" class="export-btn">
            <i class="fas fa-file-csv"></i> 导出为CSV
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="fas fa-table"></i>
        <h3>没有数据</h3>
        <p>请上传CSV文件或输入数据</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'CsvPreview',
  setup() {
    const csvInput = ref('')
    const parsedData = ref([])
    const headers = ref([])
    const delimiter = ref(',')
    const encoding = ref('UTF-8')
    const hasHeader = ref(true)
    const searchTerm = ref('')
    const filteredData = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const sortColumn = ref(-1)
    const sortDirection = ref('asc')

    // 解析CSV
    const parseCSV = () => {
      if (!csvInput.value.trim()) {
        parsedData.value = []
        headers.value = []
        return
      }

      const lines = csvInput.value.trim().split('\n')
      const data = []

      lines.forEach((line, index) => {
        if (line.trim()) {
          const row = parseCSVLine(line, delimiter.value)
          if (hasHeader.value && index === 0) {
            headers.value = row
          } else {
            data.push(row)
          }
        }
      })

      if (!hasHeader.value) {
        headers.value = Array.from({ length: data[0]?.length || 0 }, (_, i) => `列${i + 1}`)
      }

      parsedData.value = data
      filterData()
      currentPage.value = 1
    }

    // 解析CSV行
    const parseCSVLine = (line, delimiter) => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      result.push(current.trim())
      return result
    }

    // 文件上传处理
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        readFile(file)
      }
    }

    const handleFileDrop = (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        readFile(file)
      }
    }

    const readFile = (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        csvInput.value = e.target.result
        parseCSV()
      }
      reader.readAsText(file, encoding.value)
    }

    // 示例数据
    const loadExample = (type) => {
      const examples = {
        basic: `姓名,年龄,城市
张三,25,北京
李四,30,上海
王五,28,广州
赵六,35,深圳`,
        sales: `产品,销量,单价,总额
iPhone,100,5999,599900
MacBook,50,12999,649950
iPad,80,3999,319920
AirPods,200,1299,259800`,
        employees: `员工ID,姓名,部门,薪资,入职日期
E001,张三,技术部,15000,2023-01-15
E002,李四,销售部,12000,2023-02-20
E003,王五,市场部,13000,2023-03-10
E004,赵六,人事部,11000,2023-04-05`
      }
      
      csvInput.value = examples[type] || examples.basic
      parseCSV()
    }

    // 搜索过滤
    const filterData = () => {
      if (!searchTerm.value.trim()) {
        filteredData.value = [...parsedData.value]
      } else {
        const term = searchTerm.value.toLowerCase()
        filteredData.value = parsedData.value.filter(row =>
          row.some(cell => cell.toString().toLowerCase().includes(term))
        )
      }
      currentPage.value = 1
    }

    // 排序
    const sortBy = (columnIndex) => {
      if (sortColumn.value === columnIndex) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortColumn.value = columnIndex
        sortDirection.value = 'asc'
      }

      filteredData.value.sort((a, b) => {
        const aVal = a[columnIndex] || ''
        const bVal = b[columnIndex] || ''
        
        // 尝试数字比较
        const aNum = parseFloat(aVal)
        const bNum = parseFloat(bVal)
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection.value === 'asc' ? aNum - bNum : bNum - aNum
        }
        
        // 字符串比较
        const result = aVal.toString().localeCompare(bVal.toString())
        return sortDirection.value === 'asc' ? result : -result
      })
    }

    // 分页
    const totalPages = computed(() => 
      Math.ceil(filteredData.value.length / pageSize.value)
    )

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredData.value.slice(start, end)
    })

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    // 导出功能
    const exportJSON = () => {
      const jsonData = filteredData.value.map(row => {
        const obj = {}
        headers.value.forEach((header, index) => {
          obj[header] = row[index] || ''
        })
        return obj
      })
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], 
        { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'data.json'
      a.click()
      URL.revokeObjectURL(url)
    }

    const exportCSV = () => {
      let csvContent = headers.value.join(',') + '\n'
      filteredData.value.forEach(row => {
        csvContent += row.map(cell => 
          cell.toString().includes(',') ? `"${cell}"` : cell
        ).join(',') + '\n'
      })
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'exported_data.csv'
      a.click()
      URL.revokeObjectURL(url)
    }

    // 监听搜索
    watch(searchTerm, filterData)

    return {
      csvInput,
      parsedData,
      headers,
      delimiter,
      encoding,
      hasHeader,
      searchTerm,
      filteredData,
      currentPage,
      totalPages,
      paginatedData,
      sortColumn,
      sortDirection,
      parseCSV,
      handleFileSelect,
      handleFileDrop,
      loadExample,
      filterData,
      sortBy,
      previousPage,
      nextPage,
      exportJSON,
      exportCSV
    }
  }
}
</script>

<style scoped>
.csv-preview-tool {
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

.csv-gradient {
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

.table-info {
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

.csv-settings {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 10px;
  background: var(--card-bg);
  border-radius: 8px;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setting-row label {
  font-weight: 500;
  color: var(--text-color);
}


.setting-row input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
  padding: 0.3rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-color);
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

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-color);
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-controls button {
  padding: 0.5rem 0.8rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-controls button:disabled {
  background: var(--border-color);
  cursor: not-allowed;
}

.page-controls button:not(:disabled):hover {
  background: var(--primary-hover);
}

.table-container {
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: var(--primary-color);
  color: white;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.data-table th:hover {
  background: var(--primary-hover);
}

.data-table th.sorted {
  background: var(--primary-hover);
}

.data-table th i {
  margin-left: 0.5rem;
  opacity: 0.7;
}

.data-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-table tr.even td {
  background: var(--hover-bg);
}

.data-table tr:hover td {
  background: var(--primary-light);
}

.export-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.export-btn {
  padding: 0.8rem 1.5rem;
  background: var(--success-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: var(--success-hover);
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 10px;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .csv-settings {
    flex-direction: column;
    gap: 1rem;
  }
  
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .export-section {
    flex-direction: column;
  }
}
</style> 