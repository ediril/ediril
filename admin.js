/**
 * Art Lovers Hub - Admin Panel JavaScript
 * File upload, drag/drop, and table management
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
    initializeTableEvents();
    initializePagination();
    initializeGroupSelector();
    initializeGroupManagement();
});

/**
 * Initialize file upload functionality with drag/drop
 */
function initializeFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('imageFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileQueueDiv = document.getElementById('fileQueue');
    const fileList = document.getElementById('fileList');
    const queueCount = document.getElementById('queueCount');
    const uploadForm = document.getElementById('uploadForm');
    const clearQueueBtn = document.getElementById('clearQueueBtn');

    // File queue for multiple uploads
    let uploadQueue = [];
    let originalQueueTotal = 0; // Track original total for progress display
    
    // Batch duplicate checking to prevent server flooding
    let duplicateCheckQueue = [];
    let isProcessingDuplicates = false;

    // Note: No client-side file size limit - server will convert and compress to 80KB

    // Drag and drop events
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Event delegation for remove file buttons - MUST come before dropZone click handler
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-file-btn')) {
            e.preventDefault();
            e.stopPropagation(); // Prevent bubbling to dropZone
            const fileId = e.target.closest('.remove-file-btn').dataset.fileId;
            removeFileFromQueue(fileId);
            return; // Important: return early to prevent other handlers
        }
        
        // Browse button click
        if (e.target.closest('.browse-btn')) {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
            return;
        }
        
        // Clear queue button click
        if (e.target.closest('.clear-queue-btn')) {
            e.preventDefault();
            e.stopPropagation();
            clearUploadQueue();
            return;
        }
    });
    
    // No click handler needed for dropZone - only browse button should trigger file dialog

    // Form submission
    uploadForm.addEventListener('submit', handleFormSubmit);

    // Initialize queue display on page load
    updateQueueDisplay();

    function handleDragOver(e) {
        e.preventDefault();
        dropZone.classList.add('border-success');
        dropZone.querySelector('i').className = 'fas fa-cloud-upload-alt fa-3x text-success mb-3';
    }

    function handleDragLeave(e) {
        e.preventDefault();
        dropZone.classList.remove('border-success');
        dropZone.querySelector('i').className = 'fas fa-cloud-upload-alt fa-3x text-info mb-3';
    }

    function handleDrop(e) {
        e.preventDefault();
        dropZone.classList.remove('border-success');
        dropZone.querySelector('i').className = 'fas fa-cloud-upload-alt fa-3x text-info mb-3';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            // Handle multiple files
            Array.from(files).forEach(file => {
                addFileToQueue(file);
            });
        }
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            // Handle multiple selected files
            Array.from(files).forEach(file => {
                addFileToQueue(file);
            });
        }
    }

    async function addFileToQueue(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showAlert(`"${file.name}" is not a valid image file (JPG, PNG, GIF, WebP, BMP)`, 'danger');
            return;
        }

        // Check if file already in queue
        const existingFile = uploadQueue.find(queuedFile => 
            queuedFile.file.name === file.name && queuedFile.file.size === file.size
        );
        if (existingFile) {
            showAlert(`"${file.name}" is already in the upload queue`, 'warning');
            return;
        }

        // Add to batch duplicate check queue instead of immediate check
        duplicateCheckQueue.push({ file, resolve: null, reject: null });
        
        // Process duplicate checks in batches with throttling
        processDuplicateCheckQueue();
    }

    // Process duplicate checks in batches to prevent server flooding
    async function processDuplicateCheckQueue() {
        if (isProcessingDuplicates || duplicateCheckQueue.length === 0) {
            return;
        }
        
        isProcessingDuplicates = true;
        
        // Process up to 5 files at a time with delay between batches
        while (duplicateCheckQueue.length > 0) {
            const batch = duplicateCheckQueue.splice(0, 5);
            
            // Process batch in parallel
            const promises = batch.map(async ({ file }) => {
                try {
                    const formData = new FormData();
                    formData.append('action', 'check_duplicate');
                    formData.append('filename', file.name);
                    
                    const response = await fetch('/admin', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (result.duplicate) {
                        // Skip duplicate automatically and show toast
                        showAlert(`Skipped "${file.name}" - already exists in database`, 'info');
                        return { file, isDuplicate: true };
                    } else {
                        // Add to upload queue
                        addFileToQueueAfterDuplicateCheck(file);
                        return { file, isDuplicate: false };
                    }
                } catch (error) {
                    console.error('Error checking for duplicates:', error);
                    // Add to queue even if duplicate check fails
                    addFileToQueueAfterDuplicateCheck(file);
                    return { file, isDuplicate: false };
                }
            });
            
            await Promise.all(promises);
            
            // Wait 500ms between batches to prevent overwhelming server
            if (duplicateCheckQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        isProcessingDuplicates = false;
    }
    
    function addFileToQueueAfterDuplicateCheck(file) {
        // Try to capture file path information (limited by browser security)
        let pathInfo = file.webkitRelativePath || file.name;
        
        // If we have a File API with mozFullPath (Firefox)
        if (file.mozFullPath) {
            pathInfo = file.mozFullPath;
        }

        // Generate unique ID for this file
        const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // Add to queue
        const queueItem = {
            id: fileId,
            file: file,
            pathInfo: pathInfo,
            status: 'pending' // pending, uploading, completed, error
        };

        uploadQueue.push(queueItem);
        updateQueueDisplay();
        
        // Enable upload button if we have files
        uploadBtn.disabled = uploadQueue.length === 0;
    }

    function updateQueueDisplay() {
        queueCount.textContent = uploadQueue.length;
        
        const emptyState = document.getElementById('emptyDropState');

        // Clear existing queue display
        fileList.innerHTML = '';

        if (uploadQueue.length === 0) {
            // Show empty state, hide file list and clear button
            if (emptyState) emptyState.style.display = 'block';
            if (clearQueueBtn) clearQueueBtn.style.display = 'none';
            return;
        }

        // Hide empty state, show file list and clear button
        if (emptyState) emptyState.style.display = 'none';
        if (clearQueueBtn) clearQueueBtn.style.display = 'inline-block';

        // Performance optimization: For large queues, show summary + first few files
        if (uploadQueue.length > 20) {
            // Show summary for large batches
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'alert alert-info border-light mb-3';
            summaryDiv.innerHTML = `
                <i class="fas fa-info-circle me-2"></i>
                <strong>${uploadQueue.length} files queued for upload</strong>
                <div class="mt-2 small">
                    Files will be processed individually during upload. Large batches may take several minutes to complete.
                </div>
            `;
            fileList.appendChild(summaryDiv);
            
            // Show first 10 files for preview
            const previewFiles = uploadQueue.slice(0, 10);
            previewFiles.forEach((queueItem, index) => {
                const fileDiv = createFileQueueItem(queueItem);
                if (index === 9 && uploadQueue.length > 10) {
                    // Add "and X more" indicator after 10th item
                    const moreDiv = document.createElement('div');
                    moreDiv.className = 'text-center py-3 text-light';
                    moreDiv.innerHTML = `<em>... and ${uploadQueue.length - 10} more files</em>`;
                    fileList.appendChild(fileDiv);
                    fileList.appendChild(moreDiv);
                } else {
                    fileList.appendChild(fileDiv);
                }
            });
        } else {
            // Show all files for smaller batches (≤20 files)
            uploadQueue.forEach(queueItem => {
                const fileDiv = createFileQueueItem(queueItem);
                fileList.appendChild(fileDiv);
            });
        }
    }

    function createFileQueueItem(queueItem) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'card bg-secondary border-light mb-2';
        fileDiv.setAttribute('data-file-id', queueItem.id);

        fileDiv.innerHTML = `
            <div class="card-body p-3">
                <div class="row align-items-start">
                    <div class="col-auto">
                        <img class="file-preview-img rounded" src="" alt="Preview" 
                             style="width: 60px; height: 60px; object-fit: cover; display: none;">
                    </div>
                    <div class="col" style="min-width: 0;">
                        <div class="mb-2">
                            <strong class="text-light">${escapeHtml(queueItem.file.name)}</strong>
                            <span class="badge bg-info ms-2">${formatFileSize(queueItem.file.size)}</span>
                        </div>
                        <div class="mb-2">
                            <label class="form-label form-label-sm text-light mb-1">Caption:</label>
                            <textarea class="form-control form-control-sm bg-dark text-light border-light file-caption" 
                                      data-file-id="${queueItem.id}"
                                      rows="3"
                                      style="resize: vertical;"
                                      placeholder="Enter caption (optional)"></textarea>
                        </div>
                        <div class="mt-1">
                            <small class="status-text text-success" style="display: none;">
                                <i class="fas fa-check-circle me-1"></i><span class="status-message">Ready</span>
                            </small>
                        </div>
                    </div>
                    <div class="col-auto">
                        <button type="button" class="btn btn-sm btn-danger remove-file-btn" 
                                data-file-id="${queueItem.id}" title="Remove file">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Load preview image after HTML is set
        // Only for reasonable file sizes to prevent memory issues
        if (queueItem.file.size < 10 * 1024 * 1024) { // Only preview files < 10MB
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = fileDiv.querySelector('.file-preview-img');
                if (img && e.target.result) {
                    console.log(`Setting preview for ${queueItem.file.name}, data URL length: ${e.target.result.length}`);
                    img.src = e.target.result;
                    img.style.display = 'block';
                } else {
                    console.log(`Failed to set preview for ${queueItem.file.name}`);
                }
            };
            reader.onerror = function(e) {
                console.error(`FileReader error for ${queueItem.file.name}:`, e);
                const img = fileDiv.querySelector('.file-preview-img');
                if (img) {
                    img.style.display = 'none';
                }
            };
            console.log(`Starting FileReader for ${queueItem.file.name} (${formatFileSize(queueItem.file.size)})`);
            reader.readAsDataURL(queueItem.file);
        } else {
            console.log(`Skipping preview for ${queueItem.file.name} - file too large (${formatFileSize(queueItem.file.size)})`);
            const img = fileDiv.querySelector('.file-preview-img');
            if (img) {
                img.style.display = 'none';
            }
        }

        return fileDiv;
    }
    
    function truncateFilename(filename) {
        // If filename is short enough, return as is
        if (filename.length <= 33) return filename;
        
        // Get first 15 chars and last 15 chars
        const start = filename.substring(0, 15);
        const end = filename.substring(filename.length - 15);
        
        return start + '...' + end;
    }



    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function removeFileFromQueue(fileId) {
        uploadQueue = uploadQueue.filter(item => item.id !== fileId);
        updateQueueDisplay();
        uploadBtn.disabled = uploadQueue.length === 0;
    }

    function clearUploadQueue() {
        if (uploadQueue.length === 0) return;
        
        // Confirm before clearing large queues
        if (uploadQueue.length > 5) {
            if (!confirm(`Are you sure you want to clear all ${uploadQueue.length} files from the queue?`)) {
                return;
            }
        }
        
        uploadQueue = [];
        originalQueueTotal = 0; // Reset original total
        updateQueueDisplay();
        uploadBtn.disabled = true;
        if (clearQueueBtn) clearQueueBtn.style.display = 'none';
        
        showAlert('Upload queue cleared', 'info');
    }


    // Add a function to refresh queue styling (for debugging)
    window.refreshQueueStyling = function() {
        updateQueueDisplay();
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Check if we have files in queue
        if (uploadQueue.length === 0) {
            showAlert('Please select image files to upload', 'danger');
            return;
        }

        // Start batch upload
        startBatchUpload();
    }

    async function startBatchUpload() {
        // Show loading state
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading...';
        uploadBtn.disabled = true;

        let completed = 0;
        let failed = 0;
        originalQueueTotal = uploadQueue.length; // Set global for progress tracking

        // Process each file in sequence
        for (const queueItem of uploadQueue) {
            if (queueItem.status === 'completed') continue;

            try {
                queueItem.status = 'uploading';
                updateFileStatus(queueItem.id, 'uploading', 'Uploading...');

                // Get individual caption for this file
                const captionField = document.querySelector(`textarea[data-file-id="${queueItem.id}"]`);
                const caption = captionField ? captionField.value.trim() : '';

                const result = await uploadSingleFile(queueItem, caption);
                
                if (result.success) {
                    queueItem.status = 'completed';
                    updateFileStatus(queueItem.id, 'completed', 'Upload successful');
                    completed++;
                } else {
                    queueItem.status = 'error';
                    updateFileStatus(queueItem.id, 'error', result.error || 'Upload failed');
                    failed++;
                }
            } catch (error) {
                queueItem.status = 'error';
                updateFileStatus(queueItem.id, 'error', 'Upload failed');
                failed++;
            }

            // Brief pause between uploads
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Show final results
        if (completed > 0) {
            showAlert(`Successfully uploaded ${completed} file${completed > 1 ? 's' : ''}!`, 'success');
        }
        if (failed > 0) {
            showAlert(`Failed to upload ${failed} file${failed > 1 ? 's' : ''}`, 'danger');
        }

        // Reset button
        uploadBtn.innerHTML = '<i class="fas fa-upload me-2"></i>Upload';
        uploadBtn.disabled = uploadQueue.filter(item => item.status !== 'completed').length === 0;

        // Refresh table if any files were successfully uploaded
        if (completed > 0) {
            const pageSelect = document.getElementById('pageSelect');
            const currentPage = pageSelect ? parseInt(pageSelect.value) : 1;
            loadTablePage(currentPage);
        }
    }

    async function uploadSingleFile(queueItem, caption) {
        const formData = new FormData();
        formData.append('action', 'upload_image');
        formData.append('image_file', queueItem.file);
        formData.append('file_path', queueItem.pathInfo);
        formData.append('caption', caption);
        
        // Add the group_id from the select dropdown
        const groupSelect = document.getElementById('groupSelect');
        if (groupSelect) {
            formData.append('group_id', groupSelect.value);
        }
        
        // Send the original file's last modified time
        if (queueItem.file.lastModified) {
            formData.append('file_last_modified', queueItem.file.lastModified);
        }

        console.log(`=== Starting upload for file ${queueItem.id} (${queueItem.file.name}, ${formatFileSize(queueItem.file.size)}) ===`);

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            
            // No progress simulation needed - using simple status messages
            
            // Track upload progress for logging only
            xhr.upload.addEventListener('progress', (e) => {
                console.log(`Progress event for ${queueItem.id}: ${e.loaded}/${e.total} bytes`);
            });
            
            xhr.upload.addEventListener('loadstart', () => {
                console.log(`Upload loadstart for ${queueItem.id}`);
            });
            
            xhr.upload.addEventListener('loadend', () => {
                console.log(`Upload loadend for ${queueItem.id}`);
            });
            
            xhr.addEventListener('load', () => {
                console.log(`XHR load complete for ${queueItem.id}, status: ${xhr.status}`);
                
                // Check if it's a redirect (which means success)
                if (xhr.status >= 300 && xhr.status < 400) {
                    resolve({ success: true });
                } else if (xhr.status === 200) {
                    // Check response for error messages
                    const errorMatch = xhr.responseText.match(/die\('([^']+)'\)/);
                    if (errorMatch) {
                        resolve({ success: false, error: errorMatch[1] });
                    } else {
                        // Assume success if no error found
                        resolve({ success: true });
                    }
                } else {
                    resolve({ success: false, error: 'Upload failed' });
                }
            });
            
            xhr.addEventListener('error', () => {
                console.log(`XHR error for ${queueItem.id}`);
                resolve({ success: false, error: 'Network error' });
            });
            
            xhr.open('POST', '/admin');
            xhr.send(formData);
        });
    }

    // Removed progress bar functionality - using simple status messages instead

    function updateFileStatus(fileId, status, message) {
        const fileDiv = document.querySelector(`[data-file-id="${fileId}"]`);
        
        // Update queue item status for tracking (even if not visible)
        const queueItem = uploadQueue.find(item => item.id === fileId);
        if (queueItem) {
            queueItem.status = status;
            queueItem.statusMessage = message;
        }
        
        if (!fileDiv) {
            // File not visible in DOM (part of hidden files in large batches)
            // Still update the overall batch progress
            updateBatchProgress();
            return;
        }

        const statusText = fileDiv.querySelector('.status-text');
        const statusMessage = fileDiv.querySelector('.status-message');
        const statusIcon = fileDiv.querySelector('.status-text i');

        if (statusText && statusMessage) {
            statusMessage.textContent = message;
            statusText.style.display = 'block';
            
            // Update icon and styling based on status
            if (status === 'uploading') {
                statusText.className = 'status-text text-info';
                if (statusIcon) statusIcon.className = 'fas fa-spinner fa-spin me-1';
            } else if (status === 'completed') {
                statusText.className = 'status-text text-success';
                if (statusIcon) statusIcon.className = 'fas fa-check-circle me-1';
                
                // Remove completed file from queue after showing success briefly
                setTimeout(() => {
                    fileDiv.style.transition = 'opacity 0.5s ease-out';
                    fileDiv.style.opacity = '0';
                    setTimeout(() => {
                        removeFileFromQueue(fileId);
                        updateBatchProgress();
                    }, 500);
                }, 1500);
            } else if (status === 'error') {
                statusText.className = 'status-text text-danger';
                if (statusIcon) statusIcon.className = 'fas fa-exclamation-circle me-1';
            }
        }
        
        updateBatchProgress();
    }

    // Update overall batch progress for large uploads
    function updateBatchProgress() {
        const totalFiles = originalQueueTotal > 0 ? originalQueueTotal : uploadQueue.length;
        if (totalFiles === 0) return;
        
        const completed = uploadQueue.filter(item => item.status === 'completed').length;
        const uploading = uploadQueue.filter(item => item.status === 'uploading').length;
        const errors = uploadQueue.filter(item => item.status === 'error').length;
        
        // Update the queue count display with progress info
        const queueCountElement = document.getElementById('queueCount');
        if (queueCountElement && originalQueueTotal > 0) {
            const remaining = uploadQueue.length; // Current queue length = remaining files
            if (remaining > 0) {
                queueCountElement.textContent = `${remaining} remaining`;
            } else {
                queueCountElement.textContent = `0`;
            }
        } else if (queueCountElement) {
            queueCountElement.textContent = uploadQueue.length;
        }
        
        // Update batch summary for large batches
        const summaryDiv = document.querySelector('.alert.alert-info');
        if (summaryDiv && totalFiles > 20) {
            const processed = totalFiles - uploadQueue.length;
            summaryDiv.innerHTML = `
                <i class="fas fa-info-circle me-2"></i>
                <strong>Batch Upload Progress</strong>
                <div class="mt-2 small">
                    ${processed} of ${totalFiles} files processed${errors > 0 ? ` (${errors} failed)` : ''}
                </div>
            `;
        }
    }
}

/**
 * Initialize table events for edit/delete functionality
 */
function initializeTableEvents() {
    // Event delegation for dynamically loaded table content - only initialize once
    if (window.tableEventsInitialized) return;
    window.tableEventsInitialized = true;
    
    document.addEventListener('click', function(e) {
        // Edit image button
        if (e.target.closest('.edit-image-btn')) {
            const btn = e.target.closest('.edit-image-btn');
            const imageId = btn.getAttribute('data-image-id');
            const caption = btn.getAttribute('data-image-caption');
            const publishedDate = btn.getAttribute('data-image-published');
            openEditModal(imageId, caption, publishedDate);
        }

        // Delete image button
        if (e.target.closest('.delete-image-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const btn = e.target.closest('.delete-image-btn');
            const imageId = btn.getAttribute('data-image-id');
            const filename = btn.getAttribute('data-image-filename');
            console.log('Delete button clicked:', imageId, filename);
            deleteImage(imageId, filename);
        }
        
        // Copy filename button
        if (e.target.closest('.copy-filename-btn')) {
            const btn = e.target.closest('.copy-filename-btn');
            const filename = btn.getAttribute('data-filename');
            copyToClipboard(filename);
        }
    });

    // Edit form submission
    const editForm = document.getElementById('editImageForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
    
    // Edit modal close functionality
    const editModal = document.getElementById('editImageModal');
    const editModalClose = editModal.querySelector('.btn-close');
    const editModalCancel = editModal.querySelector('[data-bs-dismiss="modal"]');
    
    if (editModalClose) {
        editModalClose.addEventListener('click', closeEditModal);
    }
    if (editModalCancel) {
        editModalCancel.addEventListener('click', closeEditModal);
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && editModal.classList.contains('show')) {
            closeEditModal();
        }
    });
}

/**
 * Open edit modal with image data
 */
function openEditModal(imageId, caption, publishedDate) {
    const modal = document.getElementById('editImageModal');
    document.getElementById('editImageId').value = imageId;
    document.getElementById('editCaption').value = caption || '';
    document.getElementById('editPublishedDate').value = publishedDate || '';
    
    // Show modal
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Focus on the caption input
    setTimeout(() => {
        document.getElementById('editCaption').focus();
    }, 100);
}

/**
 * Close edit modal
 */
function closeEditModal() {
    const modal = document.getElementById('editImageModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 150);
}

/**
 * Handle edit form submission
 */
function handleEditSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    fetch('/admin', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        if (data.includes('success') || data.includes('updated')) {
            showAlert('Image updated successfully!', 'success');
            closeEditModal();
            
            // Refresh the current table page to show updated data
            const pageSelect = document.getElementById('pageSelect');
            const currentPage = pageSelect ? parseInt(pageSelect.value) : 1;
            loadTablePage(currentPage);
        } else {
            showAlert('Update failed. Please try again.', 'danger');
        }
    })
    .catch(error => {
        console.error('Update error:', error);
        showAlert('Update failed. Please try again.', 'danger');
    });
}

/**
 * Delete image with confirmation
 */
function deleteImage(imageId, filename) {
    console.log('deleteImage called with:', imageId, filename);
    const confirmed = confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`);
    console.log('User confirmation:', confirmed);
    if (!confirmed) {
        return;
    }

    const formData = new FormData();
    formData.append('action', 'delete_image');
    formData.append('image_id', imageId);

    fetch('/admin', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        if (data.includes('success') || data.includes('deleted')) {
            showAlert('Image deleted successfully!', 'success');
            
            // Refresh the current table page to show updated data
            const pageSelect = document.getElementById('pageSelect');
            const currentPage = pageSelect ? parseInt(pageSelect.value) : 1;
            loadTablePage(currentPage);
        } else {
            showAlert('Delete failed. Please try again.', 'danger');
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        showAlert('Delete failed. Please try again.', 'danger');
    });
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-custom');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show alert-custom position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alert);

    // Add manual close button handler
    const closeBtn = alert.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            alert.remove();
        });
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showAlert(`Copied to clipboard: ${text}`, 'success');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showAlert(`Copied to clipboard: ${text}`, 'success');
        } catch (err) {
            showAlert('Failed to copy to clipboard', 'danger');
        }
        document.body.removeChild(textArea);
    }
}

