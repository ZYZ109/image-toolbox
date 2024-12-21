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

// 全局状态管理
const appState = {
    isLoading: false
};

// 加载工具
async function loadTool(toolId) {
    // 防止重复点击
    if (appState.isLoading) return;
    appState.isLoading = true;

    try {
        // 移除现有的工具内容
        const existingContent = document.querySelector('.tool-content');
        if (existingContent) {
            // 移除之前先解绑所有事件
            const oldInstance = existingContent.toolInstance;
            if (oldInstance && typeof oldInstance.destroy === 'function') {
                oldInstance.destroy();
            }
            existingContent.remove();
        }

        // 如果点击的是首页
        if (toolId === 'home') {
            // 显示首页内容
            const pageTitle = document.querySelector('.page-title');
            const toolsGrid = document.querySelector('.tools-grid');
            if (pageTitle) pageTitle.style.display = 'block';
            if (toolsGrid) toolsGrid.style.display = 'grid';
            
            // 更新侧边栏选中状态
            document.querySelectorAll('.sidebar__nav a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#home') {
                    link.classList.add('active');
                }
            });
            return;
        }

        // 如果点击的是工具
        // 隐藏首页内容
        const pageTitle = document.querySelector('.page-title');
        const toolsGrid = document.querySelector('.tools-grid');
        if (pageTitle) pageTitle.style.display = 'none';
        if (toolsGrid) toolsGrid.style.display = 'none';
        
        // 更新侧边栏选中状态
        document.querySelectorAll('.sidebar__nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${toolId}`) {
                link.classList.add('active');
            }
        });
        
        // 创建新的工具内容区域
        const toolContent = document.createElement('div');
        toolContent.className = 'tool-content';
        const main = document.querySelector('.main');
        if (!main) throw new Error('找不到主容器元素');
        main.appendChild(toolContent);

        // 根据工具ID加载对应模块
        let instance;
        switch(toolId) {
            case 'converter':
                const { ImageConverter } = await import('./modules/converter.js');
                instance = new ImageConverter();
                break;
            case 'resizer':
                const { ImageResizer } = await import('./modules/resizer.js');
                instance = new ImageResizer();
                break;
            case 'compressor':
                const { ImageCompressor } = await import('./modules/compressor.js');
                instance = new ImageCompressor();
                break;
            default:
                toolContent.innerHTML = `<h2>正在加载 ${toolId} 工具...</h2>`;
                return;
        }

        // 渲染界面并初始化事件
        if (instance) {
            toolContent.innerHTML = instance.createInterface();
            toolContent.toolInstance = instance; // 保存实例引用
            instance.initializeEvents();
        }

    } catch (error) {
        console.error('加载工具出错:', error);
        alert('加载工具时出现错误，请刷新页面重试');
    } finally {
        appState.isLoading = false;
    }
}

// 初始化工具卡片
function initializeTools() {
    // 使用 tools 数组数据创建工具卡片
    const toolsGrid = document.querySelector('.tools-grid');
    if (!toolsGrid) return;

    toolsGrid.innerHTML = tools.map(tool => `
        <div class="tool-card" data-tool="${tool.id}">
            <div class="tool-card__icon">${tool.icon}</div>
            <h3 class="tool-card__title">${tool.title}</h3>
            <p class="tool-card__description">${tool.description}</p>
        </div>
    `).join('');

    // 使用事件委托处理导航点击
    document.querySelector('.sidebar__nav')?.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            const toolId = link.getAttribute('href').substring(1);
            loadTool(toolId);
        }
    });

    // 使用事件委托处理工具卡片点击
    toolsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.tool-card');
        if (card) {
            const toolId = card.getAttribute('data-tool');
            loadTool(toolId);
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeTools); 