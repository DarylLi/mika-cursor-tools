<template>
  <div class="time-diff-tool">
    <h2>日期间隔计算</h2>
    <p>计算两个日期之间的时间间隔，支持多种时间单位显示</p>

    <!-- 日期输入区域 -->
    <div class="input-section">
      <div class="date-inputs">
        <div class="date-group">
          <label>开始日期</label>
          <input 
            type="datetime-local" 
            v-model="startDate"
            @change="calculateDiff"
          >
          <button @click="setToNow('start')" class="now-btn">
            <i class="fas fa-clock"></i> 现在
          </button>
        </div>
        
        <div class="arrow-container">
          <i class="fas fa-arrow-right"></i>
        </div>
        
        <div class="date-group">
          <label>结束日期</label>
          <input 
            type="datetime-local" 
            v-model="endDate"
            @change="calculateDiff"
          >
          <button @click="setToNow('end')" class="now-btn">
            <i class="fas fa-clock"></i> 现在
          </button>
        </div>
      </div>

      <!-- 快速预设 -->
      <div class="quick-presets">
        <button @click="setPreset('1hour')" class="preset-btn">1小时后</button>
        <button @click="setPreset('1day')" class="preset-btn">1天后</button>
        <button @click="setPreset('1week')" class="preset-btn">1周后</button>
        <button @click="setPreset('1month')" class="preset-btn">1月后</button>
        <button @click="setPreset('1year')" class="preset-btn">1年后</button>
      </div>
    </div>

    <!-- 结果显示区域 -->
    <div class="results-section" v-if="diffResult">
      <h3>时间间隔结果</h3>
      
      <!-- 主要结果显示 -->
      <div class="main-result">
        <div class="time-display">
          <span class="time-number" v-if="diffResult.years">{{ diffResult.years }}</span>
          <span class="time-unit" v-if="diffResult.years">年</span>
          
          <span class="time-number" v-if="diffResult.months">{{ diffResult.months }}</span>
          <span class="time-unit" v-if="diffResult.months">个月</span>
          
          <span class="time-number" v-if="diffResult.days">{{ diffResult.days }}</span>
          <span class="time-unit" v-if="diffResult.days">天</span>
          
          <span class="time-number" v-if="diffResult.hours">{{ diffResult.hours }}</span>
          <span class="time-unit" v-if="diffResult.hours">小时</span>
          
          <span class="time-number" v-if="diffResult.minutes">{{ diffResult.minutes }}</span>
          <span class="time-unit" v-if="diffResult.minutes">分钟</span>
          
          <span class="time-number" v-if="diffResult.seconds">{{ diffResult.seconds }}</span>
          <span class="time-unit" v-if="diffResult.seconds">秒</span>
        </div>
        
        <div class="direction-indicator" :class="{ 'future': diffResult.future, 'past': !diffResult.future }">
          <i class="fas" :class="diffResult.future ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
          {{ diffResult.future ? '未来时间' : '过去时间' }}
        </div>
      </div>

      <!-- 详细统计 -->
      <div class="detailed-stats">
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-value">{{ Math.abs(diffResult.totalDays).toLocaleString() }}</div>
            <div class="stat-label">总天数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ Math.abs(diffResult.totalHours).toLocaleString() }}</div>
            <div class="stat-label">总小时数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ Math.abs(diffResult.totalMinutes).toLocaleString() }}</div>
            <div class="stat-label">总分钟数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ Math.abs(diffResult.totalSeconds).toLocaleString() }}</div>
            <div class="stat-label">总秒数</div>
          </div>
        </div>
      </div>

      <!-- 工作日计算 -->
      <div class="workdays-section">
        <h4>工作日计算</h4>
        <div class="workdays-stats">
          <div class="workday-item">
            <span class="workday-label">工作日：</span>
            <span class="workday-value">{{ workdaysResult.workdays }} 天</span>
          </div>
          <div class="workday-item">
            <span class="workday-label">周末：</span>
            <span class="workday-value">{{ workdaysResult.weekends }} 天</span>
          </div>
          <div class="workday-item">
            <span class="workday-label">工作周：</span>
            <span class="workday-value">{{ workdaysResult.workweeks.toFixed(1) }} 周</span>
          </div>
        </div>
      </div>

      <!-- 人生统计 -->
      <div class="life-stats" v-if="Math.abs(diffResult.totalDays) > 30">
        <h4>生命统计（基于平均值）</h4>
        <div class="life-grid">
          <div class="life-item">
            <i class="fas fa-heartbeat"></i>
            <span class="life-label">心跳次数</span>
            <span class="life-value">{{ lifeStats.heartbeats.toLocaleString() }}</span>
          </div>
          <div class="life-item">
            <i class="fas fa-lungs"></i>
            <span class="life-label">呼吸次数</span>
            <span class="life-value">{{ lifeStats.breaths.toLocaleString() }}</span>
          </div>
          <div class="life-item">
            <i class="fas fa-bed"></i>
            <span class="life-label">睡眠时间</span>
            <span class="life-value">{{ lifeStats.sleepHours.toLocaleString() }} 小时</span>
          </div>
          <div class="life-item">
            <i class="fas fa-utensils"></i>
            <span class="life-label">用餐次数</span>
            <span class="life-value">{{ lifeStats.meals.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeDiff',
  data() {
    return {
      startDate: '',
      endDate: '',
      diffResult: null
    }
  },
  computed: {
    workdaysResult() {
      if (!this.diffResult) return { workdays: 0, weekends: 0, workweeks: 0 }
      
      const totalDays = Math.abs(this.diffResult.totalDays)
      const workdays = this.calculateWorkdays()
      const weekends = totalDays - workdays
      const workweeks = workdays / 5
      
      return { workdays, weekends, workweeks }
    },
    
    lifeStats() {
      if (!this.diffResult) return {}
      
      const days = Math.abs(this.diffResult.totalDays)
      return {
        heartbeats: Math.round(days * 24 * 60 * 70), // 平均心率70次/分钟
        breaths: Math.round(days * 24 * 60 * 15), // 平均呼吸15次/分钟
        sleepHours: Math.round(days * 8), // 每天8小时睡眠
        meals: Math.round(days * 3) // 每天3餐
      }
    }
  },
  mounted() {
    const now = new Date()
    this.startDate = this.formatDatetimeLocal(now)
    this.endDate = this.formatDatetimeLocal(new Date(now.getTime() + 24 * 60 * 60 * 1000))
    this.calculateDiff()
  },
  methods: {
    formatDatetimeLocal(date) {
      const offset = date.getTimezoneOffset()
      const localDate = new Date(date.getTime() - offset * 60 * 1000)
      return localDate.toISOString().slice(0, 16)
    },
    
    setToNow(type) {
      const now = this.formatDatetimeLocal(new Date())
      if (type === 'start') {
        this.startDate = now
      } else {
        this.endDate = now
      }
      this.calculateDiff()
    },
    
    setPreset(preset) {
      const now = new Date()
      this.startDate = this.formatDatetimeLocal(now)
      
      let endTime = new Date(now)
      switch (preset) {
        case '1hour':
          endTime.setHours(endTime.getHours() + 1)
          break
        case '1day':
          endTime.setDate(endTime.getDate() + 1)
          break
        case '1week':
          endTime.setDate(endTime.getDate() + 7)
          break
        case '1month':
          endTime.setMonth(endTime.getMonth() + 1)
          break
        case '1year':
          endTime.setFullYear(endTime.getFullYear() + 1)
          break
      }
      
      this.endDate = this.formatDatetimeLocal(endTime)
      this.calculateDiff()
    },
    
    calculateDiff() {
      if (!this.startDate || !this.endDate) {
        this.diffResult = null
        return
      }
      
      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      
      const timeDiff = end.getTime() - start.getTime()
      const future = timeDiff > 0
      const absTimeDiff = Math.abs(timeDiff)
      
      // 计算总的时间单位
      const totalSeconds = Math.floor(absTimeDiff / 1000)
      const totalMinutes = Math.floor(totalSeconds / 60)
      const totalHours = Math.floor(totalMinutes / 60)
      const totalDays = Math.floor(totalHours / 24)
      
      // 计算精确的年、月、日、时、分、秒
      let tempStart = new Date(start)
      let tempEnd = new Date(end)
      
      if (!future) {
        [tempStart, tempEnd] = [tempEnd, tempStart]
      }
      
      let years = tempEnd.getFullYear() - tempStart.getFullYear()
      let months = tempEnd.getMonth() - tempStart.getMonth()
      let days = tempEnd.getDate() - tempStart.getDate()
      let hours = tempEnd.getHours() - tempStart.getHours()
      let minutes = tempEnd.getMinutes() - tempStart.getMinutes()
      let seconds = tempEnd.getSeconds() - tempStart.getSeconds()
      
      // 处理负数情况
      if (seconds < 0) {
        seconds += 60
        minutes--
      }
      if (minutes < 0) {
        minutes += 60
        hours--
      }
      if (hours < 0) {
        hours += 24
        days--
      }
      if (days < 0) {
        const prevMonth = new Date(tempEnd.getFullYear(), tempEnd.getMonth(), 0)
        days += prevMonth.getDate()
        months--
      }
      if (months < 0) {
        months += 12
        years--
      }
      
      this.diffResult = {
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays: future ? totalDays : -totalDays,
        totalHours: future ? totalHours : -totalHours,
        totalMinutes: future ? totalMinutes : -totalMinutes,
        totalSeconds: future ? totalSeconds : -totalSeconds,
        future
      }
    },
    
    calculateWorkdays() {
      if (!this.startDate || !this.endDate) return 0
      
      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      
      let current = new Date(Math.min(start.getTime(), end.getTime()))
      const endDate = new Date(Math.max(start.getTime(), end.getTime()))
      
      let workdays = 0
      
      while (current <= endDate) {
        const dayOfWeek = current.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 不是周日和周六
          workdays++
        }
        current.setDate(current.getDate() + 1)
      }
      
      return workdays
    }
  }
}
</script>

