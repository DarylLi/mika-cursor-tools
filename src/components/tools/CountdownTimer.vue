<template>
  <div class="countdown-timer-tool">
    <div class="tool-header">
      <h3><i class="fas fa-hourglass-half"></i> 倒计时器</h3>
      <p>设置多个倒计时器，支持自定义时间、目标日期和提醒功能</p>
    </div>

    <!-- 新建倒计时 -->
    <div class="create-timer-section">
      <h4><i class="fas fa-plus-circle"></i> 创建倒计时</h4>
      <div class="timer-form">
        <div class="form-row">
          <div class="input-group">
            <label>倒计时名称</label>
            <input 
              type="text" 
              v-model="newTimer.name" 
              placeholder="输入倒计时名称..."
              class="name-input"
            >
          </div>
          <div class="input-group">
            <label>倒计时类型</label>
            <select v-model="newTimer.type" class="type-select">
              <option value="duration">时长倒计时</option>
              <option value="target">目标时间</option>
            </select>
          </div>
        </div>

        <!-- 时长倒计时设置 -->
        <div v-if="newTimer.type === 'duration'" class="duration-settings">
          <div class="time-inputs">
            <div class="time-input-group">
              <label>小时</label>
              <input 
                type="number" 
                v-model.number="newTimer.hours" 
                min="0" 
                max="23"
                class="time-input"
              >
            </div>
            <div class="time-input-group">
              <label>分钟</label>
              <input 
                type="number" 
                v-model.number="newTimer.minutes" 
                min="0" 
                max="59"
                class="time-input"
              >
            </div>
            <div class="time-input-group">
              <label>秒</label>
              <input 
                type="number" 
                v-model.number="newTimer.seconds" 
                min="0" 
                max="59"
                class="time-input"
              >
            </div>
          </div>
          
          <!-- 快速设置按钮 -->
          <div class="quick-presets">
            <button @click="setQuickTime(5, 0, 0)" class="preset-btn">5分钟</button>
            <button @click="setQuickTime(10, 0, 0)" class="preset-btn">10分钟</button>
            <button @click="setQuickTime(15, 0, 0)" class="preset-btn">15分钟</button>
            <button @click="setQuickTime(30, 0, 0)" class="preset-btn">30分钟</button>
            <button @click="setQuickTime(0, 1, 0)" class="preset-btn">1小时</button>
            <button @click="setQuickTime(0, 2, 0)" class="preset-btn">2小时</button>
          </div>
        </div>

        <!-- 目标时间设置 -->
        <div v-if="newTimer.type === 'target'" class="target-settings">
          <div class="target-inputs">
            <div class="input-group">
              <label>目标日期时间</label>
              <input 
                type="datetime-local" 
                v-model="newTimer.targetTime" 
                class="datetime-input"
              >
            </div>
          </div>
          
          <!-- 快速目标设置 -->
          <div class="quick-targets">
            <button @click="setQuickTarget('today-end')" class="preset-btn">今天结束</button>
            <button @click="setQuickTarget('tomorrow-start')" class="preset-btn">明天开始</button>
            <button @click="setQuickTarget('week-end')" class="preset-btn">本周结束</button>
            <button @click="setQuickTarget('month-end')" class="preset-btn">本月结束</button>
            <button @click="setQuickTarget('year-end')" class="preset-btn">年底</button>
          </div>
        </div>

        <!-- 提醒设置 -->
        <div class="notification-settings">
          <label class="checkbox-label">
            <input type="checkbox" v-model="newTimer.enableNotification">
            <span>启用到时提醒</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="newTimer.enableSound">
            <span>播放提示音</span>
          </label>
        </div>

        <button @click="createTimer" class="create-btn" :disabled="!canCreateTimer">
          <i class="fas fa-play"></i> 创建并启动
        </button>
      </div>
    </div>

    <!-- 活跃的倒计时列表 -->
    <div class="active-timers-section" v-if="timers.length > 0">
      <h4><i class="fas fa-list"></i> 活跃倒计时</h4>
      <div class="timers-grid">
        <div 
          v-for="timer in timers" 
          :key="timer.id"
          class="timer-card"
          :class="{ 
            finished: timer.status === 'finished',
            paused: timer.status === 'paused',
            warning: timer.timeLeft <= 60000 && timer.status === 'running'
          }"
        >
          <div class="timer-header">
            <h5 class="timer-name">{{ timer.name }}</h5>
            <div class="timer-actions">
              <button 
                @click="toggleTimer(timer.id)" 
                class="action-btn"
                :class="timer.status"
              >
                <i :class="timer.status === 'running' ? 'fas fa-pause' : 'fas fa-play'"></i>
              </button>
              <button @click="resetTimer(timer.id)" class="action-btn reset">
                <i class="fas fa-redo"></i>
              </button>
              <button @click="removeTimer(timer.id)" class="action-btn remove">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="timer-display">
            <div class="time-remaining">{{ formatTime(timer.timeLeft) }}</div>
            <div class="timer-info">
              <span v-if="timer.type === 'target'" class="target-info">
                目标: {{ formatDateTime(timer.targetTime) }}
              </span>
              <span v-else class="duration-info">
                总时长: {{ formatTime(timer.originalDuration) }}
              </span>
            </div>
          </div>

          <div class="timer-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getProgressPercentage(timer) + '%' }"
              ></div>
            </div>
            <div class="progress-text">{{ getProgressPercentage(timer).toFixed(1) }}%</div>
          </div>

          <div class="timer-status">
            <span class="status-badge" :class="timer.status">
              {{ getStatusText(timer.status) }}
            </span>
            <span v-if="timer.status === 'finished'" class="finish-time">
              完成于 {{ formatDateTime(timer.finishTime) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div class="history-section" v-if="finishedTimers.length > 0">
      <h4><i class="fas fa-history"></i> 历史记录</h4>
      <div class="history-list">
        <div 
          v-for="timer in finishedTimers" 
          :key="timer.id"
          class="history-item"
        >
          <div class="history-info">
            <span class="history-name">{{ timer.name }}</span>
            <span class="history-duration">{{ formatTime(timer.originalDuration) }}</span>
          </div>
          <div class="history-details">
            <span class="history-finish">{{ formatDateTime(timer.finishTime) }}</span>
            <button @click="recreateTimer(timer)" class="recreate-btn">
              <i class="fas fa-redo"></i> 重新创建
            </button>
          </div>
        </div>
      </div>
      <button @click="clearHistory" class="clear-history-btn">
        <i class="fas fa-trash-alt"></i> 清空历史
      </button>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <h4><i class="fas fa-chart-pie"></i> 统计信息</h4>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ totalTimersCreated }}</div>
          <div class="stat-label">总创建数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalTimeSpent }}</div>
          <div class="stat-label">总计时时长</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ activeTimersCount }}</div>
          <div class="stat-label">活跃倒计时</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ finishedTimersCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>

    <!-- 通知权限请求 -->
    <div v-if="showNotificationRequest" class="notification-request">
      <div class="request-content">
        <i class="fas fa-bell"></i>
        <h5>启用通知权限</h5>
        <p>允许显示桌面通知以便及时提醒倒计时结束</p>
        <div class="request-actions">
          <button @click="requestNotificationPermission" class="allow-btn">允许</button>
          <button @click="hideNotificationRequest" class="deny-btn">拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CountdownTimer',
  data() {
    return {
      newTimer: {
        name: '',
        type: 'duration',
        hours: 0,
        minutes: 5,
        seconds: 0,
        targetTime: '',
        enableNotification: true,
        enableSound: true
      },
      timers: [],
      finishedTimers: [],
      nextId: 1,
      updateInterval: null,
      showNotificationRequest: false
    }
  },
  
  computed: {
    canCreateTimer() {
      if (!this.newTimer.name.trim()) return false
      
      if (this.newTimer.type === 'duration') {
        return this.newTimer.hours > 0 || this.newTimer.minutes > 0 || this.newTimer.seconds > 0
      } else {
        return this.newTimer.targetTime && new Date(this.newTimer.targetTime) > new Date()
      }
    },
    
    totalTimersCreated() {
      return this.timers.length + this.finishedTimers.length
    },
    
    totalTimeSpent() {
      const total = this.finishedTimers.reduce((sum, timer) => sum + timer.originalDuration, 0)
      return this.formatTime(total)
    },
    
    activeTimersCount() {
      return this.timers.filter(timer => timer.status === 'running').length
    },
    
    finishedTimersCount() {
      return this.finishedTimers.length
    }
  },
  
  mounted() {
    this.startUpdateLoop()
    this.checkNotificationPermission()
    this.loadFromStorage()
  },
  
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.saveToStorage()
  },
  
  methods: {
    setQuickTime(minutes, hours, seconds) {
      this.newTimer.minutes = minutes
      this.newTimer.hours = hours
      this.newTimer.seconds = seconds
    },
    
    setQuickTarget(type) {
      const now = new Date()
      let target
      
      switch (type) {
        case 'today-end':
          target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
          break
        case 'tomorrow-start':
          target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
          break
        case 'week-end':
          const daysToSunday = (7 - now.getDay()) % 7
          target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToSunday, 23, 59, 59)
          break
        case 'month-end':
          target = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
          break
        case 'year-end':
          target = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
          break
        default:
          target = new Date(now.getTime() + 60 * 60 * 1000)
      }
      
      this.newTimer.targetTime = target.toISOString().slice(0, 16)
    },
    
    createTimer() {
      let duration, targetTime
      
      if (this.newTimer.type === 'duration') {
        duration = (this.newTimer.hours * 3600 + this.newTimer.minutes * 60 + this.newTimer.seconds) * 1000
        targetTime = new Date(Date.now() + duration)
      } else {
        targetTime = new Date(this.newTimer.targetTime)
        duration = targetTime.getTime() - Date.now()
      }
      
      const timer = {
        id: this.nextId++,
        name: this.newTimer.name,
        type: this.newTimer.type,
        originalDuration: duration,
        timeLeft: duration,
        targetTime: targetTime,
        status: 'running',
        enableNotification: this.newTimer.enableNotification,
        enableSound: this.newTimer.enableSound,
        startTime: Date.now(),
        pausedTime: 0
      }
      
      this.timers.push(timer)
      this.resetNewTimer()
    },
    
    resetNewTimer() {
      this.newTimer = {
        name: '',
        type: 'duration',
        hours: 0,
        minutes: 5,
        seconds: 0,
        targetTime: '',
        enableNotification: true,
        enableSound: true
      }
    },
    
    toggleTimer(id) {
      const timer = this.timers.find(t => t.id === id)
      if (!timer) return
      
      if (timer.status === 'running') {
        timer.status = 'paused'
        timer.pausedTime = Date.now()
      } else if (timer.status === 'paused') {
        const pauseDuration = Date.now() - timer.pausedTime
        timer.targetTime = new Date(timer.targetTime.getTime() + pauseDuration)
        timer.status = 'running'
      }
    },
    
    resetTimer(id) {
      const timer = this.timers.find(t => t.id === id)
      if (!timer) return
      
      timer.timeLeft = timer.originalDuration
      timer.targetTime = new Date(Date.now() + timer.originalDuration)
      timer.status = 'running'
      timer.startTime = Date.now()
      timer.pausedTime = 0
    },
    
    removeTimer(id) {
      this.timers = this.timers.filter(t => t.id !== id)
    },
    
    recreateTimer(historyTimer) {
      const timer = {
        id: this.nextId++,
        name: historyTimer.name + ' (重新创建)',
        type: historyTimer.type,
        originalDuration: historyTimer.originalDuration,
        timeLeft: historyTimer.originalDuration,
        targetTime: new Date(Date.now() + historyTimer.originalDuration),
        status: 'running',
        enableNotification: historyTimer.enableNotification,
        enableSound: historyTimer.enableSound,
        startTime: Date.now(),
        pausedTime: 0
      }
      
      this.timers.push(timer)
    },
    
    startUpdateLoop() {
      this.updateInterval = setInterval(() => {
        this.updateTimers()
      }, 100)
    },
    
    updateTimers() {
      const now = Date.now()
      
      this.timers.forEach(timer => {
        if (timer.status === 'running') {
          timer.timeLeft = timer.targetTime.getTime() - now
          
          if (timer.timeLeft <= 0) {
            timer.timeLeft = 0
            timer.status = 'finished'
            timer.finishTime = new Date()
            this.onTimerFinished(timer)
          }
        }
      })
      
      // 移动已完成的计时器到历史记录
      const finishedTimers = this.timers.filter(t => t.status === 'finished')
      if (finishedTimers.length > 0) {
        this.finishedTimers.unshift(...finishedTimers)
        this.timers = this.timers.filter(t => t.status !== 'finished')
      }
    },
    
    onTimerFinished(timer) {
      if (timer.enableNotification) {
        this.showNotification(timer)
      }
      
      if (timer.enableSound) {
        this.playNotificationSound()
      }
    },
    
    formatTime(milliseconds) {
      const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
    },
    
    formatDateTime(date) {
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    
    getProgressPercentage(timer) {
      if (timer.originalDuration === 0) return 100
      const elapsed = timer.originalDuration - timer.timeLeft
      return Math.max(0, Math.min(100, (elapsed / timer.originalDuration) * 100))
    },
    
    getStatusText(status) {
      const statusMap = {
        running: '运行中',
        paused: '已暂停',
        finished: '已完成'
      }
      return statusMap[status] || status
    },
    
    checkNotificationPermission() {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          this.showNotificationRequest = true
        }
      }
    },
    
    requestNotificationPermission() {
      Notification.requestPermission().then(permission => {
        this.showNotificationRequest = false
      })
    },
    
    hideNotificationRequest() {
      this.showNotificationRequest = false
    },
    
    showNotification(timer) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`倒计时结束: ${timer.name}`, {
          body: '计时器已到达设定时间',
          icon: '/favicon.ico'
        })
      }
    },
    
    playNotificationSound() {
      // 创建简单的提示音
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1)
    },
    
    clearHistory() {
      this.finishedTimers = []
    },
    
    saveToStorage() {
      const data = {
        timers: this.timers,
        finishedTimers: this.finishedTimers,
        nextId: this.nextId
      }
      localStorage.setItem('countdown-timers', JSON.stringify(data))
    },
    
    loadFromStorage() {
      const stored = localStorage.getItem('countdown-timers')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          this.timers = data.timers || []
          this.finishedTimers = data.finishedTimers || []
          this.nextId = data.nextId || 1
          
          // 恢复定时器状态
          this.timers.forEach(timer => {
            timer.targetTime = new Date(timer.targetTime)
          })
        } catch (error) {
          console.error('加载定时器数据失败:', error)
        }
      }
    }
  },
  
  watch: {
    timers: {
      handler() {
        this.saveToStorage()
      },
      deep: true
    },
    finishedTimers: {
      handler() {
        this.saveToStorage()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.countdown-timer-tool {
  max-width: 1200px;
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

.create-timer-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 10px;
  margin-bottom: 10px;
  color: white;
}

.create-timer-section h4 {
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.timer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
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

.name-input,
.type-select,
.datetime-input {
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.duration-settings,
.target-settings {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 10px;
}

.time-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 10px;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: center;
}

.time-input {
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-weight: 600;
}

.quick-presets,
.quick-targets {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  transform: translateY(-1px);
}

.target-inputs {
  margin-bottom: 10px;
}

.notification-settings {
  display: flex;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
}

.create-btn {
  padding: 10px;
  background: #2ecc71;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.create-btn:hover:not(:disabled) {
  background: #27ae60;
  transform: translateY(-2px);
}

.create-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.active-timers-section {
  margin-bottom: 10px;
}

.active-timers-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.timers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.timer-card {
  background: white;
  border-radius: 15px;
  padding: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.timer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.timer-card.warning {
  border-color: #f39c12;
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
}

.timer-card.finished {
  border-color: #27ae60;
  background: linear-gradient(135deg, #d5f5d5 0%, #c3f0c3 100%);
}

.timer-card.paused {
  border-color: #95a5a6;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.timer-name {
  color: #2c3e50;
  font-size: 1.2rem;
  margin: 0;
}

.timer-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.action-btn.running {
  background: #e74c3c;
  color: white;
}

.action-btn.paused {
  background: #2ecc71;
  color: white;
}

.action-btn.reset {
  background: #3498db;
  color: white;
}

.action-btn.remove {
  background: #95a5a6;
  color: white;
}

.action-btn:hover {
  transform: scale(1.1);
}

.timer-display {
  text-align: center;
  margin-bottom: 10px;
}

.time-remaining {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.timer-card.warning .time-remaining {
  color: #f39c12;
}

.timer-card.finished .time-remaining {
  color: #27ae60;
}

.timer-info {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.timer-progress {
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.3s ease;
}

.timer-card.warning .progress-fill {
  background: linear-gradient(90deg, #f39c12, #e67e22);
}

.timer-card.finished .progress-fill {
  background: #27ae60;
}

.progress-text {
  text-align: center;
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
}

.timer-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.running {
  background: #2ecc71;
  color: white;
}

.status-badge.paused {
  background: #f39c12;
  color: white;
}

.status-badge.finished {
  background: #3498db;
  color: white;
}

.finish-time {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.history-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 10px;
  margin-bottom: 10px;
}

.history-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.history-item {
  background: white;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.history-name {
  font-weight: 600;
  color: #2c3e50;
}

.history-duration {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.history-details {
  display: flex;
  align-items: center;
  gap: 15px;
}

.history-finish {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.recreate-btn {
  padding: 10px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.recreate-btn:hover {
  background: #2980b9;
}

.clear-history-btn {
  padding: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.clear-history-btn:hover {
  background: #c0392b;
}

.stats-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 10px;
}

.stats-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
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
  padding: 10px;
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
  margin-bottom: 10px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.notification-request {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 15px;
  padding: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  text-align: center;
  max-width: 400px;
}

.request-content i {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 10px;
}

.request-content h5 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.request-content p {
  color: #7f8c8d;
  margin-bottom: 10px;
  line-height: 1.5;
}

.request-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.allow-btn {
  padding: 10px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.allow-btn:hover {
  background: #27ae60;
}

.deny-btn {
  padding: 10px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.deny-btn:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .countdown-timer-tool {
    padding: 10px;
  }
  
  .create-timer-section {
    padding: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .time-inputs {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .quick-presets,
  .quick-targets {
    justify-content: center;
  }
  
  .timers-grid {
    grid-template-columns: 1fr;
  }
  
  .timer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .time-remaining {
    font-size: 2rem;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .history-details {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .notification-request {
    margin: 20px;
    max-width: calc(100% - 40px);
  }
}
/* Input 输入框统一样式 */
/* Checkbox 统一样式 */
input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}
/* Checkbox 统一样式 */
input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}
/* Input 和 Select 统一样式 */
input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
input[type="url"],
input[type="search"],
input[type="tel"],
select {
  background: #fff;
}
</style>
