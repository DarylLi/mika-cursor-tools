<template>
  <div class="age-calculator">
    <h2>年龄计算器</h2>
    <p>精确计算年龄、生日统计和人生里程碑</p>

    <!-- 输入区域 -->
    <div class="input-section">
      <div class="birthday-input">
        <div class="input-group">
          <label>出生日期</label>
          <input 
            type="date" 
            v-model="birthDate"
            @change="calculateAge"
            :max="today"
          >
        </div>
        
        <div class="input-group">
          <label>计算到日期（可选）</label>
          <input 
            type="date" 
            v-model="targetDate"
            @change="calculateAge"
          >
          <button @click="setToToday" class="today-btn">
            <i class="fas fa-calendar-day"></i> 今天
          </button>
        </div>
      </div>

      <!-- 快速设置 -->
      <div class="quick-settings">
        <h4>快速设置生日年份</h4>
        <div class="year-buttons">
          <button @click="setDecade(1990)" class="decade-btn">90后</button>
          <button @click="setDecade(2000)" class="decade-btn">00后</button>
          <button @click="setDecade(2010)" class="decade-btn">10后</button>
          <button @click="setDecade(1980)" class="decade-btn">80后</button>
          <button @click="setDecade(1970)" class="decade-btn">70后</button>
        </div>
      </div>
    </div>

    <!-- 结果显示区域 -->
    <div class="results-section" v-if="ageResult">
      <!-- 主要年龄显示 -->
      <div class="main-age-display">
        <div class="age-primary">
          <span class="age-number">{{ ageResult.years }}</span>
          <span class="age-unit">岁</span>
        </div>
        <div class="age-details">
          {{ ageResult.months }}个月 {{ ageResult.days }}天
        </div>
        <div class="precise-age">
          精确年龄：{{ ageResult.totalDays.toLocaleString() }}天
        </div>
      </div>

      <!-- 详细统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ ageResult.totalDays.toLocaleString() }}</div>
            <div class="stat-label">总天数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ ageResult.totalHours.toLocaleString() }}</div>
            <div class="stat-label">总小时数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-stopwatch"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ ageResult.totalMinutes.toLocaleString() }}</div>
            <div class="stat-label">总分钟数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-heartbeat"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ lifeStats.heartbeats.toLocaleString() }}</div>
            <div class="stat-label">心跳次数</div>
          </div>
        </div>
      </div>

      <!-- 生日信息 -->
      <div class="birthday-info">
        <h3>生日信息</h3>
        <div class="birthday-stats">
          <div class="birthday-item">
            <div class="birthday-label">出生星期</div>
            <div class="birthday-value">{{ birthdayInfo.dayOfWeek }}</div>
          </div>
          <div class="birthday-item">
            <div class="birthday-label">生肖</div>
            <div class="birthday-value">{{ birthdayInfo.zodiacAnimal }} {{ birthdayInfo.zodiacAnimalEmoji }}</div>
          </div>
          <div class="birthday-item">
            <div class="birthday-label">星座</div>
            <div class="birthday-value">{{ birthdayInfo.constellation }} {{ birthdayInfo.constellationEmoji }}</div>
          </div>
          <div class="birthday-item">
            <div class="birthday-label">下次生日</div>
            <div class="birthday-value">{{ birthdayInfo.nextBirthday }}</div>
          </div>
          <div class="birthday-item">
            <div class="birthday-label">距下次生日</div>
            <div class="birthday-value">{{ birthdayInfo.daysToNextBirthday }}天</div>
          </div>
          <div class="birthday-item">
            <div class="birthday-label">已过生日</div>
            <div class="birthday-value">{{ birthdayInfo.birthdaysPassed }}次</div>
          </div>
        </div>
      </div>

      <!-- 人生里程碑 -->
      <div class="milestones-section">
        <h3>人生里程碑</h3>
        <div class="milestones-grid">
          <div 
            v-for="milestone in milestones" 
            :key="milestone.name"
            class="milestone-card"
            :class="{ 'achieved': milestone.achieved, 'upcoming': !milestone.achieved }"
          >
            <div class="milestone-icon">
              <i :class="milestone.icon"></i>
            </div>
            <div class="milestone-content">
              <div class="milestone-name">{{ milestone.name }}</div>
              <div class="milestone-date">{{ milestone.date }}</div>
              <div class="milestone-status">
                <span v-if="milestone.achieved" class="achieved-text">
                  <i class="fas fa-check"></i> 已达成 ({{ milestone.daysAgo }}天前)
                </span>
                <span v-else class="upcoming-text">
                  <i class="fas fa-clock"></i> 还需 {{ milestone.daysLeft }}天
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 生命统计 -->
      <div class="life-statistics">
        <h3>生命统计 (估算)</h3>
        <div class="life-stats-grid">
          <div class="life-stat-item">
            <i class="fas fa-bed"></i>
            <div class="life-stat-content">
              <div class="life-stat-value">{{ lifeStats.sleepDays.toLocaleString() }}</div>
              <div class="life-stat-label">睡眠天数</div>
              <div class="life-stat-percent">约 {{ lifeStats.sleepPercent }}% 的人生</div>
            </div>
          </div>

          <div class="life-stat-item">
            <i class="fas fa-utensils"></i>
            <div class="life-stat-content">
              <div class="life-stat-value">{{ lifeStats.meals.toLocaleString() }}</div>
              <div class="life-stat-label">用餐次数</div>
              <div class="life-stat-percent">平均每天3餐</div>
            </div>
          </div>

          <div class="life-stat-item">
            <i class="fas fa-lungs"></i>
            <div class="life-stat-content">
              <div class="life-stat-value">{{ lifeStats.breaths.toLocaleString() }}</div>
              <div class="life-stat-label">呼吸次数</div>
              <div class="life-stat-percent">平均每分钟15次</div>
            </div>
          </div>

          <div class="life-stat-item">
            <i class="fas fa-tint"></i>
            <div class="life-stat-content">
              <div class="life-stat-value">{{ lifeStats.waterLiters.toLocaleString() }}</div>
              <div class="life-stat-label">饮水量(升)</div>
              <div class="life-stat-percent">平均每天2升</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgeCalculator',
  data() {
    return {
      birthDate: '',
      targetDate: '',
      ageResult: null,
      today: new Date().toISOString().split('T')[0]
    }
  },
  computed: {
    birthdayInfo() {
      if (!this.birthDate) return {}
      
      const birth = new Date(this.birthDate)
      const target = this.targetDate ? new Date(this.targetDate) : new Date()
      
      return {
        dayOfWeek: this.getDayOfWeek(birth),
        zodiacAnimal: this.getZodiacAnimal(birth.getFullYear()),
        zodiacAnimalEmoji: this.getZodiacAnimalEmoji(birth.getFullYear()),
        constellation: this.getConstellation(birth.getMonth() + 1, birth.getDate()),
        constellationEmoji: this.getConstellationEmoji(birth.getMonth() + 1, birth.getDate()),
        nextBirthday: this.getNextBirthday(birth, target),
        daysToNextBirthday: this.getDaysToNextBirthday(birth, target),
        birthdaysPassed: target.getFullYear() - birth.getFullYear()
      }
    },
    
    lifeStats() {
      if (!this.ageResult) return {}
      
      const days = this.ageResult.totalDays
      return {
        heartbeats: Math.round(days * 24 * 60 * 70),
        breaths: Math.round(days * 24 * 60 * 15),
        sleepDays: Math.round(days * 8 / 24),
        sleepPercent: ((8 / 24) * 100).toFixed(1),
        meals: Math.round(days * 3),
        waterLiters: Math.round(days * 2)
      }
    },
    
    milestones() {
      if (!this.birthDate) return []
      
      const birth = new Date(this.birthDate)
      const target = this.targetDate ? new Date(this.targetDate) : new Date()
      
      const milestones = [
        { name: '满1岁', days: 365, icon: 'fas fa-baby' },
        { name: '上小学', days: 365 * 6, icon: 'fas fa-school' },
        { name: '成年', days: 365 * 18, icon: 'fas fa-user-graduate' },
        { name: '大学毕业', days: 365 * 22, icon: 'fas fa-graduation-cap' },
        { name: '而立之年', days: 365 * 30, icon: 'fas fa-briefcase' },
        { name: '不惑之年', days: 365 * 40, icon: 'fas fa-lightbulb' },
        { name: '知天命', days: 365 * 50, icon: 'fas fa-star' },
        { name: '花甲之年', days: 365 * 60, icon: 'fas fa-crown' },
        { name: '古稀之年', days: 365 * 70, icon: 'fas fa-gem' },
        { name: '耄耋之年', days: 365 * 80, icon: 'fas fa-medal' }
      ]
      
      return milestones.map(milestone => {
        const milestoneDate = new Date(birth.getTime() + milestone.days * 24 * 60 * 60 * 1000)
        const achieved = target >= milestoneDate
        const daysDiff = Math.abs((target - milestoneDate) / (24 * 60 * 60 * 1000))
        
        return {
          ...milestone,
          date: milestoneDate.toLocaleDateString('zh-CN'),
          achieved,
          daysAgo: achieved ? Math.floor(daysDiff) : 0,
          daysLeft: achieved ? 0 : Math.ceil(daysDiff)
        }
      })
    }
  },
  mounted() {
    // 设置默认值
    this.targetDate = this.today
  },
  methods: {
    calculateAge() {
      if (!this.birthDate) {
        this.ageResult = null
        return
      }
      
      const birth = new Date(this.birthDate)
      const target = this.targetDate ? new Date(this.targetDate) : new Date()
      
      if (birth > target) {
        this.ageResult = null
        return
      }
      
      // 计算精确年龄
      let years = target.getFullYear() - birth.getFullYear()
      let months = target.getMonth() - birth.getMonth()
      let days = target.getDate() - birth.getDate()
      
      if (days < 0) {
        months--
        const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0)
        days += prevMonth.getDate()
      }
      
      if (months < 0) {
        years--
        months += 12
      }
      
      // 计算总的时间
      const timeDiff = target.getTime() - birth.getTime()
      const totalDays = Math.floor(timeDiff / (24 * 60 * 60 * 1000))
      const totalHours = Math.floor(timeDiff / (60 * 60 * 1000))
      const totalMinutes = Math.floor(timeDiff / (60 * 1000))
      
      this.ageResult = {
        years,
        months,
        days,
        totalDays,
        totalHours,
        totalMinutes
      }
    },
    
    setToToday() {
      this.targetDate = this.today
      this.calculateAge()
    },
    
    setDecade(startYear) {
      // 设置到该年代的中间年份的1月1日
      const year = startYear + 5
      this.birthDate = `${year}-01-01`
      this.calculateAge()
    },
    
    getDayOfWeek(date) {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return days[date.getDay()]
    },
    
    getZodiacAnimal(year) {
      const animals = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊']
      return animals[year % 12]
    },
    
    getZodiacAnimalEmoji(year) {
      const emojis = ['🐒', '🐓', '🐕', '🐷', '🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑']
      return emojis[year % 12]
    },
    
    getConstellation(month, day) {
      const constellations = [
        { name: '水瓶座', start: [1, 20], end: [2, 18] },
        { name: '双鱼座', start: [2, 19], end: [3, 20] },
        { name: '白羊座', start: [3, 21], end: [4, 19] },
        { name: '金牛座', start: [4, 20], end: [5, 20] },
        { name: '双子座', start: [5, 21], end: [6, 21] },
        { name: '巨蟹座', start: [6, 22], end: [7, 22] },
        { name: '狮子座', start: [7, 23], end: [8, 22] },
        { name: '处女座', start: [8, 23], end: [9, 22] },
        { name: '天秤座', start: [9, 23], end: [10, 23] },
        { name: '天蝎座', start: [10, 24], end: [11, 22] },
        { name: '射手座', start: [11, 23], end: [12, 21] },
        { name: '摩羯座', start: [12, 22], end: [1, 19] }
      ]
      
      for (const constellation of constellations) {
        const [startMonth, startDay] = constellation.start
        const [endMonth, endDay] = constellation.end
        
        if ((month === startMonth && day >= startDay) || 
            (month === endMonth && day <= endDay) ||
            (startMonth > endMonth && (month === startMonth || month === endMonth))) {
          return constellation.name
        }
      }
      
      return '摩羯座' // 默认
    },
    
    getConstellationEmoji(month, day) {
      const constellation = this.getConstellation(month, day)
      const emojis = {
        '白羊座': '♈', '金牛座': '♉', '双子座': '♊', '巨蟹座': '♋',
        '狮子座': '♌', '处女座': '♍', '天秤座': '♎', '天蝎座': '♏',
        '射手座': '♐', '摩羯座': '♑', '水瓶座': '♒', '双鱼座': '♓'
      }
      return emojis[constellation] || '♑'
    },
    
    getNextBirthday(birth, target) {
      const thisYear = target.getFullYear()
      let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate())
      
      if (nextBirthday <= target) {
        nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate())
      }
      
      return nextBirthday.toLocaleDateString('zh-CN')
    },
    
    getDaysToNextBirthday(birth, target) {
      const thisYear = target.getFullYear()
      let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate())
      
      if (nextBirthday <= target) {
        nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate())
      }
      
      return Math.ceil((nextBirthday - target) / (24 * 60 * 60 * 1000))
    }
  }
}
</script>

