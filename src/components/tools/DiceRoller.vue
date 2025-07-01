<template>
  <div class="dice-roller-tool">
    <div class="tool-header">
      <h3><i class="fas fa-dice"></i> RPG 骰子工具</h3>
      <p>专业的桌游骰子模拟器，支持多种骰子类型和复合投掷</p>
    </div>

    <div class="tool-content">
      <div class="dice-controls">
        <div class="preset-dice">
          <h4>常用骰子</h4>
          <div class="dice-buttons">
            <button @click="rollPreset(4)" class="dice-btn d4">
              <i class="fas fa-dice-four"></i>
              D4
            </button>
            <button @click="rollPreset(6)" class="dice-btn d6">
              <i class="fas fa-dice-six"></i>
              D6
            </button>
            <button @click="rollPreset(8)" class="dice-btn d8">
              <i class="fas fa-dice"></i>
              D8
            </button>
            <button @click="rollPreset(10)" class="dice-btn d10">
              <i class="fas fa-dice"></i>
              D10
            </button>
            <button @click="rollPreset(12)" class="dice-btn d12">
              <i class="fas fa-dice"></i>
              D12
            </button>
            <button @click="rollPreset(20)" class="dice-btn d20">
              <i class="fas fa-dice-d20"></i>
              D20
            </button>
            <button @click="rollPreset(100)" class="dice-btn d100">
              <i class="fas fa-dice"></i>
              D100
            </button>
          </div>
        </div>

        <div class="custom-roll">
          <h4>自定义投掷</h4>
          <div class="custom-inputs">
            <div class="input-group">
              <label for="diceCount">骰子数量</label>
              <input type="number" id="diceCount" v-model.number="diceCount" min="1" max="100" />
            </div>
            <div class="input-group">
              <label for="diceType">骰子类型</label>
              <select id="diceType" v-model="diceType">
                <option value="4">D4</option>
                <option value="6">D6</option>
                <option value="8">D8</option>
                <option value="10">D10</option>
                <option value="12">D12</option>
                <option value="20">D20</option>
                <option value="100">D100</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            <div class="input-group" v-if="diceType === 'custom'">
              <label for="customSides">面数</label>
              <input type="number" id="customSides" v-model.number="customSides" min="2" max="1000" />
            </div>
            <div class="input-group">
              <label for="modifier">修正值</label>
              <input type="number" id="modifier" v-model.number="modifier" />
            </div>
          </div>
          <button @click="rollCustom" class="btn-primary roll-btn">
            <i class="fas fa-dice"></i> 投掷
          </button>
        </div>

        <div class="formula-roll">
          <h4>公式投掷</h4>
          <div class="formula-inputs">
            <input 
              type="text" 
              v-model="formula" 
              placeholder="例: 2d6+3, 3d8-1, 1d20+5"
              class="formula-input"
            />
            <button @click="rollFormula" class="btn-secondary">
              <i class="fas fa-calculator"></i> 计算
            </button>
          </div>
          <div class="formula-presets">
            <button @click="setFormula('1d20+3')" class="preset-formula">攻击检定</button>
            <button @click="setFormula('2d6+2')" class="preset-formula">伤害投掷</button>
            <button @click="setFormula('4d6')" class="preset-formula">属性投掷</button>
            <button @click="setFormula('1d100')" class="preset-formula">百分比</button>
          </div>
        </div>
      </div>

      <div class="roll-result" v-if="lastRoll">
        <div class="result-card">
          <div class="result-header">
            <h3>投掷结果</h3>
            <div class="result-formula">{{ lastRoll.formula }}</div>
          </div>
          
          <div class="result-display">
            <div class="individual-dice" v-if="lastRoll.dice.length > 1">
              <div class="dice-label">各骰子结果:</div>
              <div class="dice-values">
                <span 
                  v-for="(die, index) in lastRoll.dice" 
                  :key="index"
                  class="die-value"
                  :class="getDieClass(die.value, die.sides)"
                >
                  {{ die.value }}
                </span>
              </div>
            </div>
            
            <div class="total-result">
              <div class="total-label">总计:</div>
              <div class="total-value" :class="getResultClass(lastRoll.total)">
                {{ lastRoll.total }}
              </div>
            </div>
            
            <div class="result-breakdown" v-if="lastRoll.breakdown">
              <div class="breakdown-label">计算过程:</div>
              <div class="breakdown-text">{{ lastRoll.breakdown }}</div>
            </div>
          </div>
          
          <div class="result-actions">
            <button @click="reroll" class="btn-secondary">
              <i class="fas fa-redo"></i> 重投
            </button>
            <button @click="saveRoll" class="btn-secondary">
              <i class="fas fa-save"></i> 保存
            </button>
          </div>
        </div>
      </div>

      <div class="roll-history" v-if="rollHistory.length">
        <h4>投掷历史</h4>
        <div class="history-controls">
          <button @click="clearHistory" class="btn-secondary">
            <i class="fas fa-trash"></i> 清空历史
          </button>
          <button @click="exportHistory" class="btn-secondary">
            <i class="fas fa-download"></i> 导出
          </button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="(roll, index) in rollHistory.slice(-10)" 
            :key="index"
            class="history-item"
          >
            <div class="history-formula">{{ roll.formula }}</div>
            <div class="history-result">{{ roll.total }}</div>
            <div class="history-time">{{ roll.timestamp }}</div>
            <button @click="repeatRoll(roll)" class="btn-icon repeat-btn" title="重复此投掷">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="statistics" v-if="rollHistory.length > 5">
        <h4>统计信息</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ rollHistory.length }}</div>
            <div class="stat-label">总投掷次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ averageRoll.toFixed(1) }}</div>
            <div class="stat-label">平均值</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ highestRoll }}</div>
            <div class="stat-label">最高值</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ lowestRoll }}</div>
            <div class="stat-label">最低值</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'DiceRoller',
  setup() {
    const diceCount = ref(1)
    const diceType = ref('20')
    const customSides = ref(6)
    const modifier = ref(0)
    const formula = ref('')
    const lastRoll = ref(null)
    const rollHistory = ref([])

    // 投掷单个骰子
    const rollDie = (sides) => {
      return Math.floor(Math.random() * sides) + 1
    }

    // 预设骰子投掷
    const rollPreset = (sides) => {
      const die = rollDie(sides)
      const result = {
        formula: `1d${sides}`,
        dice: [{ value: die, sides }],
        total: die,
        breakdown: `${die}`,
        timestamp: new Date().toLocaleTimeString()
      }
      
      lastRoll.value = result
      addToHistory(result)
    }

    // 自定义投掷
    const rollCustom = () => {
      const sides = diceType.value === 'custom' ? customSides.value : parseInt(diceType.value)
      const dice = []
      let total = 0
      
      for (let i = 0; i < diceCount.value; i++) {
        const die = rollDie(sides)
        dice.push({ value: die, sides })
        total += die
      }
      
      total += modifier.value
      
      const diceSum = dice.map(d => d.value).join(' + ')
      const modifierText = modifier.value !== 0 ? 
        (modifier.value > 0 ? ` + ${modifier.value}` : ` ${modifier.value}`) : ''
      
      const result = {
        formula: `${diceCount.value}d${sides}${modifierText}`,
        dice,
        total,
        breakdown: dice.length > 1 ? `(${diceSum})${modifierText} = ${total}` : `${total}`,
        timestamp: new Date().toLocaleTimeString()
      }
      
      lastRoll.value = result
      addToHistory(result)
    }

    // 公式投掷
    const rollFormula = () => {
      try {
        const result = parseAndRollFormula(formula.value)
        lastRoll.value = result
        addToHistory(result)
      } catch (error) {
        alert('无效的投掷公式，请检查格式')
      }
    }

    // 解析投掷公式
    const parseAndRollFormula = (formulaStr) => {
      // 简单的公式解析，支持 XdY+Z 格式
      const match = formulaStr.match(/(\d+)d(\d+)([+-]\d+)?/i)
      if (!match) {
        throw new Error('Invalid formula')
      }
      
      const count = parseInt(match[1])
      const sides = parseInt(match[2])
      const mod = match[3] ? parseInt(match[3]) : 0
      
      const dice = []
      let total = 0
      
      for (let i = 0; i < count; i++) {
        const die = rollDie(sides)
        dice.push({ value: die, sides })
        total += die
      }
      
      total += mod
      
      const diceSum = dice.map(d => d.value).join(' + ')
      const modifierText = mod !== 0 ? (mod > 0 ? ` + ${mod}` : ` ${mod}`) : ''
      
      return {
        formula: formulaStr,
        dice,
        total,
        breakdown: dice.length > 1 ? `(${diceSum})${modifierText} = ${total}` : `${total}`,
        timestamp: new Date().toLocaleTimeString()
      }
    }

    // 设置公式
    const setFormula = (formulaStr) => {
      formula.value = formulaStr
    }

    // 重投
    const reroll = () => {
      if (lastRoll.value) {
        if (lastRoll.value.formula.includes('d')) {
          rollFormula()
        } else {
          rollCustom()
        }
      }
    }

    // 保存投掷
    const saveRoll = () => {
      if (lastRoll.value) {
        // 简单实现：复制到剪贴板
        const rollText = `${lastRoll.value.formula}: ${lastRoll.value.total}`
        navigator.clipboard.writeText(rollText).then(() => {
          alert('投掷结果已复制到剪贴板')
        })
      }
    }

    // 重复投掷
    const repeatRoll = (roll) => {
      formula.value = roll.formula
      rollFormula()
    }

    // 添加到历史
    const addToHistory = (roll) => {
      rollHistory.value.push({ ...roll })
      if (rollHistory.value.length > 100) {
        rollHistory.value.shift()
      }
    }

    // 清空历史
    const clearHistory = () => {
      if (confirm('确定要清空投掷历史吗？')) {
        rollHistory.value = []
      }
    }

    // 导出历史
    const exportHistory = () => {
      const exportData = {
        history: rollHistory.value,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dice_history_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    // 获取骰子样式类
    const getDieClass = (value, sides) => {
      if (value === 1) return 'critical-fail'
      if (value === sides) return 'critical-success'
      return ''
    }

    // 获取结果样式类
    const getResultClass = (total) => {
      if (total >= 18) return 'excellent'
      if (total >= 12) return 'good'
      if (total <= 3) return 'poor'
      return ''
    }

    // 计算属性
    const averageRoll = computed(() => {
      if (rollHistory.value.length === 0) return 0
      const sum = rollHistory.value.reduce((acc, roll) => acc + roll.total, 0)
      return sum / rollHistory.value.length
    })

    const highestRoll = computed(() => {
      if (rollHistory.value.length === 0) return 0
      return Math.max(...rollHistory.value.map(roll => roll.total))
    })

    const lowestRoll = computed(() => {
      if (rollHistory.value.length === 0) return 0
      return Math.min(...rollHistory.value.map(roll => roll.total))
    })

    return {
      diceCount,
      diceType,
      customSides,
      modifier,
      formula,
      lastRoll,
      rollHistory,
      rollPreset,
      rollCustom,
      rollFormula,
      setFormula,
      reroll,
      saveRoll,
      repeatRoll,
      clearHistory,
      exportHistory,
      getDieClass,
      getResultClass,
      averageRoll,
      highestRoll,
      lowestRoll
    }
  }
}
</script>

<style scoped>
.dice-roller-tool {
  max-width: 1200px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.tool-header h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: var(--text-secondary);
}

.dice-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.preset-dice,
.custom-roll,
.formula-roll {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.preset-dice h4,
.custom-roll h4,
.formula-roll h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.dice-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
}

.dice-btn {
  padding: 1rem 0.5rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
}

.dice-btn:hover {
  background: var(--accent-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.custom-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.input-group input,
.input-group select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.roll-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.roll-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.formula-inputs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.formula-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.formula-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.preset-formula {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.preset-formula:hover {
  background: var(--accent-color);
  color: white;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
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

.roll-result {
  margin-bottom: 2rem;
}

.result-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.result-header {
  text-align: center;
  margin-bottom: 1rem;
}

.result-header h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.result-formula {
  color: var(--text-secondary);
  font-family: monospace;
  font-weight: bold;
}

.individual-dice {
  margin-bottom: 1rem;
  text-align: center;
}

.dice-label {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.dice-values {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.die-value {
  display: inline-block;
  min-width: 40px;
  padding: 0.5rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
}

.die-value.critical-fail {
  background: #e74c3c;
  color: white;
  border-color: #c0392b;
}

.die-value.critical-success {
  background: #27ae60;
  color: white;
  border-color: #229954;
}

.total-result {
  text-align: center;
  margin-bottom: 1rem;
}

.total-label {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.total-value {
  font-size: 3rem;
  font-weight: bold;
  color: var(--accent-color);
}

.total-value.excellent {
  color: #27ae60;
}

.total-value.good {
  color: #3498db;
}

.total-value.poor {
  color: #e74c3c;
}

.result-breakdown {
  text-align: center;
  margin-bottom: 1rem;
}

.breakdown-label {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.breakdown-text {
  font-family: monospace;
  color: var(--text-primary);
  font-weight: 500;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.roll-history,
.statistics {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.roll-history h4,
.statistics h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.history-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.history-item:last-child {
  border-bottom: none;
}

.history-formula {
  font-family: monospace;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 100px;
}

.history-result {
  font-weight: bold;
  color: var(--accent-color);
  min-width: 50px;
}

.history-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
  flex: 1;
}

.btn-icon {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--accent-color);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
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
</style>
