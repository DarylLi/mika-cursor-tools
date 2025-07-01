<template>
  <div class="single-tool">
    <h2><i class="fas fa-search"></i> RegEx Tester</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <div style="margin-bottom: 1rem;">
      <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">正则表达式:</label>
      <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
        <span>/</span>
        <input 
          v-model="regexPattern" 
          placeholder="输入正则表达式..."
          style="flex: 1; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; font-family: 'Courier New', monospace;"
          @input="testRegex"
        >
        <span>/</span>
        <div style="display: flex; gap: 0.25rem;">
          <label style="display: flex; align-items: center; gap: 0.25rem;">
            <input type="checkbox" v-model="flags.global" @change="testRegex">
            g
          </label>
          <label style="display: flex; align-items: center; gap: 0.25rem;">
            <input type="checkbox" v-model="flags.ignoreCase" @change="testRegex">
            i
          </label>
          <label style="display: flex; align-items: center; gap: 0.25rem;">
            <input type="checkbox" v-model="flags.multiline" @change="testRegex">
            m
          </label>
        </div>
      </div>
      
      <div v-if="regexError" style="color: #cc0000; font-size: 0.8rem; margin-bottom: 0.5rem;">
        {{ regexError }}
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; height: 400px;">
      <div style="display: flex; flex-direction: column;">
        <h3>测试文本</h3>
        <textarea 
          v-model="testText" 
          placeholder="输入要测试的文本..."
          style="flex: 1; resize: none; font-family: 'Courier New', monospace;"
          @input="testRegex"
        ></textarea>
      </div>
      
      <div style="display: flex; flex-direction: column;">
        <h3>匹配结果</h3>
        <div 
          class="match-display" 
          v-html="highlightedText"
          style="flex: 1; border: 1px solid var(--border-color); padding: 1rem; overflow-y: auto; background: var(--bg-surface); font-family: 'Courier New', monospace; white-space: pre-wrap; line-height: 1.4;"
        ></div>
      </div>
    </div>
    
    <div style="margin-top: 1rem;">
      <div class="stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; text-align: center; margin-bottom: 1rem;">
        <div>
          <div style="font-weight: bold; color: var(--text-accent);">{{ matchCount }}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">匹配次数</div>
        </div>
        <div>
          <div style="font-weight: bold; color: var(--text-accent);">{{ groupCount }}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">捕获组</div>
        </div>
        <div>
          <div style="font-weight: bold; color: var(--text-accent);">{{ textLength }}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">文本长度</div>
        </div>
      </div>
      
      <div v-if="matches.length > 0" style="margin-bottom: 1rem;">
        <h4>匹配详情:</h4>
        <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 4px; background: var(--bg-surface);">
          <div v-for="(match, index) in matches" :key="index" style="margin-bottom: 0.5rem; padding: 0.5rem; border-left: 3px solid var(--text-accent); background: rgba(59, 130, 246, 0.1);">
            <div style="font-weight: bold;">匹配 {{ index + 1 }}: "{{ match.match }}"</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">位置: {{ match.index }} - {{ match.index + match.match.length }}</div>
            <div v-if="match.groups.length > 0" style="font-size: 0.8rem; margin-top: 0.25rem;">
              <span style="color: var(--text-muted);">捕获组:</span>
              <span v-for="(group, gIndex) in match.groups" :key="gIndex" style="margin-left: 0.5rem;">
                [{{ gIndex + 1 }}]: "{{ group }}"
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button @click="copyMatches">复制匹配结果</button>
        <button @click="copyRegex">复制正则表达式</button>
        <button @click="clearAll">清空</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'RegexTester',
  props: {
    toolData: Object
  },
  setup() {
    const regexPattern = ref('')
    const testText = ref('')
    const regexError = ref('')
    const matches = ref([])
    const flags = ref({
      global: true,
      ignoreCase: false,
      multiline: false
    })

    const matchCount = computed(() => matches.value.length)
    const groupCount = computed(() => {
      return matches.value.reduce((total, match) => total + match.groups.length, 0)
    })
    const textLength = computed(() => testText.value.length)

    const highlightedText = computed(() => {
      if (!testText.value || matches.value.length === 0) {
        return testText.value.replace(/\n/g, '<br>')
      }
      
      let result = testText.value
      let offset = 0
      
      // 按位置倒序排列，避免索引偏移问题
      const sortedMatches = [...matches.value].sort((a, b) => b.index - a.index)
      
      for (const match of sortedMatches) {
        const start = match.index
        const end = start + match.match.length
        const highlighted = `<span style="background-color: #ffeb3b; color: #333; padding: 0.1rem 0.2rem; border-radius: 2px; font-weight: bold;">${match.match}</span>`
        result = result.slice(0, start) + highlighted + result.slice(end)
      }
      
      return result.replace(/\n/g, '<br>')
    })

    const loadExample = () => {
      regexPattern.value = '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
      testText.value = `请联系我们:
业务咨询: business@example.com
技术支持: support@company.co.uk  
客服邮箱: service@demo.org.cn
错误示例: invalid-email-format
另一个邮箱: hello@world.tech`
      
      flags.value.global = true
      flags.value.ignoreCase = true
      
      setTimeout(() => {
        testRegex()
      }, 500)
    }

    const testRegex = () => {
      regexError.value = ''
      matches.value = []
      
      if (!regexPattern.value || !testText.value) {
        return
      }
      
      try {
        let flagString = ''
        if (flags.value.global) flagString += 'g'
        if (flags.value.ignoreCase) flagString += 'i'
        if (flags.value.multiline) flagString += 'm'
        
        const regex = new RegExp(regexPattern.value, flagString)
        
        if (flags.value.global) {
          let match
          while ((match = regex.exec(testText.value)) !== null) {
            matches.value.push({
              match: match[0],
              index: match.index,
              groups: match.slice(1)
            })
            
            // 防止无限循环
            if (!flags.value.global) break
            if (match.index === regex.lastIndex) {
              regex.lastIndex++
            }
          }
        } else {
          const match = regex.exec(testText.value)
          if (match) {
            matches.value.push({
              match: match[0],
              index: match.index,
              groups: match.slice(1)
            })
          }
        }
      } catch (error) {
        regexError.value = `正则表达式错误: ${error.message}`
      }
    }

    const copyMatches = () => {
      if (matches.value.length === 0) {
        alert('没有匹配结果可复制')
        return
      }
      
      const result = matches.value.map((match, index) => 
        `匹配 ${index + 1}: "${match.match}" (位置: ${match.index})`
      ).join('\n')
      
      navigator.clipboard.writeText(result)
      alert('匹配结果已复制到剪贴板！')
    }

    const copyRegex = () => {
      if (!regexPattern.value) {
        alert('没有正则表达式可复制')
        return
      }
      
      let flagString = ''
      if (flags.value.global) flagString += 'g'
      if (flags.value.ignoreCase) flagString += 'i'
      if (flags.value.multiline) flagString += 'm'
      
      const regexString = `/${regexPattern.value}/${flagString}`
      navigator.clipboard.writeText(regexString)
      alert('正则表达式已复制到剪贴板！')
    }

    const clearAll = () => {
      regexPattern.value = ''
      testText.value = ''
      matches.value = []
      regexError.value = ''
    }

    return {
      regexPattern,
      testText,
      regexError,
      matches,
      flags,
      matchCount,
      groupCount,
      textLength,
      highlightedText,
      loadExample,
      testRegex,
      copyMatches,
      copyRegex,
      clearAll
    }
  }
}
</script> 