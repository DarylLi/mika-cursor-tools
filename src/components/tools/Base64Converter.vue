<template>
  <div class="single-tool">
    <h2><i class="fas fa-code"></i> Base64 编码/解码</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="base64Input" placeholder="输入要编码/解码的文本..."></textarea>
    
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
  name: 'Base64Converter',
  props: {
    toolData: Object
  },
  setup() {
    const base64Input = ref('')
    const result = ref('')

    const loadExample = () => {
      base64Input.value = '通用工具瑞士军刀\nSwiss Army Tools\n一站式实用工具集合'
      
      setTimeout(() => {
        encode()
      }, 500)
    }

    const encode = () => {
      try {
        result.value = btoa(unescape(encodeURIComponent(base64Input.value)))
      } catch (error) {
        result.value = '编码失败: ' + error.message
      }
    }

    const decode = () => {
      try {
        result.value = decodeURIComponent(escape(atob(base64Input.value)))
      } catch (error) {
        result.value = '解码失败: ' + error.message
      }
    }

    return {
      base64Input,
      result,
      loadExample,
      encode,
      decode
    }
  }
}
</script> 