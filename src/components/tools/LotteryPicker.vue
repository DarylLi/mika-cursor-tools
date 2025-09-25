<template>
  <div class="lottery-picker-tool">
    <div class="tool-header">
      <h3><i class="fas fa-gift"></i> 抽奖器工具</h3>
      <p>公平的随机抽奖工具，支持多种抽奖模式和权重设置</p>
    </div>

    <div class="tool-content">
      <div class="lottery-setup">
        <div class="setup-tabs">
          <button 
            @click="activeTab = 'simple'" 
            :class="{ active: activeTab === 'simple' }"
            class="tab-btn"
          >
            简单抽奖
          </button>
          <button 
            @click="activeTab = 'weighted'" 
            :class="{ active: activeTab === 'weighted' }"
            class="tab-btn"
          >
            权重抽奖
          </button>
          <button 
            @click="activeTab = 'multiple'" 
            :class="{ active: activeTab === 'multiple' }"
            class="tab-btn"
          >
            多次抽奖
          </button>
        </div>

        <div v-if="activeTab === 'simple'" class="simple-setup">
          <h4>简单抽奖</h4>
          <div class="participants-input">
            <label for="participantsList">参与者列表 (每行一个)</label>
            <textarea 
              id="participantsList"
              v-model="participantsList" 
              placeholder="张三&#10;李四&#10;王五&#10;赵六"
              rows="8"
              class="participants-textarea"
            ></textarea>
          </div>
          <div class="quick-add">
            <input 
              type="text" 
              v-model="newParticipant" 
              placeholder="快速添加参与者"
              @keyup.enter="addParticipant"
              class="quick-input"
            />
            <button @click="addParticipant" class="btn-secondary">
              <i class="fas fa-plus"></i> 添加
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'weighted'" class="weighted-setup">
          <h4>权重抽奖</h4>
          <div class="weighted-participants">
            <div 
              v-for="(participant, index) in weightedParticipants" 
              :key="index"
              class="weighted-item"
            >
              <input 
                type="text" 
                v-model="participant.name" 
                placeholder="参与者姓名"
                class="name-input"
              />
              <input 
                type="number" 
                v-model.number="participant.weight" 
                min="1" 
                max="100"
                placeholder="权重"
                class="weight-input"
              />
              <button @click="removeWeightedParticipant(index)" class="btn-icon remove-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <button @click="addWeightedParticipant" class="btn-secondary">
            <i class="fas fa-plus"></i> 添加参与者
          </button>
        </div>

        <div v-if="activeTab === 'multiple'" class="multiple-setup">
          <h4>多次抽奖</h4>
          <div class="multiple-controls">
            <div class="control-group">
              <label for="drawCount">抽奖次数</label>
              <input type="number" id="drawCount" v-model.number="drawCount" min="1" max="100" />
            </div>
            <div class="control-group">
              <label for="allowDuplicates">允许重复中奖</label>
              <input type="checkbox" id="allowDuplicates" v-model="allowDuplicates" />
            </div>
          </div>
          <div class="participants-input">
            <label for="multipleParticipantsList">参与者列表</label>
            <textarea 
              id="multipleParticipantsList"
              v-model="multipleParticipantsList" 
              placeholder="张三&#10;李四&#10;王五&#10;赵六"
              rows="6"
              class="participants-textarea"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="lottery-controls">
        <div class="control-options">
          <div class="option-group">
            <label for="animationSpeed">动画速度</label>
            <select id="animationSpeed" v-model="animationSpeed">
              <option value="fast">快速</option>
              <option value="normal">正常</option>
              <option value="slow">缓慢</option>
            </select>
          </div>
          <div class="option-group">
            <label for="soundEnabled">音效</label>
            <input type="checkbox" id="soundEnabled" v-model="soundEnabled" />
          </div>
        </div>
        
        <button @click="startLottery" :disabled="!canStartLottery" class="btn-primary lottery-btn">
          <i class="fas fa-play"></i> 开始抽奖
        </button>
      </div>

      <div class="lottery-display" v-if="isDrawing || lastResults.length">
        <div class="draw-animation" v-if="isDrawing">
          <div class="spinning-wheel">
            <div class="wheel-content">
              <div class="current-name">{{ currentDrawName }}</div>
              <div class="draw-progress">抽奖中...</div>
            </div>
          </div>
        </div>

        <div class="results-display" v-if="lastResults.length && !isDrawing">
          <h4>🎉 抽奖结果 🎉</h4>
          <div class="results-list">
            <div 
              v-for="(result, index) in lastResults" 
              :key="index"
              class="result-item"
              :class="{ 'result-highlight': index === 0 }"
            >
              <div class="result-rank">第{{ index + 1 }}名</div>
              <div class="result-name">{{ result.name }}</div>
              <div class="result-weight" v-if="result.weight">权重: {{ result.weight }}</div>
            </div>
          </div>
          
          <div class="result-actions">
            <button @click="redraw" class="btn-secondary">
              <i class="fas fa-redo"></i> 重新抽奖
            </button>
            <button @click="saveResults" class="btn-secondary">
              <i class="fas fa-save"></i> 保存结果
            </button>
            <button @click="shareResults" class="btn-secondary">
              <i class="fas fa-share"></i> 分享结果
            </button>
          </div>
        </div>
      </div>

      <div class="lottery-history" v-if="lotteryHistory.length">
        <h4>抽奖历史</h4>
        <div class="history-controls">
          <button @click="clearHistory" class="btn-secondary">
            <i class="fas fa-trash"></i> 清空历史
          </button>
          <button @click="exportHistory" class="btn-secondary">
            <i class="fas fa-download"></i> 导出历史
          </button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="(record, index) in lotteryHistory.slice(-5)" 
            :key="index"
            class="history-item"
          >
            <div class="history-header">
              <div class="history-date">{{ record.timestamp }}</div>
              <div class="history-type">{{ getTypeLabel(record.type) }}</div>
            </div>
            <div class="history-results">
              <span 
                v-for="(result, idx) in record.results.slice(0, 3)" 
                :key="idx"
                class="history-winner"
              >
                {{ result.name }}
              </span>
              <span v-if="record.results.length > 3" class="more-winners">
                +{{ record.results.length - 3 }}人
              </span>
            </div>
            <button @click="repeatLottery(record)" class="btn-icon repeat-btn" title="重复此抽奖">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="lottery-statistics" v-if="lotteryHistory.length > 3">
        <h4>统计信息</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ totalDraws }}</div>
            <div class="stat-label">总抽奖次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ uniqueWinners }}</div>
            <div class="stat-label">不同中奖者</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ averageParticipants.toFixed(1) }}</div>
            <div class="stat-label">平均参与人数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ luckyWinner }}</div>
            <div class="stat-label">最幸运者</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, getCurrentInstance } from 'vue'

