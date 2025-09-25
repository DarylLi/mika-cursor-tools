<template>
  <div class="credit-card-tool">
    <!-- 工具头部 -->
    <div class="tool-header">
      <div class="header-gradient card-gradient">
        <div class="header-content">
          <div class="tool-info">
            <h1><i class="fas fa-credit-card"></i> Luhn Validator</h1>
            <p>信用卡号码验证与分析工具</p>
          </div>
        </div>
      </div>
    </div>

    <div class="tool-content">
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="section-header">
          <h3><i class="fas fa-keyboard"></i> 号码输入</h3>
        </div>
        
        <!-- 单个号码验证 -->
        <div class="input-group">
          <label>信用卡号码:</label>
          <input type="text" 
                 v-model="cardNumber" 
                 @input="validateCard"
                 placeholder="4532 1234 5678 9012"
                 maxlength="19"
                 class="card-input">
          <small>支持空格分隔，自动格式化</small>
        </div>

        <!-- 示例按钮 -->
        <div class="example-buttons">
          <button @click="loadExample('visa')" class="example-btn">
            <i class="fab fa-cc-visa"></i> Visa示例
          </button>
          <button @click="loadExample('mastercard')" class="example-btn">
            <i class="fab fa-cc-mastercard"></i> MasterCard示例
          </button>
          <button @click="loadExample('amex')" class="example-btn">
            <i class="fab fa-cc-amex"></i> American Express
          </button>
        </div>
      </div>

      <!-- 单个验证结果 -->
      <div v-if="cardNumber.replace(/\s/g, '').length > 0" class="validation-section">
        <div class="section-header">
          <h3><i class="fas fa-check-circle"></i> 验证结果</h3>
        </div>
        
        <div class="validation-card">
          <div class="validation-status" :class="{ 'valid': validationResult.isValid, 'invalid': !validationResult.isValid }">
            <i :class="validationResult.isValid ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            <span>{{ validationResult.isValid ? '有效' : '无效' }}</span>
          </div>
          
          <div class="card-details">
            <div class="detail-row">
              <strong>原始号码:</strong> {{ cardNumber }}
            </div>
            <div class="detail-row">
              <strong>纯数字:</strong> {{ validationResult.cleanNumber }}
            </div>
            <div class="detail-row">
              <strong>卡片类型:</strong> 
              <span class="card-type">
                <i :class="getCardIcon(validationResult.type)"></i>
                {{ validationResult.type }}
              </span>
            </div>
            <div class="detail-row">
              <strong>Luhn校验:</strong> 
              <span :class="{ 'valid': validationResult.luhnValid, 'invalid': !validationResult.luhnValid }">
                {{ validationResult.luhnValid ? '通过' : '失败' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="fas fa-credit-card"></i>
        <h3>信用卡号码验证</h3>
        <p>输入信用卡号码进行Luhn算法验证</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'CreditCardCheck',
  setup() {
    const cardNumber = ref('')
    
    const validationResult = reactive({
      isValid: false,
      cleanNumber: '',
      type: 'Unknown',
      luhnValid: false
    })

    const formatCardNumber = (number) => {
      const clean = number.replace(/\s/g, '')
      return clean.replace(/(.{4})/g, '$1 ').trim()
    }

    const detectCardType = (number) => {
      if (number.startsWith('4')) return 'Visa'
      if (number.startsWith('5') || number.startsWith('2')) return 'MasterCard'
      if (number.startsWith('3')) return 'American Express'
      if (number.startsWith('6')) return 'Discover'
      return 'Unknown'
    }

    const luhnCheck = (number) => {
      const digits = number.split('').map(Number).reverse()
      let sum = 0
      for (let i = 0; i < digits.length; i++) {
        let digit = digits[i]
        if (i % 2 === 1) {
          digit *= 2
          if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10)
        }
        sum += digit
      }
      return sum % 10 === 0
    }

    const validateCard = () => {
      const cleanNum = cardNumber.value.replace(/\s/g, '')
      
      if (cleanNum.length === 0) {
        Object.assign(validationResult, {
          isValid: false,
          cleanNumber: '',
          type: 'Unknown',
          luhnValid: false
        })
        return
      }

      if (cleanNum.length <= 19) {
        cardNumber.value = formatCardNumber(cleanNum)
      }

      const type = detectCardType(cleanNum)
      const luhnValid = luhnCheck(cleanNum)
      const isValidLength = cleanNum.length >= 13 && cleanNum.length <= 19

      Object.assign(validationResult, {
        isValid: isValidLength && luhnValid && type !== 'Unknown',
        cleanNumber: cleanNum,
        type: type,
        luhnValid: luhnValid
      })
    }

    const getCardIcon = (type) => {
      const icons = {
        'Visa': 'fab fa-cc-visa',
        'MasterCard': 'fab fa-cc-mastercard',
        'American Express': 'fab fa-cc-amex',
        'Discover': 'fab fa-cc-discover',
        'Unknown': 'fas fa-credit-card'
      }
      return icons[type] || icons['Unknown']
    }

    const loadExample = (type) => {
      const examples = {
        'visa': '4532123456789012',
        'mastercard': '5555555555554444',
        'amex': '378282246310005'
      }
      
      cardNumber.value = formatCardNumber(examples[type] || examples['visa'])
      validateCard()
    }

    return {
      cardNumber,
      validationResult,
      validateCard,
      getCardIcon,
      loadExample
    }
  }
}
</script>

<style scoped>
.credit-card-tool {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tool-header {
  margin-bottom: 2rem;
}

.card-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-gradient {
  padding: 2rem;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><circle cx="10" cy="10" r="8" fill="url(%23a)"/><circle cx="90" cy="10" r="8" fill="url(%23a)"/></svg>') repeat;
  opacity: 0.1;
}

.header-content {
  position: relative;
  z-index: 1;
}

.tool-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.tool-info p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.tool-content {
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.section-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.3rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.card-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 1.2rem;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.input-group small {
  display: block;
  margin-top: 0.3rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.example-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.example-btn {
  padding: 0.7rem 1.2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.example-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.validation-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

.validation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.validation-status.valid {
  color: var(--success-color);
}

.validation-status.invalid {
  color: var(--error-color);
}

.card-details {
  margin-bottom: 2rem;
}

.detail-row {
  margin-bottom: 0.8rem;
  color: var(--text-color);
}

.card-type {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  background: var(--primary-light);
  border-radius: 4px;
  font-weight: 500;
}

.valid {
  color: var(--success-color);
}

.invalid {
  color: var(--error-color);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}
</style> 