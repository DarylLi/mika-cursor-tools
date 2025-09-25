<template>
  <div class="single-tool">
    <h2><i class="fas fa-exchange-alt"></i> YAML ↔ JSON Converter</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; height: 500px;">
      <div style="display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h3>YAML 输入</h3>
          <button @click="convertToJson" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">YAML → JSON</button>
        </div>
        <textarea 
          v-model="yamlInput" 
          placeholder="请输入 YAML 格式数据..."
          style="flex: 1; resize: none; font-family: 'Courier New', monospace;"
        ></textarea>
      </div>
      
      <div style="display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h3>JSON 输出</h3>
          <button @click="convertToYaml" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">JSON → YAML</button>
        </div>
        <textarea 
          v-model="jsonOutput" 
          placeholder="JSON 输出将显示在这里..."
          style="flex: 1; resize: none; font-family: 'Courier New', monospace;"
        ></textarea>
      </div>
    </div>
    
    <div style="margin-top: 1rem;">
      <button @click="formatJson">格式化 JSON</button>
      <button @click="minifyJson">压缩 JSON</button>
      <button @click="copyYaml">复制 YAML</button>
      <button @click="copyJson">复制 JSON</button>
    </div>
    
    <div v-if="errorMessage" class="error-message" style="margin-top: 1rem; padding: 0.5rem; background: #ffe6e6; border: 1px solid #ff9999; border-radius: 4px; color: #cc0000;">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, getCurrentInstance } from 'vue'

export default {
  name: 'YamlToJson',
  props: {
    toolData: Object
  },
  setup() {
    const instance = getCurrentInstance()
    const yamlInput = ref('')
    const jsonOutput = ref('')
    const errorMessage = ref('')

    const loadExample = () => {
      yamlInput.value = `# 用户配置示例
name: 张三
age: 28
email: zhangsan@example.com
address:
  street: 中山路123号
  city: 北京
  zipcode: 100000
skills:
  - JavaScript
  - Python
  - Vue.js
  - Node.js
settings:
  theme: dark
  language: zh-CN
  notifications:
    email: true
    sms: false
active: true`
      
      setTimeout(() => {
        convertToJson()
      }, 500)
    }

    // 简单的 YAML 解析器
    const parseYaml = (yamlStr) => {
      const lines = yamlStr.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
      const result = {}
      const stack = [{ obj: result, indent: -1 }]
      
      for (const line of lines) {
        const indent = line.length - line.trimStart().length
        const trimmed = line.trim()
        
        // 处理数组项
        if (trimmed.startsWith('- ')) {
          const value = trimmed.substring(2).trim()
          let parent = stack[stack.length - 1]
          
          // 找到正确的父级
          while (parent.indent >= indent && stack.length > 1) {
            stack.pop()
            parent = stack[stack.length - 1]
          }
          
          if (!Array.isArray(parent.lastArray)) {
            parent.lastArray = []
            if (parent.lastKey) {
              parent.obj[parent.lastKey] = parent.lastArray
            }
          }
          
          parent.lastArray.push(parseValue(value))
        }
        // 处理键值对
        else if (trimmed.includes(':')) {
          const [key, ...valueParts] = trimmed.split(':')
          const value = valueParts.join(':').trim()
          
          // 找到正确的父级对象
          while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
            stack.pop()
          }
          
          const parent = stack[stack.length - 1]
          
          if (value === '' || value === null) {
            // 这是一个对象
            const newObj = {}
            parent.obj[key.trim()] = newObj
            stack.push({ obj: newObj, indent, lastKey: null, lastArray: null })
          } else {
            // 这是一个值
            parent.obj[key.trim()] = parseValue(value)
            parent.lastKey = key.trim()
            parent.lastArray = null
          }
        }
      }
      
      return result
    }

    const parseValue = (value) => {
      if (value === 'true') return true
      if (value === 'false') return false
      if (value === 'null') return null
      if (/^-?\d+$/.test(value)) return parseInt(value)
      if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value)
      return value
    }

    // 简单的 JSON 到 YAML 转换器
    const jsonToYaml = (obj, indent = 0) => {
      const spaces = '  '.repeat(indent)
      let yaml = ''
      
      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (typeof item === 'object' && item !== null) {
            yaml += `${spaces}- \n${jsonToYaml(item, indent + 1)}`
          } else {
            yaml += `${spaces}- ${item}\n`
          }
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) {
            yaml += `${spaces}${key}:\n`
            yaml += jsonToYaml(value, indent + 1)
          } else if (typeof value === 'object' && value !== null) {
            yaml += `${spaces}${key}:\n`
            yaml += jsonToYaml(value, indent + 1)
          } else {
            yaml += `${spaces}${key}: ${value}\n`
          }
        }
      }
      
      return yaml
    }

    const convertToJson = () => {
      try {
        errorMessage.value = ''
        const yamlData = parseYaml(yamlInput.value)
        jsonOutput.value = JSON.stringify(yamlData, null, 2)
      } catch (error) {
        errorMessage.value = `YAML 解析错误: ${error.message}`
        jsonOutput.value = ''
      }
    }

    const convertToYaml = () => {
      try {
        errorMessage.value = ''
        const jsonData = JSON.parse(jsonOutput.value)
        yamlInput.value = jsonToYaml(jsonData).trim()
      } catch (error) {
        errorMessage.value = `JSON 解析错误: ${error.message}`
        yamlInput.value = ''
      }
    }

    const formatJson = () => {
      try {
        errorMessage.value = ''
        const parsed = JSON.parse(jsonOutput.value)
        jsonOutput.value = JSON.stringify(parsed, null, 2)
      } catch (error) {
        errorMessage.value = `JSON 格式化错误: ${error.message}`
      }
    }

    const minifyJson = () => {
      try {
        errorMessage.value = ''
        const parsed = JSON.parse(jsonOutput.value)
        jsonOutput.value = JSON.stringify(parsed)
      } catch (error) {
        errorMessage.value = `JSON 压缩错误: ${error.message}`
      }
    }

    const copyYaml = () => {
      if (yamlInput.value) {
        navigator.clipboard.writeText(yamlInput.value)
        instance.proxy.$message.success('YAML 已复制到剪贴板！')
      }
    }

    const copyJson = () => {
      if (jsonOutput.value) {
        navigator.clipboard.writeText(jsonOutput.value)
        instance.proxy.$message.success('JSON 已复制到剪贴板！')
      }
    }

    return {
      yamlInput,
      jsonOutput,
      errorMessage,
      loadExample,
      convertToJson,
      convertToYaml,
      formatJson,
      minifyJson,
      copyYaml,
      copyJson
    }
  }
}
</script> 