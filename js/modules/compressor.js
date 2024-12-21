export class ImageCompressor {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxFiles = 20;
        this.files = [];
        this.compressedImages = [];
        this.quality = 0.8;
        this.currentIndex = undefined;
    }

    createInterface() {
        return `
            <div class="compressor-container">
                <h1 class="compressor-title">图片压缩</h1>
                
                <div class="compressor-intro">
                    <div class="compressor-icon">
                        <img src="assets/icons/compress.svg" alt="图片压缩">
                    </div>
                    <p class="compressor-description">
                        使用我们的压缩工具，您可以轻松地减小图片文件大小。上传您的图片，调整压缩质量，然后点击压缩按钮即可。
                    </p>
                </div>

                <div class="tool-section">
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-dropzone" id="dropzone">
                            <p>拖放文件到这里，或者点击选择文件</p>
                            <p class="upload-limit">支持JPG、PNG、WEBP、GIF格式，单个文件最大10MB（最多20张）</p>
                            <input type="file" id="fileInput" accept="image/*" multiple style="display: none;">
                            <button class="upload-btn" id="uploadBtn">上传图片</button>
                        </div>
                    </div>
                </div>

                <div class="preview-area" style="display: none;">
                    <div class="preview-container">
                        <div class="preview-box">
                            <h3>原图预览</h3>
                            <div class="preview-image">
                                <div class="preview-grid" id="previewGrid">
                                    <!-- 图片预览将在这里动态生成 -->
                                </div>
                            </div>
                        </div>

                        <div class="preview-box">
                            <h3>压缩后预览</h3>
                            <div class="preview-image">
                                <div class="preview-grid" id="compressedPreviewGrid">
                                    <!-- 压缩后的图片预览将在这里动态生成 -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="compress-options">
                        <div class="quality-control">
                            <label>压缩质量: <span id="qualityValue">80%</span></label>
                            <input type="range" id="qualitySlider" min="0" max="100" value="80" class="quality-slider">
                        </div>
                        <div class="compress-actions">
                            <button class="compress-btn" disabled>批量压缩</button>
                            <button class="download-btn" disabled>下载压缩图片</button>
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

    initializeEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');
        const compressBtn = document.querySelector('.compress-btn');
        const downloadBtn = document.querySelector('.download-btn');

        // 点击上传按钮
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

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
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFiles(files);
        });

        // 质量滑块
        qualitySlider.addEventListener('input', () => {
            const value = qualitySlider.value;
            qualityValue.textContent = `${value}%`;
            // 将百分比转换为0-1的质量值，使用非线性映射
            this.quality = Math.pow(value / 100, 1.5); // 使用幂函数使压缩更符合人的感知
        });

        // 压缩按钮
        compressBtn.addEventListener('click', () => {
            this.compressImages();
        });

        // 下载按钮
        downloadBtn.addEventListener('click', () => {
            this.downloadImage();
        });

        // 添加模态框关闭事件
        const modal = document.getElementById('previewModal');
        const closeBtn = modal.querySelector('.close-modal');
        
        closeBtn.onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
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

        // 验证文件
        const validFiles = newFiles.filter(file => {
            if (file.size > this.maxFileSize) {
                alert(`文件 ${file.name} 超过大小限制（10MB）`);
                return false;
            }

            if (!file.type.startsWith('image/')) {
                alert(`文件 ${file.name} 不是图片文件`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            // 为每个文件创建预览
            for (const file of validFiles) {
                const preview = await this.createPreview(file);
                this.files.push({
                    file,
                    preview: preview.dataUrl,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    width: preview.width,
                    height: preview.height
                });
            }

            // 更新预览网格
            this.updatePreviewGrid();
            
            // 显示预览区域
            document.querySelector('.preview-area').style.display = 'block';
            
            // 启用压缩按钮
            document.querySelector('.compress-btn').disabled = false;
        }
    }

    async createPreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // 创建图片对象来获取分辨率
                const img = new Image();
                img.onload = () => {
                    resolve({
                        dataUrl: e.target.result,
                        width: img.width,
                        height: img.height
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    updatePreviewGrid() {
        const previewGrid = document.getElementById('previewGrid');
        previewGrid.innerHTML = this.files.map((file, index) => `
            <div class="preview-item ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <img src="${file.preview}" alt="${file.name}">
                <div class="preview-item-overlay">
                    <span class="preview-item-name">${file.name}</span>
                    <div class="preview-item-info">
                        <span class="preview-item-resolution">${file.width} × ${file.height}</span>
                        <span class="preview-item-size">${this.formatFileSize(file.size)}</span>
                    </div>
                    <button class="remove-btn" data-index="${index}">×</button>
                </div>
            </div>
        `).join('');

        // 添加点击预览事件
        previewGrid.querySelectorAll('.preview-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 只在点击图片时显示大图预览
                if (e.target.tagName === 'IMG') {
                    const modal = document.getElementById('previewModal');
                    const modalImg = document.getElementById('previewModalImage');
                    modalImg.src = e.target.src;
                    modal.style.display = 'flex';
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

        // 更新压缩按钮文本
        const compressBtn = document.querySelector('.compress-btn');
        compressBtn.textContent = this.files.length > 1 ? '批量压缩' : '压缩图片';

        // 默认显示第一张图片的信息
        if (this.files.length > 0 && this.currentIndex === undefined) {
            this.showFileInfo(0);
        }
    }

    showFileInfo(index) {
        this.currentIndex = index;
        // 更新选中状态
        document.querySelectorAll('.preview-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.preview-item[data-index="${index}"]`).classList.add('active');
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.currentIndex = undefined;
        this.updatePreviewGrid();
        
        if (this.files.length === 0) {
            document.querySelector('.preview-area').style.display = 'none';
        } else if (index === this.currentIndex) {
            // 如果删除的是当前预览的图片，显示第一张图片
            this.showFileInfo(0);
        }
    }

    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 计算压缩后的尺寸
                let { width, height } = img;
                const maxSize = 1920; // 最大宽度/高度限制
                
                // 根据原始尺寸计算压缩比例
                let scale = 1;
                if (width > maxSize || height > maxSize) {
                    scale = Math.min(maxSize / width, maxSize / height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }
                
                // 设置画布尺寸
                canvas.width = width;
                canvas.height = height;
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);
                
                // 根据原始图片类型和大小选择最佳的输出格式和质量
                let outputType = file.type;
                let quality = this.quality;
                
                // 对于不同类型的图片使用不同的压缩策略
                if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                    outputType = 'image/jpeg';
                    // JPEG质量可以更激进一些
                    quality = Math.max(0.1, this.quality);
                } else if (file.type === 'image/png') {
                    if (!this.hasTransparency(ctx, width, height)) {
                        outputType = 'image/jpeg'; // 无透明度的PNG转换为JPEG
                        quality = Math.max(0.1, this.quality);
                    } else {
                        outputType = 'image/png';
                        // PNG需要保持较高质量以保持透明度
                        quality = Math.max(0.6, this.quality);
                    }
                } else if (file.type === 'image/webp') {
                    outputType = 'image/webp';
                    quality = Math.max(0.1, this.quality);
                }
                
                // 如果原图小于100KB，提高最低质量以保持清晰度
                if (file.size < 102400) {
                    quality = Math.max(0.7, quality);
                }
                
                canvas.toBlob(
                    (blob) => resolve(blob),
                    outputType,
                    quality
                );
                
                URL.revokeObjectURL(img.src);
            };
            
            img.onerror = reject;
        });
    }

    // 检查图片是否包含透明通道
    hasTransparency(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height).data;
        for (let i = 3; i < imageData.length; i += 4) {
            if (imageData[i] < 255) {
                return true;
            }
        }
        return false;
    }

    async compressImages() {
        if (this.files.length === 0) return;

        const compressBtn = document.querySelector('.compress-btn');
        compressBtn.disabled = true;

        this.compressedImages = [];
        
        try {
            // 遍历所有文件进行压缩
            for (const fileData of this.files) {
                const compressedBlob = await this.compressImage(fileData.file);
                
                // 将压缩后的文件转换为 base64
                const reader = new FileReader();
                const base64 = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(compressedBlob);
                });

                this.compressedImages.push({
                    dataUrl: base64,
                    name: fileData.name,
                    size: compressedBlob.size
                });
            }

            // 更新压缩后的预览网格
            const compressedPreviewGrid = document.getElementById('compressedPreviewGrid');
            compressedPreviewGrid.innerHTML = this.compressedImages.map((img, index) => `
                <div class="preview-item">
                    <img src="${img.dataUrl}" alt="${img.name}">
                    <div class="preview-item-overlay">
                        <span class="preview-item-name">${img.name}</span>
                        <div class="preview-item-info">
                            <span class="preview-item-size">压缩后：${this.formatFileSize(img.size)}</span>
                            <span class="preview-item-ratio">${Math.round((1 - img.size / this.files[index].size) * 100)}% 减小</span>
                        </div>
                    </div>
                </div>
            `).join('');

            // 添加点击预览事件
            compressedPreviewGrid.querySelectorAll('.preview-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.tagName === 'IMG') {
                        const modal = document.getElementById('previewModal');
                        const modalImg = document.getElementById('previewModalImage');
                        modalImg.src = e.target.src;
                        modal.style.display = 'flex';
                    }
                });
            });

            // 启用下载按钮
            document.querySelector('.download-btn').disabled = false;
        } catch (error) {
            console.error('压缩过程出错:', error);
            alert('压缩过程中出现错误，请重试');
        } finally {
            compressBtn.disabled = false;
        }
    }

    downloadImage() {
        if (!this.compressedImages || this.compressedImages.length === 0) return;

        if (this.compressedImages.length === 1) {
            // 单个文件直接下载
            const link = document.createElement('a');
            link.download = `compressed_${this.compressedImages[0].name}`;
            link.href = this.compressedImages[0].dataUrl;
            link.click();
        } else {
            // 多个文件打包下载
            const zip = new JSZip();
            
            this.compressedImages.forEach((img, index) => {
                // 从 base64 中提取实际的图片数据
                const imageData = img.dataUrl.split(',')[1];
                zip.file(`compressed_${img.name}`, imageData, {base64: true});
            });
            
            zip.generateAsync({type: 'blob'}).then(content => {
                const link = document.createElement('a');
                link.download = `compressed_images_${new Date().getTime()}.zip`;
                link.href = URL.createObjectURL(content);
                link.click();
                
                // 清理 URL 对象
                setTimeout(() => URL.revokeObjectURL(link.href), 0);
            });
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
} 