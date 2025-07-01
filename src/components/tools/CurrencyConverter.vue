<template>
  <div class="currency-converter">
    <div class="converter-container">
      <!-- 汇率换算主面板 -->
      <div class="main-converter">
        <h3><i class="fas fa-coins"></i> 静态汇率换算</h3>
        
        <div class="converter-panel">
          <div class="currency-row">
            <!-- 原币种 -->
            <div class="currency-section">
              <div class="currency-selector">
                <label>从</label>
                <select v-model="fromCurrency" @change="convert">
                  <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                    {{ currency.code }} - {{ currency.name }}
                  </option>
                </select>
              </div>
              <div class="amount-input">
                <input 
                  v-model="fromAmount" 
                  type="number" 
                  step="0.01"
                  placeholder="输入金额"
                  @input="convert"
                  class="amount-field">
              </div>
              <div class="currency-info">
                <div class="currency-flag">{{ getCurrencyInfo(fromCurrency)?.flag }}</div>
                <div class="currency-details">
                  <div class="currency-name">{{ getCurrencyInfo(fromCurrency)?.name }}</div>
                  <div class="currency-symbol">{{ getCurrencyInfo(fromCurrency)?.symbol }}</div>
                </div>
              </div>
            </div>

            <!-- 转换按钮 -->
            <div class="converter-arrow">
              <button @click="swapCurrencies" class="swap-btn" title="交换货币">
                <i class="fas fa-exchange-alt"></i>
              </button>
            </div>

            <!-- 目标币种 -->
            <div class="currency-section">
              <div class="currency-selector">
                <label>到</label>
                <select v-model="toCurrency" @change="convert">
                  <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                    {{ currency.code }} - {{ currency.name }}
                  </option>
                </select>
              </div>
              <div class="amount-output">
                <input 
                  :value="toAmount" 
                  readonly 
                  class="amount-field result"
                  @click="copyResult">
                <button @click="copyResult" class="copy-btn" title="复制结果">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <div class="currency-info">
                <div class="currency-flag">{{ getCurrencyInfo(toCurrency)?.flag }}</div>
                <div class="currency-details">
                  <div class="currency-name">{{ getCurrencyInfo(toCurrency)?.name }}</div>
                  <div class="currency-symbol">{{ getCurrencyInfo(toCurrency)?.symbol }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 汇率信息显示 -->
          <div v-if="exchangeRate" class="rate-display">
            <div class="rate-info">
              <div class="rate-text">
                1 {{ fromCurrency }} = {{ exchangeRate.toFixed(4) }} {{ toCurrency }}
              </div>
              <div class="reverse-rate">
                1 {{ toCurrency }} = {{ (1/exchangeRate).toFixed(4) }} {{ fromCurrency }}
              </div>
            </div>
            <div class="rate-note">
              <i class="fas fa-info-circle"></i>
              静态汇率，仅供参考，实际汇率请以银行为准
            </div>
          </div>
        </div>
      </div>

      <!-- 快速换算 -->
      <div class="quick-convert">
        <h4><i class="fas fa-bolt"></i> 快速换算</h4>
        <div class="quick-amounts">
          <button 
            v-for="amount in quickAmounts" 
            :key="amount"
            @click="setQuickAmount(amount)"
            class="quick-amount-btn">
            {{ formatAmount(amount) }}
          </button>
        </div>
        <div class="common-pairs">
          <h5>常用货币对</h5>
          <div class="pairs-grid">
            <button 
              v-for="pair in commonPairs" 
              :key="pair.name"
              @click="setPair(pair)"
              class="pair-btn">
              <span class="pair-name">{{ pair.name }}</span>
              <span class="pair-codes">{{ pair.from }} → {{ pair.to }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 汇率表格 -->
      <div class="rates-table">
        <h4><i class="fas fa-table"></i> 汇率对照表</h4>
        <div class="table-controls">
          <select v-model="baseCurrency" @change="updateRatesTable" class="base-selector">
            <option v-for="currency in majorCurrencies" :key="currency" :value="currency">
              {{ currency }} ({{ getCurrencyInfo(currency)?.name }})
            </option>
          </select>
        </div>
        <div class="rates-grid">
          <div class="rates-header">
            <span>货币</span>
            <span>汇率 (基于 {{ baseCurrency }})</span>
            <span>100 {{ baseCurrency }} =</span>
          </div>
          <div 
            v-for="rate in ratesTableData" 
            :key="rate.currency"
            class="rate-row"
            @click="setFromTable(rate.currency)">
            <span class="currency-cell">
              <span class="flag">{{ rate.flag }}</span>
              <span class="code">{{ rate.currency }}</span>
              <span class="name">{{ rate.name }}</span>
            </span>
            <span class="rate-cell">{{ rate.rate }}</span>
            <span class="amount-cell">{{ rate.amount }}</span>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div v-if="history.length > 0" class="history-section">
        <h4><i class="fas fa-history"></i> 换算历史</h4>
        <div class="history-list">
          <div v-for="(item, index) in history" :key="index" class="history-item" @click="loadHistory(item)">
            <div class="history-conversion">
              {{ item.fromAmount }} {{ item.fromCurrency }} = {{ item.toAmount }} {{ item.toCurrency }}
            </div>
            <div class="history-rate">汇率: {{ item.rate }}</div>
            <div class="history-time">{{ item.time }}</div>
            <button @click.stop="removeHistory(index)" class="remove-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <button @click="clearHistory" class="clear-btn">
          <i class="fas fa-trash"></i> 清空历史
        </button>
      </div>

      <!-- 货币知识 -->
      <div class="currency-knowledge">
        <h4><i class="fas fa-graduation-cap"></i> 货币知识</h4>
        <div class="knowledge-grid">
          <div class="knowledge-card">
            <i class="fas fa-chart-line"></i>
            <div>
              <strong>汇率波动</strong>
              <p>汇率受供需关系、经济政策、政治稳定性等多种因素影响</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-bank"></i>
            <div>
              <strong>中间价汇率</strong>
              <p>银行买入价和卖出价的中间值，通常作为汇率参考</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-globe"></i>
            <div>
              <strong>储备货币</strong>
              <p>美元、欧元、日元、英镑等是主要的国际储备货币</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-percentage"></i>
            <div>
              <strong>汇率标价</strong>
              <p>直接标价法：外币=1，本币=X；间接标价法：本币=1，外币=Y</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CurrencyConverter',
  setup() {
    const fromCurrency = ref('USD')
    const toCurrency = ref('CNY')
    const fromAmount = ref('1')
    const toAmount = ref('')
    const baseCurrency = ref('USD')
    const history = ref([])
    
    // 静态汇率数据（基于USD）
    const exchangeRates = {
      USD: 1,        // 美元
      CNY: 7.2,      // 人民币
      EUR: 0.85,     // 欧元
      JPY: 110,      // 日元
      GBP: 0.73,     // 英镑
      KRW: 1180,     // 韩元
      HKD: 7.8,      // 港币
      TWD: 28,       // 台币
      CAD: 1.25,     // 加元
      AUD: 1.35,     // 澳元
      CHF: 0.92,     // 瑞士法郎
      SEK: 8.5,      // 瑞典克朗
      NOK: 8.8,      // 挪威克朗
      DKK: 6.3,      // 丹麦克朗
      SGD: 1.35,     // 新加坡元
      THB: 33,       // 泰铢
      MYR: 4.2,      // 马来西亚林吉特
      PHP: 50,       // 菲律宾比索
      INR: 74,       // 印度卢比
      IDR: 14200,    // 印尼盾
      VND: 23000,    // 越南盾
      RUB: 75,       // 俄罗斯卢布
      BRL: 5.2,      // 巴西雷亚尔
      MXN: 20,       // 墨西哥比索
      ZAR: 14.5      // 南非兰特
    }
    
    const currencies = [
      { code: 'USD', name: '美元', symbol: '$', flag: '🇺🇸' },
      { code: 'CNY', name: '人民币', symbol: '¥', flag: '🇨🇳' },
      { code: 'EUR', name: '欧元', symbol: '€', flag: '🇪🇺' },
      { code: 'JPY', name: '日元', symbol: '¥', flag: '🇯🇵' },
      { code: 'GBP', name: '英镑', symbol: '£', flag: '🇬🇧' },
      { code: 'KRW', name: '韩元', symbol: '₩', flag: '🇰🇷' },
      { code: 'HKD', name: '港币', symbol: 'HK$', flag: '🇭🇰' },
      { code: 'TWD', name: '台币', symbol: 'NT$', flag: '🇹🇼' },
      { code: 'CAD', name: '加元', symbol: 'C$', flag: '🇨🇦' },
      { code: 'AUD', name: '澳元', symbol: 'A$', flag: '🇦🇺' },
      { code: 'CHF', name: '瑞士法郎', symbol: 'CHF', flag: '🇨🇭' },
      { code: 'SEK', name: '瑞典克朗', symbol: 'kr', flag: '🇸🇪' },
      { code: 'NOK', name: '挪威克朗', symbol: 'kr', flag: '🇳🇴' },
      { code: 'DKK', name: '丹麦克朗', symbol: 'kr', flag: '🇩🇰' },
      { code: 'SGD', name: '新加坡元', symbol: 'S$', flag: '🇸🇬' },
      { code: 'THB', name: '泰铢', symbol: '฿', flag: '🇹🇭' },
      { code: 'MYR', name: '马来西亚林吉特', symbol: 'RM', flag: '🇲🇾' },
      { code: 'PHP', name: '菲律宾比索', symbol: '₱', flag: '🇵🇭' },
      { code: 'INR', name: '印度卢比', symbol: '₹', flag: '🇮🇳' },
      { code: 'IDR', name: '印尼盾', symbol: 'Rp', flag: '🇮🇩' },
      { code: 'VND', name: '越南盾', symbol: '₫', flag: '🇻🇳' },
      { code: 'RUB', name: '俄罗斯卢布', symbol: '₽', flag: '🇷🇺' },
      { code: 'BRL', name: '巴西雷亚尔', symbol: 'R$', flag: '🇧🇷' },
      { code: 'MXN', name: '墨西哥比索', symbol: '$', flag: '🇲🇽' },
      { code: 'ZAR', name: '南非兰特', symbol: 'R', flag: '🇿🇦' }
    ]
    
    const quickAmounts = [1, 10, 100, 500, 1000, 5000, 10000]
    
    const commonPairs = [
      { name: '美元→人民币', from: 'USD', to: 'CNY' },
      { name: '欧元→美元', from: 'EUR', to: 'USD' },
      { name: '英镑→美元', from: 'GBP', to: 'USD' },
      { name: '日元→美元', from: 'JPY', to: 'USD' },
      { name: '港币→人民币', from: 'HKD', to: 'CNY' },
      { name: '韩元→人民币', from: 'KRW', to: 'CNY' }
    ]
    
    const majorCurrencies = ['USD', 'CNY', 'EUR', 'JPY', 'GBP', 'KRW', 'HKD', 'CAD', 'AUD']
    
    const exchangeRate = computed(() => {
      if (!fromCurrency.value || !toCurrency.value) return 0
      
      const fromRate = exchangeRates[fromCurrency.value]
      const toRate = exchangeRates[toCurrency.value]
      
      if (!fromRate || !toRate) return 0
      
      return toRate / fromRate
    })
    
    const ratesTableData = computed(() => {
      const baseRate = exchangeRates[baseCurrency.value]
      if (!baseRate) return []
      
      return currencies
        .filter(currency => currency.code !== baseCurrency.value)
        .map(currency => {
          const rate = exchangeRates[currency.code] / baseRate
          return {
            currency: currency.code,
            name: currency.name,
            flag: currency.flag,
            rate: rate.toFixed(4),
            amount: (100 * rate).toFixed(2)
          }
        })
    })
    
    const getCurrencyInfo = (code) => {
      return currencies.find(currency => currency.code === code)
    }
    
    const formatAmount = (amount) => {
      return amount >= 1000 ? `${amount/1000}K` : amount.toString()
    }
    
    const convert = () => {
      const amount = parseFloat(fromAmount.value)
      if (isNaN(amount) || !exchangeRate.value) {
        toAmount.value = ''
        return
      }
      
      const result = (amount * exchangeRate.value).toFixed(2)
      toAmount.value = result
      
      // 添加到历史记录
      if (amount > 0 && fromCurrency.value !== toCurrency.value) {
        addToHistory({
          fromAmount: fromAmount.value,
          toAmount: result,
          fromCurrency: fromCurrency.value,
          toCurrency: toCurrency.value,
          rate: exchangeRate.value.toFixed(4),
          time: new Date().toLocaleTimeString()
        })
      }
    }
    
    const addToHistory = (item) => {
      // 避免重复添加相同的转换
      const isDuplicate = history.value.some(h => 
        h.fromAmount === item.fromAmount &&
        h.fromCurrency === item.fromCurrency &&
        h.toCurrency === item.toCurrency
      )
      
      if (!isDuplicate) {
        history.value.unshift(item)
        if (history.value.length > 10) {
          history.value.pop()
        }
      }
    }
    
    const swapCurrencies = () => {
      [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value]
      fromAmount.value = toAmount.value || fromAmount.value
      convert()
    }
    
    const copyResult = () => {
      if (toAmount.value) {
        navigator.clipboard.writeText(toAmount.value).then(() => {
          // 可以添加提示
        })
      }
    }
    
    const setQuickAmount = (amount) => {
      fromAmount.value = amount.toString()
      convert()
    }
    
    const setPair = (pair) => {
      fromCurrency.value = pair.from
      toCurrency.value = pair.to
      convert()
    }
    
    const setFromTable = (currency) => {
      toCurrency.value = currency
      fromCurrency.value = baseCurrency.value
      convert()
    }
    
    const updateRatesTable = () => {
      // 表格会自动更新，这里可以添加其他逻辑
    }
    
    const loadHistory = (item) => {
      fromCurrency.value = item.fromCurrency
      toCurrency.value = item.toCurrency
      fromAmount.value = item.fromAmount
      convert()
    }
    
    const removeHistory = (index) => {
      history.value.splice(index, 1)
    }
    
    const clearHistory = () => {
      history.value = []
    }
    
    // 初始转换
    convert()
    
    return {
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      baseCurrency,
      history,
      currencies,
      quickAmounts,
      commonPairs,
      majorCurrencies,
      exchangeRate,
      ratesTableData,
      getCurrencyInfo,
      formatAmount,
      convert,
      swapCurrencies,
      copyResult,
      setQuickAmount,
      setPair,
      setFromTable,
      updateRatesTable,
      loadHistory,
      removeHistory,
      clearHistory
    }
  }
}
</script>

<style scoped>
.currency-converter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.converter-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.main-converter {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.main-converter h3 {
  margin: 0 0 2rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
}

.currency-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.currency-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.currency-selector label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}

.currency-selector select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1rem;
}

