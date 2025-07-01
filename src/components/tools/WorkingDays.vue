<template>
  <div class="working-days-tool">
    <div class="tool-header">
      <h3><i class="fas fa-briefcase"></i> 工作日计算器</h3>
      <p>计算两个日期之间的工作日数量，排除周末和节假日</p>
    </div>

    <!-- 主要计算区域 -->
    <div class="main-calc-section">
      <div class="date-inputs">
        <div class="input-group">
          <label>开始日期</label>
          <input 
            type="date" 
            v-model="startDate" 
            class="date-input"
          >
        </div>
        <div class="input-group">
          <label>结束日期</label>
          <input 
            type="date" 
            v-model="endDate" 
            class="date-input"
          >
        </div>
        <div class="input-group">
          <label>工作制度</label>
          <select v-model="workSchedule" class="schedule-select">
            <option value="5">五天工作制</option>
            <option value="6">六天工作制</option>
            <option value="custom">自定义</option>
          </select>
        </div>
      </div>

      <!-- 自定义工作日设置 -->
      <div v-if="workSchedule === 'custom'" class="custom-schedule">
        <label>选择工作日:</label>
        <div class="weekdays-selector">
          <label v-for="(day, index) in weekdays" :key="index" class="weekday-label">
            <input type="checkbox" v-model="workingDays[index]">
            <span>{{ day }}</span>
          </label>
        </div>
      </div>

      <!-- 节假日设置 -->
      <div class="holidays-section">
        <div class="holidays-header">
          <label>
            <input type="checkbox" v-model="excludeHolidays">
            <span>排除中国法定节假日</span>
          </label>
          <button @click="showCustomHolidays = !showCustomHolidays" class="toggle-btn">
            自定义节假日
          </button>
        </div>
        
        <div v-if="showCustomHolidays" class="custom-holidays">
          <div class="holiday-input">
            <input 
              type="date" 
              v-model="newHoliday" 
              placeholder="添加节假日"
              class="holiday-date-input"
            >
            <button @click="addHoliday" class="add-btn">添加</button>
          </div>
          <div class="holidays-list">
            <span 
              v-for="(holiday, index) in customHolidays" 
              :key="index"
              class="holiday-tag"
            >
              {{ holiday }}
              <button @click="removeHoliday(index)" class="remove-btn">×</button>
            </span>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <button @click="setThisMonth" class="action-btn">本月</button>
        <button @click="setThisQuarter" class="action-btn">本季度</button>
        <button @click="setThisYear" class="action-btn">本年</button>
        <button @click="setNext30Days" class="action-btn">未来30天</button>
      </div>
    </div>

    <!-- 计算结果 -->
    <div class="result-section" v-if="calculationResult">
      <h4><i class="fas fa-chart-line"></i> 计算结果</h4>
      <div class="result-grid">
        <div class="result-card main">
          <div class="result-number">{{ calculationResult.workingDays }}</div>
          <div class="result-label">工作日</div>
        </div>
        <div class="result-card">
          <div class="result-number">{{ calculationResult.totalDays }}</div>
          <div class="result-label">总天数</div>
        </div>
        <div class="result-card">
          <div class="result-number">{{ calculationResult.weekends }}</div>
          <div class="result-label">周末</div>
        </div>
        <div class="result-card">
          <div class="result-number">{{ calculationResult.holidays }}</div>
          <div class="result-label">节假日</div>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill working" :style="{ width: workingDaysPercentage + '%' }"></div>
          <div class="progress-fill weekend" :style="{ width: weekendPercentage + '%' }"></div>
        </div>
        <div class="progress-legend">
          <span class="legend-item working">工作日 {{ workingDaysPercentage.toFixed(1) }}%</span>
          <span class="legend-item weekend">非工作日 {{ (100 - workingDaysPercentage).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- 详细分析 -->
    <div class="analysis-section" v-if="monthlyBreakdown.length > 0">
      <h4><i class="fas fa-calendar-alt"></i> 月度分析</h4>
      <div class="monthly-grid">
        <div 
          v-for="month in monthlyBreakdown" 
          :key="month.month"
          class="month-card"
        >
          <div class="month-header">{{ month.month }}</div>
          <div class="month-stats">
            <div class="stat-item">
              <span class="stat-label">工作日:</span>
              <span class="stat-value">{{ month.workingDays }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总天数:</span>
              <span class="stat-value">{{ month.totalDays }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工作日提醒 -->
    <div class="tips-section">
      <h4><i class="fas fa-lightbulb"></i> 实用提醒</h4>
      <div class="tips-grid">
        <div class="tip-card">
          <i class="fas fa-clock"></i>
          <div class="tip-content">
            <h5>工作时间计算</h5>
            <p>按每天8小时计算，总工作时间约 {{ totalWorkingHours }} 小时</p>
          </div>
        </div>
        <div class="tip-card">
          <i class="fas fa-money-bill-wave"></i>
          <div class="tip-content">
            <h5>薪资周期</h5>
            <p>如果按月薪计算，平均每个工作日价值约为月薪的 1/22</p>
          </div>
        </div>
        <div class="tip-card">
          <i class="fas fa-calendar-week"></i>
          <div class="tip-content">
            <h5>工作周数</h5>
            <p>约包含 {{ Math.ceil((calculationResult?.workingDays || 0) / 5) }} 个完整工作周</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkingDays',
  data() {
    return {
      startDate: '',
      endDate: '',
      workSchedule: '5',
      workingDays: [false, true, true, true, true, true, false], // 周日到周六
      excludeHolidays: true,
      showCustomHolidays: false,
      newHoliday: '',
      customHolidays: [],
      weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      // 2024年中国法定节假日（示例）
      chineseHolidays: [
        '2024-01-01', // 元旦
        '2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13', '2024-02-14', '2024-02-15', '2024-02-16', '2024-02-17', // 春节
        '2024-04-04', '2024-04-05', '2024-04-06', // 清明节
        '2024-05-01', '2024-05-02', '2024-05-03', // 劳动节
        '2024-06-10', // 端午节
        '2024-09-15', '2024-09-16', '2024-09-17', // 中秋节
        '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04', '2024-10-05', '2024-10-06', '2024-10-07' // 国庆节
      ]
    }
  },
  
  computed: {
    currentWorkingDays() {
      if (this.workSchedule === '5') {
        return [false, true, true, true, true, true, false]
      } else if (this.workSchedule === '6') {
        return [false, true, true, true, true, true, true]
      } else {
        return this.workingDays
      }
    },
    
    calculationResult() {
      if (!this.startDate || !this.endDate) return null
      
      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      
      if (start > end) return null
      
      let totalDays = 0
      let workingDays = 0
      let weekends = 0
      let holidays = 0
      
      const current = new Date(start)
      
      while (current <= end) {
        totalDays++
        
        const dayOfWeek = current.getDay()
        const dateStr = current.toISOString().split('T')[0]
        
        let isHoliday = false
        if (this.excludeHolidays && this.chineseHolidays.includes(dateStr)) {
          isHoliday = true
          holidays++
        }
        if (this.customHolidays.includes(dateStr)) {
          isHoliday = true
          holidays++
        }
        
        if (!isHoliday && this.currentWorkingDays[dayOfWeek]) {
          workingDays++
        } else if (!isHoliday && !this.currentWorkingDays[dayOfWeek]) {
          weekends++
        }
        
        current.setDate(current.getDate() + 1)
      }
      
      return {
        totalDays,
        workingDays,
        weekends,
        holidays
      }
    },
    
    workingDaysPercentage() {
      if (!this.calculationResult) return 0
      return (this.calculationResult.workingDays / this.calculationResult.totalDays) * 100
    },
    
    weekendPercentage() {
      if (!this.calculationResult) return 0
      return ((this.calculationResult.weekends + this.calculationResult.holidays) / this.calculationResult.totalDays) * 100
    },
    
    totalWorkingHours() {
      return this.calculationResult ? this.calculationResult.workingDays * 8 : 0
    },
    
    monthlyBreakdown() {
      if (!this.startDate || !this.endDate) return []
      
      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      const months = []
      
      const current = new Date(start.getFullYear(), start.getMonth(), 1)
      
      while (current <= end) {
        const monthStart = new Date(Math.max(current.getTime(), start.getTime()))
        const monthEnd = new Date(Math.min(new Date(current.getFullYear(), current.getMonth() + 1, 0).getTime(), end.getTime()))
        
        let workingDays = 0
        let totalDays = 0
        
        const tempDate = new Date(monthStart)
        while (tempDate <= monthEnd) {
          totalDays++
          const dayOfWeek = tempDate.getDay()
          const dateStr = tempDate.toISOString().split('T')[0]
          
          let isHoliday = false
          if (this.excludeHolidays && this.chineseHolidays.includes(dateStr)) {
            isHoliday = true
          }
          if (this.customHolidays.includes(dateStr)) {
            isHoliday = true
          }
          
          if (!isHoliday && this.currentWorkingDays[dayOfWeek]) {
            workingDays++
          }
          
          tempDate.setDate(tempDate.getDate() + 1)
        }
        
        months.push({
          month: current.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
          workingDays,
          totalDays
        })
        
        current.setMonth(current.getMonth() + 1)
      }
      
      return months
    }
  },
  
  mounted() {
    this.setThisMonth()
  },
  
  methods: {
    setThisMonth() {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      this.startDate = startOfMonth.toISOString().split('T')[0]
      this.endDate = endOfMonth.toISOString().split('T')[0]
    },
    
    setThisQuarter() {
      const now = new Date()
      const quarter = Math.floor(now.getMonth() / 3)
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1)
      const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0)
      
      this.startDate = startOfQuarter.toISOString().split('T')[0]
      this.endDate = endOfQuarter.toISOString().split('T')[0]
    },
    
    setThisYear() {
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const endOfYear = new Date(now.getFullYear(), 11, 31)
      
      this.startDate = startOfYear.toISOString().split('T')[0]
      this.endDate = endOfYear.toISOString().split('T')[0]
    },
    
    setNext30Days() {
      const now = new Date()
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      this.startDate = now.toISOString().split('T')[0]
      this.endDate = end.toISOString().split('T')[0]
    },
    
    addHoliday() {
      if (this.newHoliday && !this.customHolidays.includes(this.newHoliday)) {
        this.customHolidays.push(this.newHoliday)
        this.newHoliday = ''
      }
    },
    
    removeHoliday(index) {
      this.customHolidays.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.working-days-tool {
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

.main-calc-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  color: white;
}

.date-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 600;
  font-size: 0.9rem;
}

.date-input,
.schedule-select {
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.custom-schedule {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
}

.weekdays-selector {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.weekday-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.holidays-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
}

.holidays-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.toggle-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
}

.custom-holidays {
  margin-top: 15px;
}

.holiday-input {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.holiday-date-input {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.add-btn {
  padding: 8px 15px;
  background: #2ecc71;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.holidays-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.holiday-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 15px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-btn {
  background: rgba(231, 76, 60, 0.7);
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.quick-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.result-section {
  margin-bottom: 30px;
}

.result-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.result-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.result-card.main {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.result-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.result-label {
  font-size: 1rem;
  opacity: 0.8;
}

.progress-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
}

.progress-bar {
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
  display: flex;
}

.progress-fill.working {
  background: #2ecc71;
}

.progress-fill.weekend {
  background: #e74c3c;
}

.progress-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.legend-item.working::before {
  content: '';
  width: 12px;
  height: 12px;
  background: #2ecc71;
  border-radius: 2px;
}

.legend-item.weekend::before {
  content: '';
  width: 12px;
  height: 12px;
  background: #e74c3c;
  border-radius: 2px;
}

.analysis-section {
  margin-bottom: 30px;
}

.analysis-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.monthly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.month-card {
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.month-header {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.month-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.stat-label {
  color: #7f8c8d;
}

.stat-value {
  font-weight: 600;
  color: #2c3e50;
}

.tips-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
}

.tips-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.tip-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tip-card i {
  font-size: 2rem;
  color: #3498db;
  margin-top: 5px;
}

.tip-content h5 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 1rem;
}

.tip-content p {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .working-days-tool {
    padding: 15px;
  }
  
  .main-calc-section {
    padding: 20px;
  }
  
  .date-inputs {
    grid-template-columns: 1fr;
  }
  
  .weekdays-selector {
    flex-wrap: wrap;
  }
  
  .result-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
}
</style>
