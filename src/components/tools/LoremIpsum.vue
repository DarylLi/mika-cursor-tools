<template>
  <div class="single-tool">
    <h2><i class="fas fa-font"></i> Lorem Ipsum Generator</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 生成示例
      </button>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
      <select v-model="generateType">
        <option value="words">单词</option>
        <option value="sentences">句子</option>
        <option value="paragraphs">段落</option>
      </select>
      <input v-model.number="generateCount" type="number" min="1" max="100" placeholder="数量">
    </div>
    
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
      <button @click="generateLorem">生成 Lorem Ipsum</button>
      <button @click="generateChinese">生成中文假文</button>
      <button @click="generateMixed">生成混合文本</button>
      <button @click="copyResult">复制结果</button>
    </div>
    
    <div class="result-display" style="max-height: 300px; overflow-y: auto;">{{ loremResult }}</div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'LoremIpsum',
  props: {
    toolData: Object
  },
  setup() {
    const generateType = ref('paragraphs')
    const generateCount = ref(3)
    const loremResult = ref('')

    const loremWords = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ]

    const chineseWords = [
      '这是', '一段', '测试', '文本', '内容', '用于', '展示', '排版', '效果', '和',
      '文字', '布局', '样式', '设计', '开发', '过程', '中的', '占位', '文字', '内容',
      '可以', '帮助', '设计师', '开发者', '预览', '页面', '的', '整体', '视觉', '效果',
      '而不', '被', '具体', '文字', '内容', '所', '干扰', '这样', '能够', '更好',
      '地', '关注', '于', '布局', '字体', '颜色', '等', '设计', '要素', '的', '协调性'
    ]

    const loadExample = () => {
      generateCount.value = 2
      generateType.value = 'paragraphs'
      
      setTimeout(() => {
        generateLorem()
      }, 500)
    }

    const getRandomWords = (wordList, count) => {
      const result = []
      for (let i = 0; i < count; i++) {
        result.push(wordList[Math.floor(Math.random() * wordList.length)])
      }
      return result
    }

    const generateSentence = (wordList, wordCount = 8) => {
      const words = getRandomWords(wordList, Math.floor(Math.random() * 8) + wordCount)
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
      return words.join(' ') + '.'
    }

    const generateParagraph = (wordList, sentenceCount = 4) => {
      const sentences = []
      for (let i = 0; i < sentenceCount; i++) {
        sentences.push(generateSentence(wordList))
      }
      return sentences.join(' ')
    }

    const generateLorem = () => {
      const count = generateCount.value || 1
      const type = generateType.value

      switch (type) {
        case 'words':
          loremResult.value = getRandomWords(loremWords, count).join(' ')
          break
        case 'sentences':
          const sentences = []
          for (let i = 0; i < count; i++) {
            sentences.push(generateSentence(loremWords))
          }
          loremResult.value = sentences.join(' ')
          break
        case 'paragraphs':
          const paragraphs = []
          for (let i = 0; i < count; i++) {
            paragraphs.push(generateParagraph(loremWords))
          }
          loremResult.value = paragraphs.join('\n\n')
          break
      }
    }

    const generateChinese = () => {
      const count = generateCount.value || 1
      const type = generateType.value

      switch (type) {
        case 'words':
          loremResult.value = getRandomWords(chineseWords, count).join('')
          break
        case 'sentences':
          const sentences = []
          for (let i = 0; i < count; i++) {
            sentences.push(generateSentence(chineseWords).replace(/\s+/g, ''))
          }
          loremResult.value = sentences.join('')
          break
        case 'paragraphs':
          const paragraphs = []
          for (let i = 0; i < count; i++) {
            paragraphs.push(generateParagraph(chineseWords).replace(/\s+/g, ''))
          }
          loremResult.value = paragraphs.join('\n\n')
          break
      }
    }

    const generateMixed = () => {
      const count = generateCount.value || 1
      const type = generateType.value
      const allWords = [...loremWords, ...chineseWords]

      switch (type) {
        case 'words':
          loremResult.value = getRandomWords(allWords, count).join(' ')
          break
        case 'sentences':
          const sentences = []
          for (let i = 0; i < count; i++) {
            sentences.push(generateSentence(allWords))
          }
          loremResult.value = sentences.join(' ')
          break
        case 'paragraphs':
          const paragraphs = []
          for (let i = 0; i < count; i++) {
            paragraphs.push(generateParagraph(allWords))
          }
          loremResult.value = paragraphs.join('\n\n')
          break
      }
    }

    const copyResult = () => {
      if (loremResult.value) {
        navigator.clipboard.writeText(loremResult.value)
        alert('已复制到剪贴板！')
      }
    }

    return {
      generateType,
      generateCount,
      loremResult,
      loadExample,
      generateLorem,
      generateChinese,
      generateMixed,
      copyResult
    }
  }
}
</script> 