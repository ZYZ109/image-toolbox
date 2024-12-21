// 工具卡片数据
const tools = [
    {
        id: 'converter',
        title: '图片格式转换',
        description: '支持多种图片格式互转，包括PNG、JPG、WEBP、GIF、BMP等',
        icon: '🔄'
    },
    {
        id: 'resizer',
        title: '尺寸调整',
        description: '调整图片尺寸，支持自定义像素和预设尺寸',
        icon: '📐'
    },
    {
        id: 'compressor',
        title: '图片压缩',
        description: '在线压缩图片，支持批量处理和质量调节',
        icon: '🗜️'
    }
];

// 初始化工具卡片
function initializeTools() {
    // 使用 tools 数组数据创建工具卡片
    const toolsGrid = document.querySelector('.tools-grid');
    toolsGrid.innerHTML = tools.map(tool => `
        <div class="tool-card" data-tool="${tool.id}">
            <div class="tool-card__icon">${tool.icon}</div>
            <h3 class="tool-card__title">${tool.title}</h3>
            <p class="tool-card__description">${tool.description}</p>
        </div>
    `).join('');

    // 添加侧边栏导航事件
    document.querySelectorAll('.sidebar__nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const toolId = link.getAttribute('href').substring(1);
            loadTool(toolId);
        });
    });

    // 添加工具卡片点击事件
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            const toolId = card.getAttribute('data-tool');
            loadTool(toolId);
        });
    });
}

// 加载工具
async function loadTool(toolId) {
    // 如果点击的是首页，显示首页内容
    if (toolId === 'home') {
        document.querySelector('.page-title').style.display = 'block';
        document.querySelector('.tools-grid').style.display = 'grid';
        // 移除工具内容区域
        const toolContent = document.querySelector('.tool-content');
        if (toolContent) {
            toolContent.remove();
        }
        
        // 更新侧边栏选中状态
        document.querySelectorAll('.sidebar__nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#home') {
                link.classList.add('active');
            }
        });
        return;
    }

    // 如果点击的是工具，加载对应的工具模块
    const toolName = toolId;
    
    // 隐藏首页内容
    document.querySelector('.page-title').style.display = 'none';
    document.querySelector('.tools-grid').style.display = 'none';
    
    // 更新侧边栏选中状态
    document.querySelectorAll('.sidebar__nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${toolId}`) {
            link.classList.add('active');
        }
    });
    
    // 创建工具内容区域(如果不存在)
    let toolContent = document.querySelector('.tool-content');
    if (!toolContent) {
        toolContent = document.createElement('div');
        toolContent.className = 'tool-content';
        document.querySelector('.main').appendChild(toolContent);
    }

    switch(toolId) {
        case 'converter':
            const { ImageConverter } = await import('./modules/converter.js');
            const converter = new ImageConverter();
            toolContent.innerHTML = converter.createInterface();
            converter.initializeEvents();
            break;
        case 'resizer':
            const { ImageResizer } = await import('./modules/resizer.js');
            const resizer = new ImageResizer();
            toolContent.innerHTML = resizer.createInterface();
            resizer.initializeEvents();
            break;
        case 'compressor':
            const { ImageCompressor } = await import('./modules/compressor.js');
            const compressor = new ImageCompressor();
            toolContent.innerHTML = compressor.createInterface();
            compressor.initializeEvents();
            break;
        default:
            toolContent.innerHTML = `<h2>正在加载 ${toolId} 工具...</h2>`;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeTools); 