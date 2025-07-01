<template>
  <div class="unix-timestamp-tool">
    <h2>Unix 时间戳转换</h2>
    <p>时间戳与日期时间的相互转换工具</p>

    <!-- 当前时间戳 -->
    <div class="current-time-section">
      <h3>当前时间戳</h3>
      <div class="current-time-display">
        <div class="timestamp-group">
          <label>Unix 时间戳（秒）</label>
          <div class="timestamp-value" @click="copyToClipboard(currentTimestamp.toString())">
            {{ currentTimestamp }}
            <i class="fas fa-copy"></i>
          </div>
        </div>
        <div class="timestamp-group">
          <label>Unix 时间戳（毫秒）</label>
          <div class="timestamp-value" @click="copyToClipboard(currentTimestampMs.toString())">
            {{ currentTimestampMs }}
            <i class="fas fa-copy"></i>
          </div>
        </div>
        <div class="timestamp-group">
          <label>当前时间</label>
          <div class="datetime-value">
            {{ currentDateTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- 时间戳转日期 -->
    <div class="conversion-section">
      <h3>时间戳转日期</h3>
      <div class="form-group">
        <label>输入时间戳</label>
        <div class="input-with-buttons">
          <input 
            type="text" 
            v-model="inputTimestamp" 
            placeholder="输入Unix时间戳（支持秒或毫秒）"
            @input="convertTimestampToDate"
          >
          <button @click="useCurrentTimestamp" class="secondary-btn">
            <i class="fas fa-clock"></i> 当前
          </button>
        </div>
        <div class="timestamp-detection" v-if="inputTimestamp">
          <span :class="['detection-tag', timestampType]">
            {{ timestampType === 'seconds' ? '秒级时间戳' : '毫秒级时间戳' }}
          </span>
        </div>
      </div>

      <div class="results-grid" v-if="convertedDate">
        <div class="result-item">
          <label>本地时间</label>
          <div class="result-value">{{ convertedDate.local }}</div>
        </div>
        <div class="result-item">
          <label>UTC时间</label>
          <div class="result-value">{{ convertedDate.utc }}</div>
        </div>
        <div class="result-item">
          <label>ISO 8601</label>
          <div class="result-value">{{ convertedDate.iso }}</div>
        </div>
        <div class="result-item">
          <label>相对时间</label>
          <div class="result-value">{{ convertedDate.relative }}</div>
        </div>
      </div>
    </div>

    <!-- 日期转时间戳 -->
    <div class="conversion-section">
      <h3>日期转时间戳</h3>
      <div class="date-input-grid">
        <div class="form-group">
          <label>选择日期</label>
          <input 
            type="date" 
            v-model="inputDate"
            @change="convertDateToTimestamp"
          >
        </div>
        <div class="form-group">
          <label>选择时间</label>
          <input 
            type="time" 
            v-model="inputTime"
            step="1"
            @change="convertDateToTimestamp"
          >
        </div>
      </div>

      <div class="quick-actions">
        <button @click="setToNow" class="secondary-btn">
          <i class="fas fa-clock"></i> 设为现在
        </button>
        <button @click="setToStartOfDay" class="secondary-btn">
          <i class="fas fa-sunrise"></i> 今日0点
        </button>
        <button @click="setToEndOfDay" class="secondary-btn">
          <i class="fas fa-sunset"></i> 今日24点
        </button>
      </div>

      <div class="results-grid" v-if="convertedTimestamp">
        <div class="result-item">
          <label>Unix时间戳（秒）</label>
          <div class="result-value copyable" @click="copyToClipboard(convertedTimestamp.seconds.toString())">
            {{ convertedTimestamp.seconds }}
            <i class="fas fa-copy"></i>
          </div>
        </div>
        <div class="result-item">
          <label>Unix时间戳（毫秒）</label>
          <div class="result-value copyable" @click="copyToClipboard(convertedTimestamp.milliseconds.toString())">
            {{ convertedTimestamp.milliseconds }}
            <i class="fas fa-copy"></i>
          </div>
        </div>
        <div class="result-item">
          <label>选择的时间</label>
          <div class="result-value">{{ convertedTimestamp.formatted }}</div>
        </div>
      </div>
    </div>

    <!-- 常用时间戳 -->
    <div class="presets-section">
      <h3>常用时间戳</h3>
      <div class="presets-grid">
        <div 
          v-for="preset in timePresets" 
          :key="preset.name"
          class="preset-item"
          @click="usePreset(preset)"
        >
          <div class="preset-name">{{ preset.name }}</div>
          <div class="preset-timestamp">{{ preset.timestamp }}</div>
          <div class="preset-date">{{ preset.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UnixTimestamp',
  data() {
    return {
      currentTimestamp: 0,
      currentTimestampMs: 0,
      currentDateTime: '',
      inputTimestamp: '',
      timestampType: 'seconds',
      convertedDate: null,
      inputDate: '',
      inputTime: '',
      convertedTimestamp: null,
      updateInterval: null
    }
  },
  computed: {
    timePresets() {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      return [
        {
          name: '今日0点',
          timestamp: Math.floor(today.getTime() / 1000),
          date: today.toLocaleDateString()
        },
        {
          name: '昨日0点',
          timestamp: Math.floor(yesterday.getTime() / 1000),
          date: yesterday.toLocaleDateString()
        },
        {
          name: '明日0点',
          timestamp: Math.floor(tomorrow.getTime() / 1000),
          date: tomorrow.toLocaleDateString()
        },
        {
          name: '一周前',
          timestamp: Math.floor(weekAgo.getTime() / 1000),
          date: weekAgo.toLocaleDateString()
        },
        {
          name: '一月前',
          timestamp: Math.floor(monthAgo.getTime() / 1000),
          date: monthAgo.toLocaleDateString()
        },
        {
          name: 'Unix 元年',
          timestamp: 0,
          date: '1970-01-01'
        }
      ]
    }
  },
  mounted() {
    this.updateCurrentTime()
    this.updateInterval = setInterval(this.updateCurrentTime, 1000)
    this.setToNow()
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  },
  methods: {
    updateCurrentTime() {
      const now = new Date()
      this.currentTimestamp = Math.floor(now.getTime() / 1000)
      this.currentTimestampMs = now.getTime()
      this.currentDateTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })
    },

    convertTimestampToDate() {
      if (!this.inputTimestamp) {
        this.convertedDate = null
        return
      }

      let timestamp = parseInt(this.inputTimestamp)
      if (isNaN(timestamp)) {
        this.convertedDate = null
        return
      }

      // 检测时间戳类型（秒或毫秒）
      this.timestampType = timestamp.toString().length > 10 ? 'milliseconds' : 'seconds'
      
      // 转换为毫秒
      const ms = this.timestampType === 'seconds' ? timestamp * 1000 : timestamp
      const date = new Date(ms)

      if (isNaN(date.getTime())) {
        this.convertedDate = null
        return
      }

      this.convertedDate = {
        local: date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        utc: date.toUTCString(),
        iso: date.toISOString(),
        relative: this.getRelativeTime(date)
      }
    },

    convertDateToTimestamp() {
      if (!this.inputDate || !this.inputTime) return

      const datetime = new Date(`${this.inputDate}T${this.inputTime}`)
      if (isNaN(datetime.getTime())) return

      this.convertedTimestamp = {
        seconds: Math.floor(datetime.getTime() / 1000),
        milliseconds: datetime.getTime(),
        formatted: datetime.toLocaleString('zh-CN')
      }
    },

    useCurrentTimestamp() {
      this.inputTimestamp = this.currentTimestamp.toString()
      this.convertTimestampToDate()
    },

    setToNow() {
      const now = new Date()
      this.inputDate = now.toISOString().split('T')[0]
      this.inputTime = now.toTimeString().split(' ')[0]
      this.convertDateToTimestamp()
    },

    setToStartOfDay() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      this.inputDate = today.toISOString().split('T')[0]
      this.inputTime = '00:00:00'
      this.convertDateToTimestamp()
    },

    setToEndOfDay() {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      this.inputDate = today.toISOString().split('T')[0]
      this.inputTime = '23:59:59'
      this.convertDateToTimestamp()
    },

    usePreset(preset) {
      this.inputTimestamp = preset.timestamp.toString()
      this.convertTimestampToDate()
    },

    getRelativeTime(date) {
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const diffSeconds = Math.floor(diff / 1000)
      const diffMinutes = Math.floor(diffSeconds / 60)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (Math.abs(diffSeconds) < 60) {
        return diffSeconds >= 0 ? `${diffSeconds}秒前` : `${Math.abs(diffSeconds)}秒后`
      } else if (Math.abs(diffMinutes) < 60) {
        return diffMinutes >= 0 ? `${diffMinutes}分钟前` : `${Math.abs(diffMinutes)}分钟后`
      } else if (Math.abs(diffHours) < 24) {
        return diffHours >= 0 ? `${diffHours}小时前` : `${Math.abs(diffHours)}小时后`
      } else {
        return diffDays >= 0 ? `${diffDays}天前` : `${Math.abs(diffDays)}天后`
      }
    },

    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        // 可以添加复制成功提示
      } catch (err) {
        console.error('复制失败:', err)
      }
    }
  }
}
</script>

