<template>
  <div class="tool-card">
    <!-- 渐变色头部 -->
    <div class="tool-header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
      <div class="tool-icon">
        <i class="fas fa-fill-drip"></i>
      </div>
      <div class="tool-title">
        <h2>SQL 参数填充工具</h2>
        <p>将参数化SQL语句填充为完整的可执行SQL</p>
      </div>
    </div>

    <!-- 示例按钮 -->
    <div class="example-section">
      <button @click="loadExample" class="example-btn">
        <i class="fas fa-magic"></i> 加载示例数据
      </button>
    </div>

    <!-- SQL模板输入 -->
    <div class="form-group">
      <label for="sql-template">
        <i class="fas fa-code"></i> SQL 模板
      </label>
      <textarea 
        id="sql-template"
        v-model="sqlTemplate" 
        placeholder="支持多种参数格式：&#10;1. ? 占位符：SELECT * FROM users WHERE id = ? AND name = ?&#10;2. 命名参数：SELECT * FROM users WHERE id = :id AND name = :name&#10;3. $1,$2参数：SELECT * FROM users WHERE id = $1 AND name = $2&#10;4. %s格式：SELECT * FROM users WHERE id = %s AND name = '%s'"
        rows="6"
      ></textarea>
    </div>

    <!-- 参数格式选择 -->
    <div class="options-grid">
      <div class="form-group">
        <label>参数格式</label>
        <select v-model="parameterFormat">
          <option value="question">? 占位符</option>
          <option value="named">命名参数 (:param)</option>
          <option value="numbered">编号参数 ($1, $2)</option>
          <option value="printf">Printf格式 (%s, %d)</option>
        </select>
      </div>

      <div class="form-group">
        <label>数据库类型</label>
        <select v-model="databaseType">
          <option value="mysql">MySQL</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="sqlite">SQLite</option>
          <option value="sqlserver">SQL Server</option>
          <option value="oracle">Oracle</option>
        </select>
      </div>

      <div class="form-group">
        <label>输出格式</label>
        <select v-model="outputFormat">
          <option value="formatted">格式化</option>
          <option value="compact">紧凑</option>
          <option value="pretty">美化</option>
        </select>
      </div>
    </div>

    <!-- 参数输入 -->
    <div class="form-group">
      <label for="parameters">
        <i class="fas fa-list"></i> 参数值
      </label>
      <div class="parameter-input-method">
        <label>
          <input type="radio" v-model="inputMethod" value="json">
          JSON格式
        </label>
        <label>
          <input type="radio" v-model="inputMethod" value="lines">
          逐行输入
        </label>
        <label>
          <input type="radio" v-model="inputMethod" value="csv">
          CSV格式
        </label>
      </div>

      <textarea 
        id="parameters"
        v-model="parameters" 
        :placeholder="getParameterPlaceholder()"
        rows="8"
      ></textarea>
    </div>

    <!-- 高级选项 -->
    <div class="checkbox-group">
      <label>
        <input type="checkbox" v-model="autoQuote">
        <span>自动添加引号</span>
      </label>
      <label>
        <input type="checkbox" v-model="escapeStrings">
        <span>转义字符串</span>
      </label>
      <label>
        <input type="checkbox" v-model="formatOutput">
        <span>格式化输出</span>
      </label>
      <label>
        <input type="checkbox" v-model="includeComments">
        <span>包含注释</span>
      </label>
    </div>

    <!-- 结果显示 -->
    <div v-if="filledSql" class="result-display">
      <h3><i class="fas fa-database"></i> 填充后的SQL</h3>
      <div class="result-code">{{ filledSql }}</div>
      <div class="result-actions">
        <button @click="copyToClipboard(filledSql)" class="copy-btn">
          <i class="fas fa-copy"></i> 复制SQL
        </button>
        <button @click="downloadSql" class="download-btn">
          <i class="fas fa-download"></i> 下载文件
        </button>
        <button @click="validateSql" class="validate-btn">
          <i class="fas fa-check"></i> 验证语法
        </button>
      </div>
    </div>

    <!-- 批量结果 -->
    <div v-if="batchResults.length > 0" class="batch-results">
      <h3><i class="fas fa-layer-group"></i> 批量结果 ({{ batchResults.length }} 条)</h3>
      <div class="batch-list">
        <div v-for="(result, index) in batchResults" :key="index" class="batch-item">
          <div class="batch-header">
            <span class="batch-number">#{{ index + 1 }}</span>
            <button @click="copyToClipboard(result)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="batch-sql">{{ result }}</div>
        </div>
      </div>
    </div>

    <!-- 参数信息 -->
    <div v-if="parameterInfo.total > 0" class="parameter-info">
      <h3><i class="fas fa-info-circle"></i> 参数信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">总参数</span>
          <span class="info-value">{{ parameterInfo.total }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">已填充</span>
          <span class="info-value">{{ parameterInfo.filled }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">缺失</span>
          <span class="info-value">{{ parameterInfo.missing }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">类型</span>
          <span class="info-value">{{ parameterFormat }}</span>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="help-section">
      <h3><i class="fas fa-question-circle"></i> 使用说明</h3>
      <ul>
        <li><strong>参数格式：</strong>支持多种参数化SQL格式，包括?占位符、命名参数等</li>
        <li><strong>JSON格式：</strong>["value1", "value2"] 或 {"param1": "value1"}</li>
        <li><strong>逐行输入：</strong>每行一个参数值，支持多数据类型</li>
        <li><strong>CSV格式：</strong>支持批量处理，每行一组参数</li>
        <li><strong>自动引号：</strong>根据数据类型自动添加SQL引号</li>
        <li><strong>转义处理：</strong>自动转义SQL特殊字符，防止注入攻击</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'SqlParameterFiller',
  setup() {
    const instance = getCurrentInstance()
    // 响应式数据
    const sqlTemplate = ref('')
    const parameters = ref('')
    const parameterFormat = ref('question')
    const inputMethod = ref('json')
    const databaseType = ref('mysql')
    const outputFormat = ref('formatted')
    const autoQuote = ref(true)
    const escapeStrings = ref(true)
    const formatOutput = ref(true)
    const includeComments = ref(false)

    // 批量结果
    const batchResults = ref([])

    // 参数信息
    const parameterInfo = ref({
      total: 0,
      filled: 0,
      missing: 0
    })

    // 获取参数占位符提示
    const getParameterPlaceholder = () => {
      switch (inputMethod.value) {
        case 'json':
          return parameterFormat.value === 'named' 
            ? '{"id": 123, "name": "张三", "email": "test@example.com"}'
            : '[123, "张三", "test@example.com"]'
        case 'lines':
          return '123\n张三\ntest@example.com'
        case 'csv':
          return '123,张三,test@example.com\n456,李四,test2@example.com'
        default:
          return ''
      }
    }

    // 解析参数
    const parseParameters = () => {
      if (!parameters.value.trim()) return []

      try {
        switch (inputMethod.value) {
          case 'json':
            return JSON.parse(parameters.value)
          case 'lines':
            return parameters.value.trim().split('\n').map(line => line.trim())
          case 'csv':
            return parameters.value.trim().split('\n').map(line => 
              line.split(',').map(cell => cell.trim())
            )
          default:
            return []
        }
      } catch (e) {
        console.error('参数解析失败:', e)
        return []
      }
    }

    // 转义SQL字符串
    const escapeSqlString = (value) => {
      if (!escapeStrings.value) return value
      
      return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "''")
        .replace(/"/g, '""')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
    }

    // 格式化值
    const formatValue = (value) => {
      if (value === null || value === undefined) {
        return 'NULL'
      }

      if (typeof value === 'number') {
        return String(value)
      }

      if (typeof value === 'boolean') {
        return databaseType.value === 'mysql' ? (value ? '1' : '0') : 
               databaseType.value === 'postgresql' ? (value ? 'TRUE' : 'FALSE') :
               String(value)
      }

      if (autoQuote.value) {
        const escaped = escapeSqlString(value)
        return `'${escaped}'`
      }

      return escapeSqlString(value)
    }

    // 填充SQL参数
    const fillSqlParameters = (template, params) => {
      let result = template

      switch (parameterFormat.value) {
        case 'question':
          // ? 占位符
          let paramIndex = 0
          result = result.replace(/\?/g, () => {
            if (paramIndex < params.length) {
              return formatValue(params[paramIndex++])
            }
            return '?'
          })
          break

        case 'named':
          // 命名参数 :param
          if (typeof params === 'object' && !Array.isArray(params)) {
            Object.keys(params).forEach(key => {
              const regex = new RegExp(`:${key}\\b`, 'g')
              result = result.replace(regex, formatValue(params[key]))
            })
          }
          break

        case 'numbered':
          // 编号参数 $1, $2
          if (Array.isArray(params)) {
            params.forEach((param, index) => {
              const regex = new RegExp(`\\$${index + 1}\\b`, 'g')
              result = result.replace(regex, formatValue(param))
            })
          }
          break

        case 'printf':
          // Printf格式 %s, %d
          if (Array.isArray(params)) {
            let paramIndex = 0
            result = result.replace(/%[sd]/g, (match) => {
              if (paramIndex < params.length) {
                return formatValue(params[paramIndex++])
              }
              return match
            })
          }
          break
      }

      return result
    }

    // 格式化SQL
    const formatSql = (sql) => {
      if (!formatOutput.value) return sql

      // 简单的SQL格式化
      return sql
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s*=\s*/g, ' = ')
        .replace(/\bSELECT\b/gi, 'SELECT')
        .replace(/\bFROM\b/gi, '\nFROM')
        .replace(/\bWHERE\b/gi, '\nWHERE')
        .replace(/\bAND\b/gi, '\n  AND')
        .replace(/\bOR\b/gi, '\n  OR')
        .replace(/\bORDER BY\b/gi, '\nORDER BY')
        .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
        .replace(/\bHAVING\b/gi, '\nHAVING')
        .trim()
    }

    // 填充后的SQL
    const filledSql = computed(() => {
      if (!sqlTemplate.value.trim()) return ''

      const params = parseParameters()
      if (params.length === 0 && inputMethod.value !== 'csv') return ''

      // 更新参数信息
      const templateParams = (sqlTemplate.value.match(/\?|:\w+|\$\d+|%[sd]/g) || []).length
      parameterInfo.value = {
        total: templateParams,
        filled: Array.isArray(params) ? params.length : Object.keys(params).length,
        missing: Math.max(0, templateParams - (Array.isArray(params) ? params.length : Object.keys(params).length))
      }

      if (inputMethod.value === 'csv' && Array.isArray(params) && params.length > 0 && Array.isArray(params[0])) {
        // 批量处理CSV
        batchResults.value = params.map(paramSet => {
          const filled = fillSqlParameters(sqlTemplate.value, paramSet)
          return formatSql(filled)
        })
        return batchResults.value[0] || ''
      } else {
        batchResults.value = []
        const filled = fillSqlParameters(sqlTemplate.value, params)
        return formatSql(filled)
      }
    })

    // 监听变化
    watch([sqlTemplate, parameters, parameterFormat, inputMethod, autoQuote, escapeStrings, formatOutput], () => {
      // 触发重新计算
    })

    // 加载示例数据
    const loadExample = () => {
      sqlTemplate.value = `SELECT u.id, u.name, u.email, p.title
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.status = ? 
  AND u.created_at >= ?
  AND u.department IN (?, ?)
ORDER BY u.created_at DESC
LIMIT ?`

      parameters.value = `[
  "active",
  "2024-01-01",
  "技术部",
  "产品部", 
  10
]`
      parameterFormat.value = 'question'
      inputMethod.value = 'json'
    }

    // 复制到剪贴板
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        instance.proxy.$message.success('已复制到剪贴板！')
      } catch (err) {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        instance.proxy.$message.success('已复制到剪贴板！')
      }
    }

    // 下载SQL文件
    const downloadSql = () => {
      if (!filledSql.value) return

      const content = batchResults.value.length > 0 
        ? batchResults.value.join(';\n\n') + ';'
        : filledSql.value + ';'

      const blob = new Blob([content], { type: 'text/sql' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `filled_sql_${Date.now()}.sql`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    // 验证SQL语法
    const validateSql = () => {
      if (!filledSql.value) return

      // 简单的SQL语法检查
      const sql = filledSql.value.toLowerCase()
      const hasSelect = sql.includes('select')
      const hasFrom = sql.includes('from')
      const hasBasicStructure = hasSelect && hasFrom

      if (hasBasicStructure) {
        instance.proxy.$message.success('✅ SQL语法看起来正确！\n请在实际数据库中测试确认。')
      } else {
        instance.proxy.$message.success('⚠️ SQL语法可能有问题，请检查：\n- 是否包含必要的关键字\n- 参数是否正确填充\n- 引号和括号是否匹配')
      }
    }

    return {
      sqlTemplate,
      parameters,
      parameterFormat,
      inputMethod,
      databaseType,
      outputFormat,
      autoQuote,
      escapeStrings,
      formatOutput,
      includeComments,
      filledSql,
      batchResults,
      parameterInfo,
      getParameterPlaceholder,
      loadExample,
      copyToClipboard,
      downloadSql,
      validateSql
    }
  }
}
</script>

<style scoped>
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.parameter-input-method {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.parameter-input-method label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.result-code {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.4;
}

.result-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.copy-btn, .download-btn, .validate-btn {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.validate-btn {
  background: linear-gradient(45deg, #007bff, #6610f2);
}

.copy-btn:hover, .download-btn:hover, .validate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
}

.batch-results {
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-radius: 12px;
  padding: 1.5rem;
}

.batch-list {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 1rem;
}

.batch-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e9ecef;
}

.batch-number {
  font-weight: 600;
  color: #495057;
}

.mini-copy-btn {
  background: linear-gradient(45deg, #6c757d, #495057);
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.batch-sql {
  padding: 10px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  line-height: 1.4;
  font-size: 0.9rem;
}

.parameter-info {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  text-align: center;
  padding: 0.8rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.2rem;
}

.info-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #495057;
}

.help-section {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.help-section ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.help-section li {
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
}

.help-section li::before {
  content: '•';
  color: #4caf50;
  font-weight: bold;
  position: absolute;
  left: 0;
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .parameter-input-method {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 工具头部样式 */
.tool-header {
  padding: 10px;
  margin-bottom: 10px;
}
</style> 