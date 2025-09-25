<template>
  <div class="bcrypt-hash-tool">
    <div class="tool-header">
      <h2><i class="fas fa-shield-alt"></i> Bcrypt Hash Generator</h2>
      <p>生成和验证Bcrypt哈希值，常用于密码加密存储</p>
    </div>

    <div class="tool-content">
      <!-- 哈希生成部分 -->
      <div class="section">
        <h3><i class="fas fa-lock"></i> 生成Bcrypt哈希</h3>
        <div class="input-group">
          <label for="passwordInput">输入密码：</label>
          <div class="password-input-wrapper">
            <input 
              id="passwordInput"
              v-model="password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入要加密的密码"
              class="password-input"
              @input="generateHash"
            />
            <button 
              @click="showPassword = !showPassword" 
              class="toggle-password-btn"
              :title="showPassword ? '隐藏密码' : '显示密码'"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="input-group">
          <label for="saltRounds">Salt Rounds (4-12)：</label>
          <input 
            id="saltRounds"
            v-model.number="saltRounds" 
            type="number" 
            min="4" 
            max="12" 
            class="salt-input"
            @input="generateHash"
          />
          <small>建议值：10-12（更高更安全，但计算更慢）</small>
        </div>

        <div class="result-section">
          <label>生成的哈希值：</label>
          <div class="hash-result">
            <textarea 
              v-model="hashedPassword" 
              readonly 
              placeholder="哈希值将在这里显示..."
              class="hash-output"
            ></textarea>
            <button 
              @click="copyToClipboard(hashedPassword)" 
              :disabled="!hashedPassword"
              class="copy-btn"
              title="复制哈希值"
            >
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 示例和说明 -->
      <div class="section">
        <h3><i class="fas fa-lightbulb"></i> 使用说明</h3>
        <div class="example-section">
          <button @click="loadExample" class="example-btn">
            <i class="fas fa-play"></i> 加载示例
          </button>
        </div>

        <div class="warning-note">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>注意：</strong>这是客户端模拟实现，实际应用中请使用服务端的bcrypt库以确保安全性。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'BcryptHash',
  setup() {
    const password = ref('')
    const saltRounds = ref(10)
    const hashedPassword = ref('')
    const showPassword = ref(false)

    const generateHash = () => {
      if (!password.value) {
        hashedPassword.value = ''
        return
      }

      try {
        const salt = generateSalt()
        const hash = simpleHash(password.value + salt, saltRounds.value)
        hashedPassword.value = `$2b$${saltRounds.value.toString().padStart(2, '0')}$${salt}${hash}`
      } catch (error) {
        console.error('生成哈希失败:', error)
        hashedPassword.value = ''
      }
    }

    const generateSalt = (length = 22) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'
      let result = ''
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    const simpleHash = (input, rounds) => {
      let hash = input
      for (let i = 0; i < Math.min(Math.pow(2, rounds), 1024); i++) {
        let newHash = ''
        for (let j = 0; j < hash.length; j++) {
          newHash += String.fromCharCode((hash.charCodeAt(j) * 17 + i) % 126 + 33)
        }
        hash = newHash.substring(0, 31)
      }
      return btoa(hash).substring(0, 31)
    }

    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    const loadExample = () => {
      password.value = 'mySecretPassword123'
      saltRounds.value = 10
      generateHash()
    }

    return {
      password,
      saltRounds,
      hashedPassword,
      showPassword,
      generateHash,
      copyToClipboard,
      loadExample
    }
  }
}
</script>

<style scoped>
.bcrypt-hash-tool {
  max-width: 800px;
  margin: 0 auto;
  padding: 10px;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.tool-header h2 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.tool-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid var(--border-color);
}

.section h3 {
  color: var(--primary-color);
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.input-group {
  margin-bottom: 10px;
}

.input-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: var(--text-primary);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input,
.salt-input {
  width: 100%;
  padding: 10px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.password-input {
  padding-right: 45px;
}

.password-input:focus,
.salt-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
  padding: 0;
}

.toggle-password-btn:hover {
  color: var(--primary-color);
}

.salt-input {
  max-width: 120px;
}

.input-group small {
  display: block;
  margin-top: 5px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.result-section {
  margin-top: 20px;
}

.hash-result {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.hash-output {
  flex: 1;
  min-height: 80px;
  padding: 10px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  resize: vertical;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.copy-btn {
  padding: 10px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.copy-btn:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
}

.example-section {
  text-align: center;
  margin: 20px 0;
}

.example-btn {
  padding: 10px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.example-btn:hover {
  background: var(--accent-hover);
}

.warning-note {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
  margin-top: 20px;
}

.warning-note i {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .bcrypt-hash-tool {
    padding: 10px;
  }
  
  .section {
    padding: 10px;
  }
  
  .hash-result {
    flex-direction: column;
  }
  
  .copy-btn {
    align-self: stretch;
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
