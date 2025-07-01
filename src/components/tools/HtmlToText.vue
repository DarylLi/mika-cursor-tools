<template>
  <div class="single-tool">
    <h2><i class="fas fa-code"></i> HTML to Text</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; height: 450px;">
      <div style="display: flex; flex-direction: column;">
        <h3>HTML 输入</h3>
        <textarea 
          v-model="htmlInput" 
          placeholder="请输入 HTML 代码..."
          style="flex: 1; resize: none; font-family: 'Courier New', monospace;"
          @input="convertHtmlToText"
        ></textarea>
      </div>
      
      <div style="display: flex; flex-direction: column;">
        <h3>纯文本输出</h3>
        <textarea 
          v-model="textOutput" 
          placeholder="提取的纯文本将显示在这里..."
          style="flex: 1; resize: none;"
          readonly
        ></textarea>
      </div>
    </div>
    
    <div style="margin: 1rem 0;">
      <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <input type="checkbox" v-model="preserveLineBreaks" @change="convertHtmlToText">
        保留换行符
      </label>
      <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <input type="checkbox" v-model="preserveSpaces" @change="convertHtmlToText">
        保留多个空格
      </label>
      <label style="display: flex; align-items: center; gap: 0.5rem;">
        <input type="checkbox" v-model="extractLinks" @change="convertHtmlToText">
        提取链接地址
      </label>
    </div>
    
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <button @click="copyText">复制纯文本</button>
      <button @click="clearAll">清空</button>
      <button @click="removeAllTags">移除所有标签</button>
      <button @click="extractText">仅提取文本</button>
    </div>
    
    <div class="stats" style="margin-top: 1rem; padding: 0.5rem; background: var(--bg-surface); border-radius: 4px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; text-align: center;">
        <div>
          <div style="font-weight: bold; color: var(--text-accent);">{{ htmlInput.length }}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">HTML 字符数</div>
        </div>
        <div>
          <div style="font-weight: bold; color: var(--text-accent);">{{ textOutput.length }}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">文本字符数</div>
        </div>
        <div>
          <div style="font-weight: bold; color: var(--text-accent);">{{ wordCount }}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">单词数</div>
        </div>
        <div>
          <div style="font-weight: bold; color: var(--text-accent);">{{ tagCount }}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">HTML 标签数</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'HtmlToText',
  props: {
    toolData: Object
  },
  setup() {
    const htmlInput = ref('')
    const textOutput = ref('')
    const preserveLineBreaks = ref(true)
    const preserveSpaces = ref(false)
    const extractLinks = ref(false)

    const wordCount = computed(() => {
      return textOutput.value.trim() ? textOutput.value.trim().split(/\s+/).length : 0
    })

    const tagCount = computed(() => {
      const matches = htmlInput.value.match(/<[^>]*>/g)
      return matches ? matches.length : 0
    })

    const loadExample = () => {
      htmlInput.value = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>示例网页</title>
    <style>
        body { font-family: Arial, sans-serif; }
    </style>
</head>
<body>
    <header>
        <h1>欢迎来到我的网站</h1>
        <nav>
            <ul>
                <li><a href="#home">首页</a></li>
                <li><a href="#about">关于我们</a></li>
                <li><a href="#contact">联系方式</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article>
            <h2>文章标题</h2>
            <p>这是一个包含 <strong>粗体文本</strong> 和 <em>斜体文本</em> 的段落。</p>
            <p>你可以访问 <a href="https://example.com">这个链接</a> 了解更多信息。</p>
            
            <blockquote>
                这是一个引用块的例子。
            </blockquote>
            
            <div class="highlight">
                这是一个高亮的内容区域。
            </div>
        </article>
    </main>
    
    <footer>
        <p>版权所有 2024 我的网站. 保留所有权利.</p>
    </footer>
</body>
</html>`
      
      setTimeout(() => {
        convertHtmlToText()
      }, 500)
    }

    const convertHtmlToText = () => {
      let html = htmlInput.value
      
      // 移除 script 和 style 标签及其内容
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      
      // 移除注释
      html = html.replace(/<!--[\s\S]*?-->/g, '')
      
      // 处理特殊标签
      if (preserveLineBreaks.value) {
        // 将块级元素转换为换行
        html = html.replace(/<\/(div|p|h[1-6]|li|blockquote|article|section|header|footer|main)>/gi, '\n')
        html = html.replace(/<br\s*\/?>/gi, '\n')
        html = html.replace(/<hr\s*\/?>/gi, '\n---\n')
      }
      
      // 提取链接
      if (extractLinks.value) {
        html = html.replace(/<a[^>]*href=['"']([^'"]*)['"'][^>]*>(.*?)<\/a>/gi, '$2 [$1]')
      }
      
      // 移除所有HTML标签
      html = html.replace(/<[^>]*>/g, '')
      
      // 解码HTML实体
      const entityMap = {
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        '&nbsp;': ' ',
        '&copy;': '©',
        '&reg;': '®',
        '&trade;': '™'
      }
      
      for (const [entity, char] of Object.entries(entityMap)) {
        html = html.replace(new RegExp(entity, 'g'), char)
      }
      
      // 处理空格和换行
      if (!preserveSpaces.value) {
        html = html.replace(/[ \t]+/g, ' ')
      }
      
      if (preserveLineBreaks.value) {
        html = html.replace(/\n\s*\n/g, '\n\n')
      } else {
        html = html.replace(/\s+/g, ' ')
      }
      
      textOutput.value = html.trim()
    }

    const removeAllTags = () => {
      const temp = htmlInput.value.replace(/<[^>]*>/g, '')
      textOutput.value = temp.replace(/\s+/g, ' ').trim()
    }

    const extractText = () => {
      // 创建一个临时的DOM元素来提取文本
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlInput.value, 'text/html')
        
        // 移除script和style元素
        const scripts = doc.querySelectorAll('script, style')
        scripts.forEach(el => el.remove())
        
        textOutput.value = doc.body ? doc.body.textContent.trim() : ''
      } catch (error) {
        // 如果DOMParser失败，使用简单的文本提取
        removeAllTags()
      }
    }

    const copyText = () => {
      if (textOutput.value) {
        navigator.clipboard.writeText(textOutput.value)
        alert('纯文本已复制到剪贴板！')
      }
    }

    const clearAll = () => {
      htmlInput.value = ''
      textOutput.value = ''
    }

    return {
      htmlInput,
      textOutput,
      preserveLineBreaks,
      preserveSpaces,
      extractLinks,
      wordCount,
      tagCount,
      loadExample,
      convertHtmlToText,
      removeAllTags,
      extractText,
      copyText,
      clearAll
    }
  }
}
</script> 