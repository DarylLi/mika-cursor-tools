<template>
  <div class="single-tool">
    <h2><i class="fas fa-shield-alt"></i> SHA-256 Hash</h2>
    <p>计算安全的SHA-256哈希值，适用于密码存储和数据完整性验证</p>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="inputText" placeholder="输入要计算SHA-256哈希的文本..."></textarea>
    
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
      <button @click="calculateHash">计算 SHA-256</button>
      <button @click="clearText">清空</button>
    </div>
    
    <div class="result-display" v-if="result">
      <div class="hash-result">
        <label>SHA-256 哈希值:</label>
        <div class="hash-value">{{ result }}</div>
        <button @click="copyHash" class="copy-btn">
          <i class="fas fa-copy"></i> 复制
        </button>
      </div>
    </div>

    <div class="info-section">
      <h4><i class="fas fa-info-circle"></i> 关于 SHA-256</h4>
      <p>SHA-256 是一种安全的密码散列函数，比MD5更安全，推荐用于安全敏感场景。</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import CryptoJS from 'crypto-js'

export default {
  name: 'Sha256Hash',
  props: {
    toolData: Object
  },
  setup() {
    const inputText = ref('')
    const result = ref('')

    const loadExample = () => {
      inputText.value = 'Hello, World!'
      calculateHash()
    }

    const calculateHash = () => {
      if (!inputText.value) {
        result.value = ''
        return
      }
      result.value = CryptoJS.SHA256(inputText.value).toString()
    }

    const clearText = () => {
      inputText.value = ''
      result.value = ''
    }

    const copyHash = async () => {
      try {
        await navigator.clipboard.writeText(result.value)
      } catch (e) {
        console.error('复制失败:', e)
      }
    }

    return {
      inputText,
      result,
      loadExample,
      calculateHash,
      clearText,
      copyHash
    }
  }
}
</script>

<style scoped>
.hash-result {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hash-value {
  background: #f3f4f6;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.copy-btn {
  align-self: flex-start;
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-btn:hover {
  background: #059669;
}

.info-section {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.info-section h4 {
  margin: 0 0 10px 0;
  color: #1e40af;
}

.info-section p {
  margin: 0;
  color: #1e40af;
  line-height: 1.5;
}
</style> 