export default {
  name: 'LotteryPicker',
  setup() {
    const instance = getCurrentInstance()
    const activeTab = ref('simple')
    const participantsList = ref('')
    const newParticipant = ref('')
    const weightedParticipants = ref([{ name: '', weight: 1 }])
    const multipleParticipantsList = ref('')
    const drawCount = ref(1)
    const allowDuplicates = ref(false)
    const animationSpeed = ref('normal')
    const soundEnabled = ref(true)
    const isDrawing = ref(false)
    const currentDrawName = ref('')
    const lastResults = ref([])
    const lotteryHistory = ref([])

    // 添加参与者
    const addParticipant = async () => {
      if (newParticipant.value.trim()) {
        if (participantsList.value) {
          participantsList.value += '\n' + newParticipant.value.trim()
        } else {
          participantsList.value = newParticipant.value.trim()
        }
        newParticipant.value = ''
      }
    }

    // 添加权重参与者
    const addWeightedParticipant = async () => {
      weightedParticipants.value.push({ name: '', weight: 1 })
    }

    // 移除权重参与者
    const removeWeightedParticipant = (index) => {
      if (weightedParticipants.value.length > 1) {
        weightedParticipants.value.splice(index, 1)
      }
    }

    // 获取参与者列表
    const getParticipants = async () => {
      switch (activeTab.value) {
        case 'simple':
          return participantsList.value.split('\n').filter(name => name.trim())
        case 'weighted':
          return weightedParticipants.value.filter(p => p.name.trim())
        case 'multiple':
          return multipleParticipantsList.value.split('\n').filter(name => name.trim())
        default:
          return []
      }
    }

    // 开始抽奖
    const startLottery = async () => {
      const participants = getParticipants()
      if (participants.length === 0) return

      isDrawing.value = true
      lastResults.value = []

      // 动画时长
      const animationDuration = {
        fast: 1000,
        normal: 2000,
        slow: 3000
      }[animationSpeed.value]

      // 动画过程
      const startTime = Date.now()
      const animationInterval = setInterval(() => {
        if (activeTab.value === 'weighted') {
          const randomParticipant = participants[Math.floor(Math.random() * participants.length)]
          currentDrawName.value = randomParticipant.name
        } else {
          currentDrawName.value = participants[Math.floor(Math.random() * participants.length)]
        }
      }, 100)

      // 等待动画结束
      setTimeout(() => {
        clearInterval(animationInterval)
        performDraw(participants)
        isDrawing.value = false
      }, animationDuration)
    }

    // 执行抽奖
    const performDraw = (participants) => {
      const results = []
      let availableParticipants = [...participants]

      const drawAmount = activeTab.value === 'multiple' ? drawCount.value : 1

      for (let i = 0; i < drawAmount; i++) {
        if (availableParticipants.length === 0) break

        let winner
        
        if (activeTab.value === 'weighted') {
          winner = drawWeighted(availableParticipants)
        } else {
          const randomIndex = Math.floor(Math.random() * availableParticipants.length)
          winner = { name: availableParticipants[randomIndex] }
        }

        results.push(winner)

        // 如果不允许重复，从可用列表中移除
        if (!allowDuplicates.value) {
          if (activeTab.value === 'weighted') {
            availableParticipants = availableParticipants.filter(p => p.name !== winner.name)
          } else {
            availableParticipants = availableParticipants.filter(name => name !== winner.name)
          }
        }
      }

      lastResults.value = results
      
      // 保存到历史
      const record = {
        timestamp: new Date().toLocaleString(),
        type: activeTab.value,
        participants: participants.length,
        results: results,
        settings: {
          drawCount: drawCount.value,
          allowDuplicates: allowDuplicates.value,
          animationSpeed: animationSpeed.value
        }
      }
      
      lotteryHistory.value.push(record)
      
      // 播放音效
      if (soundEnabled.value) {
        playWinSound()
      }
    }

    // 权重抽奖
    const drawWeighted = (participants) => {
      const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0)
      let random = Math.random() * totalWeight
      
      for (const participant of participants) {
        random -= participant.weight
        if (random <= 0) {
          return participant
        }
      }
      
      return participants[participants.length - 1]
    }

    // 播放获奖音效
    const playWinSound = async () => {
      // 简单的音效实现
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }

    // 重新抽奖
    const redraw = async () => {
      startLottery()
    }

    // 保存结果
    const saveResults = async () => {
      const resultText = lastResults.value.map((result, index) => 
        `第${index + 1}名: ${result.name}${result.weight ? ` (权重: ${result.weight})` : ''}`
      ).join('\n')
      
      navigator.clipboard.writeText(resultText).then(() => {
        instance.proxy.$message.success('抽奖结果已复制到剪贴板')
      })
    }

    // 分享结果
    const shareResults = async () => {
      const resultText = `🎉 抽奖结果 🎉\n${lastResults.value.map((result, index) => 
        `第${index + 1}名: ${result.name}`
      ).join('\n')}\n\n抽奖时间: ${new Date().toLocaleString()}`
      
      if (navigator.share) {
        navigator.share({
          title: '抽奖结果',
          text: resultText
        })
      } else {
        navigator.clipboard.writeText(resultText).then(() => {
          instance.proxy.$message.success('抽奖结果已复制到剪贴板，可以分享给他人')
        })
      }
    }

    // 重复抽奖
    const repeatLottery = (record) => {
      activeTab.value = record.type
      drawCount.value = record.settings.drawCount || 1
      allowDuplicates.value = record.settings.allowDuplicates || false
      animationSpeed.value = record.settings.animationSpeed || 'normal'
      startLottery()
    }

    // 清空历史
    const clearHistory = async () => {
      if (await instance.proxy.$message.confirm('确定要清空抽奖历史吗？')) {
        lotteryHistory.value = []
      }
    }

    // 导出历史
    const exportHistory = async () => {
      const exportData = {
        history: lotteryHistory.value,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lottery_history_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    // 获取类型标签
    const getTypeLabel = (type) => {
      const labels = {
        simple: '简单抽奖',
        weighted: '权重抽奖',
        multiple: '多次抽奖'
      }
      return labels[type] || type
    }

    // 计算属性
    const canStartLottery = computed(() => {
      const participants = getParticipants()
      return participants.length > 0 && !isDrawing.value
    })

    const totalDraws = computed(() => lotteryHistory.value.length)

    const uniqueWinners = computed(() => {
      const winners = new Set()
      lotteryHistory.value.forEach(record => {
        record.results.forEach(result => winners.add(result.name))
      })
      return winners.size
    })

    const averageParticipants = computed(() => {
      if (lotteryHistory.value.length === 0) return 0
      const total = lotteryHistory.value.reduce((sum, record) => sum + record.participants, 0)
      return total / lotteryHistory.value.length
    })

    const luckyWinner = computed(() => {
      const winCounts = {}
      lotteryHistory.value.forEach(record => {
        record.results.forEach(result => {
          winCounts[result.name] = (winCounts[result.name] || 0) + 1
        })
      })
      
      let maxWins = 0
      let luckyPerson = '暂无'
      for (const [name, wins] of Object.entries(winCounts)) {
        if (wins > maxWins) {
          maxWins = wins
          luckyPerson = name
        }
      }
      
      return luckyPerson
    })

    return {
      activeTab,
      participantsList,
      newParticipant,
      weightedParticipants,
      multipleParticipantsList,
      drawCount,
      allowDuplicates,
      animationSpeed,
      soundEnabled,
      isDrawing,
      currentDrawName,
      lastResults,
      lotteryHistory,
      canStartLottery,
      totalDraws,
      uniqueWinners,
      averageParticipants,
      luckyWinner,
      addParticipant,
      addWeightedParticipant,
      removeWeightedParticipant,
      startLottery,
      redraw,
      saveResults,
      shareResults,
      repeatLottery,
      clearHistory,
      exportHistory,
      getTypeLabel
    }
  }
}
</script>

<style scoped>
.lottery-picker-tool {
  max-width: 1200px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.tool-header h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: var(--text-secondary);
}

.setup-tabs {
  display: flex;
  margin-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
}

.tab-btn {
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.tab-btn:hover {
  color: var(--accent-color);
}

.lottery-setup {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.simple-setup h4,
.weighted-setup h4,
.multiple-setup h4 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.participants-input {
  margin-bottom: 10px;
}

.participants-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.participants-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  font-family: inherit;
}

.quick-add {
  display: flex;
  gap: 0.5rem;
}

.quick-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background: var(--accent-color);
  color: white;
}

.weighted-participants {
  margin-bottom: 10px;
}

.weighted-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.name-input {
  flex: 2;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.weight-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.btn-icon {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #e74c3c;
  color: white;
}

.multiple-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 10px;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.control-group input,
.control-group select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}

.control-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
}

