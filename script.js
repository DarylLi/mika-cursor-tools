// 示例数据加载函数
function loadTextExample() {
  const textInput = document.getElementById("text-input");
  const exampleText = `Hello World! 这是一个示例文本。
包含中英文混合内容，用于测试文本格式化功能。
可以尝试转换大小写、标题格式或反转文本。`;
  textInput.value = exampleText;
  // 自动执行一个格式化操作作为演示
  setTimeout(() => {
    formatText("title");
  }, 500);
}

function loadStatsExample() {
  const statsInput = document.getElementById("stats-input");
  const exampleText = `这是一个用于测试文本统计功能的示例段落。

本段落包含：
- 中文字符
- English words
- 数字 123456
- 特殊符号 !@#$%^&*()
- 多行文本内容

通过这个示例，您可以看到文本统计工具如何计算字符数、单词数和行数。`;
  statsInput.value = exampleText;
  updateTextStats();
}

function loadJSONExample() {
  const jsonInput = document.getElementById("json-input");
  const exampleJSON = `{"name":"张三","age":28,"city":"北京","skills":["JavaScript","Python","React","Node.js"],"experience":{"frontend":3,"backend":2},"active":true,"salary":null,"projects":[{"name":"电商网站","year":2023,"technologies":["Vue.js","Express.js"]},{"name":"管理系统","year":2024,"technologies":["React","Spring Boot"]}]}`;
  jsonInput.value = exampleJSON;
  validateJSON();
  // 自动格式化
  setTimeout(() => {
    formatJSON();
  }, 500);
}

function loadEncodeExample() {
  const encodeInput = document.getElementById("encode-input");
  const exampleText = `欢迎使用编码转换工具！
这是一个包含中文和特殊字符的示例文本：
• 网址：https://example.com?name=张三&age=25
• 邮箱：test@example.com
• 特殊符号：!@#$%^&*()`;
  encodeInput.value = exampleText;
}

function loadQRExample() {
  const qrInput = document.getElementById("qr-text");
  const exampleText = `通用工具瑞士军刀
https://github.com/example/swiss-army-tools
一站式实用工具集合`;
  qrInput.value = exampleText;
  // 自动生成二维码
  setTimeout(() => {
    generateQR();
  }, 500);
}

function loadLengthExample() {
  const lengthInput = document.getElementById("length-input");
  const lengthFrom = document.getElementById("length-from");
  const lengthTo = document.getElementById("length-to");

  lengthInput.value = "100";
  lengthFrom.value = "m";
  lengthTo.value = "ft";

  convertLength();
}

function loadPasswordExample() {
  // 设置推荐的安全密码配置
  const lengthSlider = document.getElementById("password-length");
  const uppercaseCheck = document.getElementById("include-uppercase");
  const lowercaseCheck = document.getElementById("include-lowercase");
  const numbersCheck = document.getElementById("include-numbers");
  const symbolsCheck = document.getElementById("include-symbols");

  // 推荐配置：16位，包含所有字符类型
  lengthSlider.value = "16";
  uppercaseCheck.checked = true;
  lowercaseCheck.checked = true;
  numbersCheck.checked = true;
  symbolsCheck.checked = true;

  updateLengthDisplay();

  // 自动生成示例密码
  setTimeout(() => {
    generatePassword();
  }, 500);
}

function loadColorExample() {
  const colorPicker = document.getElementById("color-picker");

  // 预设一些好看的颜色示例
  const exampleColors = [
    "#667eea", // 蓝紫色
    "#764ba2", // 深紫色
    "#28a745", // 绿色
    "#20c997", // 青色
    "#ff6b6b", // 红色
    "#ffa500", // 橙色
    "#6f42c1", // 紫色
    "#e83e8c", // 粉色
    "#fd7e14", // 橙红色
    "#17a2b8", // 青蓝色
  ];

  // 随机选择一个颜色
  const randomColor =
    exampleColors[Math.floor(Math.random() * exampleColors.length)];
  colorPicker.value = randomColor;

  convertColor();
}

// 导航功能
document.addEventListener("DOMContentLoaded", function () {
  const navButtons = document.querySelectorAll(".nav-btn");
  const toolSections = document.querySelectorAll(".tool-section");

  navButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tool = this.dataset.tool;

      // 更新活跃按钮
      navButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // 显示对应工具区域
      toolSections.forEach((section) => {
        section.classList.remove("active");
      });

      const targetSection = document.getElementById(tool + "-tools");
      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });
});

// 文本处理工具
function formatText(action) {
  const input = document.getElementById("text-input").value;
  const output = document.getElementById("text-output");
  let result = "";

  switch (action) {
    case "upper":
      result = input.toUpperCase();
      break;
    case "lower":
      result = input.toLowerCase();
      break;
    case "title":
      result = input.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      break;
    case "reverse":
      result = input.split("").reverse().join("");
      break;
    default:
      result = input;
  }

  output.value = result;
}

