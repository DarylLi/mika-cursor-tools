<template>
  <div class="timezone-convert-tool">
    <div class="tool-header">
      <h3><i class="fas fa-globe-asia"></i> 时区转换器</h3>
      <p>转换不同时区的时间，查看世界时钟和时差计算</p>
    </div>

    <!-- 主要转换区域 -->
    <div class="main-convert-section">
      <div class="convert-row">
        <div class="time-input-group">
          <label>源时间</label>
          <div class="input-row">
            <input 
              type="datetime-local" 
              v-model="sourceDateTime" 
              class="datetime-input"
            >
            <select v-model="sourceTimezone" class="timezone-select">
              <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="convert-arrow">
          <i class="fas fa-arrow-down"></i>
        </div>

        <div class="time-output-group">
          <label>目标时间</label>
          <div class="input-row">
            <input 
              type="text" 
              :value="convertedDateTime" 
              readonly 
              class="datetime-output"
            >
            <select v-model="targetTimezone" class="timezone-select">
              <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 快速时间设置 -->
      <div class="quick-actions">
        <button @click="setCurrentTime" class="action-btn">
          <i class="fas fa-clock"></i> 当前时间
        </button>
        <button @click="swapTimezones" class="action-btn">
          <i class="fas fa-exchange-alt"></i> 交换时区
        </button>
        <button @click="copyResult" class="action-btn">
          <i class="fas fa-copy"></i> 复制结果
        </button>
      </div>
    </div>

    <!-- 时差信息 -->
    <div class="time-difference-section" v-if="timeDifference">
      <h4><i class="fas fa-clock"></i> 时差信息</h4>
      <div class="difference-info">
        <div class="diff-item">
          <span class="label">时差：</span>
          <span class="value">{{ timeDifference.hours }}小时 {{ timeDifference.minutes }}分钟</span>
        </div>
        <div class="diff-item">
          <span class="label">关系：</span>
          <span class="value">{{ timeDifference.relationship }}</span>
        </div>
      </div>
    </div>

    <!-- 世界时钟 -->
    <div class="world-clock-section">
      <h4><i class="fas fa-globe"></i> 世界时钟</h4>
      <div class="clocks-grid">
        <div 
          v-for="clock in worldClocks" 
          :key="clock.timezone"
          class="clock-card"
          :class="{ active: clock.timezone === sourceTimezone || clock.timezone === targetTimezone }"
        >
          <div class="clock-header">
            <span class="city">{{ clock.city }}</span>
            <span class="timezone-name">{{ clock.timezone }}</span>
          </div>
          <div class="clock-time">{{ clock.time }}</div>
          <div class="clock-date">{{ clock.date }}</div>
          <button @click="useAsSource(clock.timezone)" class="use-btn">设为源</button>
        </div>
      </div>
    </div>

    <!-- 时区详细信息 -->
    <div class="timezone-info-section">
      <div class="timezone-details">
        <div class="detail-card">
          <h5>{{ getTimezoneInfo(sourceTimezone).name }}</h5>
          <div class="detail-item">
            <span>UTC偏移：</span>
            <span>{{ getTimezoneInfo(sourceTimezone).offset }}</span>
          </div>
          <div class="detail-item">
            <span>夏令时：</span>
            <span>{{ getTimezoneInfo(sourceTimezone).dst ? '是' : '否' }}</span>
          </div>
        </div>

        <div class="detail-card">
          <h5>{{ getTimezoneInfo(targetTimezone).name }}</h5>
          <div class="detail-item">
            <span>UTC偏移：</span>
            <span>{{ getTimezoneInfo(targetTimezone).offset }}</span>
          </div>
          <div class="detail-item">
            <span>夏令时：</span>
            <span>{{ getTimezoneInfo(targetTimezone).dst ? '是' : '否' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess" class="copy-success-toast">
      <i class="fas fa-check"></i> 已复制到剪贴板
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimezoneConvert',
  data() {
    return {
      sourceDateTime: '',
      sourceTimezone: 'Asia/Shanghai',
      targetTimezone: 'America/New_York',
      showCopySuccess: false,
      updateInterval: null,
      timezones: [
        { value: 'Asia/Shanghai', label: '北京 (UTC+8)', city: '北京' },
        { value: 'America/New_York', label: '纽约 (UTC-5)', city: '纽约' },
        { value: 'Europe/London', label: '伦敦 (UTC+0)', city: '伦敦' },
        { value: 'Asia/Tokyo', label: '东京 (UTC+9)', city: '东京' },
        { value: 'Australia/Sydney', label: '悉尼 (UTC+11)', city: '悉尼' },
        { value: 'Europe/Paris', label: '巴黎 (UTC+1)', city: '巴黎' },
        { value: 'America/Los_Angeles', label: '洛杉矶 (UTC-8)', city: '洛杉矶' },
        { value: 'Asia/Dubai', label: '迪拜 (UTC+4)', city: '迪拜' },
        { value: 'Asia/Hong_Kong', label: '香港 (UTC+8)', city: '香港' },
        { value: 'Europe/Moscow', label: '莫斯科 (UTC+3)', city: '莫斯科' },
        { value: 'America/Chicago', label: '芝加哥 (UTC-6)', city: '芝加哥' },
        { value: 'Asia/Singapore', label: '新加坡 (UTC+8)', city: '新加坡' },
        { value: 'Europe/Berlin', label: '柏林 (UTC+1)', city: '柏林' },
        { value: 'America/Toronto', label: '多伦多 (UTC-5)', city: '多伦多' },
        { value: 'Asia/Seoul', label: '首尔 (UTC+9)', city: '首尔' }
      ]
    }
  },
  computed: {
    convertedDateTime() {
      if (!this.sourceDateTime) return ''
      
      try {
        const sourceDate = new Date(this.sourceDateTime)
        
        // 创建一个在源时区的时间
        const sourceTime = new Intl.DateTimeFormat('zh-CN', {
          timeZone: this.sourceTimezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).formatToParts(sourceDate)
        
        // 转换为目标时区
        const targetTime = new Intl.DateTimeFormat('zh-CN', {
          timeZone: this.targetTimezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(sourceDate)
        
        return targetTime
      } catch (error) {
        return '无效时间'
      }
    },
    
    timeDifference() {
      if (!this.sourceDateTime) return null
      
      try {
        const now = new Date()
        
        // 获取两个时区的UTC偏移
        const sourceOffset = this.getTimezoneOffset(this.sourceTimezone)
        const targetOffset = this.getTimezoneOffset(this.targetTimezone)
        
        const diffMinutes = targetOffset - sourceOffset
        const hours = Math.floor(Math.abs(diffMinutes) / 60)
        const minutes = Math.abs(diffMinutes) % 60
        
        let relationship = ''
        if (diffMinutes > 0) {
          relationship = `${this.getTimezoneName(this.targetTimezone)} 比 ${this.getTimezoneName(this.sourceTimezone)} 快 ${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`
        } else if (diffMinutes < 0) {
          relationship = `${this.getTimezoneName(this.targetTimezone)} 比 ${this.getTimezoneName(this.sourceTimezone)} 慢 ${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`
        } else {
          relationship = '两个时区时间相同'
        }
        
        return {
          hours,
          minutes,
          relationship
        }
      } catch (error) {
        return null
      }
    },
    
    worldClocks() {
      const majorTimezones = [
        'Asia/Shanghai', 'America/New_York', 'Europe/London', 'Asia/Tokyo',
        'Australia/Sydney', 'Europe/Paris', 'America/Los_Angeles', 'Asia/Dubai'
      ]
      
      return majorTimezones.map(timezone => {
        const now = new Date()
        const timeString = new Intl.DateTimeFormat('zh-CN', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now)
        
        const dateString = new Intl.DateTimeFormat('zh-CN', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(now)
        
        const cityInfo = this.timezones.find(tz => tz.value === timezone)
        
        return {
          timezone,
          city: cityInfo ? cityInfo.city : timezone,
          time: timeString,
          date: dateString
        }
      })
    }
  },
  
  mounted() {
    this.setCurrentTime()
    // 每秒更新世界时钟
    this.updateInterval = setInterval(() => {
      this.$forceUpdate()
    }, 1000)
  },
  
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  },
  
  methods: {
    setCurrentTime() {
      const now = new Date()
      const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      this.sourceDateTime = localTime.toISOString().slice(0, 16)
    },
    
    swapTimezones() {
      const temp = this.sourceTimezone
      this.sourceTimezone = this.targetTimezone
      this.targetTimezone = temp
    },
    
    async copyResult() {
      if (!this.convertedDateTime) return
      
      const result = `源时间: ${this.sourceDateTime} (${this.getTimezoneName(this.sourceTimezone)})\n目标时间: ${this.convertedDateTime} (${this.getTimezoneName(this.targetTimezone)})`
      
      try {
        await navigator.clipboard.writeText(result)
        this.showCopySuccess = true
        setTimeout(() => {
          this.showCopySuccess = false
        }, 2000)
      } catch (error) {
        console.error('复制失败:', error)
      }
    },
    
    useAsSource(timezone) {
      this.sourceTimezone = timezone
    },
    
    getTimezoneOffset(timezone) {
      const now = new Date()
      const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
      const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
      return (target.getTime() - utc.getTime()) / (1000 * 60)
    },
    
    getTimezoneName(timezone) {
      const info = this.timezones.find(tz => tz.value === timezone)
      return info ? info.city : timezone
    },
    
    getTimezoneInfo(timezone) {
      const now = new Date()
      const offset = this.getTimezoneOffset(timezone)
      const hours = Math.floor(Math.abs(offset) / 60)
      const minutes = Math.abs(offset) % 60
      const sign = offset >= 0 ? '+' : '-'
      
      // 简单的夏令时检测（基于偏移变化）
      const winter = new Date(now.getFullYear(), 0, 1)
      const summer = new Date(now.getFullYear(), 6, 1)
      const winterOffset = this.getTimezoneOffsetForDate(timezone, winter)
      const summerOffset = this.getTimezoneOffsetForDate(timezone, summer)
      const hasDST = winterOffset !== summerOffset
      
      const info = this.timezones.find(tz => tz.value === timezone)
      
      return {
        name: info ? info.city : timezone,
        offset: `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        dst: hasDST
      }
    },
    
    getTimezoneOffsetForDate(timezone, date) {
      const utc = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
      const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
      return (target.getTime() - utc.getTime()) / (1000 * 60)
    }
  }
}
</script>

<style scoped>
.timezone-convert-tool {
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.tool-header h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.8rem;
}

.tool-header p {
  color: #7f8c8d;
  font-size: 1rem;
}

.main-convert-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 10px;
  margin-bottom: 10px;
  color: white;
}

.convert-row {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 10px;
}

.time-input-group,
.time-output-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.time-input-group label,
.time-output-group label {
  font-weight: 600;
  font-size: 1.1rem;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 15px;
}

.datetime-input,
.datetime-output,
.timezone-select {
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.datetime-output {
  background: rgba(255, 255, 255, 0.7);
  cursor: not-allowed;
}

.convert-arrow {
  text-align: center;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.time-difference-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 10px;
  margin-bottom: 10px;
}

.time-difference-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.difference-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.diff-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.diff-item .label {
  font-weight: 600;
  color: #7f8c8d;
}

.diff-item .value {
  color: #2c3e50;
  font-weight: 500;
}

.world-clock-section {
  margin-bottom: 10px;
}

.world-clock-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.clocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.clock-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 15px;
  padding: 10px;
  color: white;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
}

.clock-card.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
}

.clock-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.clock-header {
  margin-bottom: 10px;
}

.city {
  font-weight: 600;
  font-size: 1.1rem;
  display: block;
}

.timezone-name {
  font-size: 0.8rem;
  opacity: 0.8;
}

.clock-time {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.clock-date {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 10px;
}

.use-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  padding: 10px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.use-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.timezone-info-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 10px;
}

.timezone-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-card {
  background: white;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-card h5 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.detail-item span:first-child {
  color: #7f8c8d;
}

.detail-item span:last-child {
  color: #2c3e50;
  font-weight: 500;
}

.copy-success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #27ae60;
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  z-index: 1000;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

@media (max-width: 768px) {
  .main-convert-section {
    padding: 10px;
  }
  
  .input-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .quick-actions {
    justify-content: center;
  }
  
  .clocks-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .timezone-details {
    grid-template-columns: 1fr;
  }
}
/* Input 输入框统一样式 */
input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
input[type="url"],
input[type="search"],
input[type="tel"] {
  background: #fff;
}
/* Checkbox 统一样式 */
input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}
</style>
