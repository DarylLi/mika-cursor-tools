<template>
  <div class="date-add-tool">
    <div class="tool-header">
      <h3><i class="fas fa-calculator"></i> 日期计算器</h3>
      <p>计算日期的加减法，支持年、月、日、时、分、秒的精确计算</p>
    </div>

    <!-- 主要计算区域 -->
    <div class="main-calc-section">
      <div class="calc-form">
        <div class="base-date-group">
          <label>基准日期</label>
          <input 
            type="datetime-local" 
            v-model="baseDateTime" 
            class="datetime-input"
          >
          <button @click="setCurrentTime" class="current-btn">
            <i class="fas fa-clock"></i> 当前时间
          </button>
        </div>

        <div class="operation-group">
          <div class="operation-row">
            <select v-model="operation" class="operation-select">
              <option value="add">加上</option>
              <option value="subtract">减去</option>
            </select>
            
            <div class="time-units">
              <div class="unit-input">
                <input type="number" v-model.number="years" class="unit-value">
                <span>年</span>
              </div>
              <div class="unit-input">
                <input type="number" v-model.number="months" class="unit-value">
                <span>月</span>
              </div>
              <div class="unit-input">
                <input type="number" v-model.number="days" class="unit-value">
                <span>天</span>
              </div>
              <div class="unit-input">
                <input type="number" v-model.number="hours" class="unit-value">
                <span>时</span>
              </div>
              <div class="unit-input">
                <input type="number" v-model.number="minutes" class="unit-value">
                <span>分</span>
              </div>
              <div class="unit-input">
                <input type="number" v-model.number="seconds" class="unit-value">
                <span>秒</span>
              </div>
            </div>
          </div>
        </div>

        <div class="quick-presets">
          <button @click="setQuickValue('1-day')" class="preset-btn">1天</button>
          <button @click="setQuickValue('1-week')" class="preset-btn">1周</button>
          <button @click="setQuickValue('1-month')" class="preset-btn">1个月</button>
          <button @click="setQuickValue('1-year')" class="preset-btn">1年</button>
          <button @click="setQuickValue('100-days')" class="preset-btn">100天</button>
          <button @click="clearValues" class="preset-btn clear">清空</button>
        </div>
      </div>
    </div>

    <!-- 计算结果 -->
    <div class="result-section" v-if="calculatedDate">
      <h4><i class="fas fa-calendar-check"></i> 计算结果</h4>
      <div class="result-cards">
        <div class="result-card main">
          <div class="card-header">
            <i class="fas fa-calendar-alt"></i>
            <span>结果日期</span>
          </div>
          <div class="result-datetime">{{ calculatedDate }}</div>
        </div>

        <div class="result-card">
          <div class="card-header">
            <i class="fas fa-clock"></i>
            <span>时间差</span>
          </div>
          <div class="time-difference">{{ timeDifferenceText }}</div>
        </div>

        <div class="result-card">
          <div class="card-header">
            <i class="fas fa-sun"></i>
            <span>星期</span>
          </div>
          <div class="weekday-info">{{ weekdayInfo }}</div>
        </div>
      </div>
    </div>

    <!-- 批量计算 -->
    <div class="batch-calc-section">
      <h4><i class="fas fa-list"></i> 批量计算</h4>
      <div class="batch-grid">
        <div v-for="(calc, index) in batchCalcs" :key="index" class="batch-item">
          <span class="batch-label">{{ calc.label }}</span>
          <span class="batch-result">{{ calc.result }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateAdd',
  data() {
    return {
      baseDateTime: '',
      operation: 'add',
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  },
  
  computed: {
    calculatedDate() {
      if (!this.baseDateTime) return null
      
      const baseDate = new Date(this.baseDateTime)
      const result = new Date(baseDate)
      
      const multiplier = this.operation === 'add' ? 1 : -1
      
      if (this.years) result.setFullYear(result.getFullYear() + this.years * multiplier)
      if (this.months) result.setMonth(result.getMonth() + this.months * multiplier)
      if (this.days) result.setDate(result.getDate() + this.days * multiplier)
      if (this.hours) result.setHours(result.getHours() + this.hours * multiplier)
      if (this.minutes) result.setMinutes(result.getMinutes() + this.minutes * multiplier)
      if (this.seconds) result.setSeconds(result.getSeconds() + this.seconds * multiplier)
      
      return this.formatDateTime(result)
    },
    
    timeDifferenceText() {
      if (!this.baseDateTime || !this.calculatedDate) return ''
      
      const base = new Date(this.baseDateTime)
      const calculated = new Date(this.calculatedDate)
      const diffMs = Math.abs(calculated.getTime() - base.getTime())
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      return `${diffDays}天 ${diffHours}小时 ${diffMinutes}分钟`
    },
    
    weekdayInfo() {
      if (!this.calculatedDate) return ''
      
      const date = new Date(this.calculatedDate)
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return weekdays[date.getDay()]
    },
    
    batchCalcs() {
      if (!this.baseDateTime) return []
      
      const base = new Date(this.baseDateTime)
      const calcs = []
      
      // 常用的日期计算
      const calculations = [
        { label: '明天', days: 1 },
        { label: '下周', days: 7 },
        { label: '下个月', months: 1 },
        { label: '下季度', months: 3 },
        { label: '明年', years: 1 },
        { label: '昨天', days: -1 },
        { label: '上周', days: -7 },
        { label: '上个月', months: -1 }
      ]
      
      calculations.forEach(calc => {
        const result = new Date(base)
        if (calc.years) result.setFullYear(result.getFullYear() + calc.years)
        if (calc.months) result.setMonth(result.getMonth() + calc.months)
        if (calc.days) result.setDate(result.getDate() + calc.days)
        
        calcs.push({
          label: calc.label,
          result: this.formatDateTime(result)
        })
      })
      
      return calcs
    }
  },
  
  mounted() {
    this.setCurrentTime()
  },
  
  methods: {
    setCurrentTime() {
      const now = new Date()
      const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      this.baseDateTime = localTime.toISOString().slice(0, 16)
    },
    
    setQuickValue(type) {
      this.clearValues()
      
      switch (type) {
        case '1-day':
          this.days = 1
          break
        case '1-week':
          this.days = 7
          break
        case '1-month':
          this.months = 1
          break
        case '1-year':
          this.years = 1
          break
        case '100-days':
          this.days = 100
          break
      }
    },
    
    clearValues() {
      this.years = 0
      this.months = 0
      this.days = 0
      this.hours = 0
      this.minutes = 0
      this.seconds = 0
    },
    
    formatDateTime(date) {
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.date-add-tool {
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

.main-calc-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 10px;
  margin-bottom: 10px;
  color: white;
}

.calc-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.base-date-group {
  display: flex;
  align-items: end;
  gap: 15px;
}

.base-date-group label {
  font-weight: 600;
  margin-bottom: 10px;
  min-width: 80px;
}

.datetime-input {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.current-btn {
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.current-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.operation-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.operation-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.operation-select {
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-weight: 600;
  min-width: 80px;
}

.time-units {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  flex: 1;
}

.unit-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.unit-value {
  width: 60px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  text-align: center;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.unit-input span {
  font-size: 0.9rem;
  opacity: 0.9;
}

.quick-presets {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.preset-btn {
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.preset-btn.clear {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.5);
}

.result-section {
  margin-bottom: 10px;
}

.result-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.result-cards {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
}

.result-card {
  background: white;
  border-radius: 15px;
  padding: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.result-card.main {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 600;
}

.result-datetime {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.time-difference,
.weekday-info {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.batch-calc-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 10px;
}

.batch-calc-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.batch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.batch-item {
  background: white;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.batch-label {
  font-weight: 600;
  color: #2c3e50;
}

.batch-result {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .date-add-tool {
    padding: 10px;
  }
  
  .main-calc-section {
    padding: 10px;
  }
  
  .base-date-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .operation-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .time-units {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .result-cards {
    grid-template-columns: 1fr;
  }
  
  .batch-grid {
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
