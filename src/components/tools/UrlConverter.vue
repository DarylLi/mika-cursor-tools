<template>
  <div class="single-tool">
    <h2><i class="fas fa-link"></i> URL 编码/解码</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="urlInput" placeholder="输入要编码/解码的URL..."></textarea>
    
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
      <button @click="encode">编码</button>
      <button @click="decode">解码</button>
    </div>
    
    <div class="result-display">{{ result }}</div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'UrlConverter',
  props: {
    toolData: Object
  },
  setup() {
    const urlInput = ref('')
    const result = ref('')

    const loadExample = () => {
      urlInput.value = 'https://example.com/search?q=Vue3 工具&type=开发工具&category=前端框架'
      
      setTimeout(() => {
        encode()
      }, 500)
    }

    const encode = () => {
      try {
        result.value = encodeURIComponent(urlInput.value)
      } catch (error) {
        result.value = '编码失败: ' + error.message
      }
    }

    const decode = () => {
      try {
        result.value = decodeURIComponent(urlInput.value)
      } catch (error) {
        result.value = '解码失败: ' + error.message
      }
    }

    return {
      urlInput,
      result,
      loadExample,
      encode,
      decode
    }
  }
}
</script> 