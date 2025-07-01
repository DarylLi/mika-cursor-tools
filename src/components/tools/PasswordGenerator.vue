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
      <input type="range" v-model="passwordLength" min="4" max="50">
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
import { ref } from 'vue'

export default {
  name: 'PasswordGenerator',
  props: {
    toolData: Object
  },
  setup() {
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
        alert('请至少选择一种字符类型！')
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
          alert('密码已复制到剪贴板！')
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