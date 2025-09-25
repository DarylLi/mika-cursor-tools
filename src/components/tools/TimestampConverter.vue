<template>
  <div class="tool-card">
    <!-- 渐变色头部 -->
    <div class="tool-header" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);">
      <div class="tool-icon">
        <i class="fas fa-clock"></i>
      </div>
      <div class="tool-title">
        <h2>时间戳转换工具</h2>
        <p>Unix时间戳、ISO字符串、本地时间等格式互转</p>
      </div>
    </div>

    <!-- 当前时间显示 -->
    <div class="current-time-section">
      <h3><i class="fas fa-clock"></i> 当前时间</h3>
      <div class="time-display-grid">
        <div class="time-item">
          <span class="time-label">Unix 时间戳 (秒)</span>
          <span class="time-value">{{ currentTime.unix }}</span>
          <button @click="copyToClipboard(currentTime.unix)" class="mini-copy-btn">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div class="time-item">
          <span class="time-label">Unix 时间戳 (毫秒)</span>
          <span class="time-value">{{ currentTime.unixMs }}</span>
          <button @click="copyToClipboard(currentTime.unixMs)" class="mini-copy-btn">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div class="time-item">
          <span class="time-label">ISO 8601 格式</span>
          <span class="time-value">{{ currentTime.iso }}</span>
          <button @click="copyToClipboard(currentTime.iso)" class="mini-copy-btn">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div class="time-item">
          <span class="time-label">本地时间</span>
          <span class="time-value">{{ currentTime.local }}</span>
          <button @click="copyToClipboard(currentTime.local)" class="mini-copy-btn">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 时间戳转换 -->
    <div class="converter-section">
      <h3><i class="fas fa-exchange-alt"></i> 时间戳转换</h3>
      
      <!-- 输入时间戳 -->
      <div class="form-group">
        <label>输入时间戳</label>
        <div class="input-with-buttons">
          <input 
            v-model="inputTimestamp" 
            type="text" 
            placeholder="输入Unix时间戳（秒或毫秒）"
            @input="convertFromTimestamp"
          >
          <button @click="setCurrentTimestamp" class="set-current-btn">
            <i class="fas fa-clock"></i> 当前时间
          </button>
          <button @click="pasteFromClipboard" class="paste-btn">
            <i class="fas fa-paste"></i> 粘贴
          </button>
        </div>
        <div class="timestamp-hints">
          <small>支持10位（秒）或13位（毫秒）时间戳</small>
        </div>
      </div>

      <!-- 转换结果 -->
      <div v-if="timestampResult.valid" class="result-display">
        <h4><i class="fas fa-arrow-right"></i> 转换结果</h4>
        <div class="result-grid">
          <div class="result-item">
            <span class="result-label">Unix 时间戳 (秒)</span>
            <span class="result-value">{{ timestampResult.unix }}</span>
            <button @click="copyToClipboard(timestampResult.unix)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="result-item">
            <span class="result-label">Unix 时间戳 (毫秒)</span>
            <span class="result-value">{{ timestampResult.unixMs }}</span>
            <button @click="copyToClipboard(timestampResult.unixMs)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="result-item">
            <span class="result-label">ISO 8601 (UTC)</span>
            <span class="result-value">{{ timestampResult.isoUtc }}</span>
            <button @click="copyToClipboard(timestampResult.isoUtc)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="result-item">
            <span class="result-label">ISO 8601 (本地)</span>
            <span class="result-value">{{ timestampResult.isoLocal }}</span>
            <button @click="copyToClipboard(timestampResult.isoLocal)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="result-item">
            <span class="result-label">本地时间</span>
            <span class="result-value">{{ timestampResult.local }}</span>
            <button @click="copyToClipboard(timestampResult.local)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="result-item">
            <span class="result-label">UTC 时间</span>
            <span class="result-value">{{ timestampResult.utc }}</span>
            <button @click="copyToClipboard(timestampResult.utc)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 时间字符串转换 -->
    <div class="converter-section">
      <h3><i class="fas fa-calendar-alt"></i> 时间字符串转时间戳</h3>
      
      <!-- 输入时间字符串 -->
      <div class="form-group">
        <label>输入时间字符串</label>
        <input 
          v-model="inputTimeString" 
          type="text" 
          placeholder="如: 2024-01-01 12:00:00 或 2024-01-01T12:00:00Z"
          @input="convertFromString"
        >
        <div class="format-hints">
          <small>支持格式: YYYY-MM-DD HH:mm:ss、ISO 8601等</small>
        </div>
      </div>

      <!-- 时区选择 -->
      <div class="form-group">
        <label>时区</label>
        <select v-model="selectedTimezone" @change="convertFromString">
          <option value="local">本地时区</option>
          <option value="UTC">UTC</option>
          <option value="Asia/Shanghai">Asia/Shanghai (中国)</option>
          <option value="America/New_York">America/New_York (美国东部)</option>
          <option value="America/Los_Angeles">America/Los_Angeles (美国西部)</option>
          <option value="Europe/London">Europe/London (英国)</option>
          <option value="Asia/Tokyo">Asia/Tokyo (日本)</option>
        </select>
      </div>

      <!-- 字符串转换结果 -->
      <div v-if="stringResult.valid" class="result-display">
        <h4><i class="fas fa-arrow-right"></i> 转换结果</h4>
        <div class="result-grid">
          <div class="result-item">
            <span class="result-label">Unix 时间戳 (秒)</span>
            <span class="result-value">{{ stringResult.unix }}</span>
            <button @click="copyToClipboard(stringResult.unix)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="result-item">
            <span class="result-label">Unix 时间戳 (毫秒)</span>
            <span class="result-value">{{ stringResult.unixMs }}</span>
            <button @click="copyToClipboard(stringResult.unixMs)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="result-item">
            <span class="result-label">解析的时间</span>
            <span class="result-value">{{ stringResult.parsed }}</span>
            <button @click="copyToClipboard(stringResult.parsed)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 时间计算 -->
    <div class="calculator-section">
      <h3><i class="fas fa-calculator"></i> 时间计算</h3>
      
      <div class="calc-options">
        <div class="form-group">
          <label>基础时间戳</label>
          <input v-model="calcBase" type="text" placeholder="输入基础时间戳">
        </div>
        
        <div class="calc-operations">
          <button @click="addTime('hour', 1)" class="calc-btn">+1小时</button>
          <button @click="addTime('day', 1)" class="calc-btn">+1天</button>
          <button @click="addTime('week', 1)" class="calc-btn">+1周</button>
          <button @click="addTime('month', 1)" class="calc-btn">+1月</button>
          <button @click="addTime('year', 1)" class="calc-btn">+1年</button>
          <button @click="addTime('hour', -1)" class="calc-btn">-1小时</button>
          <button @click="addTime('day', -1)" class="calc-btn">-1天</button>
          <button @click="addTime('week', -1)" class="calc-btn">-1周</button>
        </div>
        
        <div v-if="calcResult" class="calc-result">
          <span class="calc-result-label">计算结果:</span>
          <span class="calc-result-value">{{ calcResult }}</span>
          <button @click="copyToClipboard(calcResult)" class="mini-copy-btn">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
    </div>

    <!-- 使用说明 -->
    <div class="help-section">
      <h3><i class="fas fa-question-circle"></i> 使用说明</h3>
      <ul>
        <li><strong>Unix时间戳：</strong>从1970年1月1日00:00:00 UTC开始的秒数或毫秒数</li>
        <li><strong>自动识别：</strong>工具会自动识别10位（秒）或13位（毫秒）时间戳</li>
        <li><strong>时区处理：</strong>支持多种时区转换，默认使用本地时区</li>
        <li><strong>格式支持：</strong>支持ISO 8601、标准日期时间格式等多种输入</li>
        <li><strong>时间计算：</strong>支持时间的加减运算，便于时间范围计算</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

