export class ImageResizer {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.originalImage = null;
        this.aspectRatio = 1;
    }

    createInterface() {
        return `
            <div class="resizer-container">
                <h1 class="resizer-title">调整图片大小</h1>
                
                <div class="resizer-intro">
                    <div class="resizer-icon">
                        <img src="assets/icons/resize.svg" alt="尺寸调整">
                    </div>
                    <p class="resizer-description">
                        使用我们的调整大小工具，您可以轻松地改变图片的尺寸。上传您的图片，设置新的宽度和高度，然后点击调整大小按钮即可。
                    </p>
                </div>

                <div class="upload-area">
                    <div class="upload-dropzone" id="dropzone">
                        <p>拖放文件到这里，或者点击选择文件</p>
                        <p class="upload-limit">支持JPG、PNG、WEBP、GIF格式，单个文件最大10MB</p>
                        <input type="file" id="fileInput" accept="image/*" style="display: none;">
                        <button class="upload-btn" id="uploadBtn">上传图片</button>
                    </div>
                </div>

                <div class="preview-area" style="display: none;">
                    <div class="preview-container">
                        <div class="preview-box">
                            <div class="image-info">
                                <span id="originalSize">原始尺寸：-- x -- 像素</span>
                            </div>
                            <h3>原图预览</h3>
                            <div class="preview-image">
                                <img id="originalPreview" alt="原图预览">
                            </div>
                        </div>

                        <div class="preview-box">
                            <div class="image-info">
                                <span id="resizedSize">新尺寸：-- x -- 像素</span>
                            </div>
                            <h3>调整后预览</h3>
                            <div class="preview-image">
                                <img id="resizedPreview" alt="调整后预览">
                            </div>
                        </div>
                    </div>

                    <div class="resize-options">
                        <h3>调整选项</h3>
                        <div class="size-inputs">
                            <div class="input-group">
                                <label for="width">宽度 (像素)</label>
                                <input type="number" id="width" min="1" max="10000">
                            </div>
                            <div class="input-group">
                                <label for="height">高度 (像素)</label>
                                <input type="number" id="height" min="1" max="10000">
                            </div>
                            <label class="checkbox-group">
                                <input type="checkbox" id="keepRatio" checked>
                                <span>保持宽高比</span>
                            </label>
                        </div>
                        <div class="preset-sizes">
                            <h4>常用尺寸</h4>
                            <div class="preset-buttons">
                                <button data-width="1920" data-height="1080">1920×1080</button>
                                <button data-width="1280" data-height="720">1280×720</button>
                                <button data-width="800" data-height="600">800×600</button>
                                <button data-width="640" data-height="480">640×480</button>
                            </div>
                        </div>
                        <div class="resize-actions">
                            <button class="resize-btn" disabled>调整大小</button>
                            <button class="download-btn" disabled>下载调整后的图片</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeEvents() {
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const widthInput = document.getElementById('width');
        const heightInput = document.getElementById('height');
        const keepRatioCheckbox = document.getElementById('keepRatio');
        const presetButtons = document.querySelectorAll('.preset-buttons button');
        const resizeBtn = document.querySelector('.resize-btn');
        const downloadBtn = document.querySelector('.download-btn');

        // 点击上传按钮
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
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
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // 文件选择
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // 宽度输入
        widthInput.addEventListener('input', () => {
            if (keepRatioCheckbox.checked && this.aspectRatio) {
                heightInput.value = Math.round(widthInput.value / this.aspectRatio);
            }
            resizeBtn.disabled = false;
        });

        // 高度输入
        heightInput.addEventListener('input', () => {
            if (keepRatioCheckbox.checked && this.aspectRatio) {
                widthInput.value = Math.round(heightInput.value * this.aspectRatio);
            }
            resizeBtn.disabled = false;
        });

        // 预设尺寸按钮
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const width = parseInt(btn.dataset.width);
                const height = parseInt(btn.dataset.height);
                widthInput.value = width;
                heightInput.value = height;
                resizeBtn.disabled = false;
            });
        });

        // 调整大小按钮
        resizeBtn.addEventListener('click', () => {
            this.resizeImage();
        });

        // 下载按钮
        downloadBtn.addEventListener('click', () => {
            this.downloadImage();
        });

        // 添加首页链接事件
        document.querySelector('a[href="#home"]').addEventListener('click', (e) => {
            e.preventDefault();
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

    handleFile(file) {
        if (file.size > this.maxFileSize) {
            alert('文件大小超过限制（10MB）');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.aspectRatio = img.width / img.height;

                // 显示原图预览
                const originalPreview = document.getElementById('originalPreview');
                originalPreview.src = e.target.result;
                document.getElementById('originalSize').textContent = 
                    `原始尺寸：${img.width} × ${img.height} 像素`;

                // 设置初始尺寸
                document.getElementById('width').value = img.width;
                document.getElementById('height').value = img.height;

                // 显示预览区域
                document.querySelector('.preview-area').style.display = 'block';
                document.querySelector('.resize-btn').disabled = true;
                document.querySelector('.download-btn').disabled = true;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resizeImage() {
        if (!this.originalImage) return;

        const width = parseInt(document.getElementById('width').value);
        const height = parseInt(document.getElementById('height').value);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(this.originalImage, 0, 0, width, height);

        const resizedPreview = document.getElementById('resizedPreview');
        resizedPreview.src = canvas.toDataURL();
        document.getElementById('resizedSize').textContent = 
            `新尺寸：${width} × ${height} 像素`;

        document.querySelector('.download-btn').disabled = false;
    }

    downloadImage() {
        const link = document.createElement('a');
        link.download = 'resized_image.png';
        link.href = document.getElementById('resizedPreview').src;
        link.click();
    }
} 