<template>
  <div class="calendar-maker-tool">
    <div class="tool-header">
      <h3><i class="fas fa-calendar"></i> 日历生成器</h3>
      <p>生成自定义日历，支持多种样式和导出功能</p>
    </div>

    <!-- 设置面板 -->
    <div class="settings-panel">
      <div class="settings-row">
        <div class="setting-group">
          <label>年份</label>
          <input type="number" v-model.number="selectedYear" :min="1900" :max="2100" class="year-input">
        </div>
        <div class="setting-group">
          <label>月份</label>
          <select v-model="selectedMonth" class="month-select">
            <option v-for="(month, index) in months" :key="index" :value="index">
              {{ month }}
            </option>
          </select>
        </div>
        <div class="setting-group">
          <label>一周开始</label>
          <select v-model="weekStart" class="week-select">
            <option value="0">星期日</option>
            <option value="1">星期一</option>
          </select>
        </div>
      </div>

      <div class="settings-row">
        <div class="setting-group">
          <label>日历样式</label>
          <select v-model="calendarStyle" class="style-select">
            <option value="modern">现代风格</option>
            <option value="classic">经典风格</option>
            <option value="minimal">极简风格</option>
            <option value="colorful">彩色风格</option>
          </select>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" v-model="showWeekNumbers">
            <span>显示周数</span>
          </label>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" v-model="showHolidays">
            <span>显示节假日</span>
          </label>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="previousMonth" class="nav-btn">
          <i class="fas fa-chevron-left"></i> 上月
        </button>
        <button @click="currentMonth" class="nav-btn current">
          <i class="fas fa-calendar-day"></i> 本月
        </button>
        <button @click="nextMonth" class="nav-btn">
          下月 <i class="fas fa-chevron-right"></i>
        </button>
        <button @click="exportCalendar" class="export-btn">
          <i class="fas fa-download"></i> 导出
        </button>
      </div>
    </div>

    <!-- 日历显示 -->
    <div class="calendar-container" :class="calendarStyle">
      <div class="calendar-header">
        <h2>{{ selectedYear }}年{{ months[selectedMonth] }}</h2>
      </div>

      <div class="calendar-grid">
        <!-- 周数列（如果启用） -->
        <div v-if="showWeekNumbers" class="week-numbers-column">
          <div class="week-header">周</div>
          <div 
            v-for="weekNum in weekNumbers" 
            :key="weekNum"
            class="week-number"
          >
            {{ weekNum }}
          </div>
        </div>

        <!-- 主日历区域 -->
        <div class="calendar-main">
          <!-- 星期标题 -->
          <div class="weekdays-header">
            <div 
              v-for="day in weekdays" 
              :key="day"
              class="weekday-header"
            >
              {{ day }}
            </div>
          </div>

          <!-- 日期格子 -->
          <div class="dates-grid">
            <div 
              v-for="date in calendarDates" 
              :key="date.key"
              class="date-cell"
              :class="{
                'other-month': date.isOtherMonth,
                'today': date.isToday,
                'weekend': date.isWeekend,
                'holiday': date.isHoliday
              }"
            >
              <div class="date-number">{{ date.day }}</div>
              <div v-if="date.holidayName" class="holiday-name">{{ date.holidayName }}</div>
              <div v-if="date.specialEvent" class="special-event">{{ date.specialEvent }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 节假日图例 -->
      <div v-if="showHolidays" class="holidays-legend">
        <h4>节假日说明</h4>
        <div class="legend-items">
          <span class="legend-item holiday">节假日</span>
          <span class="legend-item weekend">周末</span>
          <span class="legend-item today">今天</span>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="calendar-stats">
      <div class="stat-card">
        <div class="stat-number">{{ monthStats.totalDays }}</div>
        <div class="stat-label">总天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ monthStats.workdays }}</div>
        <div class="stat-label">工作日</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ monthStats.weekends }}</div>
        <div class="stat-label">周末</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ monthStats.holidays }}</div>
        <div class="stat-label">节假日</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarMaker',
  data() {
    return {
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth(),
      weekStart: 1, // 0=周日, 1=周一
      calendarStyle: 'modern',
      showWeekNumbers: true,
      showHolidays: true,
      months: [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
      ],
      // 中国节假日数据
      holidays: {
        '2024-01-01': '元旦',
        '2024-02-10': '春节',
        '2024-02-11': '春节',
        '2024-02-12': '春节',
        '2024-02-13': '春节',
        '2024-02-14': '春节',
        '2024-02-15': '春节',
        '2024-02-16': '春节',
        '2024-02-17': '春节',
        '2024-04-04': '清明节',
        '2024-04-05': '清明节',
        '2024-04-06': '清明节',
        '2024-05-01': '劳动节',
        '2024-05-02': '劳动节',
        '2024-05-03': '劳动节',
        '2024-06-10': '端午节',
        '2024-09-15': '中秋节',
        '2024-09-16': '中秋节',
        '2024-09-17': '中秋节',
        '2024-10-01': '国庆节',
        '2024-10-02': '国庆节',
        '2024-10-03': '国庆节',
        '2024-10-04': '国庆节',
        '2024-10-05': '国庆节',
        '2024-10-06': '国庆节',
        '2024-10-07': '国庆节'
      }
    }
  },
  
  computed: {
    weekdays() {
      const days = ['日', '一', '二', '三', '四', '五', '六']
      if (this.weekStart === 1) {
        return [...days.slice(1), days[0]]
      }
      return days
    },
    
    calendarDates() {
      const year = this.selectedYear
      const month = this.selectedMonth
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const today = new Date()
      
      // 计算第一天是星期几
      let startDayOfWeek = firstDay.getDay()
      if (this.weekStart === 1) {
        startDayOfWeek = (startDayOfWeek + 6) % 7
      }
      
      const dates = []
      
      // 添加上月的日期（如果需要）
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(firstDay.getTime() - (i + 1) * 24 * 60 * 60 * 1000)
        dates.push(this.createDateObject(date, true))
      }
      
      // 添加本月的日期
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day)
        dates.push(this.createDateObject(date, false))
      }
      
      // 添加下月的日期（填满6周）
      const totalCells = 42
      while (dates.length < totalCells) {
        const lastDate = dates[dates.length - 1]
        const nextDate = new Date(lastDate.fullDate.getTime() + 24 * 60 * 60 * 1000)
        dates.push(this.createDateObject(nextDate, true))
      }
      
      return dates
    },
    
    weekNumbers() {
      const weeks = []
      for (let i = 0; i < 6; i++) {
        const weekStart = this.calendarDates[i * 7]
        if (weekStart) {
          weeks.push(this.getWeekNumber(weekStart.fullDate))
        }
      }
      return weeks
    },
    
    monthStats() {
      const currentMonthDates = this.calendarDates.filter(date => !date.isOtherMonth)
      const totalDays = currentMonthDates.length
      const workdays = currentMonthDates.filter(date => !date.isWeekend && !date.isHoliday).length
      const weekends = currentMonthDates.filter(date => date.isWeekend && !date.isHoliday).length
      const holidays = currentMonthDates.filter(date => date.isHoliday).length
      
      return { totalDays, workdays, weekends, holidays }
    }
  },
  
  methods: {
    createDateObject(date, isOtherMonth) {
      const today = new Date()
      const isToday = date.toDateString() === today.toDateString()
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const dateStr = date.toISOString().split('T')[0]
      const isHoliday = this.holidays.hasOwnProperty(dateStr)
      const holidayName = this.holidays[dateStr] || ''
      
      return {
        key: date.getTime(),
        day: date.getDate(),
        fullDate: date,
        isOtherMonth,
        isToday,
        isWeekend,
        isHoliday,
        holidayName,
        specialEvent: this.getSpecialEvent(date)
      }
    },
    
    getSpecialEvent(date) {
      // 可以在这里添加特殊事件，如生日、纪念日等
      return null
    },
    
    getWeekNumber(date) {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
      const daysSinceFirstDay = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000))
      return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7)
    },
    
    previousMonth() {
      if (this.selectedMonth === 0) {
        this.selectedMonth = 11
        this.selectedYear--
      } else {
        this.selectedMonth--
      }
    },
    
    nextMonth() {
      if (this.selectedMonth === 11) {
        this.selectedMonth = 0
        this.selectedYear++
      } else {
        this.selectedMonth++
      }
    },
    
    currentMonth() {
      const now = new Date()
      this.selectedYear = now.getFullYear()
      this.selectedMonth = now.getMonth()
    },
    
    exportCalendar() {
      // 生成可打印的HTML页面
      const calendarHtml = this.generatePrintableCalendar()
      const blob = new Blob([calendarHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `日历_${this.selectedYear}年${this.selectedMonth + 1}月.html`
      a.click()
      URL.revokeObjectURL(url)
    },
    
    generatePrintableCalendar() {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this.selectedYear}年${this.months[this.selectedMonth]}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .calendar { width: 100%; border-collapse: collapse; }
    .calendar th, .calendar td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    .calendar th { background-color: #f2f2f2; }
    .weekend { background-color: #ffe6e6; }
    .holiday { background-color: #ffcccc; font-weight: bold; }
    .today { background-color: #cce6ff; }
    .other-month { color: #ccc; }
    h1 { text-align: center; }
  </style>
</head>
<body>
  <h1>${this.selectedYear}年${this.months[this.selectedMonth]}</h1>
  <table class="calendar">
    <tr>
      ${this.weekdays.map(day => `<th>${day}</th>`).join('')}
    </tr>
    ${this.generateCalendarRows()}
  </table>
</body>
</html>`
    },
    
    generateCalendarRows() {
      let rows = ''
      for (let week = 0; week < 6; week++) {
        rows += '<tr>'
        for (let day = 0; day < 7; day++) {
          const dateIndex = week * 7 + day
          const date = this.calendarDates[dateIndex]
          if (date) {
            const classes = []
            if (date.isOtherMonth) classes.push('other-month')
            if (date.isToday) classes.push('today')
            if (date.isWeekend) classes.push('weekend')
            if (date.isHoliday) classes.push('holiday')
            
            rows += `<td class="${classes.join(' ')}">${date.day}${date.holidayName ? '<br><small>' + date.holidayName + '</small>' : ''}</td>`
          }
        }
        rows += '</tr>'
      }
      return rows
    }
  }
}
</script>

<style scoped>
.calendar-maker-tool {
  max-width: 1000px;
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

.settings-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  color: white;
}

.settings-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.setting-group label {
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.year-input,
.month-select,
.week-select,
.style-select {
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-btn,
.export-btn {
  padding: 10px 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
}

.nav-btn.current {
  background: rgba(46, 204, 113, 0.3);
}

.export-btn {
  background: rgba(52, 152, 219, 0.3);
}

.nav-btn:hover,
.export-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.calendar-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.calendar-header h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.calendar-grid {
  display: flex;
  gap: 20px;
}

.week-numbers-column {
  display: flex;
  flex-direction: column;
  min-width: 50px;
}

.week-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #7f8c8d;
  border-bottom: 2px solid #ecf0f1;
  margin-bottom: 5px;
}

.week-number {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #95a5a6;
  font-size: 0.9rem;
  border-bottom: 1px solid #ecf0f1;
}

.calendar-main {
  flex: 1;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 5px;
}

.weekday-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #2c3e50;
  background: #f8f9fa;
  border-radius: 8px;
}

.dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.date-cell {
  height: 80px;
  padding: 8px;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.date-cell:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.date-cell.other-month {
  color: #bdc3c7;
  background: #f8f9fa;
}

.date-cell.today {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  font-weight: 600;
}

.date-cell.weekend {
  background: linear-gradient(135deg, #ffe6e6, #ffcccc);
}

.date-cell.holiday {
  background: linear-gradient(135deg, #ffcccc, #ff9999);
  color: #c0392b;
  font-weight: 600;
}

.date-number {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.holiday-name,
.special-event {
  font-size: 0.7rem;
  line-height: 1.2;
  opacity: 0.9;
}

.holidays-legend {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.holidays-legend h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1rem;
}

.legend-items {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.legend-item.holiday {
  background: #ffcccc;
  color: #c0392b;
}

.legend-item.weekend {
  background: #ffe6e6;
  color: #e74c3c;
}

.legend-item.today {
  background: #3498db;
  color: white;
}

.calendar-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 8px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 1rem;
}

/* 样式主题 */
.calendar-container.classic {
  background: #f8f9fa;
  border: 2px solid #ddd;
}

.calendar-container.classic .date-cell {
  border: 1px solid #999;
  border-radius: 0;
}

.calendar-container.minimal .date-cell {
  border: none;
  border-radius: 0;
}

.calendar-container.minimal .weekday-header {
  background: transparent;
  border-bottom: 1px solid #ddd;
}

.calendar-container.colorful .date-cell.weekend {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
}

.calendar-container.colorful .date-cell.holiday {
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

@media (max-width: 768px) {
  .calendar-maker-tool {
    padding: 15px;
  }
  
  .settings-panel {
    padding: 20px;
  }
  
  .settings-row {
    flex-direction: column;
  }
  
  .calendar-container {
    padding: 15px;
  }
  
  .calendar-grid {
    flex-direction: column;
  }
  
  .week-numbers-column {
    display: none;
  }
  
  .date-cell {
    height: 60px;
    font-size: 0.9rem;
  }
  
  .calendar-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
