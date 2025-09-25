<template>
  <div class="single-tool">
    <h2><i class="fab fa-markdown"></i> Markdown Preview</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; height: 500px;">
      <div style="display: flex; flex-direction: column;">
        <h3>Markdown 输入</h3>
        <textarea 
          v-model="markdownInput" 
          placeholder="请输入 Markdown 文本..."
          style="flex: 1; resize: none; font-family: 'Courier New', monospace;"
          @input="convertMarkdown"
        ></textarea>
      </div>
      
      <div style="display: flex; flex-direction: column;">
        <h3>HTML 预览</h3>
        <div 
          class="markdown-preview" 
          v-html="htmlOutput"
          style="flex: 1; border: 1px solid var(--border-color); padding: 1rem; overflow-y: auto; background: var(--bg-surface);"
        ></div>
      </div>
    </div>
    
    <div style="margin-top: 1rem;">
      <button @click="copyHtml">复制 HTML</button>
      <button @click="copyMarkdown">复制 Markdown</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue'

export default {
  name: 'MarkdownPreview',
  props: {
    toolData: Object
  },
  setup() {
    const instance = getCurrentInstance()
    const markdownInput = ref('')
    const htmlOutput = ref('')

    const loadExample = () => {
      markdownInput.value = `# Markdown 示例文档

## 标题示例
这是一个 **粗体文本** 和 *斜体文本* 的示例。

### 列表示例
- 第一项
- 第二项
  - 嵌套项目
  - 另一个嵌套项目

### 代码示例
这是一个行内代码：\`console.log('Hello World')\`

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### 链接和图片
[访问 Google](https://google.com)

### 引用
> 这是一个引用块
> 可以有多行文本

### 表格
| 姓名 | 年龄 | 城市 |
|------|------|------|
| 张三 | 25   | 北京 |
| 李四 | 30   | 上海 |

---

**注意**: 这只是一个简单的 Markdown 解析器实现。`
      
      setTimeout(() => {
        convertMarkdown()
      }, 500)
    }

    const convertMarkdown = () => {
      let html = markdownInput.value
      
      // 转换标题 (h1-h6)
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // 转换粗体和斜体
      html = html.replace(/\*\*\*(.*)\*\*\*/gim, '<strong><em>$1</em></strong>')
      html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      html = html.replace(/\*(.*)\*/gim, '<em>$1</em>')
      
      // 转换行内代码
      html = html.replace(/`([^`]+)`/gim, '<code>$1</code>')
      
      // 转换代码块
      html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
      
      // 转换链接
      html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
      
      // 转换图片
      html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img alt="$1" src="$2" />')
      
      // 转换引用块
      html = html.replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')
      
      // 转换水平线
      html = html.replace(/^---$/gim, '<hr>')
      
      // 转换列表
      html = html.replace(/^\s*\* (.*)$/gim, '<li>$1</li>')
      html = html.replace(/^\s*- (.*)$/gim, '<li>$1</li>')
      html = html.replace(/^\s*\+ (.*)$/gim, '<li>$1</li>')
      
      // 包装连续的 li 为 ul
      html = html.replace(/(<li>.*<\/li>)/gims, (match) => {
        return '<ul>' + match + '</ul>'
      })
      
      // 转换表格
      const tableRegex = /\|(.+)\|\n\|(-+\|)+\n((\|.+\|\n?)+)/gim
      html = html.replace(tableRegex, (match) => {
        const lines = match.trim().split('\n')
        const headers = lines[0].split('|').slice(1, -1).map(h => h.trim())
        const rows = lines.slice(2).map(line => 
          line.split('|').slice(1, -1).map(cell => cell.trim())
        )
        
        let table = '<table style="border-collapse: collapse; width: 100%;">\n<thead>\n<tr>'
        headers.forEach(header => {
          table += `<th style="border: 1px solid #ddd; padding: 8px;">${header}</th>`
        })
        table += '</tr>\n</thead>\n<tbody>\n'
        
        rows.forEach(row => {
          table += '<tr>'
          row.forEach(cell => {
            table += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`
          })
          table += '</tr>\n'
        })
        
        table += '</tbody>\n</table>'
        return table
      })
      
      // 转换段落
      html = html.replace(/\n\n/gim, '</p><p>')
      html = '<p>' + html + '</p>'
      
      // 清理空段落
      html = html.replace(/<p><\/p>/gim, '')
      html = html.replace(/<p>(<h[1-6]>)/gim, '$1')
      html = html.replace(/(<\/h[1-6]>)<\/p>/gim, '$1')
      html = html.replace(/<p>(<ul>)/gim, '$1')
      html = html.replace(/(<\/ul>)<\/p>/gim, '$1')
      html = html.replace(/<p>(<blockquote>)/gim, '$1')
      html = html.replace(/(<\/blockquote>)<\/p>/gim, '$1')
      html = html.replace(/<p>(<hr>)/gim, '$1')
      html = html.replace(/(<hr>)<\/p>/gim, '$1')
      html = html.replace(/<p>(<table)/gim, '$1')
      html = html.replace(/(<\/table>)<\/p>/gim, '$1')
      html = html.replace(/<p>(<pre>)/gim, '$1')
      html = html.replace(/(<\/pre>)<\/p>/gim, '$1')
      
      // 转换换行
      html = html.replace(/\n/gim, '<br>')
      
      htmlOutput.value = html
    }

    const copyHtml = () => {
      if (htmlOutput.value) {
        navigator.clipboard.writeText(htmlOutput.value)
        instance.proxy.$message.success('HTML 已复制到剪贴板！')
      }
    }

    const copyMarkdown = () => {
      if (markdownInput.value) {
        navigator.clipboard.writeText(markdownInput.value)
        instance.proxy.$message.success('Markdown 已复制到剪贴板！')
      }
    }

    onMounted(() => {
      convertMarkdown()
    })

    return {
      markdownInput,
      htmlOutput,
      loadExample,
      convertMarkdown,
      copyHtml,
      copyMarkdown
    }
  }
}
</script>

<style scoped>
.markdown-preview {
  line-height: 1.6;
}

.markdown-preview h1, .markdown-preview h2, .markdown-preview h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.markdown-preview h1 {
  border-bottom: 2px solid #eee;
  padding-bottom: 0.3rem;
}

.markdown-preview h2 {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3rem;
}

.markdown-preview blockquote {
  border-left: 4px solid #ddd;
  margin: 0;
  padding-left: 1rem;
  color: #666;
}

.markdown-preview code {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.markdown-preview pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
}

.markdown-preview pre code {
  background: none;
  padding: 0;
}

.markdown-preview ul {
  padding-left: 2rem;
}

.markdown-preview li {
  margin: 0.25rem 0;
}
</style> 