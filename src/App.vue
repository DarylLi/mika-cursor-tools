<template>
  <div id="app" :class="{ 'dark-theme': isDarkTheme }">
    <header>
      <div class="header-content">
        <div class="header-left">
          <h1><i class="fas fa-tools"></i> 通用工具瑞士军刀</h1>
          <p>一站式实用工具集合 | Swiss Army Tools</p>
        </div>
        <div class="header-right">
          <button @click="toggleTheme" class="theme-toggle-btn" :title="isDarkTheme ? '切换到浅色模式' : '切换到深色模式'">
            <i :class="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- 搜索工具功能 -->
    <div class="search-section" v-if="!currentTool && !currentSubTool">
      <div class="search-container">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery"
            @input="performSearch"
            placeholder="🔍 搜索工具... (支持工具名称、描述搜索)"
            class="search-input"
          >
          <button 
            v-if="searchQuery" 
            @click="clearSearch"
            class="clear-btn"
            title="清空搜索">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- 搜索结果 -->
        <div v-if="searchQuery && searchResults.length > 0" class="search-results">
          <div class="search-results-header">
            <span>找到 {{ searchResults.length }} 个工具</span>
          </div>
          <div class="search-results-grid">
            <button
              v-for="result in searchResults.slice(0, 12)"
              :key="`${result.category}-${result.tool.id}`"
              @click="openSearchResult(result)"
              class="search-result-item">
              <div class="result-icon">
                <i :class="result.tool.icon"></i>
              </div>
              <div class="result-content">
                <h4>{{ result.tool.name }}</h4>
                <p>{{ result.tool.description }}</p>
                <span class="result-category">{{ result.categoryName }}</span>
              </div>
            </button>
          </div>
          <div v-if="searchResults.length > 12" class="search-more">
            还有 {{ searchResults.length - 12 }} 个结果...
          </div>
        </div>
        
        <!-- 无搜索结果 -->
        <div v-if="searchQuery && searchResults.length === 0" class="no-results">
          <i class="fas fa-search"></i>
          <p>没有找到相关工具</p>
          <span>试试其他关键词？</span>
        </div>
      </div>
    </div>

    <!-- 主导航栏 - 常用工具快捷入口 -->
    <nav class="main-nav" v-if="!currentTool && !currentSubTool">
      <div class="nav-content">
        <h3 class="nav-title">
          <i class="fas fa-star"></i> 常用工具
        </h3>
        <div class="nav-tools">
          <button 
            v-for="tool in popularTools" 
            :key="tool.id"
            @click="openPopularTool(tool)"
            class="nav-tool-btn"
            :title="tool.description">
            <i :class="tool.icon"></i>
            <span>{{ tool.name }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 面包屑导航 -->
    <nav class="breadcrumb" v-if="currentTool || currentSubTool">
      <button @click="goHome" class="breadcrumb-btn">
        <i class="fas fa-home"></i> 首页
      </button>
      <span v-if="currentTool" class="breadcrumb-separator">></span>
      <button v-if="currentTool && !currentSubTool" @click="goHome" class="breadcrumb-btn">
        {{ getToolInfo(currentTool).name }}
      </button>
      <button v-if="currentTool && currentSubTool" @click="goToToolList(currentTool)" class="breadcrumb-btn">
        {{ getToolInfo(currentTool).name }}
      </button>
      <span v-if="currentSubTool" class="breadcrumb-separator">></span>
      <span v-if="currentSubTool" class="breadcrumb-current">
        {{ currentSubTool.name }}
      </span>
    </nav>

    <main>
      <!-- 工具分类列表 -->
      <div v-if="!currentTool" class="category-overview">
        <h2 class="section-title">🛠️ 选择工具分类</h2>
        <div class="category-grid">
          <div 
            v-for="tool in tools" 
            :key="tool.id"
            @click="setCurrentTool(tool.id)"
            class="category-card">
            <div class="category-icon">
              <i :class="tool.icon"></i>
            </div>
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.description }}</p>
            <div class="tool-count">{{ tool.subTools.length }} 个工具</div>
          </div>
        </div>
      </div>

      <!-- 工具列表 -->
      <div v-else-if="currentTool && !currentSubTool" class="tool-list">
        <h2 class="section-title">
          <i :class="getToolInfo(currentTool).icon"></i> 
          {{ getToolInfo(currentTool).name }}
        </h2>
        <div class="tools-grid">
          <div 
            v-for="subTool in getToolInfo(currentTool).subTools" 
            :key="subTool.id"
            @click="setCurrentSubTool(subTool)"
            class="tool-item-card">
            <div class="tool-thumbnail">
              <i :class="subTool.icon"></i>
            </div>
            <div class="tool-info">
              <h3>{{ subTool.name }}</h3>
              <p>{{ subTool.description }}</p>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- 工具弹窗 -->
    <transition name="modal">
      <div v-if="currentSubTool" class="modal-overlay" @click="closeToolModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>
              <i :class="currentSubTool.icon"></i>
              {{ currentSubTool.name }}
            </h2>
            <button @click="closeToolModal" class="modal-close-btn" title="关闭">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <component :is="currentSubTool.component" :tool-data="currentSubTool" />
          </div>
        </div>
      </div>
    </transition>

    <footer>
      <p>&copy; 2025 通用工具瑞士军刀 | 现代化开发，让工作更高效</p>
      <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem;">
        <i class="fab fa-vuejs"></i> Powered by Vue 3 + 
        <i class="fas fa-bolt"></i> Vite
      </p>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue'