<style scoped>
.time-diff-tool {
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

.date-inputs {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.date-group {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.date-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
}

.now-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.now-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.arrow-container {
  flex-shrink: 0;
  font-size: 1.5rem;
  color: var(--accent-color);
  align-self: flex-end;
  margin-bottom: 1rem;
}

.quick-presets {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.preset-btn {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.preset-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.results-section {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.main-result {
  text-align: center;
  margin-bottom: 2rem;
}

.time-display {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.time-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent-color);
}

.time-unit {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-right: 1rem;
}

.direction-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.direction-indicator.future {
  background: #e8f5e8;
  color: #2e7d32;
}

.direction-indicator.past {
  background: #fff3e0;
  color: #f57c00;
}

.detailed-stats {
  margin-bottom: 2rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  border: 1px solid var(--border-color);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.workdays-section {
  margin-bottom: 2rem;
}

.workdays-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.workday-item {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workday-label {
  color: var(--text-secondary);
}

.workday-value {
  font-weight: bold;
  color: var(--text-primary);
}

.life-stats {
  margin-top: 2rem;
}

.life-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.life-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.life-item i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.life-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.life-value {
  font-size: 1.2rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .time-diff-tool {
    padding: 1rem;
  }

  .date-inputs {
    flex-direction: column;
    gap: 1rem;
  }

  .arrow-container {
    transform: rotate(90deg);
    align-self: center;
    margin-bottom: 0;
  }

  .time-display {
    font-size: 1.2rem;
  }

  .time-number {
    font-size: 2rem;
  }

  .time-unit {
    font-size: 1rem;
  }

  .stat-grid,
  .life-grid {
    grid-template-columns: 1fr;
  }

  .workdays-stats {
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
