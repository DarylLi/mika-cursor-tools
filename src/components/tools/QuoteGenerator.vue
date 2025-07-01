<template>
  <div class="quote-generator-tool">
    <div class="tool-header">
      <h3><i class="fas fa-quote-right"></i> 随机名言生成器</h3>
      <p>生成励志名言、哲理语句、经典语录，激发你的灵感</p>
    </div>

    <div class="tool-content">
      <div class="generation-controls">
        <div class="control-group">
          <label for="category">分类</label>
          <select id="category" v-model="category">
            <option value="all">全部</option>
            <option value="motivation">励志</option>
            <option value="wisdom">智慧</option>
            <option value="life">人生</option>
            <option value="love">爱情</option>
            <option value="success">成功</option>
            <option value="learning">学习</option>
            <option value="friendship">友谊</option>
            <option value="happiness">快乐</option>
            <option value="dreams">梦想</option>
            <option value="courage">勇气</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="language">语言</label>
          <select id="language" v-model="language">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="includeAuthor">包含作者</label>
          <input type="checkbox" id="includeAuthor" v-model="includeAuthor" />
        </div>
        
        <div class="control-group">
          <label for="count">生成数量</label>
          <input type="number" id="count" v-model.number="count" min="1" max="20" />
        </div>
      </div>

      <div class="actions">
        <button @click="generateQuotes" class="btn-primary">
          <i class="fas fa-quote-left"></i> 生成名言
        </button>
        <button @click="shareQuote" class="btn-secondary" :disabled="!quotes.length">
          <i class="fas fa-share"></i> 分享
        </button>
        <button @click="exportQuotes" class="btn-secondary" :disabled="!quotes.length">
          <i class="fas fa-download"></i> 导出
        </button>
        <button @click="copyAllQuotes" class="btn-secondary" :disabled="!quotes.length">
          <i class="fas fa-copy"></i> 复制全部
        </button>
      </div>

      <div class="quotes-display" v-if="quotes.length">
        <div class="quotes-list">
          <div v-for="(quote, index) in quotes" :key="index" class="quote-card">
            <div class="quote-content">
              <div class="quote-text">
                <i class="fas fa-quote-left quote-icon"></i>
                {{ quote.text }}
                <i class="fas fa-quote-right quote-icon"></i>
              </div>
              <div v-if="includeAuthor && quote.author" class="quote-author">
                —— {{ quote.author }}
              </div>
              <div class="quote-category">
                <span class="category-tag">{{ getCategoryName(quote.category) }}</span>
              </div>
            </div>
            
            <div class="quote-actions">
              <button @click="addToFavorites(quote)" class="favorite-btn" 
                      :class="{ active: isFavorite(quote) }"
                      :title="isFavorite(quote) ? '取消收藏' : '添加收藏'">
                <i class="fas fa-heart"></i>
              </button>
              <button @click="copyQuote(quote)" class="copy-btn" title="复制名言">
                <i class="fas fa-copy"></i>
              </button>
              <button @click="regenerateQuote(index)" class="refresh-btn" title="重新生成">
                <i class="fas fa-sync"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="favorites-section" v-if="favoriteQuotes.length">
        <h4>收藏的名言 ({{ favoriteQuotes.length }})</h4>
        <div class="favorites-list">
          <div v-for="(quote, index) in favoriteQuotes" :key="index" class="favorite-quote">
            <div class="favorite-text">{{ quote.text }}</div>
            <div class="favorite-meta">
              <span v-if="quote.author">{{ quote.author }}</span>
              <span class="favorite-category">{{ getCategoryName(quote.category) }}</span>
            </div>
            <button @click="removeFromFavorites(index)" class="remove-btn" title="移除">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'QuoteGenerator',
  setup() {
    const category = ref('all')
    const language = ref('zh')
    const includeAuthor = ref(true)
    const count = ref(3)
    const quotes = ref([])
    const favoriteQuotes = ref([])

    // 名言数据库
    const quotesDatabase = {
      zh: {
        motivation: [
          { text: '成功不是终点，失败不是末日，最重要的是继续前进的勇气。', author: '温斯顿·丘吉尔' },
          { text: '你今天的努力，是幸运的伏笔；当下的付出，是明日的花开。', author: '佚名' },
          { text: '不要害怕失败，害怕的应该是从未尝试。', author: '迈克尔·乔丹' },
          { text: '梦想不会逃跑，会逃跑的永远都是自己。', author: '矢野浩二' },
          { text: '成功的秘诀在于坚持自己的目标和信念。', author: '本杰明·迪斯雷利' }
        ],
        wisdom: [
          { text: '知之为知之，不知为不知，是知也。', author: '孔子' },
          { text: '智者千虑，必有一失；愚者千虑，必有一得。', author: '史记' },
          { text: '学而时习之，不亦说乎？', author: '论语' },
          { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
          { text: '三人行，必有我师焉。', author: '论语' }
        ],
        life: [
          { text: '人生如逆旅，我亦是行人。', author: '苏轼' },
          { text: '生活不是等待暴风雨过去，而是学会在雨中跳舞。', author: '佚名' },
          { text: '人生最大的幸福，是发现自己爱的人正好也爱着自己。', author: '佚名' },
          { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
          { text: '人生若只如初见，何事秋风悲画扇。', author: '纳兰性德' }
        ],
        love: [
          { text: '爱情不是索取，而是给予。', author: '佚名' },
          { text: '真正的爱情是双方精神的结合。', author: '柏拉图' },
          { text: '爱是一种遇见，不能等待，也不能准备。', author: '佚名' },
          { text: '爱情使人忘记时间，时间也使人忘记爱情。', author: '张爱玲' },
          { text: '两情若是久长时，又岂在朝朝暮暮。', author: '秦观' }
        ],
        success: [
          { text: '成功的秘诀是走向目的的坚持。', author: '本杰明·迪斯雷利' },
          { text: '成功不在于力量的大小，而在于能坚持多久。', author: '约翰逊' },
          { text: '失败是成功之母。', author: '中国谚语' },
          { text: '成功的人找方法，失败的人找借口。', author: '佚名' },
          { text: '机会只垂青有准备的头脑。', author: '路易·巴斯德' }
        ]
      },
      en: {
        motivation: [
          { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
          { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
          { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
          { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
          { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' }
        ],
        wisdom: [
          { text: 'The only true wisdom is in knowing you know nothing.', author: 'Socrates' },
          { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
          { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
          { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
          { text: 'Yesterday is history, tomorrow is a mystery, today is a gift.', author: 'Eleanor Roosevelt' }
        ],
        life: [
          { text: 'Life is really simple, but we insist on making it complicated.', author: 'Confucius' },
          { text: 'The purpose of our lives is to be happy.', author: 'Dalai Lama' },
          { text: 'Life is 10% what happens to you and 90% how you react to it.', author: 'Charles R. Swindoll' },
          { text: 'In the end, we will remember not the words of our enemies, but the silence of our friends.', author: 'Martin Luther King Jr.' },
          { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' }
        ]
      }
    }

    const generateRandomQuote = () => {
      const lang = quotesDatabase[language.value] || quotesDatabase.zh
      let selectedCategory = category.value
      
      if (selectedCategory === 'all') {
        const categories = Object.keys(lang)
        selectedCategory = categories[Math.floor(Math.random() * categories.length)]
      }
      
      const categoryQuotes = lang[selectedCategory] || lang.motivation || []
      if (categoryQuotes.length === 0) return null
      
      const quote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)]
      return {
        ...quote,
        category: selectedCategory
      }
    }

    const generateQuotes = () => {
      quotes.value = []
      for (let i = 0; i < count.value; i++) {
        const quote = generateRandomQuote()
        if (quote) {
          quotes.value.push(quote)
        }
      }
    }

    const regenerateQuote = (index) => {
      const newQuote = generateRandomQuote()
      if (newQuote) {
        quotes.value[index] = newQuote
      }
    }

    const copyQuote = async (quote) => {
      const text = includeAuthor.value && quote.author 
        ? `"${quote.text}" —— ${quote.author}`
        : `"${quote.text}"`
      
      try {
        await navigator.clipboard.writeText(text)
        // 简单的成功提示
        const button = event.target.closest('button')
        if (button) {
          button.style.transform = 'scale(0.95)'
          setTimeout(() => {
            button.style.transform = 'scale(1)'
          }, 150)
        }
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    const copyAllQuotes = async () => {
      const allQuotesText = quotes.value.map(quote => {
        return includeAuthor.value && quote.author 
          ? `"${quote.text}" —— ${quote.author}`
          : `"${quote.text}"`
      }).join('\n\n')
      
      try {
        await navigator.clipboard.writeText(allQuotesText)
        alert('所有名言已复制到剪贴板！')
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    const shareQuote = () => {
      if (quotes.value.length === 0) return
      
      const quote = quotes.value[0]
      const text = includeAuthor.value && quote.author 
        ? `"${quote.text}" —— ${quote.author}`
        : `"${quote.text}"`
      
      if (navigator.share) {
        navigator.share({
          title: '名言分享',
          text: text
        })
      } else {
        copyQuote(quote)
        alert('名言已复制到剪贴板，你可以分享给朋友！')
      }
    }

    const exportQuotes = () => {
      const exportData = {
        quotes: quotes.value,
        settings: {
          category: category.value,
          language: language.value,
          includeAuthor: includeAuthor.value
        },
        generatedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quotes_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    const addToFavorites = (quote) => {
      const exists = favoriteQuotes.value.some(fav => fav.text === quote.text)
      if (exists) {
        favoriteQuotes.value = favoriteQuotes.value.filter(fav => fav.text !== quote.text)
      } else {
        favoriteQuotes.value.push({ ...quote })
      }
    }

    const isFavorite = (quote) => {
      return favoriteQuotes.value.some(fav => fav.text === quote.text)
    }

    const removeFromFavorites = (index) => {
      favoriteQuotes.value.splice(index, 1)
    }

    const getCategoryName = (cat) => {
      const categoryNames = {
        motivation: '励志',
        wisdom: '智慧',
        life: '人生',
        love: '爱情',
        success: '成功',
        learning: '学习',
        friendship: '友谊',
        happiness: '快乐',
        dreams: '梦想',
        courage: '勇气'
      }
      return categoryNames[cat] || cat
    }

    return {
      category,
      language,
      includeAuthor,
      count,
      quotes,
      favoriteQuotes,
      generateQuotes,
      regenerateQuote,
      copyQuote,
      copyAllQuotes,
      shareQuote,
      exportQuotes,
      addToFavorites,
      isFavorite,
      removeFromFavorites,
      getCategoryName
    }
  }
}
</script>

<style scoped>
.quote-generator-tool {
  max-width: 1000px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.tool-header h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: var(--text-secondary);
}

.generation-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.control-group select,
.control-group input[type="number"] {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.control-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quotes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quote-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quote-content {
  margin-bottom: 1rem;
}

.quote-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--text-primary);
  font-style: italic;
  margin-bottom: 1rem;
  position: relative;
}

.quote-icon {
  color: var(--accent-color);
  font-size: 1rem;
  opacity: 0.7;
}

.quote-author {
  text-align: right;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.quote-category {
  text-align: center;
}

.category-tag {
  padding: 0.25rem 0.75rem;
  background: var(--accent-color);
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.quote-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.favorite-btn,
.copy-btn,
.refresh-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn.active {
  color: #e74c3c;
  border-color: #e74c3c;
}

.favorite-btn:hover,
.copy-btn:hover,
.refresh-btn:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.favorites-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.favorites-section h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.favorite-quote {
  display: flex;
  align-items: start;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.favorite-text {
  flex: 1;
  color: var(--text-primary);
  font-style: italic;
}

.favorite-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  min-width: 100px;
}

.favorite-category {
  font-size: 0.8rem;
  color: var(--accent-color);
}

.remove-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}
</style> 