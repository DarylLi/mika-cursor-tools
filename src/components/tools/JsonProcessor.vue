<template>
  <div class="single-tool">
    <h2><i class="fas fa-code"></i> JSON处理</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="jsonInput" placeholder="请输入JSON数据..."></textarea>
    
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
      <button @click="formatJson">格式化</button>
      <button @click="compressJson">压缩</button>
      <button @click="validateJson">验证</button>
    </div>
    
    <div class="result-display">
      {{ jsonResult }}
      <span v-if="jsonStatus" :class="['status-indicator', jsonStatus.type]">
        {{ jsonStatus.message }}
      </span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'JsonProcessor',
  props: {
    toolData: Object
  },
  setup() {
    const jsonInput = ref('')
    const jsonResult = ref('')
    const jsonStatus = ref(null)

    const loadExample = () => {
      jsonInput.value = `{
  "name": "通用工具瑞士军刀",
  "version": "1.0.0",
  "description": "一站式实用工具集合",
  "features": [
    "文本处理",
    "编码转换",
    "密码生成",
    "二维码生成",
    "计算器"
  ],
  "technologies": {
    "frontend": "Vue3",
    "build": "Vite",
    "styling": "CSS3"
  },
  "author": "Mika",
  "license": "MIT"
}`
      
      setTimeout(() => {
        formatJson()
      }, 500)
    }

    const formatJson = () => {
      try {
        const parsed = JSON.parse(jsonInput.value)
        jsonResult.value = JSON.stringify(parsed, null, 2)
        jsonStatus.value = {
          type: 'valid',
          message: `✓ 有效JSON (${JSON.stringify(parsed).length} 字符)`
        }
      } catch (error) {
        jsonResult.value = '无效的JSON格式'
        jsonStatus.value = {
          type: 'invalid',
          message: `✗ 错误: ${error.message}`
        }
      }
    }

    const compressJson = () => {
      try {
        const parsed = JSON.parse(jsonInput.value)
        jsonResult.value = JSON.stringify(parsed)
        jsonStatus.value = {
          type: 'valid',
          message: `✓ 已压缩 (${jsonResult.value.length} 字符)`
        }
      } catch (error) {
        jsonResult.value = '无效的JSON格式'
        jsonStatus.value = {
          type: 'invalid',
          message: `✗ 错误: ${error.message}`
        }
      }
    }

    const validateJson = () => {
      try {
        const parsed = JSON.parse(jsonInput.value)
        const size = JSON.stringify(parsed).length
        const keys = Object.keys(parsed).length
        
        jsonResult.value = `JSON验证通过！
类型: ${Array.isArray(parsed) ? '数组' : typeof parsed}
大小: ${size} 字符
${typeof parsed === 'object' && !Array.isArray(parsed) ? `属性数: ${keys}` : ''}`
        
        jsonStatus.value = {
          type: 'valid',
          message: '✓ 验证通过'
        }
      } catch (error) {
        jsonResult.value = 'JSON格式错误'
        jsonStatus.value = {
          type: 'invalid',
          message: `✗ 错误: ${error.message}`
        }
      }
    }

    return {
      jsonInput,
      jsonResult,
      jsonStatus,
      loadExample,
      formatJson,
      compressJson,
      validateJson
    }
  }
}
</script> 