.amount-field {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1.3rem;
  text-align: center;
}

.amount-field.result {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  cursor: pointer;
}

.amount-output {
  position: relative;
}

.copy-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  border: none;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: rgba(102, 126, 234, 0.3);
}

.currency-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.currency-flag {
  font-size: 2rem;
}

.currency-name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.currency-symbol {
  color: #667eea;
  font-size: 0.9rem;
}

.converter-arrow {
  display: flex;
  justify-content: center;
}

.swap-btn {
  padding: 1rem;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swap-btn:hover {
  transform: rotate(180deg) scale(1.1);
}

.rate-display {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.rate-info {
  margin-bottom: 1rem;
}

.rate-text {
  color: #667eea;
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.reverse-rate {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.rate-note {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.quick-convert {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-convert h4, .quick-convert h5 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-convert h5 {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-top: 2rem;
}

.quick-amounts {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.quick-amount-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-amount-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.pairs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.pair-btn {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pair-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.pair-name {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.pair-codes {
  display: block;
  color: #667eea;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.rates-table {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.rates-table h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-controls {
  margin-bottom: 1rem;
}

.base-selector {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
}

.rates-grid {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.rates-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  font-weight: 500;
}

.rate-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.rate-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.rate-row:last-child {
  border-bottom: none;
}

.currency-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-cell .flag {
  font-size: 1.2rem;
}

.currency-cell .code {
  color: #667eea;
  font-weight: 500;
}

.currency-cell .name {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.rate-cell, .amount-cell {
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
}

.history-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.history-section h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.history-conversion {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
}

.history-rate {
  color: #667eea;
  font-size: 0.8rem;
}

.history-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.remove-btn {
  padding: 0.25rem;
  border: none;
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}

.clear-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}

.currency-knowledge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.currency-knowledge h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.knowledge-card {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.knowledge-card i {
  color: #667eea;
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.knowledge-card strong {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  display: block;
}

.knowledge-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .currency-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .converter-arrow {
    order: -1;
  }
  
  .swap-btn {
    transform: rotate(90deg);
  }
  
  .swap-btn:hover {
    transform: rotate(270deg) scale(1.1);
  }
  
  .quick-amounts {
    justify-content: center;
  }
  
  .pairs-grid {
    grid-template-columns: 1fr;
  }
  
  .rates-header, .rate-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .rates-header span, .rate-row span {
    text-align: center;
  }
  
  .currency-cell {
    justify-content: center;
  }
  
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style> 