<template>
  <div class="single-tool">
    <h2><i class="fas fa-shield-alt"></i> 密码强度检测</h2>
    <p>分析密码强度，提供安全建议</p>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <input 
      v-model="password" 
      @input="checkStrength"
      type="password" 
      placeholder="输入密码..." 
      class="password-input"
    >
    
    <div class="show-password">
      <label>
        <input v-model="showPassword" type="checkbox">
        显示密码
      </label>
    </div>
    
    <div v-if="showPassword" class="password-display">{{ password }}</div>

    <div v-if="strength" class="result-display">
      <div class="strength-meter">
        <div class="strength-label">密码强度:</div>
        <div class="strength-bar">
          <div 
            class="strength-fill" 
            :class="strength.level"
            :style="{ width: strength.score + '%' }"
          ></div>
        </div>
        <div class="strength-text" :class="strength.level">
          {{ strength.text }} ({{ strength.score }}/100)
        </div>
      </div>

      <div class="password-analysis">
        <h4>密码分析:</h4>
        <div class="analysis-grid">
          <div class="analysis-item" :class="{ passed: analysis.length }">
            <i :class="analysis.length ? 'fas fa-check' : 'fas fa-times'"></i>
            长度: {{ password.length }} 字符 {{ analysis.length ? '✓' : '(建议8+)' }}
          </div>
          <div class="analysis-item" :class="{ passed: analysis.uppercase }">
            <i :class="analysis.uppercase ? 'fas fa-check' : 'fas fa-times'"></i>
            大写字母 {{ analysis.uppercase ? '✓' : '✗' }}
          </div>
          <div class="analysis-item" :class="{ passed: analysis.lowercase }">
            <i :class="analysis.lowercase ? 'fas fa-check' : 'fas fa-times'"></i>
            小写字母 {{ analysis.lowercase ? '✓' : '✗' }}
          </div>
          <div class="analysis-item" :class="{ passed: analysis.numbers }">
            <i :class="analysis.numbers ? 'fas fa-check' : 'fas fa-times'"></i>
            数字 {{ analysis.numbers ? '✓' : '✗' }}
          </div>
          <div class="analysis-item" :class="{ passed: analysis.symbols }">
            <i :class="analysis.symbols ? 'fas fa-check' : 'fas fa-times'"></i>
            特殊字符 {{ analysis.symbols ? '✓' : '✗' }}
          </div>
          <div class="analysis-item" :class="{ passed: !analysis.common }">
            <i :class="!analysis.common ? 'fas fa-check' : 'fas fa-times'"></i>
            {{ analysis.common ? '常见密码 ✗' : '非常见密码 ✓' }}
          </div>
        </div>
      </div>

      <div v-if="suggestions.length" class="suggestions">
        <h4>改进建议:</h4>
        <ul>
          <li v-for="suggestion in suggestions" :key="suggestion">{{ suggestion }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'PasswordStrength',
  props: {
    toolData: Object
  },
  setup() {
    const password = ref('')
    const showPassword = ref(false)

    // 常见密码列表（简化版）
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', '123123'
    ]

    // 密码分析
    const analysis = computed(() => {
      if (!password.value) return {}
      
      return {
        length: password.value.length >= 8,
        uppercase: /[A-Z]/.test(password.value),
        lowercase: /[a-z]/.test(password.value),
        numbers: /\d/.test(password.value),
        symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.value),
        common: commonPasswords.includes(password.value.toLowerCase())
      }
    })

    // 密码强度计算
    const strength = computed(() => {
      if (!password.value) return null
      
      let score = 0
      
      // 长度评分
      if (password.value.length >= 8) score += 25
      if (password.value.length >= 12) score += 10
      if (password.value.length >= 16) score += 10
      
      // 字符类型评分
      if (analysis.value.uppercase) score += 15
      if (analysis.value.lowercase) score += 15
      if (analysis.value.numbers) score += 15
      if (analysis.value.symbols) score += 15
      
      // 扣分项
      if (analysis.value.common) score -= 30
      if (password.value.length < 6) score -= 20
      
      score = Math.max(0, Math.min(100, score))
      
      let level, text
      if (score < 30) {
        level = 'weak'
        text = '弱'
      } else if (score < 60) {
        level = 'medium'
        text = '中等'
      } else if (score < 80) {
        level = 'strong'
        text = '强'
      } else {
        level = 'very-strong'
        text = '很强'
      }
      
      return { score, level, text }
    })

    // 改进建议
    const suggestions = computed(() => {
      if (!password.value) return []
      
      const tips = []
      if (!analysis.value.length) tips.push('增加密码长度至少8个字符')
      if (!analysis.value.uppercase) tips.push('添加大写字母')
      if (!analysis.value.lowercase) tips.push('添加小写字母')
      if (!analysis.value.numbers) tips.push('添加数字')
      if (!analysis.value.symbols) tips.push('添加特殊字符 (!@#$%^&*)')
      if (analysis.value.common) tips.push('避免使用常见密码')
      if (password.value.length > 0 && password.value.length < 6) tips.push('密码太短，建议至少8个字符')
      
      return tips
    })

    const checkStrength = () => {
      // 触发计算
    }

    const loadExample = () => {
      password.value = 'MyStr0ng!P@ssw0rd'
      checkStrength()
    }

    return {
      password,
      showPassword,
      analysis,
      strength,
      suggestions,
      checkStrength,
      loadExample
    }
  }
}
</script>

<style scoped>
.password-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
}

.show-password {
  margin-bottom: 15px;
}

.show-password label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.password-display {
  background: #f3f4f6;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  margin-bottom: 15px;
  border: 1px solid #e5e7eb;
}

.strength-meter {
  margin-bottom: 20px;
}

.strength-label {
  font-weight: 600;
  margin-bottom: 8px;
}

.strength-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-fill.weak { background: #ef4444; }
.strength-fill.medium { background: #f59e0b; }
.strength-fill.strong { background: #10b981; }
.strength-fill.very-strong { background: #059669; }

.strength-text {
  font-weight: 600;
}

.strength-text.weak { color: #ef4444; }
.strength-text.medium { color: #f59e0b; }
.strength-text.strong { color: #10b981; }
.strength-text.very-strong { color: #059669; }

.password-analysis {
  margin-bottom: 20px;
}

.analysis-grid {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  background: #fef2f2;
  color: #dc2626;
}

.analysis-item.passed {
  background: #f0fdf4;
  color: #16a34a;
}

.suggestions {
  background: #fefce8;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #fde047;
}

.suggestions h4 {
  margin: 0 0 10px 0;
  color: #a16207;
}

.suggestions ul {
  margin: 0;
  padding-left: 20px;
  color: #a16207;
}

.suggestions li {
  margin-bottom: 5px;
}
</style>


