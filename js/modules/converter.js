// 图片格式转换模块
export class ImageConverter {
    constructor() {
        this.supportedFormats = {
            'JPG': 'image/jpeg',
            'PNG': 'image/png',
            'WEBP': 'image/webp',
            'GIF': 'image/gif',
            'PDF': 'application/pdf'
        };
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxFiles = 20;
        this.files = [];
        this.currentFileIndex = 0;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.selectedFormat = null;
        this.convertedImages = [];
    }

    // 添加文件类型验证函数
    isValidFileType(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return validTypes.includes(file.type);
    }

    // 创建转换界面
    createInterface() {
        return `
            <div class="converter-container">
                <h1 class="converter-title">图片格式转换</h1>
                
                <div class="converter-intro">
                    <div class="converter-icon">
                        <img src="assets/icons/convert.svg" alt="格式转换">
                    </div>
                    <p class="converter-description">
                        欢迎使用我们的图片格式转换工具。上传您的图片或PDF，然后点击转换按钮即可开始。支持JPG、PNG、WEBP、GIF和PDF格式之间的相互转换。文件大小限制为10MB。
                    </p>
                </div>

                <div class="upload-area">
                    <div class="upload-dropzone" id="dropzone">
                        <p>拖放文件到这里，或者点击选择文件</p>
                        <p class="upload-limit">支持JPG、PNG、WEBP、GIF和PDF格式，单个文件最大10MB（最多20个文件）</p>
                        <input type="file" id="fileInput" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" multiple style="display: none;">
                        <button class="upload-btn" id="uploadBtn">选择文件</button>
                    </div>
                </div>

                <div class="preview-area" style="display: none;">
                    <div class="preview-container">
                        <div class="preview-section">
                            <h3>原图预览</h3>
                            <div class="preview-grid" id="previewGrid">
                                <!-- 图片预览网格将在这里动态生成 -->
                            </div>
                        </div>

                        <div class="preview-box">
                            <h3>转换预览</h3>
                            <div class="preview-image">
                                <img id="convertedPreview" alt="转换预览">
                            </div>
                        </div>
                    </div>

                    <div class="convert-options">
                        <h3>选择目标格式</h3>
                        <div class="format-buttons">
                            <button class="format-btn" data-format="JPG">JPG</button>
                            <button class="format-btn" data-format="PNG">PNG</button>
                            <button class="format-btn" data-format="WEBP">WEBP</button>
                            <button class="format-btn" data-format="GIF">GIF</button>
                            <button class="format-btn" data-format="PDF">PDF</button>
                        </div>
                        <div class="convert-actions">
                            <button class="convert-btn" disabled>批量转换</button>
                            <button class="download-btn" disabled>下载转换图片</button>
                        </div>
                    </div>
                </div>

                <!-- 图片预览模态框 -->
                <div class="preview-modal" id="previewModal">
                    <div class="preview-modal-content">
                        <span class="close-modal">&times;</span>
                        <img id="previewModalImage" alt="图片预览">
                    </div>
                </div>
            </div>
        `;
    }

