<?php
include 'partials/head.php';
?>

<body class="bg-dark text-light">
    <style>
        /* Better contrast for form elements in dark theme */
        .form-control.bg-dark {
            background-color: #1a1a1a !important;
        }
        .form-control.bg-dark:focus {
            background-color: #2a2a2a !important;
            border-color: #0d6efd;
        }
        .form-select {
            background-color: #1a1a1a !important;
            color: #fff !important;
        }
        .form-select:focus {
            background-color: #2a2a2a !important;
            border-color: #0d6efd;
        }
        /* Better visibility for cards */
        .card.bg-dark {
            background-color: #1a1a1a !important;
        }
        /* Improve drop zone visibility */
        #dropZone {
            background-color: #0f0f0f !important;
        }
        #dropZone:hover {
            background-color: #1a1a1a !important;
        }
        /* Better table contrast */
        .table-dark {
            background-color: #1a1a1a !important;
        }
        /* Prevent scroll restoration while we handle it manually */
        html {
            scroll-behavior: auto;
        }
        /* Prevent focus-related scrolling */
        #groupSelect:focus {
            scroll-margin: 0;
        }
        /* Prevent any automatic scrolling */
        * {
            scroll-behavior: auto !important;
        }
    </style>
    <!-- Admin Header -->
    <nav class="navbar navbar-dark bg-primary mb-4 px-3">
        <div class="container-fluid">
            <a class="navbar-brand" href="/admin">
                <i class="fas fa-cog me-2"></i>Admin Panel
            </a>
            <div class="navbar-nav">
                <a class="nav-link" href="/" target="_blank">
                    <i class="fas fa-external-link-alt me-1"></i>View Site
                </a>
            </div>
        </div>
    </nav>

    <div class="container-fluid px-4">
        <!-- Success/Error Messages -->
        <?php if (isset($_GET['success'])): ?>
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <?php if ($_GET['success'] === 'uploaded'): ?>
                    <?php 
                    $message = $_GET['message'] ?? 'Image uploaded successfully!';
                    echo '<i class="fas fa-check-circle me-2"></i>' . escape_html($message);
                    ?>
                <?php elseif ($_GET['success'] === 'updated'): ?>
                    <i class="fas fa-check-circle me-2"></i>Image updated successfully!
                <?php elseif ($_GET['success'] === 'deleted'): ?>
                    <i class="fas fa-check-circle me-2"></i>Image deleted successfully!
                <?php endif; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <!-- Group Selector Section -->
        <div class="row mb-5">
            <div class="col-12">
                <div class="d-flex align-items-center gap-2 bg-dark p-3 border border-light rounded">
                    <label for="groupSelect" class="form-label mb-0 me-2 text-light">Group:</label>
                    <select class="form-select form-select-sm text-light border-light me-2" id="groupSelect" 
                            style="width: auto; min-width: 200px; background-color: #2a2a2a; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 4 5%22><path fill=%22%23ffffff%22 d=%22M2 0L0 2h4zm0 5L0 3h4z%22/></svg>');">
                        <?php foreach ($all_groups as $group): ?>
                            <option value="<?php echo $group['id']; ?>" data-name="<?php echo escape_html($group['name']); ?>" <?php echo ($group['id'] == $current_group_id) ? 'selected' : ''; ?>><?php echo escape_html($group['name']); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <button type="button" class="btn btn-success btn-sm me-1" id="addGroupBtn" title="Add new group">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button type="button" class="btn btn-danger btn-sm me-1" id="deleteGroupBtn" title="Delete group" style="display: none;">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button type="button" class="btn btn-info btn-sm" id="editGroupBtn" title="Edit group name">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Upload Image Section -->
        <div class="row mb-5">
            <div class="col-12">
                <div class="card bg-dark border-light">
                    <div class="card-header bg-dark text-light border-light">
                        <h5 class="card-title mb-0">Upload New Image(s)</h5>
                    </div>
                    <div class="card-body">
                        <form id="uploadForm" method="POST" enctype="multipart/form-data" class="needs-validation" novalidate>
                            <input type="hidden" name="action" value="upload_image">
                            <input type="hidden" name="file_path" id="file_path" value="">
                            
                            <!-- Combined Drag & Drop + Queue Area -->
                            <div class="mb-3">
                                <div id="dropZone" class="card bg-dark border-light border-2 border-dashed position-relative" 
                                     style="min-height: 300px;">
                                    <div class="card-header bg-dark text-light border-light">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <h6 class="card-title mb-0">
                                                <i class="fas fa-cloud-upload-alt me-2"></i>Drop files here (<span id="queueCount">0</span> files)
                                            </h6>
                                            <div class="d-flex gap-2 align-items-center">
                                                <button type="button" class="btn btn-sm btn-light browse-btn">
                                                    <i class="fas fa-folder-open me-1"></i>Browse
                                                </button>
                                                <button type="button" class="btn btn-sm btn-warning clear-queue-btn" id="clearQueueBtn" style="display: none;">
                                                    <i class="fas fa-trash me-1"></i>Clear
                                                </button>
                                                <button type="submit" class="btn btn-sm btn-success" id="uploadBtn" disabled>
                                                    <i class="fas fa-upload me-1"></i>Upload
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <!-- Empty State (shown when no files) -->
                                        <div id="emptyDropState" class="text-center py-4">
                                            <i class="fas fa-images fa-3x text-light mb-3"></i>
                                            <p class="mb-2 text-light"><strong>Drag & drop your images here</strong></p>
                                            <p class="text-light mt-3 mb-0">
                                                <small>All images converted to JPG and compressed to ≤80KB | Supported: JPG, PNG, GIF, WebP, BMP</small>
                                            </p>
                                        </div>
                                        <!-- File List (shown when files are added) -->
                                        <div id="fileList"></div>
                                    </div>
                                    <input type="file" id="imageFile" name="image_file" accept="image/*" multiple
                                           class="d-none">
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- All Images Table -->
        <div class="row">
            <div class="col-12">
                <div class="card bg-dark border-light">
                    <div class="card-header bg-dark text-light border-light d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-images me-2"></i>All Images
                        </h5>
                        <div class="text-center flex-grow-1">
                            <span id="tableRangeInfo" class="text-light">
                                <?php if ($images_pagination['total_items'] > 0): ?>
                                    Showing <?php echo (($images_pagination['current_page'] - 1) * $images_pagination['per_page'] + 1); ?>-<?php echo min($images_pagination['current_page'] * $images_pagination['per_page'], $images_pagination['total_items']); ?> of <?php echo $images_pagination['total_items']; ?> images
                                <?php else: ?>
                                    No images
                                <?php endif; ?>
                            </span>
                        </div>
                        <?php if ($images_pagination['total_pages'] > 1): ?>
                            <div class="d-flex align-items-center">
                                <select class="form-select form-select-sm" id="pageSelect" style="width: auto;">
                                    <?php for ($i = 1; $i <= $images_pagination['total_pages']; $i++): ?>
                                        <option value="<?php echo $i; ?>"<?php echo ($i === $images_pagination['current_page']) ? ' selected' : ''; ?>>
                                            Page <?php echo $i; ?> of <?php echo $images_pagination['total_pages']; ?>
                                        </option>
                                    <?php endfor; ?>
                                </select>
                            </div>
                        <?php endif; ?>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <?php echo render_images_admin_table($all_images, $images_pagination); ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Image Modal -->
    <div class="modal fade" id="editImageModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark border-light">
                <div class="modal-header border-light">
                    <h5 class="modal-title text-light">Edit Image</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <form id="editImageForm" method="POST">
                    <input type="hidden" name="action" value="edit_image">
                    <input type="hidden" name="image_id" id="editImageId">
                    
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="editCaption" class="form-label text-light">Caption</label>
                            <textarea class="form-control bg-dark text-light border-light" 
                                      id="editCaption" name="caption" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="editPublishedDate" class="form-label text-light">Published Date</label>
                            <input type="datetime-local" class="form-control bg-dark text-light border-light" 
                                   id="editPublishedDate" name="published_at">
                        </div>
                    </div>
                    
                    <div class="modal-footer border-light">
                        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Add Group Modal -->
    <div class="modal fade" id="addGroupModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark border-light">
                <div class="modal-header border-light">
                    <h5 class="modal-title text-light">Add New Group</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <form id="addGroupForm" method="POST">
                    <input type="hidden" name="action" value="add_group">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="newGroupName" class="form-label text-light">Group Name</label>
                            <input type="text" class="form-control bg-dark text-light border-light" 
                                   id="newGroupName" name="group_name" required>
                        </div>
                    </div>
                    <div class="modal-footer border-light">
                        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success">Add Group</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Edit Group Modal -->
    <div class="modal fade" id="editGroupModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark border-light">
                <div class="modal-header border-light">
                    <h5 class="modal-title text-light">Edit Group Name</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <form id="editGroupForm" method="POST">
                    <input type="hidden" name="action" value="edit_group">
                    <input type="hidden" name="group_id" id="editGroupId">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="editGroupName" class="form-label text-light">Group Name</label>
                            <input type="text" class="form-control bg-dark text-light border-light" 
                                   id="editGroupName" name="group_name" required>
                        </div>
                    </div>
                    <div class="modal-footer border-light">
                        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Bootstrap JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Admin JavaScript -->
    <script src="<?php echo get_asset_url('admin.js'); ?>"></script>
</body>
</html>