// 文本统计
function updateTextStats() {
  const text = document.getElementById("stats-input").value;
  const charCount = text.length;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const lineCount = text.split("\n").length;

  document.getElementById("char-count").textContent = charCount;
  document.getElementById("word-count").textContent = wordCount;
  document.getElementById("line-count").textContent = lineCount;
}

// JSON工具函数
function formatJSON() {
  const input = document.getElementById("json-input").value.trim();
  const output = document.getElementById("json-output");
  const status = document.getElementById("json-status");

  if (!input) {
    showJSONStatus("请输入JSON数据", "info");
    output.value = "";
    return;
  }

  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    output.value = formatted;
    showJSONStatus("JSON格式化成功", "valid");
    updateJSONInfo(formatted, true);
  } catch (error) {
    showJSONStatus("JSON格式错误: " + error.message, "invalid");
    output.value = "";
    updateJSONInfo("", false);
  }
}

function compressJSON() {
  const input = document.getElementById("json-input").value.trim();
  const output = document.getElementById("json-output");
  const status = document.getElementById("json-status");

  if (!input) {
    showJSONStatus("请输入JSON数据", "info");
    output.value = "";
    return;
  }

  try {
    const parsed = JSON.parse(input);
    const compressed = JSON.stringify(parsed);
    output.value = compressed;
    showJSONStatus("JSON压缩成功", "valid");
    updateJSONInfo(compressed, true);
  } catch (error) {
    showJSONStatus("JSON格式错误: " + error.message, "invalid");
    output.value = "";
    updateJSONInfo("", false);
  }
}

function validateJSON() {
  const input = document.getElementById("json-input").value.trim();
  const status = document.getElementById("json-status");

  if (!input) {
    showJSONStatus("", "");
    updateJSONInfo("", false);
    return;
  }

  try {
    const parsed = JSON.parse(input);
    showJSONStatus("JSON格式正确", "valid");
    updateJSONInfo(input, true);

    // 分析JSON结构
    const analysis = analyzeJSON(parsed);
    const statusEl = document.getElementById("json-status");
    statusEl.innerHTML += `<br><small>包含: ${analysis}</small>`;
  } catch (error) {
    showJSONStatus("JSON格式错误: " + error.message, "invalid");
    updateJSONInfo(input, false);
  }
}

function clearJSON() {
  document.getElementById("json-input").value = "";
  document.getElementById("json-output").value = "";
  document.getElementById("json-status").innerHTML = "";
  document.getElementById("json-status").className = "json-status";
  updateJSONInfo("", false);
}

function showJSONStatus(message, type) {
  const status = document.getElementById("json-status");
  status.textContent = message;
  status.className = "json-status " + type;
}

function updateJSONInfo(jsonString, isValid) {
  const validStatus = document.getElementById("json-valid-status");
  const sizeElement = document.getElementById("json-size");

  if (isValid) {
    validStatus.textContent = "有效";
    validStatus.className = "valid";
  } else if (jsonString) {
    validStatus.textContent = "无效";
    validStatus.className = "invalid";
  } else {
    validStatus.textContent = "未检测";
    validStatus.className = "";
  }

  // 计算大小
  const size = new Blob([jsonString]).size;
  if (size > 1024) {
    sizeElement.textContent = (size / 1024).toFixed(2) + " KB";
  } else {
    sizeElement.textContent = size + " 字节";
  }
}

function analyzeJSON(obj) {
  const analysis = [];

  if (Array.isArray(obj)) {
    analysis.push(`${obj.length}个数组元素`);
  } else if (typeof obj === "object" && obj !== null) {
    const keys = Object.keys(obj);
    analysis.push(`${keys.length}个对象属性`);

    // 分析值类型
    const types = {};
    function countTypes(value) {
      const type = Array.isArray(value) ? "array" : typeof value;
      types[type] = (types[type] || 0) + 1;

      if (type === "object" && value !== null) {
        Object.values(value).forEach(countTypes);
      } else if (type === "array") {
        value.forEach(countTypes);
      }
    }

    Object.values(obj).forEach(countTypes);

    const typeList = Object.entries(types).map(([type, count]) => {
      const typeName =
        {
          string: "字符串",
          number: "数字",
          boolean: "布尔值",
          object: "对象",
          array: "数组",
        }[type] || type;
      return `${count}个${typeName}`;
    });

    if (typeList.length > 0) {
      analysis.push(typeList.join(", "));
    }
  }

  return analysis.join(", ") || "简单值";
}

