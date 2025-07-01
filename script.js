// 导航功能
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const toolSections = document.querySelectorAll('.tool-section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tool = this.dataset.tool;
            
            // 更新活跃按钮
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应工具区域
            toolSections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(tool + '-tools');
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
});

// 文本处理工具
function formatText(action) {
    const input = document.getElementById('text-input').value;
    const output = document.getElementById('text-output');
    let result = '';

    switch(action) {
        case 'upper':
            result = input.toUpperCase();
            break;
        case 'lower':
            result = input.toLowerCase();
            break;
        case 'title':
            result = input.replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
            break;
        case 'reverse':
            result = input.split('').reverse().join('');
            break;
        default:
            result = input;
    }

    output.value = result;
}

// 文本统计
function updateTextStats() {
    const text = document.getElementById('stats-input').value;
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lineCount = text.split('\n').length;

    document.getElementById('char-count').textContent = charCount;
    document.getElementById('word-count').textContent = wordCount;
    document.getElementById('line-count').textContent = lineCount;
}

// 编码转换
function encodeText(type) {
    const input = document.getElementById('encode-input').value;
    const output = document.getElementById('encode-output');
    let result = '';

    try {
        switch(type) {
            case 'base64':
                result = btoa(unescape(encodeURIComponent(input)));
                break;
            case 'url':
                result = encodeURIComponent(input);
                break;
        }
        output.value = result;
    } catch (error) {
        output.value = '编码错误: ' + error.message;
    }
}

function decodeText(type) {
    const input = document.getElementById('encode-input').value;
    const output = document.getElementById('encode-output');
    let result = '';

    try {
        switch(type) {
            case 'base64':
                result = decodeURIComponent(escape(atob(input)));
                break;
            case 'url':
                result = decodeURIComponent(input);
                break;
        }
        output.value = result;
    } catch (error) {
        output.value = '解码错误: ' + error.message;
    }
}

// 颜色转换
function convertColor() {
    const color = document.getElementById('color-picker').value;
    
    // 转换为RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // 转换为HSL
    const hsl = rgbToHsl(r, g, b);
    
    document.getElementById('hex-value').textContent = color.toUpperCase();
    document.getElementById('rgb-value').textContent = `rgb(${r}, ${g}, ${b})`;
    document.getElementById('hsl-value').textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// 密码生成器
function updateLengthDisplay() {
    const length = document.getElementById('password-length').value;
    document.getElementById('length-display').textContent = length;
}

function generatePassword() {
    const length = parseInt(document.getElementById('password-length').value);
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
        alert('请至少选择一种字符类型！');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    document.getElementById('generated-password').value = password;
}

// 二维码生成器
function generateQR() {
    const text = document.getElementById('qr-text').value;
    const container = document.getElementById('qr-code-container');
    
    if (!text.trim()) {
        alert('请输入要生成二维码的文本！');
        return;
    }
    
    container.innerHTML = '';
    
    QRCode.toCanvas(container, text, {
        width: 200,
        height: 200,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function (error) {
        if (error) {
            container.innerHTML = '<p style="color: red;">二维码生成失败: ' + error + '</p>';
        }
    });
}

// 计算器
let calcExpression = '';
let calcResult = '';

function appendToCalculator(value) {
    const display = document.getElementById('calc-display');
    
    if (calcResult !== '' && !isNaN(value)) {
        calcExpression = '';
        calcResult = '';
    }
    
    calcExpression += value;
    display.value = calcExpression;
}

function clearCalculator() {
    calcExpression = '';
    calcResult = '';
    document.getElementById('calc-display').value = '';
}

function deleteLast() {
    calcExpression = calcExpression.slice(0, -1);
    document.getElementById('calc-display').value = calcExpression;
}

function calculate() {
    const display = document.getElementById('calc-display');
    
    try {
        calcResult = eval(calcExpression);
        display.value = calcResult;
        calcExpression = calcResult.toString();
    } catch (error) {
        display.value = '错误';
        calcExpression = '';
        calcResult = '';
    }
}

// 单位转换
const lengthUnits = {
    m: 1,
    cm: 0.01,
    km: 1000,
    ft: 0.3048,
    in: 0.0254
};

function convertLength() {
    const input = parseFloat(document.getElementById('length-input').value);
    const fromUnit = document.getElementById('length-from').value;
    const toUnit = document.getElementById('length-to').value;
    const resultElement = document.getElementById('length-result');
    
    if (isNaN(input)) {
        resultElement.textContent = '请输入有效数字';
        return;
    }
    
    // 转换为米
    const meters = input * lengthUnits[fromUnit];
    // 转换为目标单位
    const result = meters / lengthUnits[toUnit];
    
    resultElement.textContent = `${input} ${fromUnit} = ${result.toFixed(6)} ${toUnit}`;
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化颜色转换器
    convertColor();
    
    // 初始化密码长度显示
    updateLengthDisplay();
});

// 复制到剪贴板功能
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // 可以添加复制成功的提示
        console.log('已复制到剪贴板');
    }).catch(function(err) {
        console.error('复制失败:', err);
    });
}

// 添加复制按钮到密码生成器
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('generated-password');
    if (passwordInput) {
        passwordInput.addEventListener('click', function() {
            if (this.value) {
                copyToClipboard(this.value);
                // 简单的反馈
                const originalBg = this.style.backgroundColor;
                this.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    this.style.backgroundColor = originalBg;
                }, 1000);
            }
        });
    }
});