<style scoped>
.unix-timestamp-tool {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.current-time-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
}

.current-time-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.timestamp-group {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.timestamp-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.timestamp-value {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.timestamp-value:hover {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 5px;
}

.datetime-value {
  font-size: 1.1rem;
  font-weight: 500;
}

.conversion-section {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.input-with-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.input-with-buttons input {
  flex: 1;
}

.secondary-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.secondary-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.timestamp-detection {
  margin-top: 0.5rem;
}

.detection-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.detection-tag.seconds {
  background: #e3f2fd;
  color: #1976d2;
}

.detection-tag.milliseconds {
  background: #f3e5f5;
  color: #7b1fa2;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.result-item {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.result-item label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.result-value {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  word-break: break-all;
}

.result-value.copyable {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.result-value.copyable:hover {
  background: var(--accent-color-light);
  padding: 0.5rem;
  border-radius: 5px;
  color: var(--accent-color);
}

.date-input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.presets-section {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.preset-item {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.preset-item:hover {
  background: var(--accent-color-light);
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.preset-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.preset-timestamp {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--accent-color);
  margin-bottom: 0.25rem;
}

.preset-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .unix-timestamp-tool {
    padding: 1rem;
  }
  
  .current-time-display {
    grid-template-columns: 1fr;
  }
  
  .date-input-grid {
    grid-template-columns: 1fr;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    justify-content: center;
  }
}
</style> 