export default {
  name: 'TimestampConverter',
  setup() {
    // 响应式数据
    const inputTimestamp = ref('')
    const inputTimeString = ref('')
    const selectedTimezone = ref('local')
    const calcBase = ref('')
    const calcResult = ref('')
    const errorMessage = ref('')
    
    // 当前时间
    const currentTime = reactive({
      unix: 0,
      unixMs: 0,
      iso: '',
      local: ''
    })
    
    // 时间戳转换结果
    const timestampResult = reactive({
      valid: false,
      unix: '',
      unixMs: '',
      isoUtc: '',
      isoLocal: '',
      local: '',
      utc: ''
    })
    
    // 字符串转换结果
    const stringResult = reactive({
      valid: false,
      unix: '',
      unixMs: '',
      parsed: ''
    })

    // 更新当前时间
    const updateCurrentTime = () => {
      const now = new Date()
      currentTime.unix = Math.floor(now.getTime() / 1000)
      currentTime.unixMs = now.getTime()
      currentTime.iso = now.toISOString()
      currentTime.local = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // 定时器
    let timeInterval = null

    // 从时间戳转换
    const convertFromTimestamp = () => {
      errorMessage.value = ''
      
      if (!inputTimestamp.value.trim()) {
        timestampResult.valid = false
        return
      }

      try {
        let timestamp = parseInt(inputTimestamp.value.trim())
        
        if (isNaN(timestamp)) {
          errorMessage.value = '请输入有效的数字时间戳'
          timestampResult.valid = false
          return
        }

        // 判断是秒还是毫秒
        let date
        if (timestamp.toString().length === 10) {
          // 10位，秒时间戳
          date = new Date(timestamp * 1000)
          timestampResult.unix = timestamp.toString()
          timestampResult.unixMs = (timestamp * 1000).toString()
        } else if (timestamp.toString().length === 13) {
          // 13位，毫秒时间戳
          date = new Date(timestamp)
          timestampResult.unix = Math.floor(timestamp / 1000).toString()
          timestampResult.unixMs = timestamp.toString()
        } else {
          errorMessage.value = '时间戳长度应为10位（秒）或13位（毫秒）'
          timestampResult.valid = false
          return
        }

        if (isNaN(date.getTime())) {
          errorMessage.value = '无效的时间戳'
          timestampResult.valid = false
          return
        }

        timestampResult.isoUtc = date.toISOString()
        timestampResult.isoLocal = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, -1)
        timestampResult.local = date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        timestampResult.utc = date.toUTCString()
        timestampResult.valid = true

      } catch (error) {
        errorMessage.value = '时间戳转换失败: ' + error.message
        timestampResult.valid = false
      }
    }

    // 从字符串转换
    const convertFromString = () => {
      errorMessage.value = ''
      
      if (!inputTimeString.value.trim()) {
        stringResult.valid = false
        return
      }

      try {
        let dateStr = inputTimeString.value.trim()
        let date

        // 处理常见格式
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
          // YYYY-MM-DD HH:mm:ss 格式
          if (selectedTimezone.value === 'UTC') {
            date = new Date(dateStr + 'Z')
          } else if (selectedTimezone.value === 'local') {
            date = new Date(dateStr)
          } else {
            // 其他时区
            date = new Date(dateStr + 'Z')
          }
        } else {
          // 其他格式，直接解析
          date = new Date(dateStr)
        }

        if (isNaN(date.getTime())) {
          errorMessage.value = '无法解析的时间格式'
          stringResult.valid = false
          return
        }

        stringResult.unix = Math.floor(date.getTime() / 1000).toString()
        stringResult.unixMs = date.getTime().toString()
        stringResult.parsed = date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        stringResult.valid = true

      } catch (error) {
        errorMessage.value = '时间字符串转换失败: ' + error.message
        stringResult.valid = false
      }
    }

    // 设置当前时间戳
    const setCurrentTimestamp = () => {
      inputTimestamp.value = Math.floor(Date.now() / 1000).toString()
      convertFromTimestamp()
    }

    // 粘贴剪贴板内容
    const pasteFromClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText()
        inputTimestamp.value = text.trim()
        convertFromTimestamp()
      } catch (error) {
        errorMessage.value = '无法读取剪贴板内容'
      }
    }

    // 时间计算
    const addTime = (unit, amount) => {
      if (!calcBase.value.trim()) {
        calcBase.value = Math.floor(Date.now() / 1000).toString()
      }

      try {
        let baseTimestamp = parseInt(calcBase.value)
        if (isNaN(baseTimestamp)) {
          errorMessage.value = '请输入有效的基础时间戳'
          return
        }

        // 判断是秒还是毫秒
        let baseDate
        if (baseTimestamp.toString().length === 10) {
          baseDate = new Date(baseTimestamp * 1000)
        } else if (baseTimestamp.toString().length === 13) {
          baseDate = new Date(baseTimestamp)
        } else {
          errorMessage.value = '基础时间戳长度应为10位（秒）或13位（毫秒）'
          return
        }

        let resultDate = new Date(baseDate)
        
        switch (unit) {
          case 'hour':
            resultDate.setHours(resultDate.getHours() + amount)
            break
          case 'day':
            resultDate.setDate(resultDate.getDate() + amount)
            break
          case 'week':
            resultDate.setDate(resultDate.getDate() + (amount * 7))
            break
          case 'month':
            resultDate.setMonth(resultDate.getMonth() + amount)
            break
          case 'year':
            resultDate.setFullYear(resultDate.getFullYear() + amount)
            break
        }

        if (baseTimestamp.toString().length === 10) {
          calcResult.value = Math.floor(resultDate.getTime() / 1000).toString()
        } else {
          calcResult.value = resultDate.getTime().toString()
        }

      } catch (error) {
        errorMessage.value = '时间计算失败: ' + error.message
      }
    }

    // 复制到剪贴板
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        // 可以添加一个简单的提示
      } catch (err) {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
    }

    // 生命周期
    onMounted(() => {
      updateCurrentTime()
      timeInterval = setInterval(updateCurrentTime, 1000)
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      inputTimestamp,
      inputTimeString,
      selectedTimezone,
      calcBase,
      calcResult,
      errorMessage,
      currentTime,
      timestampResult,
      stringResult,
      convertFromTimestamp,
      convertFromString,
      setCurrentTimestamp,
      pasteFromClipboard,
      addTime,
      copyToClipboard
    }
  }
}
</script>

