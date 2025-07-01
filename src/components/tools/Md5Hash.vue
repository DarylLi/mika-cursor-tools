<template>
  <div class="single-tool">
    <h2><i class="fas fa-hashtag"></i> MD5 Hash</h2>
    <p>计算文本的MD5哈希值</p>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="inputText" placeholder="输入要计算MD5哈希的文本..."></textarea>
    
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
      <button @click="calculateHash">计算 MD5</button>
      <button @click="clearText">清空</button>
    </div>
    
    <div class="result-display" v-if="result">
      <div class="hash-result">
        <label>MD5 哈希值:</label>
        <div class="hash-value">{{ result }}</div>
        <button @click="copyHash" class="copy-btn">
          <i class="fas fa-copy"></i> 复制
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import CryptoJS from 'crypto-js'

export default {
  name: 'Md5Hash',
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
      result.value = CryptoJS.MD5(inputText.value).toString()
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
}

.copy-btn {
  align-self: flex-start;
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-btn:hover {
  background: #2563eb;
}
</style> 