import TextFormatter from './components/tools/TextFormatter.vue'
import TextStats from './components/tools/TextStats.vue'
import JsonProcessor from './components/tools/JsonProcessor.vue'
import SlugGenerator from './components/tools/SlugGenerator.vue'
import LoremIpsum from './components/tools/LoremIpsum.vue'
import MarkdownPreview from './components/tools/MarkdownPreview.vue'
import YamlToJson from './components/tools/YamlToJson.vue'
import HtmlToText from './components/tools/HtmlToText.vue'
import RegexTester from './components/tools/RegexTester.vue'
import DiffViewer from './components/tools/DiffViewer.vue'
import Base64Converter from './components/tools/Base64Converter.vue'
import UrlConverter from './components/tools/UrlConverter.vue'
import ColorConverter from './components/tools/ColorConverter.vue'
import PasswordGenerator from './components/tools/PasswordGenerator.vue'
import QRGenerator from './components/tools/QRGenerator.vue'
import SqlInGenerator from './components/tools/SqlInGenerator.vue'
import SqlParameterFiller from './components/tools/SqlParameterFiller.vue'
import CreditCodeGenerator from './components/tools/CreditCodeGenerator.vue'
import Calculator from './components/tools/Calculator.vue'
import UnitConverter from './components/tools/UnitConverter.vue'
import ColorPicker from './components/tools/ColorPicker.vue'
import HexRgbConverter from './components/tools/HexRgbConverter.vue'
import PaletteGenerator from './components/tools/PaletteGenerator.vue'
import ContrastChecker from './components/tools/ContrastChecker.vue'
import GradientMaker from './components/tools/GradientMaker.vue'
import ShadowGenerator from './components/tools/ShadowGenerator.vue'
import BorderRadius from './components/tools/BorderRadius.vue'
import FaviconGenerator from './components/tools/FaviconGenerator.vue'
import CssClamp from './components/tools/CssClamp.vue'
import TailwindCheatsheet from './components/tools/TailwindCheatsheet.vue'
import ImageCompress from './components/tools/ImageCompress.vue'
import ImageResize from './components/tools/ImageResize.vue'
import ImageConvert from './components/tools/ImageConvert.vue'
import ImageCrop from './components/tools/ImageCrop.vue'
import ExifViewer from './components/tools/ExifViewer.vue'
import SvgMinify from './components/tools/SvgMinify.vue'
import GifSplit from './components/tools/GifSplit.vue'
import VideoTrim from './components/tools/VideoTrim.vue'
import AudioConvert from './components/tools/AudioConvert.vue'
import IconSpriter from './components/tools/IconSpriter.vue'
import UnixTimestamp from './components/tools/UnixTimestamp.vue'
import CronParser from './components/tools/CronParser.vue'
import AgeCalculator from './components/tools/AgeCalculator.vue'
import TimeDiff from './components/tools/TimeDiff.vue'
import TimezoneConvert from './components/tools/TimezoneConvert.vue'
import WeekNumber from './components/tools/WeekNumber.vue'
import CountdownTimer from './components/tools/CountdownTimer.vue'
import DateAdd from './components/tools/DateAdd.vue'
import WorkingDays from './components/tools/WorkingDays.vue'
import CalendarMaker from './components/tools/CalendarMaker.vue'
import PercentageCalc from './components/tools/PercentageCalc.vue'
import TriangleSolver from './components/tools/TriangleSolver.vue'
import PrimeChecker from './components/tools/PrimeChecker.vue'
import QuadraticSolver from './components/tools/QuadraticSolver.vue'
import MatrixMath from './components/tools/MatrixMath.vue'
import CurrencyConverter from './components/tools/CurrencyConverter.vue'
import RomanNumeral from './components/tools/RomanNumeral.vue'
import BaseNConverter from './components/tools/BaseNConverter.vue'
import RandomNumber from './components/tools/RandomNumber.vue'
import JwtDecoder from './components/tools/JwtDecoder.vue'
import Md5Hash from './components/tools/Md5Hash.vue'
import Sha256Hash from './components/tools/Sha256Hash.vue'
import UuidGenerator from './components/tools/UuidGenerator.vue'
import BcryptHash from './components/tools/BcryptHash.vue'
import BarcodeGenerator from './components/tools/BarcodeGenerator.vue'
import PasswordStrength from './components/tools/PasswordStrength.vue'
// Web/DevTools工具
import JsonToTs from './components/tools/JsonToTs.vue'
import HttpStatus from './components/tools/HttpStatus.vue'
import UserAgent from './components/tools/UserAgent.vue'
import MimeSearch from './components/tools/MimeSearch.vue'
import DnsLookup from './components/tools/DnsLookup.vue'
import IpInfo from './components/tools/IpInfo.vue'
import JwtGenerator from './components/tools/JwtGenerator.vue'
import UuidNamespace from './components/tools/UuidNamespace.vue'
import RegexCheatsheet from './components/tools/RegexCheatsheet.vue'
import JsonDiff from './components/tools/JsonDiff.vue'
// 随机/生成器工具
import LoremImage from './components/tools/LoremImage.vue'
import FakeUser from './components/tools/FakeUser.vue'
import RandomColor from './components/tools/RandomColor.vue'
import NameGenerator from './components/tools/NameGenerator.vue'
import QuoteGenerator from './components/tools/QuoteGenerator.vue'
import UuidBatch from './components/tools/UuidBatch.vue'
import DiceRoller from './components/tools/DiceRoller.vue'
import LotteryPicker from './components/tools/LotteryPicker.vue'
import StoryPrompt from './components/tools/StoryPrompt.vue'
// 文件/文档工具
import CsvToJson from './components/tools/CsvToJson.vue'
import JsonToCsv from './components/tools/JsonToCsv.vue'
import MarkdownToc from './components/tools/MarkdownToc.vue'
import TextToPdf from './components/tools/TextToPdf.vue'
import MergePdf from './components/tools/MergePdf.vue'
import SplitPdf from './components/tools/SplitPdf.vue'
import ExcelToJson from './components/tools/ExcelToJson.vue'
import ZipExtract from './components/tools/ZipExtract.vue'
import ImageToPdf from './components/tools/ImageToPdf.vue'
import FileHash from './components/tools/FileHash.vue'
// 数据/可视化工具
import CsvPreview from './components/tools/CsvPreview.vue'
import JsonPlot from './components/tools/JsonPlot.vue'
import MarkdownMermaid from './components/tools/MarkdownMermaid.vue'
import GeojsonViewer from './components/tools/GeojsonViewer.vue'
import Base64Image from './components/tools/Base64Image.vue'
import HtmlPreview from './components/tools/HtmlPreview.vue'
import TableSorter from './components/tools/TableSorter.vue'
import UrlParser from './components/tools/UrlParser.vue'
import EmailValidator from './components/tools/EmailValidator.vue'
import CreditCardCheck from './components/tools/CreditCardCheck.vue'
// 转换工具
import TimestampConverter from './components/tools/TimestampConverter.vue'
import WordToHtml from './components/tools/WordToHtml.vue'
import MarkdownToImage from './components/tools/MarkdownToImage.vue'
import SqlConverter from './components/tools/SqlConverter.vue'