<style scoped>
.current-time-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.time-display-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.time-item {
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.time-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.3rem;
}

.time-value {
  display: block;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  word-break: break-all;
}

.converter-section, .calculator-section {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.input-with-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.input-with-buttons input {
  flex: 1;
}

.set-current-btn, .paste-btn {
  background: linear-gradient(45deg, #007bff, #6610f2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
}

.timestamp-hints, .format-hints {
  margin-top: 0.5rem;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.result-item {
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.result-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.3rem;
}

.result-value {
  display: block;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  word-break: break-all;
  margin-right: 2rem;
}

.mini-copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(45deg, #6c757d, #495057);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
}

.calc-operations {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}

.calc-btn {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.calc-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(40, 167, 69, 0.3);
}

.calc-result {
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
  margin-top: 1rem;
}

.calc-result-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.3rem;
}

.calc-result-value {
  display: block;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
  margin-right: 2rem;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid #f5c6cb;
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
  .time-display-grid, .result-grid {
    grid-template-columns: 1fr;
  }
  
  .input-with-buttons {
    flex-direction: column;
  }
  
  .calc-operations {
    flex-direction: column;
  }
  
  .calc-btn {
    width: 100%;
  }
}

/* 工具头部样式 */
.tool-header {
  padding: 10px;
  margin-bottom: 10px;
}
</style> 