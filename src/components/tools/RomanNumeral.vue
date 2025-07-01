<template>
  <div class="roman-numeral">
    <div class="converter-container">
      <!-- 主转换面板 -->
      <div class="main-converter">
        <h3><i class="fas fa-columns"></i> 罗马数字转换器</h3>
        
        <div class="conversion-modes">
          <button 
            @click="mode = 'toRoman'" 
            :class="{ active: mode === 'toRoman' }"
            class="mode-btn">
            <i class="fas fa-arrow-right"></i>
            阿拉伯 → 罗马
          </button>
          <button 
            @click="mode = 'toArabic'" 
            :class="{ active: mode === 'toArabic' }"
            class="mode-btn">
            <i class="fas fa-arrow-left"></i>
            罗马 → 阿拉伯
          </button>
        </div>

        <!-- 阿拉伯转罗马 -->
        <div v-if="mode === 'toRoman'" class="conversion-panel">
          <div class="input-section">
            <label>输入阿拉伯数字 (1-3999)</label>
            <input 
              v-model="arabicInput" 
              type="number" 
              min="1" 
              max="3999"
              placeholder="输入数字，如：2024"
              @input="convertToRoman"
              class="input-field">
          </div>
          
          <div v-if="romanResult" class="result-section">
            <div class="result-display">
              <div class="result-label">罗马数字</div>
              <div class="result-value roman" @click="copyResult">{{ romanResult }}</div>
              <button @click="copyResult" class="copy-btn">
                <i class="fas fa-copy"></i> 复制
              </button>
            </div>
            
            <div class="breakdown-section">
              <h4><i class="fas fa-list"></i> 转换分解</h4>
              <div class="breakdown-steps">
                <div v-for="step in conversionSteps" :key="step.position" class="step-item">
                  <span class="step-number">{{ step.arabic }}</span>
                  <span class="step-arrow">→</span>
                  <span class="step-roman">{{ step.roman }}</span>
                  <span class="step-description">{{ step.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 罗马转阿拉伯 -->
        <div v-if="mode === 'toArabic'" class="conversion-panel">
          <div class="input-section">
            <label>输入罗马数字</label>
            <input 
              v-model="romanInput" 
              type="text" 
              placeholder="输入罗马数字，如：MMXXIV"
              @input="convertToArabic"
              class="input-field roman-input"
              style="text-transform: uppercase;">
            <div class="input-help">
              可用字符：I, V, X, L, C, D, M
            </div>
          </div>
          
          <div v-if="arabicResult !== null" class="result-section">
            <div class="result-display">
              <div class="result-label">阿拉伯数字</div>
              <div class="result-value arabic" @click="copyResult">{{ arabicResult }}</div>
              <button @click="copyResult" class="copy-btn">
                <i class="fas fa-copy"></i> 复制
              </button>
            </div>
            
            <div v-if="parseSteps.length > 0" class="breakdown-section">
              <h4><i class="fas fa-list"></i> 解析过程</h4>
              <div class="breakdown-steps">
                <div v-for="step in parseSteps" :key="step.position" class="step-item">
                  <span class="step-roman">{{ step.symbol }}</span>
                  <span class="step-arrow">→</span>
                  <span class="step-number">{{ step.value }}</span>
                  <span class="step-description">{{ step.description }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ errorMessage }}
          </div>
        </div>
      </div>

      <!-- 快速转换 -->
      <div class="quick-convert">
        <h4><i class="fas fa-bolt"></i> 快速转换</h4>
        <div class="quick-numbers">
          <button 
            v-for="num in quickNumbers" 
            :key="num"
            @click="setQuickNumber(num)"
            class="quick-btn">
            <span class="arabic">{{ num }}</span>
            <span class="roman">{{ convertNumber(num) }}</span>
          </button>
        </div>
      </div>

      <!-- 罗马数字规则 -->
      <div class="rules-section">
        <h4><i class="fas fa-book"></i> 罗马数字对照表</h4>
        <div class="symbols-grid">
          <div class="symbol-card" v-for="symbol in romanSymbols" :key="symbol.roman">
            <div class="symbol-roman">{{ symbol.roman }}</div>
            <div class="symbol-arabic">{{ symbol.arabic }}</div>
            <div class="symbol-name">{{ symbol.name }}</div>
          </div>
        </div>
        
        <div class="rules-list">
          <h5><i class="fas fa-rules"></i> 构成规则</h5>
          <div class="rule-cards">
            <div class="rule-card">
              <div class="rule-title">基本规则</div>
              <div class="rule-content">
                <p>• 相同数字连续出现，表示相加</p>
                <p>• 小数字在大数字右边，表示相加</p>
                <p>• 小数字在大数字左边，表示相减</p>
              </div>
            </div>
            <div class="rule-card">
              <div class="rule-title">重复限制</div>
              <div class="rule-content">
                <p>• I、X、C 最多连续出现3次</p>
                <p>• V、L、D 不能连续出现</p>
                <p>• 减法组合有限制</p>
              </div>
            </div>
            <div class="rule-card">
              <div class="rule-title">减法规则</div>
              <div class="rule-content">
                <p>• IV = 4, IX = 9</p>
                <p>• XL = 40, XC = 90</p>
                <p>• CD = 400, CM = 900</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div v-if="history.length > 0" class="history-section">
        <h4><i class="fas fa-history"></i> 转换历史</h4>
        <div class="history-list">
          <div v-for="(item, index) in history" :key="index" class="history-item" @click="loadHistory(item)">
            <div class="history-conversion">
              <span class="from">{{ item.from }}</span>
              <i class="fas fa-arrow-right"></i>
              <span class="to">{{ item.to }}</span>
            </div>
            <div class="history-type">{{ item.type }}</div>
            <button @click.stop="removeHistory(index)" class="remove-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <button @click="clearHistory" class="clear-btn">
          <i class="fas fa-trash"></i> 清空历史
        </button>
      </div>

      <!-- 趣味知识 -->
      <div class="knowledge-section">
        <h4><i class="fas fa-lightbulb"></i> 罗马数字趣知识</h4>
        <div class="knowledge-grid">
          <div class="knowledge-card">
            <i class="fas fa-calendar"></i>
            <div>
              <strong>历史起源</strong>
              <p>罗马数字起源于古罗马，至今仍用于钟表、书籍章节等</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-crown"></i>
            <div>
              <strong>皇室应用</strong>
              <p>常用于表示君主世代，如伊丽莎白二世(Elizabeth II)</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-film"></i>
            <div>
              <strong>影视应用</strong>
              <p>电影制作年份、续集编号常使用罗马数字</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-church"></i>
            <div>
              <strong>建筑标记</strong>
              <p>古典建筑、纪念碑上的年份常用罗马数字刻制</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'RomanNumeral',
  setup() {
    const mode = ref('toRoman')
    const arabicInput = ref('')
    const romanInput = ref('')
    const romanResult = ref('')
    const arabicResult = ref(null)
    const errorMessage = ref('')
    const history = ref([])
    
    const romanSymbols = [
      { roman: 'I', arabic: 1, name: '一' },
      { roman: 'V', arabic: 5, name: '五' },
      { roman: 'X', arabic: 10, name: '十' },
      { roman: 'L', arabic: 50, name: '五十' },
      { roman: 'C', arabic: 100, name: '一百' },
      { roman: 'D', arabic: 500, name: '五百' },
      { roman: 'M', arabic: 1000, name: '一千' }
    ]
    
    const quickNumbers = [1, 4, 5, 9, 10, 40, 50, 90, 100, 400, 500, 900, 1000, 2024]
    
    // 罗马数字映射表
    const romanMap = [
      { value: 1000, symbol: 'M' },
      { value: 900, symbol: 'CM' },
      { value: 500, symbol: 'D' },
      { value: 400, symbol: 'CD' },
      { value: 100, symbol: 'C' },
      { value: 90, symbol: 'XC' },
      { value: 50, symbol: 'L' },
      { value: 40, symbol: 'XL' },
      { value: 10, symbol: 'X' },
      { value: 9, symbol: 'IX' },
      { value: 5, symbol: 'V' },
      { value: 4, symbol: 'IV' },
      { value: 1, symbol: 'I' }
    ]
    
    const conversionSteps = computed(() => {
      if (!arabicInput.value) return []
      
      const num = parseInt(arabicInput.value)
      if (isNaN(num) || num < 1 || num > 3999) return []
      
      const steps = []
      let remaining = num
      
      for (const { value, symbol } of romanMap) {
        if (remaining >= value) {
          const count = Math.floor(remaining / value)
          steps.push({
            position: steps.length,
            arabic: value * count,
            roman: symbol.repeat(count),
            description: `${value} × ${count} = ${value * count}`
          })
          remaining -= value * count
        }
      }
      
      return steps
    })
    
    const parseSteps = computed(() => {
      if (!romanInput.value) return []
      
      const input = romanInput.value.toUpperCase()
      const steps = []
      let i = 0
      
      while (i < input.length) {
        let found = false
        
        // 检查双字符组合
        if (i < input.length - 1) {
          const twoChar = input.substr(i, 2)
          const twoCharValue = romanMap.find(item => item.symbol === twoChar)
          if (twoCharValue) {
            steps.push({
              position: i,
              symbol: twoChar,
              value: twoCharValue.value,
              description: getSymbolDescription(twoChar)
            })
            i += 2
            found = true
          }
        }
        
        // 检查单字符
        if (!found) {
          const oneChar = input[i]
          const oneCharValue = romanMap.find(item => item.symbol === oneChar)
          if (oneCharValue) {
            steps.push({
              position: i,
              symbol: oneChar,
              value: oneCharValue.value,
              description: getSymbolDescription(oneChar)
            })
            i += 1
          } else {
            i += 1 // 跳过无效字符
          }
        }
      }
      
      return steps
    })
    
    const getSymbolDescription = (symbol) => {
      const descriptions = {
        'M': '1000',
        'CM': '900 (1000-100)',
        'D': '500',
        'CD': '400 (500-100)',
        'C': '100',
        'XC': '90 (100-10)',
        'L': '50',
        'XL': '40 (50-10)',
        'X': '10',
        'IX': '9 (10-1)',
        'V': '5',
        'IV': '4 (5-1)',
        'I': '1'
      }
      return descriptions[symbol] || symbol
    }
    
    const convertNumber = (num) => {
      if (num < 1 || num > 3999) return ''
      
      let result = ''
      let remaining = num
      
      for (const { value, symbol } of romanMap) {
        while (remaining >= value) {
          result += symbol
          remaining -= value
        }
      }
      
      return result
    }
    
    const convertToRoman = () => {
      const num = parseInt(arabicInput.value)
      
      if (isNaN(num)) {
        romanResult.value = ''
        return
      }
      
      if (num < 1 || num > 3999) {
        romanResult.value = '超出范围 (1-3999)'
        return
      }
      
      romanResult.value = convertNumber(num)
      
      // 添加到历史
      if (romanResult.value && !romanResult.value.includes('超出')) {
        addToHistory({
          from: num.toString(),
          to: romanResult.value,
          type: '阿拉伯→罗马'
        })
      }
    }
    
    const convertToArabic = () => {
      const input = romanInput.value.toUpperCase().trim()
      errorMessage.value = ''
      
      if (!input) {
        arabicResult.value = null
        return
      }
      
      // 验证输入
      if (!/^[IVXLCDM]+$/.test(input)) {
        errorMessage.value = '包含无效字符，只能使用 I, V, X, L, C, D, M'
        arabicResult.value = null
        return
      }
      
      // 转换
      let result = 0
      let i = 0
      
      while (i < input.length) {
        let found = false
        
        // 检查双字符组合
        if (i < input.length - 1) {
          const twoChar = input.substr(i, 2)
          const twoCharValue = romanMap.find(item => item.symbol === twoChar)
          if (twoCharValue) {
            result += twoCharValue.value
            i += 2
            found = true
          }
        }
        
        // 检查单字符
        if (!found) {
          const oneChar = input[i]
          const oneCharValue = romanMap.find(item => item.symbol === oneChar)
          if (oneCharValue) {
            result += oneCharValue.value
            i += 1
          } else {
            errorMessage.value = `无效字符: ${oneChar}`
            arabicResult.value = null
            return
          }
        }
      }
      
      // 验证结果
      if (result < 1 || result > 3999) {
        errorMessage.value = '结果超出有效范围 (1-3999)'
        arabicResult.value = null
        return
      }
      
      // 验证是否为有效的罗马数字格式
      const reconstructed = convertNumber(result)
      if (reconstructed !== input) {
        errorMessage.value = `格式不正确，标准写法应为: ${reconstructed}`
      }
      
      arabicResult.value = result
      
      // 添加到历史
      addToHistory({
        from: input,
        to: result.toString(),
        type: '罗马→阿拉伯'
      })
    }
    
    const addToHistory = (item) => {
      // 避免重复
      const exists = history.value.some(h => 
        h.from === item.from && h.to === item.to && h.type === item.type
      )
      
      if (!exists) {
        history.value.unshift(item)
        if (history.value.length > 10) {
          history.value.pop()
        }
      }
    }
    
    const copyResult = () => {
      const result = mode.value === 'toRoman' ? romanResult.value : arabicResult.value?.toString()
      if (result && !result.includes('超出')) {
        navigator.clipboard.writeText(result).then(() => {
          // 可以添加提示
        })
      }
    }
    
    const setQuickNumber = (num) => {
      mode.value = 'toRoman'
      arabicInput.value = num.toString()
      convertToRoman()
    }
    
    const loadHistory = (item) => {
      if (item.type === '阿拉伯→罗马') {
        mode.value = 'toRoman'
        arabicInput.value = item.from
        convertToRoman()
      } else {
        mode.value = 'toArabic'
        romanInput.value = item.from
        convertToArabic()
      }
    }
    
    const removeHistory = (index) => {
      history.value.splice(index, 1)
    }
    
    const clearHistory = () => {
      history.value = []
    }
    
    return {
      mode,
      arabicInput,
      romanInput,
      romanResult,
      arabicResult,
      errorMessage,
      history,
      romanSymbols,
      quickNumbers,
      conversionSteps,
      parseSteps,
      convertNumber,
      convertToRoman,
      convertToArabic,
      copyResult,
      setQuickNumber,
      loadHistory,
      removeHistory,
      clearHistory
    }
  }
}
</script>