<style scoped>
.age-calculator {
  max-width: 1200px;
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

.birthday-input {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.input-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
}

.today-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.today-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.quick-settings h4 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.year-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.decade-btn {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.decade-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.main-age-display {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
}

.age-primary {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
}

.age-number {
  font-size: 4rem;
  font-weight: bold;
}

.age-unit {
  font-size: 2rem;
  opacity: 0.8;
}

.age-details {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.precise-age {
  font-size: 1.1rem;
  opacity: 0.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 15px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.birthday-info {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.birthday-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.birthday-item {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  text-align: center;
}

.birthday-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.birthday-value {
  font-weight: bold;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.milestones-section {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.milestones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.milestone-card {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.milestone-card.achieved {
  border-color: #4caf50;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
}

.milestone-card.upcoming {
  border-color: #ff9800;
  background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%);
}

.milestone-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.milestone-card.achieved .milestone-icon {
  background: #4caf50;
  color: white;
}

.milestone-card.upcoming .milestone-icon {
  background: #ff9800;
  color: white;
}

.milestone-name {
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.milestone-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.milestone-status {
  font-size: 0.8rem;
}

.achieved-text {
  color: #4caf50;
}

.upcoming-text {
  color: #ff9800;
}

.life-statistics {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.life-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.life-stat-item {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 15px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.life-stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.life-stat-item i {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
}

.life-stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

.life-stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.life-stat-percent {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .age-calculator {
    padding: 1rem;
  }

  .birthday-input {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .age-number {
    font-size: 3rem;
  }

  .age-unit {
    font-size: 1.5rem;
  }

  .age-details {
    font-size: 1.2rem;
  }

  .stats-grid,
  .birthday-stats,
  .milestones-grid,
  .life-stats-grid {
    grid-template-columns: 1fr;
  }

  .year-buttons {
    justify-content: center;
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