export default {
  name: 'App',
  components: {
    TextFormatter,
    TextStats,
    JsonProcessor,
    SlugGenerator,
    LoremIpsum,
    MarkdownPreview,
    YamlToJson,
    HtmlToText,
    RegexTester,
    DiffViewer,
    Base64Converter,
    UrlConverter,
    ColorConverter,
    PasswordGenerator,
    QRGenerator,
    SqlInGenerator,
    SqlParameterFiller,
    CreditCodeGenerator,
    Calculator,
    UnitConverter,
    ColorPicker,
    HexRgbConverter,
    PaletteGenerator,
    ContrastChecker,
    GradientMaker,
    ShadowGenerator,
    BorderRadius,
    FaviconGenerator,
    CssClamp,
    TailwindCheatsheet,
    ImageCompress,
    ImageResize,
    ImageConvert,
    ImageCrop,
    ExifViewer,
    SvgMinify,
    GifSplit,
    VideoTrim,
    AudioConvert,
    IconSpriter,
    UnixTimestamp,
    CronParser,
    AgeCalculator,
    TimeDiff,
    TimezoneConvert,
    WeekNumber,
    CountdownTimer,
    DateAdd,
    WorkingDays,
    CalendarMaker,
    PercentageCalc,
    TriangleSolver,
    PrimeChecker,
    QuadraticSolver,
    MatrixMath,
    CurrencyConverter,
    RomanNumeral,
    BaseNConverter,
    RandomNumber,
    JwtDecoder,
    Md5Hash,
    Sha256Hash,
    UuidGenerator,
    BcryptHash,
    BarcodeGenerator,
    PasswordStrength,
    // Web/DevTools工具
    JsonToTs,
    HttpStatus,
    UserAgent,
    MimeSearch,
    DnsLookup,
    IpInfo,
    JwtGenerator,
    UuidNamespace,
    RegexCheatsheet,
    JsonDiff,
    // 随机/生成器工具
    LoremImage,
    FakeUser,
    RandomColor,
    NameGenerator,
    QuoteGenerator,
    UuidBatch,
    DiceRoller,
    LotteryPicker,
    StoryPrompt,
    // 文件/文档工具
    CsvToJson,
    JsonToCsv,
    MarkdownToc,
    TextToPdf,
    MergePdf,
    SplitPdf,
    ExcelToJson,
    ZipExtract,
    ImageToPdf,
    FileHash,
    // 数据/可视化工具
    CsvPreview,
    JsonPlot,
    MarkdownMermaid,
    GeojsonViewer,
    Base64Image,
    HtmlPreview,
    TableSorter,
    UrlParser,
    EmailValidator,
    CreditCardCheck,
    // 转换工具
    TimestampConverter,
    WordToHtml,
    MarkdownToImage,
    SqlConverter
  },
  setup() {
    const currentTool = ref(null)
    const currentSubTool = ref(null)
    
    // 主题管理 - 默认深色主题
    const isDarkTheme = ref(localStorage.getItem('theme') !== 'light')
    
    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value
      localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
    }
    
    // 搜索功能
    const searchQuery = ref('')
    const searchResults = ref([])
    
    // 搜索工具方法
    const performSearch = () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = []
        return
      }
      
      const query = searchQuery.value.toLowerCase().trim()
      const results = []
      
      // 搜索所有工具
      tools.value.forEach(category => {
        category.subTools.forEach(tool => {
          const nameMatch = tool.name.toLowerCase().includes(query)
          const descMatch = tool.description.toLowerCase().includes(query)
          
          if (nameMatch || descMatch) {
            results.push({
              tool: tool,
              category: category.id,
              categoryName: category.name
            })
          }
        })
      })
      
      // 按匹配度排序（名称匹配优先级更高）
      results.sort((a, b) => {
        const aNameMatch = a.tool.name.toLowerCase().includes(query)
        const bNameMatch = b.tool.name.toLowerCase().includes(query)
        
        if (aNameMatch && !bNameMatch) return -1
        if (!aNameMatch && bNameMatch) return 1
        return 0
      })
      
      searchResults.value = results
    }
    
    // 清空搜索
    const clearSearch = () => {
      searchQuery.value = ''
      searchResults.value = []
    }
    
    // 打开搜索结果工具
    const openSearchResult = (result) => {
      const targetTool = tools.value.find(t => t.id === result.category)
      if (targetTool) {
        const subTool = targetTool.subTools.find(st => st.id === result.tool.id)
        if (subTool) {
          setCurrentSubTool(subTool)
          clearSearch()
        }
      }
    }
    
    const tools = ref([
      {
        id: 'text',
        name: '文本工具',
        icon: 'fas fa-font',
        description: '文本处理、格式化、统计分析等',
        subTools: [
          {
            id: 'text-formatter',
            name: '文本格式化',
            description: '大小写转换、标题格式、文本反转等',
            icon: 'fas fa-text-height',
            component: 'TextFormatter'
          },
          {
            id: 'text-stats',
            name: '文本统计',
            description: '字符数、单词数、行数统计分析',
            icon: 'fas fa-chart-bar',
            component: 'TextStats'
          },
          {
            id: 'json-processor',
            name: 'JSON处理',
            description: 'JSON格式化、压缩、验证等',
            icon: 'fas fa-code',
            component: 'JsonProcessor'
          },
          {
            id: 'slug-generator',
            name: 'Slug Generator',
            description: '生成 URL-slug，支持多种命名格式',
            icon: 'fas fa-link',
            component: 'SlugGenerator'
          },
          {
            id: 'lorem-ipsum',
            name: 'Lorem Ipsum',
            description: '假文生成器，支持中英文占位文本',
            icon: 'fas fa-font',
            component: 'LoremIpsum'
          },
          {
            id: 'markdown-preview',
            name: 'Markdown Preview',
            description: 'MD→HTML 实时预览转换',
            icon: 'fab fa-markdown',
            component: 'MarkdownPreview'
          },
          {
            id: 'yaml-to-json',
            name: 'YAML→JSON',
            description: 'YAML与JSON格式互转工具',
            icon: 'fas fa-exchange-alt',
            component: 'YamlToJson'
          },
          {
            id: 'html-to-text',
            name: 'HTML Stripper',
            description: '提取HTML中的纯文本内容',
            icon: 'fas fa-code',
            component: 'HtmlToText'
          },
          {
            id: 'regex-tester',
            name: 'RegEx Tester',
            description: '正则表达式实时匹配测试',
            icon: 'fas fa-search',
            component: 'RegexTester'
          },
          {
            id: 'diff-viewer',
            name: 'Text Diff',
            description: '文本差异对比工具',
            icon: 'fas fa-code-branch',
            component: 'DiffViewer'
          }
        ]
      },
      {
        id: 'converter',
        name: '转换工具',
        icon: 'fas fa-exchange-alt',
        description: '多种格式转换工具',
        subTools: [
          {
            id: 'color-converter',
            name: '颜色转换',
            description: 'HEX、RGB、HSL颜色格式转换',
            icon: 'fas fa-palette',
            component: 'ColorConverter'
          },
          {
            id: 'timestamp-converter',
            name: '时间戳转换工具',
            description: 'Unix时间戳、ISO字符串、本地时间等格式互转',
            icon: 'fas fa-clock',
            component: 'TimestampConverter'
          },
          {
            id: 'word-to-html',
            name: 'Word转HTML工具',
            description: '将Word文档(.docx)转换为HTML格式',
            icon: 'fas fa-file-word',
            component: 'WordToHtml'
          },
          {
            id: 'markdown-to-image',
            name: 'Markdown转图片工具',
            description: '将Markdown文本渲染为PNG/JPG图片',
            icon: 'fab fa-markdown',
            component: 'MarkdownToImage'
          },
          {
            id: 'sql-converter',
            name: 'SQL转换工具',
            description: '多数据库SQL语法转换、格式化和优化',
            icon: 'fas fa-database',
            component: 'SqlConverter'
          }
        ]
      },
      {
        id: 'crypto',
        name: '编码/加密',
        icon: 'fas fa-shield-alt',
        description: '编码转换、哈希加密、JWT解析等安全工具',
        subTools: [
          {
            id: 'base64-converter',
            name: 'Base64编码',
            description: 'Base64编码解码转换',
            icon: 'fas fa-code',
            component: 'Base64Converter'
          },
          {
            id: 'url-converter',
            name: 'URL编码',
            description: 'URL编码解码转换',
            icon: 'fas fa-link',
            component: 'UrlConverter'
          },
          {
            id: 'jwt-decoder',
            name: 'JWT解析器',
            description: '解析JWT Token，查看Header和Payload',
            icon: 'fas fa-key',
            component: 'JwtDecoder'
          },
          {
            id: 'md5-hash',
            name: 'MD5哈希',
            description: '计算文本的MD5哈希值',
            icon: 'fas fa-hashtag',
            component: 'Md5Hash'
          },
          {
            id: 'sha256-hash',
            name: 'SHA-256哈希',
            description: '计算文本的SHA-256哈希值',
            icon: 'fas fa-shield-halved',
            component: 'Sha256Hash'
          },
          {
            id: 'uuid-generator',
            name: 'UUID生成器',
            description: '生成UUID v4唯一标识符',
            icon: 'fas fa-fingerprint',
            component: 'UuidGenerator'
          },
          {
            id: 'bcrypt-hash',
            name: 'Bcrypt哈希',
            description: '生成和验证Bcrypt密码哈希',
            icon: 'fas fa-lock',
            component: 'BcryptHash'
          },
          {
            id: 'qr-generator',
            name: '二维码生成',
            description: '文本转二维码，支持多种格式',
            icon: 'fas fa-qrcode',
            component: 'QRGenerator'
          },
          {
            id: 'barcode-generator',
            name: '条形码生成',
            description: '生成Code 128条形码',
            icon: 'fas fa-barcode',
            component: 'BarcodeGenerator'
          },
          {
            id: 'password-strength',
            name: '密码强度检测',
            description: '检测密码强度并给出改进建议',
            icon: 'fas fa-user-shield',
            component: 'PasswordStrength'
          }
        ]
      },
      {
        id: 'generator',
        name: '生成工具',
        icon: 'fas fa-magic',
        description: '密码生成等实用生成器',
        subTools: [
          {
            id: 'password-generator',
            name: '密码生成器',
            description: '安全密码生成，可自定义字符类型',
            icon: 'fas fa-key',
            component: 'PasswordGenerator'
          },
          {
            id: 'sql-in-generator',
            name: 'SQL IN 语句生成器',
            description: '将多种格式数据转换为SQL IN语句',
            icon: 'fas fa-list',
            component: 'SqlInGenerator'
          },
          {
            id: 'sql-parameter-filler',
            name: 'SQL 参数填充工具',
            description: '将参数化SQL语句填充为完整的可执行SQL',
            icon: 'fas fa-fill-drip',
            component: 'SqlParameterFiller'
          },
          {
            id: 'credit-code-generator',
            name: '统一社会信用代码生成',
            description: '生成符合国标的18位统一社会信用代码',
            icon: 'fas fa-id-card',
            component: 'CreditCodeGenerator'
          }
        ]
      },
      {
        id: 'math',
        name: '数学/单位',
        icon: 'fas fa-calculator',
        description: '数学计算、单位转换、数字处理等专业工具',
        subTools: [
          {
            id: 'calculator',
            name: '基础计算器',
            description: '四则运算、科学计算功能',
            icon: 'fas fa-calculator',
            component: 'Calculator'
          },
          {
            id: 'unit-converter',
            name: '单位换算',
            description: '长度、重量、面积、体积等单位转换',
            icon: 'fas fa-ruler',
            component: 'UnitConverter'
          },
          {
            id: 'percentage-calc',
            name: '百分比计算',
            description: '百分比增减、比例计算、折扣计算',
            icon: 'fas fa-percent',
            component: 'PercentageCalc'
          },
          {
            id: 'triangle-solver',
            name: '三角形求解',
            description: '已知边角求其他边角，三角函数计算',
            icon: 'fas fa-play',
            component: 'TriangleSolver'
          },
          {
            id: 'prime-checker',
            name: '质数检测',
            description: '质数判断、因数分解、质数生成',
            icon: 'fas fa-hashtag',
            component: 'PrimeChecker'
          },
          {
            id: 'quadratic-solver',
            name: '二次方程求解',
            description: '一元二次方程求根、判别式分析',
            icon: 'fas fa-square-root-alt',
            component: 'QuadraticSolver'
          },
          {
            id: 'matrix-math',
            name: '矩阵运算',
            description: '矩阵加减乘、求逆、行列式计算',
            icon: 'fas fa-th',
            component: 'MatrixMath'
          },
          {
            id: 'currency-converter',
            name: '汇率换算',
            description: '主要货币汇率转换，静态汇率数据',
            icon: 'fas fa-dollar-sign',
            component: 'CurrencyConverter'
          },
          {
            id: 'roman-numeral',
            name: '罗马数字转换',
            description: '阿拉伯数字与罗马数字互转',
            icon: 'fas fa-list-ol',
            component: 'RomanNumeral'
          },
          {
            id: 'base-converter',
            name: '进制转换',
            description: '2-36进制数字互转，程序员必备',
            icon: 'fas fa-code',
            component: 'BaseNConverter'
          },
          {
            id: 'random-number',
            name: '随机数生成',
            description: '各种类型随机数、序列、字符串生成',
            icon: 'fas fa-dice',
            component: 'RandomNumber'
          }
        ]
      },
      {
        id: 'design',
        name: '颜色/设计',
        icon: 'fas fa-palette',
        description: '颜色选择、CSS生成、设计辅助工具',
        subTools: [
          {
            id: 'color-picker',
            name: '颜色选择器',
            description: '专业取色工具，支持多种格式',
            icon: 'fas fa-eyedropper',
            component: 'ColorPicker'
          },
          {
            id: 'hex-rgb-converter',
            name: 'HEX↔RGB转换',
            description: '颜色格式互转，支持HSL/HSV/CMYK',
            icon: 'fas fa-exchange-alt',
            component: 'HexRgbConverter'
          },
          {
            id: 'palette-generator',
            name: '调色板生成器',
            description: '智能配色方案生成，支持多种和谐色彩',
            icon: 'fas fa-swatchbook',
            component: 'PaletteGenerator'
          },
          {
            id: 'contrast-checker',
            name: '对比度检测',
            description: 'WCAG标准色彩对比度检测工具',
            icon: 'fas fa-universal-access',
            component: 'ContrastChecker'
          },
          {
            id: 'gradient-maker',
            name: 'CSS渐变生成',
            description: '可视化CSS渐变代码生成器',
            icon: 'fas fa-paint-brush',
            component: 'GradientMaker'
          },
          {
            id: 'shadow-generator',
            name: '盒阴影生成器',
            description: 'CSS box-shadow 可视化生成',
            icon: 'fas fa-square',
            component: 'ShadowGenerator'
          },
          {
            id: 'border-radius',
            name: '圆角可视化',
            description: 'CSS border-radius 可视化调节',
            icon: 'fas fa-circle',
            component: 'BorderRadius'
          },
          {
            id: 'favicon-generator',
            name: '网站图标生成',
            description: '多尺寸favicon图标生成器',
            icon: 'fas fa-star',
            component: 'FaviconGenerator'
          },
          {
            id: 'css-clamp',
            name: 'CSS Clamp计算',
            description: '响应式尺寸clamp()函数生成',
            icon: 'fas fa-expand-arrows-alt',
            component: 'CssClamp'
          },
          {
            id: 'tailwind-cheatsheet',
            name: 'Tailwind速查',
            description: 'Tailwind CSS类名快速查找',
            icon: 'fas fa-wind',
            component: 'TailwindCheatsheet'
          }
        ]
      },
      {
        id: 'media',
        name: '图片/多媒体',
        icon: 'fas fa-images',
        description: '图片、音视频处理，格式转换，优化压缩',
        subTools: [
          {
            id: 'image-compress',
            name: '图片压缩器',
            description: '客户端压缩 JPG/PNG/WebP，保护隐私',
            icon: 'fas fa-compress-alt',
            component: 'ImageCompress'
          },
          {
            id: 'image-resize',
            name: '图片尺寸调整',
            description: '等比缩放或自定义尺寸，保持质量',
            icon: 'fas fa-expand-arrows-alt',
            component: 'ImageResize'
          },
          {
            id: 'image-convert',
            name: '图片格式转换',
            description: 'PNG↔WebP↔JPG 格式互转',
            icon: 'fas fa-exchange-alt',
            component: 'ImageConvert'
          },
          {
            id: 'image-crop',
            name: '图片裁剪工具',
            description: '精确裁剪并导出，支持多种比例',
            icon: 'fas fa-crop-alt',
            component: 'ImageCrop'
          },
          {
            id: 'exif-viewer',
            name: 'EXIF 元数据查看',
            description: '查看/移除图片元数据，保护隐私',
            icon: 'fas fa-info-circle',
            component: 'ExifViewer'
          },
          {
            id: 'svg-minify',
            name: 'SVG 压缩优化',
            description: '压缩SVG文件，移除冗余代码',
            icon: 'fas fa-code',
            component: 'SvgMinify'
          },
          {
            id: 'gif-split',
            name: 'GIF 帧拆分',
            description: '将动画GIF拆分为单独帧',
            icon: 'fas fa-film',
            component: 'GifSplit'
          },
          {
            id: 'video-trim',
            name: '视频剪辑工具',
            description: '浏览器端视频剪辑，无需上传',
            icon: 'fas fa-video',
            component: 'VideoTrim'
          },
          {
            id: 'audio-convert',
            name: '音频格式转换',
            description: 'MP3/WAV/OGG/AAC 格式互转',
            icon: 'fas fa-music',
            component: 'AudioConvert'
          },
          {
            id: 'icon-spriter',
            name: 'SVG 雪碧图生成',
            description: '合并SVG图标，生成雪碧图',
            icon: 'fas fa-th',
            component: 'IconSpriter'
          }
        ]
      },
      {
        id: 'datetime',
        name: '日期/时间',
        icon: 'fas fa-clock',
        description: '时间戳转换、日期计算、时区转换等',
        subTools: [
          {
            id: 'unix-timestamp',
            name: 'Unix时间戳转换',
            description: '时间戳↔日期互转，支持秒/毫秒',
            icon: 'fas fa-clock',
            component: 'UnixTimestamp'
          },
          {
            id: 'cron-parser',
            name: 'Cron表达式解析',
            description: '解析Cron表达式，预测执行时间',
            icon: 'fas fa-cogs',
            component: 'CronParser'
          },
          {
            id: 'age-calculator',
            name: '年龄计算器',
            description: '精确计算年龄，统计生命时光',
            icon: 'fas fa-birthday-cake',
            component: 'AgeCalculator'
          },
          {
            id: 'time-diff',
            name: '日期间隔计算',
            description: '计算两个日期间的时间差',
            icon: 'fas fa-calendar-minus',
            component: 'TimeDiff'
          },
          {
            id: 'timezone-convert',
            name: '时区转换器',
            description: '全球时区时间转换工具',
            icon: 'fas fa-globe',
            component: 'TimezoneConvert'
          },
          {
            id: 'week-number',
            name: 'ISO周数计算',
            description: '计算ISO标准周数和年份',
            icon: 'fas fa-calendar-week',
            component: 'WeekNumber'
          },
          {
            id: 'countdown-timer',
            name: '倒计时器',
            description: '事件倒计时，支持多种显示格式',
            icon: 'fas fa-hourglass-half',
            component: 'CountdownTimer'
          },
          {
            id: 'date-add',
            name: '日期加减计算',
            description: '日期的加减运算，支持多种时间单位',
            icon: 'fas fa-plus-minus',
            component: 'DateAdd'
          },
          {
            id: 'working-days',
            name: '工作日计算器',
            description: '计算工作日，排除节假日',
            icon: 'fas fa-briefcase',
            component: 'WorkingDays'
          },
          {
            id: 'calendar-maker',
            name: '月历生成器',
            description: '生成漂亮的月历PNG图片',
            icon: 'fas fa-calendar-alt',
            component: 'CalendarMaker'
          }
        ],
      },
      {
        id: 'webdev',
        name: 'Web / DevTools',
        icon: 'fas fa-laptop-code',
        description: 'Web开发工具、API测试、数据转换等开发者必备工具',
        subTools: [
          {
            id: 'json-to-ts',
            name: 'JSON→TS Interface',
            description: '将JSON数据转换为TypeScript接口定义',
            icon: 'fab fa-js-square',
            component: 'JsonToTs'
          },
          {
            id: 'http-status',
            name: 'HTTP Status Lookup',
            description: 'HTTP状态码查询和说明',
            icon: 'fas fa-globe',
            component: 'HttpStatus'
          },
          {
            id: 'user-agent',
            name: 'User Agent Parser',
            description: '解析User Agent字符串，识别浏览器和设备',
            icon: 'fas fa-user-secret',
            component: 'UserAgent'
          },
          {
            id: 'mime-search',
            name: 'MIME Type Search',
            description: '搜索文件扩展名对应的MIME类型',
            icon: 'fas fa-file-alt',
            component: 'MimeSearch'
          },
          {
            id: 'dns-lookup',
            name: 'DNS Lookup',
            description: 'DNS查询工具，支持多种记录类型',
            icon: 'fas fa-server',
            component: 'DnsLookup'
          },
          {
            id: 'ip-info',
            name: 'IP Info & Whois',
            description: '查询公网IP和Whois信息',
            icon: 'fas fa-map-marker-alt',
            component: 'IpInfo'
          },
          {
            id: 'jwt-generator',
            name: 'JWT Signer (HS256)',
            description: '本地JWT Token生成和签名',
            icon: 'fas fa-key',
            component: 'JwtGenerator'
          },
          {
            id: 'uuid-namespace',
            name: 'UUID v5 生成',
            description: '基于命名空间生成UUID v5',
            icon: 'fas fa-fingerprint',
            component: 'UuidNamespace'
          },
          {
            id: 'regex-cheatsheet',
            name: 'RegEx 速查表',
            description: '正则表达式语法参考和常用模式',
            icon: 'fas fa-list-alt',
            component: 'RegexCheatsheet'
          },
          {
            id: 'json-diff',
            name: 'JSON Diff Viewer',
            description: 'JSON对象差异对比工具',
            icon: 'fas fa-code-branch',
            component: 'JsonDiff'
          }
        ]
      },
      {
        id: 'random',
        name: '随机 / 生成器',
        icon: 'fas fa-dice',
        description: '随机数据生成、占位内容、名字生成等创意工具',
        subTools: [
          {
            id: 'lorem-image',
            name: '占位图片生成',
            description: '生成各种尺寸的占位图片，支持自定义颜色文字',
            icon: 'fas fa-image',
            component: 'LoremImage'
          },
          {
            id: 'fake-user',
            name: '虚拟人员资料',
            description: '生成完整的虚拟人员信息，适用于开发测试',
            icon: 'fas fa-user-friends',
            component: 'FakeUser'
          },
          {
            id: 'random-color',
            name: '随机颜色生成',
            description: '生成随机颜色，支持多种格式和调色方案',
            icon: 'fas fa-palette',
            component: 'RandomColor'
          },
          {
            id: 'name-generator',
            name: '名字生成器',
            description: '生成各种文化背景的姓名，支持多种风格',
            icon: 'fas fa-user-tag',
            component: 'NameGenerator'
          },
          {
            id: 'quote-generator',
            name: '随机名言生成',
            description: '生成励志名言、哲理语句、经典语录',
            icon: 'fas fa-quote-right',
            component: 'QuoteGenerator'
          },
          {
            id: 'uuid-batch',
            name: 'UUID 批量生成',
            description: '批量生成UUID，支持多种版本和格式',
            icon: 'fas fa-fingerprint',
            component: 'UuidBatch'
          },
          {
            id: 'dice-roller',
            name: 'RPG 骰子模拟',
            description: '模拟各种游戏骰子，支持复杂骰子表达式',
            icon: 'fas fa-dice-d20',
            component: 'DiceRoller'
          },
          {
            id: 'lottery-picker',
            name: '抽奖器工具',
            description: '随机抽奖、名单随机选择、幸运转盘',
            icon: 'fas fa-gift',
            component: 'LotteryPicker'
          },
          {
            id: 'story-prompt',
            name: '写作灵感生成',
            description: '生成创意写作提示、故事开头、情节点子',
            icon: 'fas fa-feather-alt',
            component: 'StoryPrompt'
          }
        ]
      },
      {
        id: 'files',
        name: '文件 / 文档',
        icon: 'fas fa-file-alt',
        description: '文件格式转换、文档处理、压缩解压等工具',
        subTools: [
          {
            id: 'csv-to-json',
            name: 'CSV → JSON',
            description: '将CSV文件转换为JSON格式',
            icon: 'fas fa-table',
            component: 'CsvToJson'
          },
          {
            id: 'json-to-csv',
            name: 'JSON → CSV',
            description: '将JSON数据转换为CSV格式',
            icon: 'fas fa-code',
            component: 'JsonToCsv'
          },
          {
            id: 'markdown-toc',
            name: 'MD TOC',
            description: '生成Markdown文档目录结构',
            icon: 'fab fa-markdown',
            component: 'MarkdownToc'
          },
          {
            id: 'text-to-pdf',
            name: 'Text → PDF',
            description: '将文本转换为PDF文档',
            icon: 'fas fa-file-pdf',
            component: 'TextToPdf'
          },
          {
            id: 'merge-pdf',
            name: 'PDF Merger',
            description: '合并多个PDF文件为一个文档',
            icon: 'fas fa-object-group',
            component: 'MergePdf'
          },
          {
            id: 'split-pdf',
            name: 'PDF Split',
            description: '将PDF文档按页面分割',
            icon: 'fas fa-cut',
            component: 'SplitPdf'
          },
          {
            id: 'excel-to-json',
            name: 'XLSX → JSON',
            description: '将Excel文件转换为JSON格式',
            icon: 'fas fa-file-excel',
            component: 'ExcelToJson'
          },
          {
            id: 'zip-extract',
            name: 'ZIP Extract',
            description: '在线解压ZIP文件',
            icon: 'fas fa-file-archive',
            component: 'ZipExtract'
          },
          {
            id: 'image-to-pdf',
            name: 'Img → PDF',
            description: '将图片转换为PDF文档',
            icon: 'fas fa-images',
            component: 'ImageToPdf'
          },
          {
            id: 'file-hash',
            name: 'File Checksum',
            description: '计算文件的哈希值校验码',
            icon: 'fas fa-shield-alt',
            component: 'FileHash'
          }
        ]
      },
      {
        id: 'data-viz',
        name: '数据 / 可视化',
        icon: 'fas fa-chart-bar',
        description: '数据分析、图表生成、格式预览等可视化工具',
        subTools: [
          {
            id: 'csv-preview',
            name: 'CSV Viewer',
            description: 'CSV文件预览与分析工具',
            icon: 'fas fa-table',
            component: 'CsvPreview'
          },
          {
            id: 'json-plot',
            name: 'JSON Plot | Chart.js',
            description: 'JSON数据可视化图表生成',
            icon: 'fas fa-chart-line',
            component: 'JsonPlot'
          },
          {
            id: 'markdown-mermaid',
            name: 'Mermaid Preview',
            description: 'Mermaid图表预览与编辑',
            icon: 'fas fa-project-diagram',
            component: 'MarkdownMermaid'
          },
          {
            id: 'geojson-viewer',
            name: 'GeoJSON Map',
            description: 'GeoJSON地图数据查看器',
            icon: 'fas fa-map',
            component: 'GeojsonViewer'
          },
          {
            id: 'base64-image',
            name: 'Base64 Img Preview',
            description: 'Base64图片编码预览与转换',
            icon: 'fas fa-image',
            component: 'Base64Image'
          },
          {
            id: 'html-preview',
            name: 'Live HTML | iframe',
            description: 'HTML实时预览与调试工具',
            icon: 'fas fa-code',
            component: 'HtmlPreview'
          },
          {
            id: 'table-sorter',
            name: 'Table Sorter / Filter',
            description: '表格数据排序与筛选工具',
            icon: 'fas fa-sort',
            component: 'TableSorter'
          },
          {
            id: 'url-parser',
            name: 'URL Inspector',
            description: 'URL结构解析与分析工具',
            icon: 'fas fa-link',
            component: 'UrlParser'
          },
          {
            id: 'email-validator',
            name: 'Email Regex Check',
            description: '邮箱地址格式验证工具',
            icon: 'fas fa-envelope',
            component: 'EmailValidator'
          },
          {
            id: 'credit-card-check',
            name: 'Luhn Validator',
            description: '信用卡号码Luhn算法验证',
            icon: 'fas fa-credit-card',
            component: 'CreditCardCheck'
          }
        ]
      }
    ])
    
    const setCurrentTool = (toolId) => {
      currentTool.value = toolId
      currentSubTool.value = null
    }
    
    const setCurrentSubTool = (subTool) => {
      currentSubTool.value = subTool
    }
    
    const getToolInfo = (toolId) => {
      return tools.value.find(tool => tool.id === toolId)
    }
    
    const goHome = () => {
      currentTool.value = null
      currentSubTool.value = null
    }
    
    const goToToolList = (toolId) => {
      currentTool.value = toolId
      currentSubTool.value = null
    }
    
    const closeToolModal = () => {
      currentSubTool.value = null
    }
    
    // 常用工具定义 - 7个最常用的工具
    const popularTools = ref([
      {
        id: 'json-processor',
        name: 'JSON处理',
        description: 'JSON格式化、压缩、验证等',
        icon: 'fas fa-code',
        component: 'JsonProcessor',
        category: 'text'
      },
      {
        id: 'password-generator',
        name: '密码生成器',
        description: '生成安全密码，自定义长度和字符类型',
        icon: 'fas fa-lock',
        component: 'PasswordGenerator',
        category: 'generators'
      },
      {
        id: 'qr-generator',
        name: '二维码生成',
        description: '文本转二维码，支持多种尺寸',
        icon: 'fas fa-qrcode',
        component: 'QRGenerator',
        category: 'generators'
      },
      {
        id: 'base64-converter',
        name: 'Base64编码',
        description: 'Base64编码解码转换',
        icon: 'fas fa-code',
        component: 'Base64Converter',
        category: 'crypto'
      },
      {
        id: 'color-picker',
        name: '颜色选择器',
        description: '智能颜色选择器，多种格式输出',
        icon: 'fas fa-eye-dropper',
        component: 'ColorPicker',
        category: 'design'
      },
      {
        id: 'unix-timestamp',
        name: 'Unix时间戳',
        description: '时间戳与时间格式互相转换',
        icon: 'fas fa-clock',
        component: 'UnixTimestamp',
        category: 'datetime'
      },
      {
        id: 'calculator',
        name: '计算器',
        description: '基础数学计算器',
        icon: 'fas fa-calculator',
        component: 'Calculator',
        category: 'math'
      }
    ])
    
    // 打开常用工具
    const openPopularTool = (tool) => {
      // 根据工具所属分类找到对应的工具
      const targetTool = tools.value.find(t => t.id === tool.category)
      if (targetTool) {
        const subTool = targetTool.subTools.find(st => st.id === tool.id)
        if (subTool) {
          setCurrentSubTool(subTool)
        }
      }
    }
    
    return {
      currentTool,
      currentSubTool,
      tools,
      popularTools,
      setCurrentTool,
      setCurrentSubTool,
      getToolInfo,
      goHome,
      goToToolList,
      closeToolModal,
      openPopularTool,
      isDarkTheme,
      toggleTheme,
      searchQuery,
      searchResults,
      performSearch,
      clearSearch,
      openSearchResult
    }
  }
}
</script>

