<template>
  <div class="single-tool">
    <h2><i class="fas fa-chart-bar"></i> 文本统计</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="statsInput" @input="updateStats" placeholder="请输入要统计的文本..."></textarea>
    
    <div class="result-display">
      字符数: {{ stats.chars }}
      单词数: {{ stats.words }}
      行数: {{ stats.lines }}
      段落数: {{ stats.paragraphs }}
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'TextStats',
  props: {
    toolData: Object
  },
  setup() {
    const statsInput = ref('')
    
    const stats = reactive({
      chars: 0,
      words: 0,
      lines: 0,
      paragraphs: 0
    })

    const loadExample = () => {
      statsInput.value = `通用工具瑞士军刀是一个现代化的Web应用程序。

它集成了多种实用工具，包括：
- 文本处理和格式化
- 编码转换工具
- 密码生成器
- 二维码生成
- 计算器功能

这个项目使用Vue3和Vite构建，提供了优秀的用户体验。`
      
      setTimeout(() => {
        updateStats()
      }, 500)
    }

    const updateStats = () => {
      const text = statsInput.value
      
      stats.chars = text.length
      stats.words = text.trim() ? text.trim().split(/\s+/).length : 0
      stats.lines = text.split('\n').length
      stats.paragraphs = text.trim() ? text.split(/\n\s*\n/).length : 0
    }

    return {
      statsInput,
      stats,
      loadExample,
      updateStats
    }
  }
}
</script> 