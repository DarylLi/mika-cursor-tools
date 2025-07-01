<template>
  <div class="week-number-tool">
    <div class="tool-header">
      <h3><i class="fas fa-calendar-week"></i> 周数计算器</h3>
      <p>查询日期对应的周数，计算年份周数统计和周日期范围</p>
    </div>

    <!-- 主要查询区域 -->
    <div class="main-query-section">
      <div class="date-input-row">
        <div class="input-group">
          <label>选择日期</label>
          <input 
            type="date" 
            v-model="selectedDate" 
            class="date-input"
          >
        </div>
        <div class="input-group">
          <label>周数计算标准</label>
          <select v-model="weekStandard" class="standard-select">
            <option value="ISO">ISO 8601标准</option>
            <option value="US">美国标准</option>
            <option value="CN">中国标准</option>
          </select>
        </div>
        <button @click="setToday" class="today-btn">
          <i class="fas fa-calendar-day"></i> 今天
        </button>
      </div>
    </div>

    <!-- 周数结果显示 -->
    <div class="week-result-section" v-if="weekResult">
      <h4><i class="fas fa-hashtag"></i> 周数信息</h4>
      <div class="result-cards">
        <div class="result-card main-week">
          <div class="card-header">
            <i class="fas fa-calendar-week"></i>
            <span>第 {{ weekResult.weekNumber }} 周</span>
          </div>
          <div class="card-content">
            <div class="week-info">
              <span class="year">{{ weekResult.year }}年</span>
              <span class="standard">{{ getStandardName(weekStandard) }}</span>
            </div>
          </div>
        </div>

        <div class="result-card">
          <div class="card-header">
            <i class="fas fa-calendar-alt"></i>
            <span>周日期范围</span>
          </div>
          <div class="card-content">
            <div class="date-range">
              <span class="start-date">{{ weekResult.weekStart }}</span>
              <span class="separator">至</span>
              <span class="end-date">{{ weekResult.weekEnd }}</span>
            </div>
          </div>
        </div>

        <div class="result-card">
          <div class="card-header">
            <i class="fas fa-clock"></i>
            <span>星期信息</span>
          </div>
          <div class="card-content">
            <div class="day-info">
              <span class="day-name">{{ weekResult.dayName }}</span>
              <span class="day-number">第{{ weekResult.dayOfWeek }}天</span>
            </div>
          </div>
        </div>

        <div class="result-card">
          <div class="card-header">
            <i class="fas fa-chart-line"></i>
            <span>年度进度</span>
          </div>
          <div class="card-content">
            <div class="progress-info">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: weekResult.yearProgress + '%' }"></div>
              </div>
              <span class="progress-text">{{ weekResult.yearProgress.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 年度周数统计 -->
    <div class="year-stats-section">
      <h4><i class="fas fa-chart-bar"></i> {{ selectedYear }}年周数统计</h4>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ yearStats.totalWeeks }}</div>
          <div class="stat-label">总周数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ yearStats.currentWeek }}</div>
          <div class="stat-label">当前周</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ yearStats.remainingWeeks }}</div>
          <div class="stat-label">剩余周数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ yearStats.workWeeks }}</div>
          <div class="stat-label">工作周数</div>
        </div>
      </div>
    </div>

    <!-- 周历视图 -->
    <div class="week-calendar-section">
      <h4><i class="fas fa-calendar"></i> 周历视图</h4>
      <div class="calendar-controls">
        <button @click="changeWeek(-1)" class="nav-btn">
          <i class="fas fa-chevron-left"></i> 上一周
        </button>
        <span class="current-week-info">
          {{ selectedYear }}年第{{ weekResult ? weekResult.weekNumber : 1 }}周
        </span>
        <button @click="changeWeek(1)" class="nav-btn">
          <i class="fas fa-chevron-right"></i> 下一周
        </button>
      </div>
      
      <div class="week-calendar" v-if="weekCalendar">
        <div class="week-header">
          <div class="week-info">
            <span class="week-range">{{ weekCalendar.start }} - {{ weekCalendar.end }}</span>
            <span class="week-number">第{{ weekCalendar.weekNumber }}周</span>
          </div>
        </div>
        <div class="days-grid">
          <div 
            v-for="day in weekCalendar.days" 
            :key="day.date"
            class="day-cell"
            :class="{ 
              today: day.isToday, 
              selected: day.isSelected,
              weekend: day.isWeekend,
              'other-month': day.isOtherMonth
            }"
            @click="selectDate(day.date)"
          >
            <div class="day-number">{{ day.dayNumber }}</div>
            <div class="day-name">{{ day.dayName }}</div>
            <div class="day-date">{{ day.monthDay }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速查询 -->
    <div class="quick-queries-section">
      <h4><i class="fas fa-bolt"></i> 快速查询</h4>
      <div class="quick-buttons">
        <button @click="quickQuery('year-start')" class="quick-btn">
          <i class="fas fa-calendar-plus"></i>
          年初第一周
        </button>
        <button @click="quickQuery('year-end')" class="quick-btn">
          <i class="fas fa-calendar-minus"></i>
          年末最后一周
        </button>
        <button @click="quickQuery('quarter-start')" class="quick-btn">
          <i class="fas fa-calendar-check"></i>
          季度开始
        </button>
        <button @click="quickQuery('month-start')" class="quick-btn">
          <i class="fas fa-calendar"></i>
          月初第一周
        </button>
        <button @click="quickQuery('week-53')" class="quick-btn">
          <i class="fas fa-star"></i>
          第53周查询
        </button>
        <button @click="quickQuery('leap-year')" class="quick-btn">
          <i class="fas fa-calendar-plus"></i>
          闰年周数
        </button>
      </div>
    </div>

    <!-- 不同标准对比 -->
    <div class="standards-comparison-section">
      <h4><i class="fas fa-balance-scale"></i> 不同标准对比</h4>
      <div class="comparison-table">
        <div class="table-header">
          <div>标准</div>
          <div>周数</div>
          <div>周起始日</div>
          <div>第一周定义</div>
        </div>
        <div v-for="standard in comparisonData" :key="standard.code" class="table-row">
          <div class="standard-name">{{ standard.name }}</div>
          <div class="week-number">第{{ standard.weekNumber }}周</div>
          <div class="start-day">{{ standard.startDay }}</div>
          <div class="definition">{{ standard.definition }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeekNumber',
  data() {
    return {
      selectedDate: '',
      weekStandard: 'ISO',
      currentDate: new Date()
    }
  },
  computed: {
    selectedYear() {
      return this.selectedDate ? new Date(this.selectedDate).getFullYear() : new Date().getFullYear()
    },
    
    weekResult() {
      if (!this.selectedDate) return null
      
      const date = new Date(this.selectedDate)
      const result = this.calculateWeekNumber(date, this.weekStandard)
      
      return {
        ...result,
        dayName: this.getDayName(date.getDay()),
        dayOfWeek: this.getDayOfWeek(date.getDay(), this.weekStandard),
        yearProgress: this.calculateYearProgress(date, result.weekNumber)
      }
    },
    
    yearStats() {
      const year = this.selectedYear
      const totalWeeks = this.getTotalWeeksInYear(year, this.weekStandard)
      const currentWeek = this.weekResult ? this.weekResult.weekNumber : 1
      const remainingWeeks = totalWeeks - currentWeek
      const workWeeks = this.calculateWorkWeeks(year)
      
      return {
        totalWeeks,
        currentWeek,
        remainingWeeks,
        workWeeks
      }
    },
    
    weekCalendar() {
      if (!this.selectedDate) return null
      
      const date = new Date(this.selectedDate)
      const weekInfo = this.calculateWeekNumber(date, this.weekStandard)
      const weekStart = new Date(weekInfo.weekStartDate)
      const weekEnd = new Date(weekInfo.weekEndDate)
      
      const days = []
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart)
        dayDate.setDate(weekStart.getDate() + i)
        
        const isToday = this.isSameDate(dayDate, new Date())
        const isSelected = this.isSameDate(dayDate, date)
        const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6
        
        days.push({
          date: dayDate.toISOString().split('T')[0],
          dayNumber: i + 1,
          dayName: this.getDayName(dayDate.getDay()),
          monthDay: dayDate.getDate(),
          isToday,
          isSelected,
          isWeekend,
          isOtherMonth: dayDate.getMonth() !== date.getMonth()
        })
      }
      
      return {
        weekNumber: weekInfo.weekNumber,
        start: this.formatDate(weekStart),
        end: this.formatDate(weekEnd),
        days
      }
    },
    
    comparisonData() {
      if (!this.selectedDate) return []
      
      const date = new Date(this.selectedDate)
      
      return [
        {
          code: 'ISO',
          name: 'ISO 8601',
          weekNumber: this.calculateWeekNumber(date, 'ISO').weekNumber,
          startDay: '星期一',
          definition: '包含1月4日的周为第1周'
        },
        {
          code: 'US',
          name: '美国标准',
          weekNumber: this.calculateWeekNumber(date, 'US').weekNumber,
          startDay: '星期日',
          definition: '1月1日所在周为第1周'
        },
        {
          code: 'CN',
          name: '中国标准',
          weekNumber: this.calculateWeekNumber(date, 'CN').weekNumber,
          startDay: '星期一',
          definition: '1月1日所在周为第1周'
        }
      ]
    }
  },
  
  mounted() {
    this.setToday()
  },
  
  methods: {
    setToday() {
      const today = new Date()
      this.selectedDate = today.toISOString().split('T')[0]
    },
    
    calculateWeekNumber(date, standard) {
      const year = date.getFullYear()
      let weekNumber, weekStart, weekEnd
      
      if (standard === 'ISO') {
        // ISO 8601标准：周一为周起始，包含1月4日的周为第1周
        const jan4 = new Date(year, 0, 4)
        const jan4Day = (jan4.getDay() + 6) % 7 // 转换为周一=0的格式
        const firstMonday = new Date(jan4.getTime() - jan4Day * 24 * 60 * 60 * 1000)
        
        const daysDiff = Math.floor((date.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000))
        weekNumber = Math.floor(daysDiff / 7) + 1
        
        // 如果是负数或0，说明属于前一年
        if (weekNumber <= 0) {
          const prevYear = year - 1
          const prevYearLastWeek = this.getTotalWeeksInYear(prevYear, 'ISO')
          weekNumber = prevYearLastWeek
        }
        
        // 如果超过当年总周数，说明属于下一年
        const totalWeeks = this.getTotalWeeksInYear(year, 'ISO')
        if (weekNumber > totalWeeks) {
          weekNumber = 1
        }
        
        // 计算周的起始和结束日期
        const currentWeekStart = new Date(firstMonday.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)
        weekStart = this.formatDate(currentWeekStart)
        weekEnd = this.formatDate(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000))
        
      } else if (standard === 'US') {
        // 美国标准：周日为周起始，1月1日所在周为第1周
        const jan1 = new Date(year, 0, 1)
        const jan1Day = jan1.getDay()
        const firstSunday = new Date(jan1.getTime() - jan1Day * 24 * 60 * 60 * 1000)
        
        const daysDiff = Math.floor((date.getTime() - firstSunday.getTime()) / (24 * 60 * 60 * 1000))
        weekNumber = Math.floor(daysDiff / 7) + 1
        
        const currentWeekStart = new Date(firstSunday.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)
        weekStart = this.formatDate(currentWeekStart)
        weekEnd = this.formatDate(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000))
        
      } else if (standard === 'CN') {
        // 中国标准：周一为周起始，1月1日所在周为第1周
        const jan1 = new Date(year, 0, 1)
        const jan1Day = (jan1.getDay() + 6) % 7 // 转换为周一=0的格式
        const firstMonday = new Date(jan1.getTime() - jan1Day * 24 * 60 * 60 * 1000)
        
        const daysDiff = Math.floor((date.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000))
        weekNumber = Math.floor(daysDiff / 7) + 1
        
        const currentWeekStart = new Date(firstMonday.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)
        weekStart = this.formatDate(currentWeekStart)
        weekEnd = this.formatDate(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000))
      }
      
      return {
        weekNumber,
        year,
        weekStart,
        weekEnd,
        weekStartDate: weekStart,
        weekEndDate: weekEnd
      }
    },
    
    getTotalWeeksInYear(year, standard) {
      if (standard === 'ISO') {
        // ISO标准：检查1月1日和12月31日的周数
        const jan1 = new Date(year, 0, 1)
        const dec31 = new Date(year, 11, 31)
        
        // 1月4日决定第一周
        const jan4 = new Date(year, 0, 4)
        const jan4Day = (jan4.getDay() + 6) % 7
        const firstMonday = new Date(jan4.getTime() - jan4Day * 24 * 60 * 60 * 1000)
        
        // 计算12月31日属于第几周
        const daysDiff = Math.floor((dec31.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000))
        const weekNum = Math.floor(daysDiff / 7) + 1
        
        return weekNum > 52 ? 53 : 52
      } else {
        // 其他标准通常是52或53周
        return 52
      }
    },
    
    calculateYearProgress(date, weekNumber) {
      const totalWeeks = this.getTotalWeeksInYear(date.getFullYear(), this.weekStandard)
      return (weekNumber / totalWeeks) * 100
    },
    
    calculateWorkWeeks(year) {
      // 粗略计算工作周数（排除一些主要节假日）
      const totalWeeks = this.getTotalWeeksInYear(year, this.weekStandard)
      // 假设有4-5周的节假日
      return Math.max(totalWeeks - 5, 47)
    },
    
    getDayName(dayOfWeek) {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return days[dayOfWeek]
    },
    
    getDayOfWeek(dayOfWeek, standard) {
      if (standard === 'US') {
        return dayOfWeek + 1 // 周日为第1天
      } else {
        return dayOfWeek === 0 ? 7 : dayOfWeek // 周一为第1天
      }
    },
    
    getStandardName(standard) {
      const names = {
        'ISO': 'ISO 8601',
        'US': '美国标准',
        'CN': '中国标准'
      }
      return names[standard] || standard
    },
    
    formatDate(date) {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-')
    },
    
    isSameDate(date1, date2) {
      return date1.toDateString() === date2.toDateString()
    },
    
    changeWeek(direction) {
      const currentDate = new Date(this.selectedDate)
      currentDate.setDate(currentDate.getDate() + direction * 7)
      this.selectedDate = currentDate.toISOString().split('T')[0]
    },
    
    selectDate(dateStr) {
      this.selectedDate = dateStr
    },
    
    quickQuery(type) {
      const year = this.selectedYear
      let targetDate
      
      switch (type) {
        case 'year-start':
          targetDate = new Date(year, 0, 1)
          break
        case 'year-end':
          targetDate = new Date(year, 11, 31)
          break
        case 'quarter-start':
          const currentQuarter = Math.floor(new Date().getMonth() / 3)
          targetDate = new Date(year, currentQuarter * 3, 1)
          break
        case 'month-start':
          targetDate = new Date(year, new Date().getMonth(), 1)
          break
        case 'week-53':
          // 查找第53周的日期
          targetDate = new Date(year, 11, 31)
          while (this.calculateWeekNumber(targetDate, this.weekStandard).weekNumber !== 53) {
            targetDate.setDate(targetDate.getDate() - 1)
            if (targetDate.getFullYear() < year) {
              targetDate = new Date(year, 11, 31)
              break
            }
          }
          break
        case 'leap-year':
          // 闰年的2月29日
          if (this.isLeapYear(year)) {
            targetDate = new Date(year, 1, 29)
          } else {
            targetDate = new Date(year, 1, 28)
          }
          break
        default:
          targetDate = new Date()
      }
      
      this.selectedDate = targetDate.toISOString().split('T')[0]
    },
    
    isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
    }
  }
}
</script>

