<template>
  <div class="single-tool">
    <h2><i class="fas fa-text-height"></i> 文本格式化</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="textInput" placeholder="请输入要处理的文本..."></textarea>
    
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
      <button @click="formatText('upper')">转大写</button>
      <button @click="formatText('lower')">转小写</button>
      <button @click="formatText('title')">标题格式</button>
      <button @click="formatText('reverse')">反转文本</button>
    </div>
    
    <div class="result-display">{{ textResult }}</div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TextFormatter',
  props: {
    toolData: Object
  },
  setup() {
    const textInput = ref('')
    const textResult = ref('')

    const loadExample = () => {
      textInput.value = `通用工具瑞士军刀
Swiss Army Tools
一站式实用工具集合
让工作更高效！`
      
      setTimeout(() => {
        formatText('title')
      }, 500)
    }

    const formatText = (type) => {
      const text = textInput.value
      
      switch(type) {
        case 'upper':
          textResult.value = text.toUpperCase()
          break
        case 'lower':
          textResult.value = text.toLowerCase()
          break
        case 'title':
          textResult.value = text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
          break
        case 'reverse':
          textResult.value = text.split('').reverse().join('')
          break
        default:
          textResult.value = text
      }
    }

    return {
      textInput,
      textResult,
      loadExample,
      formatText
    }
  }
}
</script> 