.lottery-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 10px;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.control-options {
  display: flex;
  gap: 2rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.lottery-btn {
  padding: 10px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lottery-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.lottery-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lottery-display {
  margin-bottom: 10px;
}

.draw-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.spinning-wheel {
  width: 200px;
  height: 200px;
  border: 8px solid var(--accent-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 1s linear infinite;
  background: var(--bg-primary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.wheel-content {
  text-align: center;
}

.current-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
}

.draw-progress {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.results-display {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.results-display h4 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.results-list {
  margin-bottom: 10px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;
}

.result-item.result-highlight {
  background: linear-gradient(135deg, #f8c364, #f4a261);
  color: white;
  border-color: #e76f51;
  box-shadow: 0 4px 12px rgba(244, 162, 97, 0.3);
}

.result-rank {
  font-weight: bold;
  min-width: 80px;
}

.result-name {
  flex: 1;
  font-size: 1.2rem;
  font-weight: bold;
}

.result-weight {
  font-size: 0.9rem;
  opacity: 0.8;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.lottery-history,
.lottery-statistics {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 10px;
}

.lottery-history h4,
.lottery-statistics h4 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.history-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 10px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: var(--bg-primary);
}

.history-header {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.history-date {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.history-type {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.history-results {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.history-winner {
  background: var(--accent-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.more-winners {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.repeat-btn:hover {
  background: var(--accent-color);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
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