<style scoped>
.week-number-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
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

.main-query-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
}

.date-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 20px;
  align-items: end;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.date-input,
.standard-select {
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.today-btn {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.today-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.week-result-section {
  margin-bottom: 30px;
}

.week-result-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.result-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.result-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.result-card.main-week {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-weight: 600;
  font-size: 1.1rem;
}

.card-content {
  font-size: 1rem;
}

.week-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.year {
  font-size: 1.2rem;
  font-weight: 700;
}

.standard {
  font-size: 0.9rem;
  opacity: 0.9;
}

.date-range {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: center;
}

.start-date,
.end-date {
  font-weight: 600;
  color: #2c3e50;
}

.separator {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.day-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: center;
}

.day-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.day-number {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
}

.year-stats-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
}

.year-stats-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 8px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.week-calendar-section {
  margin-bottom: 30px;
}

.week-calendar-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.nav-btn {
  padding: 8px 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.current-week-info {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.week-calendar {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.week-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
}

.week-range {
  font-size: 1.1rem;
  font-weight: 600;
  display: block;
  margin-bottom: 5px;
}

.week-number {
  font-size: 0.9rem;
  opacity: 0.9;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-cell {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.day-cell:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.day-cell.today {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.day-cell.selected {
  border-color: #3498db;
  background: #ebf3fd;
}

.day-cell.weekend {
  background: #fff3cd;
}

.day-cell.other-month {
  opacity: 0.5;
}

.day-number {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.day-name {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 3px;
}

.day-date {
  font-size: 0.9rem;
  font-weight: 500;
}

.quick-queries-section {
  margin-bottom: 30px;
}

.quick-queries-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.quick-btn {
  padding: 15px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.quick-btn:hover {
  border-color: #3498db;
  background: #ebf3fd;
  transform: translateY(-2px);
}

.quick-btn i {
  font-size: 1.2rem;
  color: #3498db;
}

.standards-comparison-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
}

.standards-comparison-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.comparison-table {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 80px 100px 2fr;
  gap: 15px;
  padding: 15px;
  background: #3498db;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 80px 100px 2fr;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  transition: background 0.3s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.standard-name {
  font-weight: 600;
  color: #2c3e50;
}

.week-number {
  color: #3498db;
  font-weight: 600;
}

.start-day {
  color: #7f8c8d;
}

.definition {
  color: #5a6c7d;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .week-number-tool {
    padding: 15px;
  }
  
  .main-query-section {
    padding: 20px;
  }
  
  .date-input-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .result-cards {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .calendar-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .days-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
  }
  
  .day-cell {
    padding: 10px 5px;
  }
  
  .quick-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .table-header > div,
  .table-row > div {
    padding: 5px 0;
  }
}
</style>