// 编码转换
function encodeText(type) {
  const input = document.getElementById("encode-input").value;
  const output = document.getElementById("encode-output");
  let result = "";

  try {
    switch (type) {
      case "base64":
        result = btoa(unescape(encodeURIComponent(input)));
        break;
      case "url":
        result = encodeURIComponent(input);
        break;
    }
    output.value = result;
  } catch (error) {
    output.value = "编码错误: " + error.message;
  }
}

function decodeText(type) {
  const input = document.getElementById("encode-input").value;
  const output = document.getElementById("encode-output");
  let result = "";

  try {
    switch (type) {
      case "base64":
        result = decodeURIComponent(escape(atob(input)));
        break;
      case "url":
        result = decodeURIComponent(input);
        break;
    }
    output.value = result;
  } catch (error) {
    output.value = "解码错误: " + error.message;
  }
}

// 颜色转换
function convertColor() {
  const color = document.getElementById("color-picker").value;

  // 转换为RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  // 转换为HSL
  const hsl = rgbToHsl(r, g, b);

  document.getElementById("hex-value").textContent = color.toUpperCase();
  document.getElementById("rgb-value").textContent = `rgb(${r}, ${g}, ${b})`;
  document.getElementById(
    "hsl-value"
  ).textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// 密码生成器
function updateLengthDisplay() {
  const length = document.getElementById("password-length").value;
  document.getElementById("length-display").textContent = length;
}

function generatePassword() {
  const length = parseInt(document.getElementById("password-length").value);
  const includeUppercase = document.getElementById("include-uppercase").checked;
  const includeLowercase = document.getElementById("include-lowercase").checked;
  const includeNumbers = document.getElementById("include-numbers").checked;
  const includeSymbols = document.getElementById("include-symbols").checked;

  let charset = "";
  if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
  if (includeNumbers) charset += "0123456789";
  if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (charset === "") {
    alert("请至少选择一种字符类型！");
    return;
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  document.getElementById("generated-password").value = password;
}

// 二维码生成器
function generateQR() {
  const text = document.getElementById("qr-text").value;
  const container = document.getElementById("qr-code-container");

  if (!text.trim()) {
    alert("请输入要生成二维码的文本！");
    return;
  }

  container.innerHTML = "";

  QRCode.toCanvas(
    container,
    text,
    {
      width: 200,
      height: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    },
    function (error) {
      if (error) {
        container.innerHTML =
          '<p style="color: red;">二维码生成失败: ' + error + "</p>";
      }
    }
  );
}

// 计算器
let calcExpression = "";
let calcResult = "";

function appendToCalculator(value) {
  const display = document.getElementById("calc-display");

  if (calcResult !== "" && !isNaN(value)) {
    calcExpression = "";
    calcResult = "";
  }

  calcExpression += value;
  display.value = calcExpression;
}

function clearCalculator() {
  calcExpression = "";
  calcResult = "";
  document.getElementById("calc-display").value = "";
}

function deleteLast() {
  calcExpression = calcExpression.slice(0, -1);
  document.getElementById("calc-display").value = calcExpression;
}

function calculate() {
  const display = document.getElementById("calc-display");

  try {
    calcResult = eval(calcExpression);
    display.value = calcResult;
    calcExpression = calcResult.toString();
  } catch (error) {
    display.value = "错误";
    calcExpression = "";
    calcResult = "";
  }
}

// 单位转换
const lengthUnits = {
  m: 1,
  cm: 0.01,
  km: 1000,
  ft: 0.3048,
  in: 0.0254,
};

function convertLength() {
  const input = parseFloat(document.getElementById("length-input").value);
  const fromUnit = document.getElementById("length-from").value;
  const toUnit = document.getElementById("length-to").value;
  const resultElement = document.getElementById("length-result");

  if (isNaN(input)) {
    resultElement.textContent = "请输入有效数字";
    return;
  }

  // 转换为米
  const meters = input * lengthUnits[fromUnit];
  // 转换为目标单位
  const result = meters / lengthUnits[toUnit];

  resultElement.textContent = `${input} ${fromUnit} = ${result.toFixed(
    6
  )} ${toUnit}`;
}

// 初始化
document.addEventListener("DOMContentLoaded", function () {
  // 初始化颜色转换器
  convertColor();

  // 初始化密码长度显示
  updateLengthDisplay();
});

// 复制到剪贴板功能
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(function () {
      // 可以添加复制成功的提示
      console.log("已复制到剪贴板");
    })
    .catch(function (err) {
      console.error("复制失败:", err);
    });
}

// 添加复制按钮到密码生成器
document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("generated-password");
  if (passwordInput) {
    passwordInput.addEventListener("click", function () {
      if (this.value) {
        copyToClipboard(this.value);
        // 简单的反馈
        const originalBg = this.style.backgroundColor;
        this.style.backgroundColor = "#d4edda";
        setTimeout(() => {
          this.style.backgroundColor = originalBg;
        }, 1000);
      }
    });
  }
});