/**
 * Format file size helper
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Initialize BWP-style pagination for admin table
 */
function initializePagination() {
    const pageSelect = document.getElementById('pageSelect');
    console.log('initializePagination called, pageSelect found:', !!pageSelect);
    console.log('pageSelect already initialized:', pageSelect ? pageSelect.hasAttribute('data-initialized') : 'N/A');
    
    if (pageSelect && !pageSelect.hasAttribute('data-initialized')) {
        console.log('Adding event listener to pageSelect');
        pageSelect.setAttribute('data-initialized', 'true');
        pageSelect.addEventListener('change', function() {
            const selectedPage = parseInt(this.value);
            console.log('Page selector changed to:', selectedPage);
            loadTablePage(selectedPage);
        });
    }
}

/**
 * Initialize group selector change event
 */
function initializeGroupSelector() {
    const groupSelect = document.getElementById('groupSelect');
    console.log('initializeGroupSelector called, groupSelect found:', !!groupSelect);
    
    if (groupSelect && !groupSelect.hasAttribute('data-group-initialized')) {
        console.log('Adding event listener to groupSelect');
        groupSelect.setAttribute('data-group-initialized', 'true');
        
        groupSelect.addEventListener('change', function(e) {
            console.log('Group selector changed to:', groupSelect.value);
            
            // Update URL parameter for group selection (but not page)
            const url = new URL(window.location);
            if (groupSelect.value === '1') {
                // Default group - remove the parameter
                url.searchParams.delete('g');
            } else {
                // Other groups - set the parameter
                url.searchParams.set('g', groupSelect.value);
            }
            // Remove page parameter since we're resetting to page 1
            url.searchParams.delete('page');
            
            // Update URL without causing navigation/reload
            history.pushState({}, '', url.toString());
            
            // Load table with new group, reset to page 1
            loadTablePage(1);
            
            // Also update delete button visibility (this was in another listener)
            if (typeof updateDeleteButtonVisibility === 'function') {
                updateDeleteButtonVisibility();
            }
        });
    }
}

