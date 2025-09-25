<template>
  <div class="single-tool">
    <h2><i class="fas fa-key"></i> 密码生成器</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 推荐配置
      </button>
    </div>
    
    <div class="form-group">
      <label>密码长度: <span>{{ passwordLength }}</span></label>
      <input type="range" v-model="passwordLength" min="4" max="50" class="modern-slider">
    </div>
    
    <div class="checkbox-group">
      <label><input type="checkbox" v-model="includeUppercase"> 包含大写字母</label>
      <label><input type="checkbox" v-model="includeLowercase"> 包含小写字母</label>
      <label><input type="checkbox" v-model="includeNumbers"> 包含数字</label>
      <label><input type="checkbox" v-model="includeSymbols"> 包含符号</label>
    </div>
    
    <button @click="generatePassword">生成密码</button>
    
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <input type="text" v-model="generatedPassword" readonly placeholder="生成的密码将显示在这里..." style="flex: 1;">
      <button v-if="generatedPassword" @click="copyPassword" style="background: #28a745; padding: 0.5rem;">
        <i class="fas fa-copy"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, getCurrentInstance } from 'vue'

export default {
  name: 'PasswordGenerator',
  props: {
    toolData: Object
  },
  setup() {
    const instance = getCurrentInstance()
    const passwordLength = ref(12)
    const includeUppercase = ref(true)
    const includeLowercase = ref(true)
    const includeNumbers = ref(true)
    const includeSymbols = ref(false)
    const generatedPassword = ref('')

    const loadExample = () => {
      passwordLength.value = 16
      includeUppercase.value = true
      includeLowercase.value = true
      includeNumbers.value = true
      includeSymbols.value = true
      
      setTimeout(() => {
        generatePassword()
      }, 500)
    }

    const generatePassword = () => {
      let charset = ''
      if (includeUppercase.value) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (includeLowercase.value) charset += 'abcdefghijklmnopqrstuvwxyz'
      if (includeNumbers.value) charset += '0123456789'
      if (includeSymbols.value) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      if (charset === '') {
        instance.proxy.$message.success('请至少选择一种字符类型！')
        return
      }
      
      let password = ''
      for (let i = 0; i < passwordLength.value; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      
      generatedPassword.value = password
    }

    const copyPassword = () => {
      if (generatedPassword.value) {
        navigator.clipboard.writeText(generatedPassword.value).then(() => {
          instance.proxy.$message.success('密码已复制到剪贴板！')
        }).catch(err => {
          console.error('复制失败:', err)
        })
      }
    }

    return {
      passwordLength,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      generatedPassword,
      loadExample,
      generatePassword,
      copyPassword
    }
  }
}
</script>

<style scoped>
/* 现代化 Slider 样式 */
.modern-slider {
  position: relative;
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modern-slider:hover {
  height: 10px;
  background: linear-gradient(90deg, #d1d5db 0%, #9ca3af 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.modern-slider:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.modern-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.modern-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.modern-slider::-webkit-slider-thumb:active {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modern-slider::-webkit-slider-track {
  height: 8px;
  background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 10px;
  border: none;
}

/* Firefox 样式 */
.modern-slider::-moz-range-track {
  height: 8px;
  background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 10px;
  border: none;
}

.modern-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.modern-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.modern-slider::-moz-range-thumb:active {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6), 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 深色主题适配 */
:global(.dark-theme) .modern-slider {
  background: linear-gradient(90deg, #374151 0%, #4b5563 100%);
}

:global(.dark-theme) .modern-slider:hover {
  background: linear-gradient(90deg, #4b5563 0%, #6b7280 100%);
}

:global(.dark-theme) .modern-slider::-webkit-slider-track {
  background: linear-gradient(90deg, #374151 0%, #4b5563 100%);
}

:global(.dark-theme) .modern-slider::-moz-range-track {
  background: linear-gradient(90deg, #374151 0%, #4b5563 100%);
}

:global(.dark-theme) .modern-slider::-webkit-slider-thumb {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-color: #1f2937;
}

:global(.dark-theme) .modern-slider::-webkit-slider-thumb:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

:global(.dark-theme) .modern-slider::-moz-range-thumb {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-color: #1f2937;
}

:global(.dark-theme) .modern-slider::-moz-range-thumb:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
</style> 