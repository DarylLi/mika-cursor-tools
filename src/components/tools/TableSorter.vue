<template>
  <div class="tool-container">
    <div class="tool-header">
      <div class="header-icon">📊</div>
      <h2>表格排序 & 筛选</h2>
      <p>对表格数据进行排序、筛选、分页和导出操作</p>
      
      <div class="example-section">
        <span class="example-label">快速开始：</span>
        <button @click="loadExample('employees')" class="example-btn">
          <i class="fas fa-users"></i> 员工数据
        </button>
        <button @click="loadExample('products')" class="example-btn">
          <i class="fas fa-boxes"></i> 产品数据
        </button>
        <button @click="loadExample('sales')" class="example-btn">
          <i class="fas fa-chart-line"></i> 销售数据
        </button>
      </div>
    </div>

    <div class="input-card">
      <div class="card-header">
        <h3><i class="fas fa-table"></i> 数据输入</h3>
        <div class="input-actions">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            accept=".csv,.json,.txt"
            style="display: none"
          />
          <button @click="$refs.fileInput.click()" class="action-btn">
            <i class="fas fa-upload"></i> 上传文件
          </button>
          <button @click="parseData" class="action-btn">
            <i class="fas fa-sync"></i> 重新解析
          </button>
        </div>
      </div>
      
      <div class="input-section">
        <textarea
          v-model="rawData"
          placeholder="输入CSV格式数据或JSON数组数据..."
          class="data-input"
          @input="autoParseData"
        ></textarea>
        
        <div class="parse-options">
          <div class="option-group">
            <label>数据格式:</label>
            <select v-model="dataFormat" @change="parseData" class="format-select">
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="tsv">TSV (制表符分隔)</option>
            </select>
          </div>
          
          <div class="option-group" v-if="dataFormat === 'csv' || dataFormat === 'tsv'">
            <label class="checkbox-label">
              <input type="checkbox" v-model="hasHeaders" @change="parseData" />
              <span class="checkmark"></span>
              首行为标题
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tableData.length > 0" class="table-card">
      <div class="card-header">
        <h3><i class="fas fa-list"></i> 数据表格</h3>
        <div class="table-stats">
          {{ filteredData.length }} / {{ tableData.length }} 行，{{ columns.length }} 列
        </div>
      </div>

      <div class="table-controls">
        <div class="search-section">
          <div class="global-search">
            <i class="fas fa-search"></i>
            <input
              v-model="globalSearch"
              type="text"
              placeholder="全局搜索..."
              class="search-input"
            />
          </div>
        </div>
        
        <div class="filter-section">
          <div class="column-filters">
            <div v-for="column in columns" :key="column" class="filter-item">
              <label>{{ column }}:</label>
              <input
                v-model="columnFilters[column]"
                type="text"
                :placeholder="`筛选${column}...`"
                class="filter-input"
              />
            </div>
          </div>
        </div>

        <div class="pagination-controls">
          <div class="page-size-control">
            <label>每页显示:</label>
            <select v-model="pageSize" class="page-size-select">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="all">全部</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column" @click="sortBy(column)" class="sortable-header">
                <div class="header-content">
                  <span>{{ column }}</span>
                  <div class="sort-indicators">
                    <i 
                      class="fas fa-sort-up"
                      :class="{ active: sortColumn === column && sortDirection === 'asc' }"
                    ></i>
                    <i 
                      class="fas fa-sort-down"
                      :class="{ active: sortColumn === column && sortDirection === 'desc' }"
                    ></i>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in paginatedData" :key="rowIndex" class="data-row">
              <td v-for="column in columns" :key="column" :title="row[column]">
                {{ row[column] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="goToPage(1)" 
          :disabled="currentPage === 1" 
          class="page-btn"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1" 
          class="page-btn"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="page-btn"
            :class="{ active: currentPage === page }"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages" 
          class="page-btn"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button 
          @click="goToPage(totalPages)" 
          :disabled="currentPage === totalPages" 
          class="page-btn"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
        
        <div class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </div>
      </div>

      <div class="export-section">
        <button @click="exportData('csv')" class="export-btn">
          <i class="fas fa-download"></i> 导出CSV
        </button>
        <button @click="exportData('json')" class="export-btn">
          <i class="fas fa-download"></i> 导出JSON
        </button>
        <button @click="exportData('excel')" class="export-btn">
          <i class="fas fa-file-excel"></i> 导出Excel
        </button>
      </div>
    </div>

    <div v-if="error" class="error-card">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>

    <div v-if="success" class="success-card">
      <i class="fas fa-check-circle"></i> {{ success }}
    </div>

    <div class="help-card">
      <h4><i class="fas fa-info-circle"></i> 使用说明</h4>
      <div class="help-content">
        <div class="help-section">
          <h5>支持的功能：</h5>
          <ul>
            <li>多种数据格式解析（CSV、JSON、TSV）</li>
            <li>列头点击排序（升序/降序）</li>
            <li>全局搜索和列筛选</li>
            <li>分页浏览和页面大小调整</li>
            <li>数据导出（CSV、JSON、Excel）</li>
          </ul>
        </div>
        
        <div class="help-section">
          <h5>CSV格式示例：</h5>
          <pre><code>姓名,年龄,部门,薪资
张三,28,技术部,15000
李四,32,销售部,12000
王五,25,人事部,8000</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'

export default {
  name: 'TableSorter',
  setup() {
    const rawData = ref('')
    const dataFormat = ref('csv')
    const hasHeaders = ref(true)
    const tableData = ref([])
    const columns = ref([])
    const sortColumn = ref('')
    const sortDirection = ref('asc')
    const globalSearch = ref('')
    const columnFilters = reactive({})
    const currentPage = ref(1)
    const pageSize = ref(25)
    const error = ref('')
    const success = ref('')
    let parseTimeout = null

    const filteredData = computed(() => {
      let data = tableData.value

      // Global search
      if (globalSearch.value) {
        const searchTerm = globalSearch.value.toLowerCase()
        data = data.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm)
          )
        )
      }

      // Column filters
      Object.keys(columnFilters).forEach(column => {
        const filterValue = columnFilters[column]
        if (filterValue) {
          const filterTerm = filterValue.toLowerCase()
          data = data.filter(row =>
            String(row[column]).toLowerCase().includes(filterTerm)
          )
        }
      })

      return data
    })

    const sortedData = computed(() => {
      if (!sortColumn.value) return filteredData.value

      return [...filteredData.value].sort((a, b) => {
        const aVal = a[sortColumn.value]
        const bVal = b[sortColumn.value]

        // Try to parse as numbers
        const aNum = parseFloat(aVal)
        const bNum = parseFloat(bVal)

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection.value === 'asc' ? aNum - bNum : bNum - aNum
        }

        // Date comparison
        const aDate = new Date(aVal)
        const bDate = new Date(bVal)
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortDirection.value === 'asc' ? aDate - bDate : bDate - aDate
        }

        // String comparison
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortDirection.value === 'asc' ? comparison : -comparison
      })
    })

    const totalPages = computed(() => {
      if (pageSize.value === 'all') return 1
      return Math.ceil(sortedData.value.length / parseInt(pageSize.value))
    })

    const paginatedData = computed(() => {
      if (pageSize.value === 'all') return sortedData.value
      
      const start = (currentPage.value - 1) * parseInt(pageSize.value)
      const end = start + parseInt(pageSize.value)
      return sortedData.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const total = totalPages.value
      const current = currentPage.value
      const delta = 2

      let start = Math.max(1, current - delta)
      let end = Math.min(total, current + delta)

      if (end - start < 4 && total > 5) {
        if (start === 1) {
          end = Math.min(total, start + 4)
        } else {
          start = Math.max(1, end - 4)
        }
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })

    const examples = {
      employees: `姓名,年龄,部门,薪资,入职日期
张三,28,技术部,15000,2022-01-15
李四,32,销售部,12000,2021-06-10
王五,25,人事部,8000,2023-03-20
赵六,35,技术部,18000,2020-11-05
钱七,29,市场部,11000,2022-08-12
孙八,31,财务部,13000,2021-09-18
周九,27,技术部,14000,2023-01-08
吴十,33,销售部,13500,2020-12-22
郑一,26,人事部,9000,2023-05-15
刘二,30,技术部,16000,2021-04-03`,
      products: `产品名称,分类,价格,库存,上架日期
iPhone 14,手机,6999,150,2023-01-10
MacBook Air,笔记本,8999,80,2023-02-15
iPad Pro,平板,5999,120,2023-01-20
AirPods Pro,耳机,1999,200,2023-03-01
Apple Watch,手表,3999,90,2023-02-28
Mac mini,电脑,4999,60,2023-01-25
MacBook Pro,笔记本,12999,45,2023-02-10
iPad Air,平板,4399,110,2023-03-05`,
      sales: `日期,销售员,产品,数量,金额
2023-12-01,张三,iPhone 14,2,13998
2023-12-01,李四,MacBook Air,1,8999
2023-12-02,王五,iPad Pro,3,17997
2023-12-02,张三,AirPods Pro,5,9995
2023-12-03,赵六,Apple Watch,2,7998
2023-12-03,李四,Mac mini,1,4999
2023-12-04,王五,MacBook Pro,1,12999
2023-12-04,张三,iPad Air,2,8798
2023-12-05,钱七,iPhone 14,3,20997
2023-12-05,孙八,AirPods Pro,4,7996`
    }

    const loadExample = (type) => {
      rawData.value = examples[type]
      dataFormat.value = 'csv'
      hasHeaders.value = true
      parseData()
    }

    const autoParseData = () => {
      clearTimeout(parseTimeout)
      parseTimeout = setTimeout(parseData, 500)
    }

    const parseData = () => {
      try {
        error.value = ''
        
        if (!rawData.value.trim()) {
          tableData.value = []
          columns.value = []
          return
        }

        let data = []

        if (dataFormat.value === 'json') {
          const parsed = JSON.parse(rawData.value)
          if (Array.isArray(parsed)) {
            data = parsed
            if (data.length > 0) {
              columns.value = Object.keys(data[0])
            }
          } else {
            throw new Error('JSON数据必须是数组格式')
          }
        } else {
          // CSV or TSV parsing
          const delimiter = dataFormat.value === 'tsv' ? '\t' : ','
          const lines = rawData.value.trim().split('\n')
          
          if (lines.length === 0) {
            throw new Error('数据为空')
          }

          const headers = hasHeaders.value ? 
            parseCSVLine(lines[0], delimiter) : 
            Array.from({ length: parseCSVLine(lines[0], delimiter).length }, (_, i) => `列${i + 1}`)
          
          columns.value = headers
          
          const startIndex = hasHeaders.value ? 1 : 0
          data = lines.slice(startIndex).map(line => {
            const values = parseCSVLine(line, delimiter)
            const row = {}
            headers.forEach((header, index) => {
              row[header] = values[index] || ''
            })
            return row
          })
        }

        tableData.value = data
        
        // Initialize column filters
        columns.value.forEach(column => {
          if (!(column in columnFilters)) {
            columnFilters[column] = ''
          }
        })

        // Reset pagination
        currentPage.value = 1
        sortColumn.value = ''

        success.value = `成功解析 ${data.length} 行数据`
        setTimeout(() => success.value = '', 3000)

      } catch (err) {
        error.value = '数据解析失败: ' + err.message
        tableData.value = []
        columns.value = []
      }
    }

    const parseCSVLine = (line, delimiter) => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"'
            i++ // Skip next quote
          } else {
            inQuotes = !inQuotes
          }
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

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        rawData.value = e.target.result
        
        // Auto-detect format
        if (file.name.endsWith('.json')) {
          dataFormat.value = 'json'
        } else if (file.name.endsWith('.tsv')) {
          dataFormat.value = 'tsv'
        } else {
          dataFormat.value = 'csv'
        }
        
        parseData()
      }
      reader.readAsText(file)
    }

    const sortBy = (column) => {
      if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortColumn.value = column
        sortDirection.value = 'asc'
      }
      currentPage.value = 1
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const exportData = (format) => {
      const dataToExport = filteredData.value

      if (format === 'csv') {
        const csvContent = [
          columns.value.join(','),
          ...dataToExport.map(row => 
            columns.value.map(col => {
              const value = String(row[col] || '')
              return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value
            }).join(',')
          )
        ].join('\n')
        
        downloadFile(csvContent, 'table-data.csv', 'text/csv')
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(dataToExport, null, 2)
        downloadFile(jsonContent, 'table-data.json', 'application/json')
      } else if (format === 'excel') {
        // Basic Excel export (CSV with .xlsx extension)
        const csvContent = [
          columns.value.join('\t'),
          ...dataToExport.map(row => 
            columns.value.map(col => String(row[col] || '')).join('\t')
          )
        ].join('\n')
        
        downloadFile(csvContent, 'table-data.xlsx', 'application/vnd.ms-excel')
      }
    }

    const downloadFile = (content, filename, mimeType) => {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      
      success.value = `${filename} 已下载`
      setTimeout(() => success.value = '', 3000)
    }

    return {
      rawData,
      dataFormat,
      hasHeaders,
      tableData,
      columns,
      sortColumn,
      sortDirection,
      globalSearch,
      columnFilters,
      currentPage,
      pageSize,
      error,
      success,
      filteredData,
      paginatedData,
      totalPages,
      visiblePages,
      loadExample,
      autoParseData,
      parseData,
      handleFileUpload,
      sortBy,
      goToPage,
      exportData
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 10px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.header-icon {
  font-size: 48px;
  margin-bottom: 10px;
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
  margin-top: 10px;
  flex-wrap: wrap;
}

.example-label {
  font-size: 14px;
  opacity: 0.8;
}

.example-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px;
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

.input-card, .table-card, .help-card, .success-card, .error-card {
  background: white;
  border-radius: 16px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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

.input-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.data-input {
  width: 100%;
  min-height: 200px;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.data-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  background: white;
}

.parse-options {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-group label {
  font-weight: 500;
  color: #4a5568;
}

.format-select {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  transform: scale(1.2);
}

.table-stats {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.table-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 10px;
}

.search-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.global-search {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.global-search i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.filter-section {
  background: #f8fafc;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.column-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-item label {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
}

.filter-input {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.filter-input:focus {
  outline: none;
  border-color: #10b981;
}

.pagination-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.page-size-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-control label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.page-size-select {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 10px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.sortable-header {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  cursor: pointer;
  user-select: none;
  border-bottom: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.sortable-header:hover {
  background: #f1f5f9;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.header-content span {
  font-weight: 600;
  color: #374151;
}

.sort-indicators {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sort-indicators i {
  font-size: 10px;
  color: #d1d5db;
  transition: color 0.3s ease;
}

.sort-indicators i.active {
  color: #10b981;
}

.data-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
}

.data-row:hover {
  background: #f8fafc;
}

.data-row td {
  padding: 10px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.page-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
  margin-left: 16px;
}

.export-section {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
  flex-wrap: wrap;
}

.export-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.success-card {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.error-card {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.help-card h4 {
  margin: 0 0 20px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.help-section h5 {
  margin: 0 0 12px 0;
  color: #4a5568;
  font-size: 16px;
  font-weight: 600;
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 10px;
  color: #4a5568;
  line-height: 1.4;
}

.help-section pre {
  margin: 0;
  background: #1f2937;
  color: #f9fafb;
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 10px;
  }
  
  .help-content {
    grid-template-columns: 1fr;
  }
  
  .example-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .table-controls {
    gap: 16px;
  }
  
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .global-search {
    max-width: none;
  }
  
  .column-filters {
    grid-template-columns: 1fr;
  }
  
  .pagination-controls {
    justify-content: center;
  }
  
  .export-section {
    flex-direction: column;
  }
  
  .pagination {
    gap: 4px;
  }
  
  .page-info {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style> 