<style scoped>
/* 主导航栏样式 */
.main-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem 0;
  margin-bottom: 2rem;
  border-radius: 0 0 15px 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.nav-title {
  color: white;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-title i {
  color: #ffd700;
}

.nav-tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  max-width: 100%;
}

.nav-tool-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  text-align: left;
}

.nav-tool-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-tool-btn:active {
  transform: translateY(0);
}

.nav-tool-btn i {
  font-size: 1rem;
  opacity: 0.9;
  flex-shrink: 0;
}

.nav-tool-btn span {
  flex: 1;
  min-width: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-content {
    padding: 0 1rem;
  }
  
  .nav-tools {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .nav-tool-btn {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .nav-title {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
}

@media (max-width: 480px) {
  .nav-tools {
    grid-template-columns: 1fr;
  }
  
  .nav-tool-btn {
    justify-content: center;
    text-align: center;
  }
}

/* 深色主题适配 */
.dark-theme .main-nav {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.dark-theme .nav-tool-btn {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}

.dark-theme .nav-tool-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 搜索功能样式 */
.search-section {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 2rem 0;
  margin-bottom: 1rem;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.search-box {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #666;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.search-input::placeholder {
  color: #888;
  font-size: 0.95rem;
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  background: #ff6b6b;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.clear-btn:hover {
  background: #ff5252;
  transform: scale(1.1);
}

/* 搜索结果样式 */
.search-results {
  margin-top: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.search-results-header {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-result-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.result-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-icon i {
  font-size: 1.1rem;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.result-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.result-category {
  font-size: 0.75rem;
  color: #999;
  background: #f8f9fa;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.search-more {
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
}

/* 无搜索结果样式 */
.no-results {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  margin-top: 1.5rem;
  backdrop-filter: blur(10px);
}

.no-results i {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.no-results p {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.no-results span {
  font-size: 0.9rem;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-container {
    padding: 0 1rem;
  }
  
  .search-results-grid {
    grid-template-columns: 1fr;
    max-height: 300px;
  }
  
  .search-input {
    font-size: 0.9rem;
    padding: 0.8rem 0.8rem 0.8rem 2.5rem;
  }
  
  .search-input::placeholder {
    font-size: 0.85rem;
  }
  
  .search-results {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .search-section {
    padding: 1.5rem 0;
  }
  
  .search-result-item {
    padding: 0.8rem;
  }
  
  .result-icon {
    width: 35px;
    height: 35px;
  }
  
  .result-content h4 {
    font-size: 0.9rem;
  }
  
  .result-content p {
    font-size: 0.8rem;
  }
}

/* 深色主题适配 */
.dark-theme .search-section {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.dark-theme .search-input {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.dark-theme .search-input::placeholder {
  color: #ccc;
}

.dark-theme .search-input:focus {
  border-color: rgba(255, 255, 255, 0.4);
}

.dark-theme .search-results {
  background: rgba(0, 0, 0, 0.7);
}

.dark-theme .search-results-header {
  color: #e2e8f0;
}

.dark-theme .search-result-item {
  background: #2d3748;
  border-color: #4a5568;
  color: white;
}

.dark-theme .search-result-item:hover {
  border-color: #667eea;
}

.dark-theme .result-content h4 {
  color: #e2e8f0;
}

.dark-theme .result-content p {
  color: #cbd5e0;
}

.dark-theme .result-category {
  background: #4a5568;
  color: #a0aec0;
}

.dark-theme .no-results {
  background: rgba(0, 0, 0, 0.7);
}

.dark-theme .no-results p {
  color: #cbd5e0;
}

.dark-theme .no-results span {
  color: #a0aec0;
}
</style> 