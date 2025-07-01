<template>
  <div class="single-tool">
    <h2><i class="fas fa-link"></i> Slug Generator</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="textInput" placeholder="请输入要转换的文本..."></textarea>
    
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
      <button @click="generateSlug('kebab')">kebab-case</button>
      <button @click="generateSlug('snake')">snake_case</button>
      <button @click="generateSlug('camel')">camelCase</button>
      <button @click="generateSlug('pascal')">PascalCase</button>
    </div>
    
    <div class="result-display">{{ slugResult }}</div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'SlugGenerator',
  props: {
    toolData: Object
  },
  setup() {
    const textInput = ref('')
    const slugResult = ref('')

    const loadExample = () => {
      textInput.value = '我的个人博客 - 技术分享与生活记录 2024'
      
      setTimeout(() => {
        generateSlug('kebab')
      }, 500)
    }

    const generateSlug = (type) => {
      const text = textInput.value.trim()
      if (!text) {
        slugResult.value = ''
        return
      }
      
      // 中文转拼音的简单映射（实际项目中可以使用pinyin库）
      const chineseMap = {
        '我': 'wo', '的': 'de', '个': 'ge', '人': 'ren', '博': 'bo', '客': 'ke',
        '技': 'ji', '术': 'shu', '分': 'fen', '享': 'xiang', '与': 'yu', '生': 'sheng',
        '活': 'huo', '记': 'ji', '录': 'lu', '和': 'he', '或': 'huo', '者': 'zhe'
      }
      
      let processed = text
        // 替换中文字符
        .replace(/[\u4e00-\u9fa5]/g, (char) => chineseMap[char] || 'x')
        // 移除特殊字符，保留字母数字和空格连字符
        .replace(/[^\w\s-]/g, '')
        // 转为小写
        .toLowerCase()
        // 替换多个空格为单个空格
        .replace(/\s+/g, ' ')
        .trim()
      
      switch(type) {
        case 'kebab':
          slugResult.value = processed.replace(/[\s_]/g, '-')
          break
        case 'snake':
          slugResult.value = processed.replace(/[\s-]/g, '_')
          break
        case 'camel':
          slugResult.value = processed.replace(/[\s-_]+(.)/g, (_, char) => char.toUpperCase())
          break
        case 'pascal':
          const camelCase = processed.replace(/[\s-_]+(.)/g, (_, char) => char.toUpperCase())
          slugResult.value = camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
          break
        default:
          slugResult.value = processed.replace(/\s+/g, '-')
      }
    }

    return {
      textInput,
      slugResult,
      loadExample,
      generateSlug
    }
  }
}
</script> 