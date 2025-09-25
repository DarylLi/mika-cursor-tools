<template>
  <div class="single-tool">
    <h2><i class="fas fa-code-branch"></i> Text Diff Viewer</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; height: 400px; margin-bottom: 1rem;">
      <div style="display: flex; flex-direction: column;">
        <h3>原始文本 (A)</h3>
        <textarea 
          v-model="textA" 
          placeholder="输入原始文本..."
          style="flex: 1; resize: none; font-family: 'Courier New', monospace;"
          @input="calculateDiff"
        ></textarea>
      </div>
      
      <div style="display: flex; flex-direction: column;">
        <h3>对比文本 (B)</h3>
        <textarea 
          v-model="textB" 
          placeholder="输入对比文本..."
          style="flex: 1; resize: none; font-family: 'Courier New', monospace;"
          @input="calculateDiff"
        ></textarea>
      </div>
    </div>
    
    <div class="checkbox-options-container">
      <div class="checkbox-group-horizontal">
        <label class="custom-checkbox-label">
          <input type="checkbox" v-model="ignoreWhitespace" @change="calculateDiff" class="custom-checkbox">
          <span class="checkbox-text">忽略空白字符</span>
        </label>
        <label class="custom-checkbox-label">
          <input type="checkbox" v-model="ignoreCase" @change="calculateDiff" class="custom-checkbox">
          <span class="checkbox-text">忽略大小写</span>
        </label>
        <label class="custom-checkbox-label">
          <input type="checkbox" v-model="showLineNumbers" @change="calculateDiff" class="custom-checkbox">
          <span class="checkbox-text">显示行号</span>
        </label>
      </div>
    </div>
    
    <div class="stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; text-align: center; margin-bottom: 1rem; padding: 1rem; background: var(--bg-surface); border-radius: 4px;">
      <div>
        <div style="font-weight: bold; color: #22c55e;">{{ addedLines }}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">新增行数</div>
      </div>
      <div>
        <div style="font-weight: bold; color: #ef4444;">{{ deletedLines }}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">删除行数</div>
      </div>
      <div>
        <div style="font-weight: bold; color: #3b82f6;">{{ modifiedLines }}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">修改行数</div>
      </div>
      <div>
        <div style="font-weight: bold; color: var(--text-accent);">{{ totalChanges }}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">总变化数</div>
      </div>
    </div>
    
    <div style="margin-bottom: 1rem;">
      <h3>差异对比结果</h3>
      <div 
        class="diff-display" 
        style="border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-surface); max-height: 600px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 0.9rem; line-height: 1.4;"
      >
        <div v-if="diffResult.length === 0" style="padding: 2rem; text-align: center; color: var(--text-muted);">
          请输入文本进行对比
        </div>
        <div v-else>
          <div 
            v-for="(line, index) in diffResult" 
            :key="index" 
            :class="getDiffLineClass(line)"
            style="display: flex; align-items: stretch; padding: 0; margin: 0; border-bottom: 1px solid rgba(0,0,0,0.05); min-height: 22px;"
          >
            <div v-if="showLineNumbers" style="width: 80px; text-align: right; padding: 4px 8px; color: var(--text-muted); flex-shrink: 0; font-size: 0.8rem; background: rgba(0,0,0,0.03); border-right: 1px solid rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: flex-end;">
              <span style="margin-right: 4px;">{{ getOriginalLineNumber(line, index) }}</span>
              <span>{{ getNewLineNumber(line, index) }}</span>
            </div>
            <div style="width: 24px; text-align: center; font-weight: bold; flex-shrink: 0; padding: 4px 8px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.02);">
              {{ getDiffSymbol(line) }}
            </div>
            <div style="flex: 1; padding: 4px 8px; white-space: pre; word-break: normal; overflow-x: auto; text-align: left; font-family: 'Courier New', monospace; display: flex; align-items: center;">
              {{ line.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <button @click="copyDiff">复制差异结果</button>
      <button @click="exportPatch">导出 Patch</button>
      <button @click="swapTexts">交换文本</button>
      <button @click="clearAll">清空</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, getCurrentInstance } from 'vue'

export default {
  name: 'DiffViewer',
  props: {
    toolData: Object
  },
  setup() {
    const instance = getCurrentInstance()
    const textA = ref('')
    const textB = ref('')
    const ignoreWhitespace = ref(false)
    const ignoreCase = ref(false)
    const showLineNumbers = ref(true)
    const diffResult = ref([])

    const addedLines = computed(() => diffResult.value.filter(line => line.type === 'added').length)
    const deletedLines = computed(() => diffResult.value.filter(line => line.type === 'deleted').length)
    const modifiedLines = computed(() => addedLines.value + deletedLines.value)
    const totalChanges = computed(() => diffResult.value.filter(line => line.type !== 'unchanged').length)

    const loadExample = () => {
      textA.value = `function calculateSum(a, b) {
  const result = a + b;
  console.log('计算结果:', result);
  return result;
}

const numbers = [1, 2, 3, 4, 5];
const total = numbers.reduce((sum, num) => sum + num, 0);
console.log('数组总和:', total);`

      textB.value = `function calculateSum(a, b, c = 0) {
  const result = a + b + c;
  console.log('计算结果:', result);
  if (result > 100) {
    console.log('结果大于100');
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5, 6];
const total = numbers.reduce((sum, num) => sum + num, 0);
console.log('数组总和:', total);
console.log('计算完成');`
      
      setTimeout(() => {
        calculateDiff()
      }, 500)
    }

    const preprocessText = (text) => {
      let processed = text
      
      if (ignoreCase.value) {
        processed = processed.toLowerCase()
      }
      
      if (ignoreWhitespace.value) {
        processed = processed.replace(/\s+/g, ' ').trim()
      }
      
      return processed
    }

    const calculateDiff = () => {
      const linesA = textA.value.split('\n')
      const linesB = textB.value.split('\n')
      
      const processedA = linesA.map(line => preprocessText(line))
      const processedB = linesB.map(line => preprocessText(line))
      
      const diff = computeDiff(processedA, processedB, linesA, linesB)
      diffResult.value = diff
    }

    const computeDiff = (processedA, processedB, originalA, originalB) => {
      const result = []
      let i = 0, j = 0
      let lineNumberA = 1, lineNumberB = 1
      
      while (i < processedA.length || j < processedB.length) {
        if (i >= processedA.length) {
          // 剩余的都是新增行
          result.push({
            type: 'added',
            content: originalB[j],
            lineNumberA: null,
            lineNumberB: lineNumberB++,
            originalIndex: i,
            newIndex: j
          })
          j++
        } else if (j >= processedB.length) {
          // 剩余的都是删除行
          result.push({
            type: 'deleted',
            content: originalA[i],
            lineNumberA: lineNumberA++,
            lineNumberB: null,
            originalIndex: i,
            newIndex: j
          })
          i++
        } else if (processedA[i] === processedB[j]) {
          // 相同行
          result.push({
            type: 'unchanged',
            content: originalA[i],
            lineNumberA: lineNumberA++,
            lineNumberB: lineNumberB++,
            originalIndex: i,
            newIndex: j
          })
          i++
          j++
        } else {
          // 查找最佳匹配
          let foundMatch = false
          
          // 向前查找几行，看是否有匹配
          for (let k = 1; k <= Math.min(5, processedB.length - j); k++) {
            if (processedA[i] === processedB[j + k]) {
              // 找到匹配，中间的是新增行
              for (let l = 0; l < k; l++) {
                result.push({
                  type: 'added',
                  content: originalB[j + l],
                  lineNumberA: null,
                  lineNumberB: lineNumberB++,
                  originalIndex: i,
                  newIndex: j + l
                })
              }
              j += k
              foundMatch = true
              break
            }
          }
          
          if (!foundMatch) {
            // 向前查找A中的匹配
            for (let k = 1; k <= Math.min(5, processedA.length - i); k++) {
              if (processedA[i + k] === processedB[j]) {
                // 找到匹配，中间的是删除行
                for (let l = 0; l < k; l++) {
                  result.push({
                    type: 'deleted',
                    content: originalA[i + l],
                    lineNumberA: lineNumberA++,
                    lineNumberB: null,
                    originalIndex: i + l,
                    newIndex: j
                  })
                }
                i += k
                foundMatch = true
                break
              }
            }
          }
          
          if (!foundMatch) {
            // 没找到匹配，当作修改处理
            result.push({
              type: 'deleted',
              content: originalA[i],
              lineNumberA: lineNumberA++,
              lineNumberB: null,
              originalIndex: i,
              newIndex: j
            })
            result.push({
              type: 'added',
              content: originalB[j],
              lineNumberA: null,
              lineNumberB: lineNumberB++,
              originalIndex: i,
              newIndex: j
            })
            i++
            j++
          }
        }
      }
      
      return result
    }

    const getDiffLineClass = (line) => {
      const baseStyle = {
        padding: '0.25rem 0',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }
      
      switch (line.type) {
        case 'added':
          return {
            ...baseStyle,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderLeft: '3px solid #22c55e'
          }
        case 'deleted':
          return {
            ...baseStyle,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '3px solid #ef4444'
          }
        case 'unchanged':
        default:
          return baseStyle
      }
    }

    const getDiffSymbol = (line) => {
      switch (line.type) {
        case 'added':
          return '+'
        case 'deleted':
          return '-'
        case 'unchanged':
        default:
          return ' '
      }
    }

    const copyDiff = () => {
      if (diffResult.value.length === 0) {
        instance.proxy.$message.success('没有差异结果可复制')
        return
      }
      
      const result = diffResult.value.map(line => 
        `${getDiffSymbol(line)} ${line.content}`
      ).join('\n')
      
      navigator.clipboard.writeText(result)
      instance.proxy.$message.success('差异结果已复制到剪贴板！')
    }

    const exportPatch = () => {
      if (diffResult.value.length === 0) {
        instance.proxy.$message.success('没有差异可导出')
        return
      }
      
      let patch = '--- 原始文本\n+++ 修改文本\n'
      patch += diffResult.value.map(line => 
        `${getDiffSymbol(line)}${line.content}`
      ).join('\n')
      
      navigator.clipboard.writeText(patch)
      instance.proxy.$message.success('Patch 格式已复制到剪贴板！')
    }

    const swapTexts = () => {
      const temp = textA.value
      textA.value = textB.value
      textB.value = temp
      calculateDiff()
    }

    const getOriginalLineNumber = (line, index) => {
      return line.lineNumberA || ''
    }

    const getNewLineNumber = (line, index) => {
      return line.lineNumberB || ''
    }

    const clearAll = () => {
      textA.value = ''
      textB.value = ''
      diffResult.value = []
    }

    return {
      textA,
      textB,
      ignoreWhitespace,
      ignoreCase,
      showLineNumbers,
      diffResult,
      addedLines,
      deletedLines,
      modifiedLines,
      totalChanges,
      loadExample,
      calculateDiff,
      getDiffLineClass,
      getDiffSymbol,
      getOriginalLineNumber,
      getNewLineNumber,
      copyDiff,
      exportPatch,
      swapTexts,
      clearAll
    }
  }
}
</script>

<style scoped>
.diff-display {
  font-family: 'Courier New', monospace;
}

/* Checkbox选项容器样式 */
.checkbox-options-container {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.checkbox-group-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

/* 自定义checkbox样式 */
.custom-checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary, #1e293b);
  transition: all 0.2s ease;
  user-select: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.custom-checkbox-label:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.custom-checkbox {
  position: relative;
  width: 18px;
  height: 18px;
  margin: 0;
  margin-right: 0.75rem;
  appearance: none;
  background: #ffffff;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.custom-checkbox:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-checkbox:checked {
  background: #3b82f6;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.custom-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 15px;
  height: 20px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.checkbox-text {
  font-weight: 500;
  color: inherit;
  line-height: 1.4;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .checkbox-options-container {
    background: rgba(30, 41, 59, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .custom-checkbox-label {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .custom-checkbox-label:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 107, 53, 0.3);
  }
  
  .custom-checkbox {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  .custom-checkbox:hover {
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
  
  .custom-checkbox:checked {
    background: #ff6b35;
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.2);
  }
  
  .custom-checkbox:focus {
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.2);
  }
}

/* Example Section 样式 */
.example-section {
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .checkbox-group-horizontal {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .custom-checkbox-label {
    justify-content: flex-start;
  }
}

/* Checkbox 统一样式 */
input[type="checkbox"] {
  width: 20px;
  margin-bottom: 0px;
}
</style> 