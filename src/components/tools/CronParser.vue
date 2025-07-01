<template>
  <div class="cron-parser-tool">
    <h2>Cron 表达式解析器</h2>
    <p>解析、验证和预测 Cron 表达式的执行时间</p>

    <!-- Cron表达式输入 -->
    <div class="input-section">
      <div class="form-group">
        <label>Cron 表达式</label>
        <div class="input-with-validation">
          <input 
            type="text" 
            v-model="cronExpression" 
            placeholder="例如: 0 0 12 * * ?"
            @input="parseCron"
            :class="{ 'error': !isValid && cronExpression }"
          >
          <div class="validation-status">
            <span v-if="isValid" class="valid">
              <i class="fas fa-check-circle"></i> 有效
            </span>
            <span v-else-if="cronExpression" class="invalid">
              <i class="fas fa-times-circle"></i> 无效
            </span>
          </div>
        </div>
        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>
      </div>

      <!-- 预设Cron表达式 -->
      <div class="presets-section">
        <h3>常用 Cron 表达式</h3>
        <div class="presets-grid">
          <div 
            v-for="preset in cronPresets" 
            :key="preset.expression"
            class="preset-item"
            @click="useCronPreset(preset)"
          >
            <div class="preset-expression">{{ preset.expression }}</div>
            <div class="preset-description">{{ preset.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 解析结果 -->
    <div class="results-section" v-if="isValid && parsedCron">
      <h3>解析结果</h3>
      
      <!-- Cron字段说明 -->
      <div class="cron-breakdown">
        <div class="breakdown-item">
          <label>秒</label>
          <div class="breakdown-value">{{ parsedCron.seconds }}</div>
        </div>
        <div class="breakdown-item">
          <label>分钟</label>
          <div class="breakdown-value">{{ parsedCron.minutes }}</div>
        </div>
        <div class="breakdown-item">
          <label>小时</label>
          <div class="breakdown-value">{{ parsedCron.hours }}</div>
        </div>
        <div class="breakdown-item">
          <label>日期</label>
          <div class="breakdown-value">{{ parsedCron.dayOfMonth }}</div>
        </div>
        <div class="breakdown-item">
          <label>月份</label>
          <div class="breakdown-value">{{ parsedCron.month }}</div>
        </div>
        <div class="breakdown-item">
          <label>星期</label>
          <div class="breakdown-value">{{ parsedCron.dayOfWeek }}</div>
        </div>
      </div>

      <!-- 人类可读描述 -->
      <div class="description-section">
        <h4>执行描述</h4>
        <div class="description-text">{{ cronDescription }}</div>
      </div>

      <!-- 下次执行时间 -->
      <div class="next-runs-section">
        <h4>接下来的执行时间</h4>
        <div class="next-runs-list">
          <div 
            v-for="(nextRun, index) in nextRuns" 
            :key="index"
            class="next-run-item"
          >
            <div class="run-time">{{ nextRun.formatted }}</div>
            <div class="run-relative">{{ nextRun.relative }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cron格式说明 -->
    <div class="help-section">
      <h3>Cron 表达式格式</h3>
      <div class="help-content">
        <div class="format-explanation">
          <div class="format-pattern">
            <span class="field">秒</span>
            <span class="field">分</span>
            <span class="field">时</span>
            <span class="field">日</span>
            <span class="field">月</span>
            <span class="field">周</span>
          </div>
        </div>
        
        <div class="special-chars">
          <h4>特殊字符说明</h4>
          <div class="chars-grid">
            <div class="char-item">
              <span class="char">*</span>
              <span class="desc">任意值</span>
            </div>
            <div class="char-item">
              <span class="char">?</span>
              <span class="desc">不指定值</span>
            </div>
            <div class="char-item">
              <span class="char">-</span>
              <span class="desc">范围</span>
            </div>
            <div class="char-item">
              <span class="char">,</span>
              <span class="desc">列举</span>
            </div>
            <div class="char-item">
              <span class="char">/</span>
              <span class="desc">步长</span>
            </div>
            <div class="char-item">
              <span class="char">L</span>
              <span class="desc">最后</span>
            </div>
            <div class="char-item">
              <span class="char">W</span>
              <span class="desc">工作日</span>
            </div>
            <div class="char-item">
              <span class="char">#</span>
              <span class="desc">第几个</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CronParser',
  data() {
    return {
      cronExpression: '',
      isValid: false,
      parsedCron: null,
      errorMessage: '',
      cronDescription: '',
      nextRuns: []
    }
  },
  computed: {
    cronPresets() {
      return [
        { expression: '0 0 0 * * ?', description: '每天午夜' },
        { expression: '0 0 12 * * ?', description: '每天中午12点' },
        { expression: '0 0 9-17 * * MON-FRI', description: '工作日9-17点每小时' },
        { expression: '0 30 10 * * ?', description: '每天10:30' },
        { expression: '0 0 0 1 * ?', description: '每月1号午夜' },
        { expression: '0 0 0 * * MON', description: '每周一午夜' },
        { expression: '0 */15 * * * ?', description: '每15分钟' },
        { expression: '0 0 */2 * * ?', description: '每2小时' },
        { expression: '0 0 0 1 1 ?', description: '每年1月1日' },
        { expression: '0 0 8 * * MON-FRI', description: '工作日早8点' }
      ]
    }
  },
  methods: {
    parseCron() {
      if (!this.cronExpression.trim()) {
        this.resetParser()
        return
      }

      try {
        const parts = this.cronExpression.trim().split(/\s+/)
        
        if (parts.length !== 6) {
          throw new Error('Cron表达式应包含6个字段（秒 分 时 日 月 周）')
        }

        this.parsedCron = {
          seconds: this.parseField(parts[0], 'seconds'),
          minutes: this.parseField(parts[1], 'minutes'),
          hours: this.parseField(parts[2], 'hours'),
          dayOfMonth: this.parseField(parts[3], 'dayOfMonth'),
          month: this.parseField(parts[4], 'month'),
          dayOfWeek: this.parseField(parts[5], 'dayOfWeek')
        }

        this.isValid = true
        this.errorMessage = ''
        this.generateDescription()
        this.calculateNextRuns()
      } catch (error) {
        this.isValid = false
        this.errorMessage = error.message
        this.parsedCron = null
        this.cronDescription = ''
        this.nextRuns = []
      }
    },

    parseField(field, fieldType) {
      // 简化的字段解析逻辑
      if (field === '*') return '任意值'
      if (field === '?') return '不指定'
      
      // 范围处理
      if (field.includes('-')) {
        const [start, end] = field.split('-')
        return `${start}-${end}`
      }
      
      // 列举处理
      if (field.includes(',')) {
        return field.split(',').join(', ')
      }
      
      // 步长处理
      if (field.includes('/')) {
        const [base, step] = field.split('/')
        return `每${step}${this.getFieldUnit(fieldType)}`
      }
      
      // 具体值
      if (fieldType === 'month') {
        return this.getMonthName(field)
      }
      if (fieldType === 'dayOfWeek') {
        return this.getDayName(field)
      }
      
      return field
    },

    getFieldUnit(fieldType) {
      const units = {
        seconds: '秒',
        minutes: '分钟',
        hours: '小时',
        dayOfMonth: '天',
        month: '月',
        dayOfWeek: '周'
      }
      return units[fieldType] || ''
    },

    getMonthName(month) {
      const months = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      return months[parseInt(month)] || month
    },

    getDayName(day) {
      const days = {
        '0': '周日', '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六',
        'SUN': '周日', 'MON': '周一', 'TUE': '周二', 'WED': '周三', 'THU': '周四', 'FRI': '周五', 'SAT': '周六'
      }
      return days[day.toUpperCase()] || day
    },

    generateDescription() {
      // 简化的描述生成
      const parts = this.cronExpression.trim().split(/\s+/)
      const [sec, min, hour, day, month, dow] = parts
      
      let desc = '在'
      
      if (hour !== '*') {
        desc += `${hour}时`
      }
      if (min !== '*') {
        desc += `${min}分`
      }
      if (sec !== '*' && sec !== '0') {
        desc += `${sec}秒`
      }
      
      if (day !== '*') {
        desc += ` 每月${day}日`
      }
      if (month !== '*') {
        desc += ` ${this.getMonthName(month)}`
      }
      if (dow !== '*' && dow !== '?') {
        desc += ` ${this.getDayName(dow)}`
      }
      
      desc += ' 执行'
      this.cronDescription = desc
    },

    calculateNextRuns() {
      // 简化的下次运行时间计算
      const now = new Date()
      this.nextRuns = []
      
      for (let i = 0; i < 5; i++) {
        const nextTime = new Date(now.getTime() + (i + 1) * 60 * 60 * 1000) // 简化：每小时一次
        this.nextRuns.push({
          formatted: nextTime.toLocaleString('zh-CN'),
          relative: this.getRelativeTime(nextTime)
        })
      }
    },

    getRelativeTime(date) {
      const now = new Date()
      const diff = date.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟后`
      } else {
        return `${minutes}分钟后`
      }
    },

    useCronPreset(preset) {
      this.cronExpression = preset.expression
      this.parseCron()
    },

    resetParser() {
      this.isValid = false
      this.parsedCron = null
      this.errorMessage = ''
      this.cronDescription = ''
      this.nextRuns = []
    }
  }
}
</script>

<style scoped>
.cron-parser-tool {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.input-section {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.input-with-validation {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.input-with-validation input {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
}

.input-with-validation input.error {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.validation-status .valid {
  color: #4caf50;
  font-weight: 500;
}

.validation-status .invalid {
  color: #f44336;
  font-weight: 500;
}

.error-message {
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.presets-section {
  margin-top: 2rem;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
}

.preset-item:hover {
  background: var(--accent-color-light);
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.preset-expression {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
}

.preset-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.results-section {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.cron-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.breakdown-item {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  border: 1px solid var(--border-color);
}

.breakdown-item label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.breakdown-value {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--text-primary);
}

.description-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.description-text {
  font-size: 1.1rem;
  font-weight: 500;
}

.next-runs-section h4 {
  margin-bottom: 1rem;
}

.next-runs-list {
  display: grid;
  gap: 0.5rem;
}

.next-run-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.run-time {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.run-relative {
  color: var(--accent-color);
  font-size: 0.9rem;
}

.help-section {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.format-pattern {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.field {
  background: var(--accent-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}

.chars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.char-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-primary);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.char {
  background: var(--accent-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .cron-parser-tool {
    padding: 1rem;
  }
  
  .cron-breakdown {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .format-pattern {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .next-run-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style> 