/**
 * Load table page via AJAX (BWP pattern)
 */
async function loadTablePage(page) {
    console.log('loadTablePage called with page:', page);
    try {
        // Skip loading state to prevent any layout shifts
        const tableContainer = document.querySelector('.table-container');
        
        // Get the selected group
        const groupSelect = document.getElementById('groupSelect');
        const groupId = groupSelect ? groupSelect.value : 1;
        
        // Make AJAX request
        const response = await fetch('/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=load_table_page&page=${page}&group_id=${groupId}`
        });
        
        if (!response.ok) {
            throw new Error('Failed to load page');
        }
        
        const data = await response.json();
        console.log('AJAX response data:', data);
        
        if (data.success) {
            // Update only table rows to prevent jumping
            const tbody = tableContainer.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = data.table_html;
            } else {
                // Fallback if no tbody found
                tableContainer.innerHTML = data.table_html;
            }
            
            // Update range info in header
            const rangeInfo = document.getElementById('tableRangeInfo');
            if (rangeInfo && data.current_page && data.total_items && data.per_page) {
                const start = (data.current_page - 1) * data.per_page + 1;
                const end = Math.min(data.current_page * data.per_page, data.total_items);
                rangeInfo.textContent = `Showing ${start}-${end} of ${data.total_items} images`;
            }
            
            // Update page selector dropdown
            const pageSelect = document.getElementById('pageSelect');
            if (pageSelect && data.total_pages) {
                // Rebuild dropdown options if total pages changed
                if (pageSelect.options.length !== data.total_pages) {
                    pageSelect.innerHTML = '';
                    pageSelect.removeAttribute('data-initialized'); // Reset so it can be re-initialized
                    for (let i = 1; i <= data.total_pages; i++) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = `Page ${i} of ${data.total_pages}`;
                        pageSelect.appendChild(option);
                    }
                    // Re-initialize pagination after rebuilding
                    initializePagination();
                }
                // Set current page
                if (data.current_page) {
                    pageSelect.value = data.current_page;
                }
            }
            
            // Re-initialize table events and pagination for new content
            initializeTableEvents();
            initializePagination();
            
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error loading table page:', error);
        
        // Show error message in tbody only
        const tableContainer = document.querySelector('.table-container');
        const tbody = tableContainer.querySelector('tbody');
        
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="7" class="text-center py-3">
                    <div class="alert alert-danger d-inline-block">
                        <small>Failed to load page. Please try again.</small>
                        <button class="btn btn-outline-danger btn-sm ms-2" onclick="location.reload()">
                            <i class="fas fa-redo"></i> Reload
                        </button>
                    </div>
                </td></tr>
            `;
        }
    }
}

/**
 * Initialize group management functionality
 */
function initializeGroupManagement() {
    const groupSelect = document.getElementById('groupSelect');
    const addGroupBtn = document.getElementById('addGroupBtn');
    const deleteGroupBtn = document.getElementById('deleteGroupBtn');
    const editGroupBtn = document.getElementById('editGroupBtn');
    const addGroupForm = document.getElementById('addGroupForm');
    const editGroupForm = document.getElementById('editGroupForm');
    
    if (!groupSelect) return;
    
    // Update delete button visibility on group change
    function updateDeleteButtonVisibility() {
        const selectedGroupId = parseInt(groupSelect.value);
        
        // Never allow deleting the default group (id = 1)
        if (selectedGroupId === 1) {
            deleteGroupBtn.style.display = 'none';
            return;
        }
        
        // Check if group is empty
        checkGroupEmpty(selectedGroupId).then(isEmpty => {
            deleteGroupBtn.style.display = isEmpty ? 'inline-block' : 'none';
        });
    }
    
    // Check if a group is empty
    async function checkGroupEmpty(groupId) {
        try {
            const response = await fetch('/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=check_group_empty&group_id=${groupId}`
            });
            
            const data = await response.json();
            return data.isEmpty || false;
        } catch (error) {
            console.error('Error checking group empty status:', error);
            return false;
        }
    }
    
    // Update delete button visibility on page load (group change handler is in initializeGroupSelector)
    updateDeleteButtonVisibility();
    // Note: group change listener moved to initializeGroupSelector to prevent conflicts
    
    // Add group button click
    if (addGroupBtn) {
        addGroupBtn.addEventListener('click', function() {
            const modal = new bootstrap.Modal(document.getElementById('addGroupModal'));
            document.getElementById('newGroupName').value = '';
            modal.show();
        });
    }
    
    // Edit group button click
    if (editGroupBtn) {
        editGroupBtn.addEventListener('click', function() {
            const selectedOption = groupSelect.options[groupSelect.selectedIndex];
            const groupId = groupSelect.value;
            const groupName = selectedOption.dataset.name || selectedOption.textContent;
            
            document.getElementById('editGroupId').value = groupId;
            document.getElementById('editGroupName').value = groupName;
            
            const modal = new bootstrap.Modal(document.getElementById('editGroupModal'));
            modal.show();
        });
    }
    
    // Delete group button click
    if (deleteGroupBtn) {
        deleteGroupBtn.addEventListener('click', async function() {
            const selectedOption = groupSelect.options[groupSelect.selectedIndex];
            const groupId = groupSelect.value;
            const groupName = selectedOption.dataset.name || selectedOption.textContent;
            
            if (!confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
                return;
            }
            
            try {
                const response = await fetch('/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `action=delete_group&group_id=${groupId}`
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Group deleted successfully!', 'success');
                    
                    // Remove from dropdown
                    selectedOption.remove();
                    
                    // Select the default group
                    groupSelect.value = '1';
                    groupSelect.dispatchEvent(new Event('change'));
                    
                    // Reload the table
                    loadTablePage(1);
                } else {
                    showAlert(data.error || 'Failed to delete group', 'danger');
                }
            } catch (error) {
                console.error('Error deleting group:', error);
                showAlert('Error deleting group', 'danger');
            }
        });
    }
    
    // Handle add group form submission
    if (addGroupForm) {
        addGroupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/admin', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Group added successfully!', 'success');
                    
                    // Add to dropdown
                    const option = document.createElement('option');
                    option.value = data.groupId;
                    option.dataset.name = data.groupName;
                    option.textContent = data.groupName;
                    groupSelect.appendChild(option);
                    
                    // Select the new group
                    groupSelect.value = data.groupId;
                    groupSelect.dispatchEvent(new Event('change'));
                    
                    // Close modal
                    bootstrap.Modal.getInstance(document.getElementById('addGroupModal')).hide();
                    
                    // Reload the table
                    loadTablePage(1);
                } else {
                    showAlert(data.error || 'Failed to add group', 'danger');
                }
            } catch (error) {
                console.error('Error adding group:', error);
                showAlert('Error adding group', 'danger');
            }
        });
    }
    
    // Handle edit group form submission
    if (editGroupForm) {
        editGroupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/admin', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Group renamed successfully!', 'success');
                    
                    // Update dropdown
                    const option = groupSelect.querySelector(`option[value="${data.groupId}"]`);
                    if (option) {
                        option.dataset.name = data.groupName;
                        option.textContent = data.groupName;
                    }
                    
                    // Close modal
                    bootstrap.Modal.getInstance(document.getElementById('editGroupModal')).hide();
                } else {
                    showAlert(data.error || 'Failed to rename group', 'danger');
                }
            } catch (error) {
                console.error('Error renaming group:', error);
                showAlert('Error renaming group', 'danger');
            }
        });
    }
}