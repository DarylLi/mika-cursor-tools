<template>
  <div class="percentage-calc">
    <div class="calc-container">
      <!-- 计算类型选择 -->
      <div class="calc-type-selector">
        <div class="segment-control">
          <button 
            v-for="type in calcTypes" 
            :key="type.id"
            @click="selectedType = type.id"
            :class="{ active: selectedType === type.id }"
            class="segment-btn">
            <i :class="type.icon"></i>
            {{ type.name }}
          </button>
        </div>
      </div>

      <!-- X是Y的百分之几 -->
      <div v-if="selectedType === 'percentage-of'" class="calc-section">
        <h3><i class="fas fa-percent"></i> X是Y的百分之几？</h3>
        <div class="input-row">
          <div class="input-group">
            <label>数值X</label>
            <input v-model="inputs.x" type="number" placeholder="如：25" @input="calculatePercentageOf">
          </div>
          <div class="input-group">
            <label>数值Y</label>
            <input v-model="inputs.y" type="number" placeholder="如：100" @input="calculatePercentageOf">
          </div>
        </div>
        <div v-if="results.percentageOf" class="result-box">
          <div class="result-main">
            <span class="result-value">{{ results.percentageOf }}%</span>
          </div>
          <div class="result-formula">{{ inputs.x }} ÷ {{ inputs.y }} × 100% = {{ results.percentageOf }}%</div>
        </div>
      </div>

      <!-- Y的X%是多少 -->
      <div v-if="selectedType === 'percent-of-number'" class="calc-section">
        <h3><i class="fas fa-calculator"></i> Y的X%是多少？</h3>
        <div class="input-row">
          <div class="input-group">
            <label>百分比X</label>
            <input v-model="inputs.percent" type="number" placeholder="如：15" @input="calculatePercentOfNumber">
            <span class="input-suffix">%</span>
          </div>
          <div class="input-group">
            <label>数值Y</label>
            <input v-model="inputs.number" type="number" placeholder="如：200" @input="calculatePercentOfNumber">
          </div>
        </div>
        <div v-if="results.percentOfNumber" class="result-box">
          <div class="result-main">
            <span class="result-value">{{ results.percentOfNumber }}</span>
          </div>
          <div class="result-formula">{{ inputs.number }} × {{ inputs.percent }}% = {{ results.percentOfNumber }}</div>
        </div>
      </div>

      <!-- 百分比增减 -->
      <div v-if="selectedType === 'percentage-change'" class="calc-section">
        <h3><i class="fas fa-chart-line"></i> 百分比增减计算</h3>
        <div class="input-row">
          <div class="input-group">
            <label>原始值</label>
            <input v-model="inputs.originalValue" type="number" placeholder="如：80" @input="calculatePercentageChange">
          </div>
          <div class="input-group">
            <label>新值</label>
            <input v-model="inputs.newValue" type="number" placeholder="如：100" @input="calculatePercentageChange">
          </div>
        </div>
        <div v-if="results.percentageChange !== null" class="result-box">
          <div class="result-main">
            <span :class="['result-value', results.percentageChange > 0 ? 'positive' : results.percentageChange < 0 ? 'negative' : 'neutral']">
              {{ results.percentageChange > 0 ? '+' : '' }}{{ results.percentageChange }}%
            </span>
          </div>
          <div class="result-formula">
            ({{ inputs.newValue }} - {{ inputs.originalValue }}) ÷ {{ inputs.originalValue }} × 100% = {{ results.percentageChange }}%
          </div>
          <div class="change-description">
            {{ results.percentageChange > 0 ? '增长' : results.percentageChange < 0 ? '下降' : '无变化' }}了 {{ Math.abs(results.percentageChange) }}%
          </div>
        </div>
      </div>

      <!-- 折扣计算 -->
      <div v-if="selectedType === 'discount'" class="calc-section">
        <h3><i class="fas fa-tag"></i> 折扣价格计算</h3>
        <div class="input-row">
          <div class="input-group">
            <label>原价</label>
            <input v-model="inputs.originalPrice" type="number" placeholder="如：100" @input="calculateDiscount">
            <span class="input-suffix">元</span>
          </div>
          <div class="input-group">
            <label>折扣</label>
            <input v-model="inputs.discount" type="number" placeholder="如：20" @input="calculateDiscount">
            <span class="input-suffix">%</span>
          </div>
        </div>
        <div v-if="results.discountPrice !== null" class="result-box">
          <div class="result-grid">
            <div class="result-item">
              <label>折后价</label>
              <span class="result-value">¥{{ results.discountPrice }}</span>
            </div>
            <div class="result-item">
              <label>优惠金额</label>
              <span class="result-value">¥{{ results.savings }}</span>
            </div>
          </div>
          <div class="result-formula">
            {{ inputs.originalPrice }} × (100% - {{ inputs.discount }}%) = {{ results.discountPrice }}
          </div>
        </div>
      </div>

      <!-- 税费计算 -->
      <div v-if="selectedType === 'tax'" class="calc-section">
        <h3><i class="fas fa-receipt"></i> 税费计算</h3>
        <div class="calc-mode-toggle">
          <button 
            @click="taxMode = 'add'"
            :class="{ active: taxMode === 'add' }"
            class="mode-btn">
            加税（税前→税后）
          </button>
          <button 
            @click="taxMode = 'remove'"
            :class="{ active: taxMode === 'remove' }"
            class="mode-btn">
            去税（税后→税前）
          </button>
        </div>
        <div class="input-row">
          <div class="input-group">
            <label>{{ taxMode === 'add' ? '税前金额' : '税后金额' }}</label>
            <input v-model="inputs.taxAmount" type="number" placeholder="如：100" @input="calculateTax">
            <span class="input-suffix">元</span>
          </div>
          <div class="input-group">
            <label>税率</label>
            <input v-model="inputs.taxRate" type="number" placeholder="如：13" @input="calculateTax">
            <span class="input-suffix">%</span>
          </div>
        </div>
        <div v-if="results.finalAmount !== null" class="result-box">
          <div class="result-grid">
            <div class="result-item">
              <label>{{ taxMode === 'add' ? '税后金额' : '税前金额' }}</label>
              <span class="result-value">¥{{ results.finalAmount }}</span>
            </div>
            <div class="result-item">
              <label>税费</label>
              <span class="result-value">¥{{ results.taxFee }}</span>
            </div>
          </div>
          <div class="result-formula">
            {{ taxMode === 'add' 
              ? `${inputs.taxAmount} × (1 + ${inputs.taxRate}%) = ${results.finalAmount}` 
              : `${inputs.taxAmount} ÷ (1 + ${inputs.taxRate}%) = ${results.finalAmount}` }}
          </div>
        </div>
      </div>

      <!-- 快速计算卡片 -->
      <div class="quick-calc-section">
        <h3><i class="fas fa-zap"></i> 快速计算</h3>
        <div class="quick-calc-grid">
          <div v-for="quick in quickCalcs" :key="quick.label" class="quick-calc-card">
            <div class="quick-label">{{ quick.label }}</div>
            <div class="quick-value">{{ quick.value }}</div>
          </div>
        </div>
      </div>

      <!-- 百分比常识 -->
      <div class="tips-section">
        <h3><i class="fas fa-lightbulb"></i> 百分比常识</h3>
        <div class="tips-grid">
          <div class="tip-card">
            <i class="fas fa-info-circle"></i>
            <div>
              <strong>百分比基础</strong>
              <p>百分比表示一个数占另一个数的比例，1% = 0.01 = 1/100</p>
            </div>
          </div>
          <div class="tip-card">
            <i class="fas fa-chart-pie"></i>
            <div>
              <strong>百分点 vs 百分比</strong>
              <p>从20%增加到25%，增长了5个百分点，增长率为25%</p>
            </div>
          </div>
          <div class="tip-card">
            <i class="fas fa-calculator"></i>
            <div>
              <strong>快速计算技巧</strong>
              <p>10% = 1/10，25% = 1/4，50% = 1/2，75% = 3/4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'PercentageCalc',
  setup() {
    const selectedType = ref('percentage-of')
    const taxMode = ref('add')
    
    const inputs = ref({
      x: '',
      y: '',
      percent: '',
      number: '',
      originalValue: '',
      newValue: '',
      originalPrice: '',
      discount: '',
      taxAmount: '',
      taxRate: ''
    })
    
    const results = ref({
      percentageOf: null,
      percentOfNumber: null,
      percentageChange: null,
      discountPrice: null,
      savings: null,
      finalAmount: null,
      taxFee: null
    })
    
    const calcTypes = [
      { id: 'percentage-of', name: 'X是Y的几%', icon: 'fas fa-percent' },
      { id: 'percent-of-number', name: 'Y的X%', icon: 'fas fa-calculator' },
      { id: 'percentage-change', name: '百分比变化', icon: 'fas fa-chart-line' },
      { id: 'discount', name: '折扣计算', icon: 'fas fa-tag' },
      { id: 'tax', name: '税费计算', icon: 'fas fa-receipt' }
    ]
    
    const calculatePercentageOf = () => {
      const x = parseFloat(inputs.value.x)
      const y = parseFloat(inputs.value.y)
      if (!isNaN(x) && !isNaN(y) && y !== 0) {
        results.value.percentageOf = ((x / y) * 100).toFixed(2)
      } else {
        results.value.percentageOf = null
      }
    }
    
    const calculatePercentOfNumber = () => {
      const percent = parseFloat(inputs.value.percent)
      const number = parseFloat(inputs.value.number)
      if (!isNaN(percent) && !isNaN(number)) {
        results.value.percentOfNumber = ((number * percent) / 100).toFixed(2)
      } else {
        results.value.percentOfNumber = null
      }
    }
    
    const calculatePercentageChange = () => {
      const original = parseFloat(inputs.value.originalValue)
      const newVal = parseFloat(inputs.value.newValue)
      if (!isNaN(original) && !isNaN(newVal) && original !== 0) {
        results.value.percentageChange = (((newVal - original) / original) * 100).toFixed(2)
      } else {
        results.value.percentageChange = null
      }
    }
    
    const calculateDiscount = () => {
      const price = parseFloat(inputs.value.originalPrice)
      const discount = parseFloat(inputs.value.discount)
      if (!isNaN(price) && !isNaN(discount)) {
        const discountAmount = (price * discount) / 100
        results.value.discountPrice = (price - discountAmount).toFixed(2)
        results.value.savings = discountAmount.toFixed(2)
      } else {
        results.value.discountPrice = null
        results.value.savings = null
      }
    }
    
    const calculateTax = () => {
      const amount = parseFloat(inputs.value.taxAmount)
      const rate = parseFloat(inputs.value.taxRate)
      if (!isNaN(amount) && !isNaN(rate)) {
        if (taxMode.value === 'add') {
          const tax = (amount * rate) / 100
          results.value.finalAmount = (amount + tax).toFixed(2)
          results.value.taxFee = tax.toFixed(2)
        } else {
          const pretaxAmount = amount / (1 + rate / 100)
          const tax = amount - pretaxAmount
          results.value.finalAmount = pretaxAmount.toFixed(2)
          results.value.taxFee = tax.toFixed(2)
        }
      } else {
        results.value.finalAmount = null
        results.value.taxFee = null
      }
    }
    
    const quickCalcs = computed(() => {
      const baseValue = 100
      return [
        { label: '10%', value: (baseValue * 0.1).toFixed(0) },
        { label: '25%', value: (baseValue * 0.25).toFixed(0) },
        { label: '50%', value: (baseValue * 0.5).toFixed(0) },
        { label: '75%', value: (baseValue * 0.75).toFixed(0) },
        { label: '90%', value: (baseValue * 0.9).toFixed(0) },
        { label: '150%', value: (baseValue * 1.5).toFixed(0) }
      ]
    })
    
    // 切换计算类型时清空结果
    watch(selectedType, () => {
      Object.keys(results.value).forEach(key => {
        results.value[key] = null
      })
    })
    
    watch(taxMode, () => {
      calculateTax()
    })
    
    return {
      selectedType,
      taxMode,
      inputs,
      results,
      calcTypes,
      quickCalcs,
      calculatePercentageOf,
      calculatePercentOfNumber,
      calculatePercentageChange,
      calculateDiscount,
      calculateTax
    }
  }
}
</script>

<style scoped>
.percentage-calc {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.calc-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.calc-type-selector {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
}

.segment-control {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.segment-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.segment-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.segment-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.calc-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.calc-section h3 {
  margin: 0 0 1.5rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.input-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.input-group {
  position: relative;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  margin-top: 0.25rem;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

.calc-mode-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.mode-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.mode-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.result-box {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.result-main {
  text-align: center;
  margin-bottom: 1rem;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.result-value.positive {
  color: #4CAF50;
}

.result-value.negative {
  color: #f44336;
}

.result-value.neutral {
  color: #ff9800;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-item {
  text-align: center;
}

.result-item label {
  display: block;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.result-item .result-value {
  font-size: 1.5rem;
}

.result-formula {
  text-align: center;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.change-description {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.quick-calc-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-calc-section h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-calc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.quick-calc-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: transform 0.3s ease;
}

.quick-calc-card:hover {
  transform: translateY(-2px);
}

.quick-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.quick-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.tips-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tips-section h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.tip-card {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.tip-card i {
  color: #667eea;
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.tip-card strong {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  display: block;
}

.tip-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .segment-control {
    flex-direction: column;
  }
  
  .input-row {
    grid-template-columns: 1fr;
  }
  
  .result-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-calc-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
}
</style> 