    // 初始化事件监听
    initializeEvents() {
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const previewArea = document.querySelector('.preview-area');
        const formatBtns = document.querySelectorAll('.format-btn');
        const convertBtn = document.querySelector('.convert-btn');
        const downloadBtn = document.querySelector('.download-btn');

        // 点击上传按钮
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInput.click();
            });
        }

        // 点击整个拖放区域
        dropzone.addEventListener('click', (e) => {
            if (e.target === dropzone) {
                fileInput.click();
            }
        });

        // 文件拖放
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });

        // 文件选择
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFiles(files);
            });
        }

        // 格式选择
        formatBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                formatBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedFormat = btn.dataset.format;
                convertBtn.disabled = false;
            });
        });

        // 批量转换
        convertBtn.addEventListener('click', () => {
            if (this.selectedFormat) {
                this.convertImage();
            } else {
                alert('请选择转换格式');
            }
        });

        // 下载转换后的图片
        downloadBtn.addEventListener('click', () => {
            this.downloadImages();
        });

        // 初始状态
        convertBtn.disabled = true;
        downloadBtn.disabled = true;

        // 添加首页链接事件
        document.querySelector('a[href="#home"]').addEventListener('click', (e) => {
            e.preventDefault();
            // 清理转换器状态
            this.files = [];
            this.currentFileIndex = 0;
            this.selectedFormat = null;
            this.convertedImages = [];
            
            // 返回首页
            document.querySelector('.page-title').style.display = 'block';
            document.querySelector('.tools-grid').style.display = 'grid';
            document.querySelector('.tool-content').innerHTML = '';
            
            // 更新侧边栏选中状态
            document.querySelectorAll('.sidebar__nav a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#home') {
                    link.classList.add('active');
                }
            });
        });
    }

    updatePreviewGrid() {
        const previewGrid = document.getElementById('previewGrid');
        previewGrid.innerHTML = this.files.map((file, index) => `
            <div class="preview-item ${index === this.currentFileIndex ? 'active' : ''}" data-index="${index}">
                <img src="${file.preview}" alt="${file.name}">
                <div class="preview-item-overlay">
                    <span class="preview-item-name">${file.name}</span>
                    <span class="preview-item-size">${this.formatFileSize(file.size)}</span>
                    <button class="remove-btn" data-index="${index}">×</button>
                </div>
            </div>
        `).join('');

        // 添加点击预览事件
        previewGrid.querySelectorAll('.preview-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-btn')) {
                    const index = parseInt(item.dataset.index);
                    this.showPreviewModal(index);
                }
            });
        });

        // 添加删除按钮事件
        previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.removeFile(index);
            });
        });
    }

    async handleFiles(newFiles) {
        // 检查是否超过最大文件数
        if (this.files.length + newFiles.length > this.maxFiles) {
            alert(`最多只能上传 ${this.maxFiles} 个文件`);
            return;
        }

        // 检查每个新文件是否已经存在
        for (const newFile of newFiles) {
            const existingFile = this.files.find(f => f.name === newFile.name);
            if (existingFile) {
                alert(`文件 "${newFile.name}" 已存在，请勿重复上传`);
                return;
            }
        }

        // 过滤有效的图片文件
        const validFiles = newFiles.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            return validTypes.includes(file.type);
        });

        if (validFiles.length === 0) {
            alert('请选择有效的图片文件（JPEG、PNG、GIF、WEBP）');
            return;
        }

        if (validFiles.length > 0) {
            // 为每个文件创建预览
            for (const file of validFiles) {
                file.preview = await this.createPreview(file);
            }

            this.files.push(...validFiles);
            if (this.files.length > this.maxFiles) {
                this.files = this.files.slice(0, this.maxFiles);
                alert(`已达到最大文件数限制（${this.maxFiles}个），超出部分将被忽略`);
            }

            // 更新预览网格
            this.updatePreviewGrid();
            
            // 显示预览区域
            document.querySelector('.preview-area').style.display = 'block';
            
            // 更新下载按钮文本
            const downloadBtn = document.querySelector('.download-btn');
            downloadBtn.textContent = this.files.length > 1 ? '下载转换包' : '下载转换图片';
        }
        else {
            // 如果没有有效文件，也空文件输入框
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.value = '';
            }
        }
    }

    async createPreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updatePreviewGrid();
        
        // 如果没有文件了，隐藏预览区域并重置状态
        if (this.files.length === 0) {
            document.querySelector('.preview-area').style.display = 'none';
            // 重置转换相关状态
            this.currentFileIndex = 0;
            this.selectedFormat = null;
            
            // 重置按钮状态
            const formatBtns = document.querySelectorAll('.format-btn');
            formatBtns.forEach(btn => btn.classList.remove('active'));
            
            const convertBtn = document.querySelector('.convert-btn');
            const downloadBtn = document.querySelector('.download-btn');
            convertBtn.disabled = true;
            downloadBtn.disabled = true;
            
            // 重置下载按钮文本为默认状态
            downloadBtn.textContent = '下载转换图片';
            
            // 清空转换预览
            const convertedPreview = document.getElementById('convertedPreview');
            convertedPreview.src = '';
            
            // 显示上传区域
            document.querySelector('.upload-area').style.display = 'block';
        } else {
            // 根据剩余文件数量更新下载按钮文本
            const downloadBtn = document.querySelector('.download-btn');
            downloadBtn.textContent = this.files.length > 1 ? '下载转换包' : '下载转换图片';
        }
    }

    async convertImage() {
        if (!this.selectedFormat) {
            alert('请选择转换格式');
            return;
        }
        if (this.files.length === 0) {
            alert('请先上传文件');
            return;
        }

        const previewImage = document.querySelector('.preview-image');
        if (!previewImage) return;
        
        previewImage.classList.add('loading');
        const convertBtn = document.querySelector('.convert-btn');
        const downloadBtn = document.querySelector('.download-btn');
        convertBtn.disabled = true;

        try {
            const format = this.supportedFormats[this.selectedFormat];
            const quality = 0.8;
            
            // 清空之前的转换结果
            this.convertedImages = [];
            
            // 创建转换后的预览区域
            const previewContainer = document.createElement('div');
            previewContainer.className = 'converted-previews';
            
            // 批量转换所有文件
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                
                // 创建临时 canvas 并绘制当前图片
                const img = new Image();
                img.src = file.preview;
                await new Promise(resolve => img.onload = resolve);
                
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.ctx.drawImage(img, 0, 0);
                
                // 转换图片
                const convertedDataUrl = this.canvas.toDataURL(format, quality);
                
                // 保存转换后的图片数据
                this.convertedImages.push({
                    name: file.name.replace(/\.[^/.]+$/, '') + '.' + format.split('/')[1],
                    data: convertedDataUrl
                });
                
                // 创建预览元素
                const previewItem = document.createElement('div');
                previewItem.className = 'converted-preview-item';
                previewItem.innerHTML = `
                    <img src="${convertedDataUrl}" alt="转换后的 ${file.name}">
                    <div class="preview-info">
                        <span>${file.name}</span>
                    </div>
                `;
                previewItem.addEventListener('click', () => {
                    this.showPreviewModal(i, convertedDataUrl);
                });
                previewContainer.appendChild(previewItem);
            }
            
            // 更新预览区域
            previewImage.innerHTML = '';
            previewImage.appendChild(previewContainer);
            previewImage.classList.remove('loading');
            
            convertBtn.disabled = false;
            // 启用下载按钮并更新文本
            downloadBtn.disabled = false;
            // 根据文件数量动态设置下载按钮文本
            downloadBtn.textContent = this.files.length > 1 ? '下载转换包' : '下载转换图片';

        } catch (error) {
            alert('转换失败，请重试');
            console.error('转换错误:', error);
            previewImage.classList.remove('loading');
            convertBtn.disabled = false;
            downloadBtn.textContent = '下载转换图片';
        }
    }

    async downloadImages() {
        if (this.convertedImages.length === 0) {
            alert('��先转换图片');
            return;
        }

        if (this.convertedImages.length === 1) {
            // 单个文件直接下载
            const image = this.convertedImages[0];
            const link = document.createElement('a');
            link.download = image.name;
            link.href = image.data;
            link.click();
        } else {
            // 多个文件打包下载
            try {
                const zip = new JSZip();
                
                // 添加所有图片到 zip
                this.convertedImages.forEach((image, index) => {
                    // 从 base64 中提取实际的图片数据
                    const imageData = image.data.split(',')[1];
                    zip.file(image.name, imageData, {base64: true});
                });
                
                // 生成 zip 文件
                const zipBlob = await zip.generateAsync({type: 'blob'});
                
                // 下载 zip 文件
                const link = document.createElement('a');
                link.download = `converted_images_${new Date().getTime()}.zip`;
                link.href = URL.createObjectURL(zipBlob);
                link.click();
                
                // 清理 URL 对象
                setTimeout(() => URL.revokeObjectURL(link.href), 0);
            } catch (error) {
                console.error('打包下载失败:', error);
                alert('下载失败，请重试');
            }
        }
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
    }

    // 显示预览模态框
    showPreviewModal(index, convertedUrl = null) {
        const modal = document.getElementById('previewModal');
        const modalImg = document.getElementById('previewModalImage');
        modalImg.src = convertedUrl || this.files[index].preview;
        modal.style.display = 'flex';
        
        // 添加关闭事件
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => modal.style.display = 'none';
        
        // 点击模态框景关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
} 