<style scoped>
.roman-numeral {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.converter-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.main-converter {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.main-converter h3 {
  margin: 0 0 2rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
}

.conversion-modes {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.mode-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.mode-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.conversion-panel {
  max-width: 600px;
  margin: 0 auto;
}

.input-section {
  margin-bottom: 2rem;
}

.input-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1.2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.roman-input {
  font-family: 'Times New Roman', serif;
  font-weight: bold;
  letter-spacing: 2px;
}

.input-help {
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  text-align: center;
}

.result-section {
  margin-top: 2rem;
}

.result-display {
  text-align: center;
  margin-bottom: 2rem;
}

.result-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.result-value {
  padding: 1.5rem;
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-value:hover {
  background: rgba(102, 126, 234, 0.2);
}

.result-value.roman {
  font-family: 'Times New Roman', serif;
  letter-spacing: 3px;
  color: #667eea;
}

.result-value.arabic {
  font-family: monospace;
  color: #667eea;
}

.copy-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.breakdown-section h4 {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breakdown-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.step-number {
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
  min-width: 60px;
}

.step-roman {
  color: #667eea;
  font-family: 'Times New Roman', serif;
  font-weight: bold;
  min-width: 40px;
  letter-spacing: 1px;
}

.step-arrow {
  color: rgba(255, 255, 255, 0.5);
}

.step-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #f44336;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.quick-convert {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-convert h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-numbers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.quick-btn {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.quick-btn .arabic {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.quick-btn .roman {
  display: block;
  color: #667eea;
  font-family: 'Times New Roman', serif;
  font-weight: bold;
  font-size: 0.9rem;
  letter-spacing: 1px;
  margin-top: 0.25rem;
}

.rules-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.rules-section h4, .rules-section h5 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rules-section h5 {
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2rem;
}

.symbols-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.symbol-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.symbol-roman {
  font-family: 'Times New Roman', serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.symbol-arabic {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.symbol-name {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.rule-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.rule-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.rule-title {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.rule-content p {
  margin: 0.25rem 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.history-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.history-section h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.history-conversion {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-conversion .from {
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
}

.history-conversion .to {
  color: #667eea;
  font-weight: 500;
}

.history-type {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.remove-btn {
  padding: 0.25rem;
  border: none;
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}

.clear-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}

.knowledge-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.knowledge-section h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.knowledge-card {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.knowledge-card i {
  color: #667eea;
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.knowledge-card strong {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  display: block;
}

.knowledge-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .conversion-modes {
    flex-direction: column;
  }
  
  .mode-btn {
    text-align: center;
  }
  
  .step-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .quick-numbers {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .symbols-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  
  .rule-cards {
    grid-template-columns: 1fr;
  }
  
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style> 