<?php
include 'partials/head.php';
include 'partials/header.php';
?>

<!-- Custom Tab Styling -->
<style>
.nav-pills .nav-link:not(.active):hover {
    background: rgba(255,255,255,0.2) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.nav-pills .nav-link.active:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(13,110,253,0.4);
}

.nav-pills .nav-link {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

/* Glassmorphism effect for tab container */
.nav-pills {
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255,255,255,0.1);
}
</style>

<!-- Main Content -->
<main class="main-content">
    <div class="container">
        <!-- Group Tabs (only show if more than one group has images) -->
        <?php if (count($groups) > 1): ?>
        <div class="mb-3">
            <ul class="nav nav-pills mx-auto" style="background: linear-gradient(135deg, rgba(13,110,253,0.1), rgba(220,53,69,0.1)); border-radius: 15px; padding: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: fit-content;">
                <?php foreach ($groups as $group_name => $group_items): ?>
                    <?php $is_active = ($group_name === $current_group); ?>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $is_active ? 'active' : ''; ?>" 
                           href="<?php echo escape_html(grid_url($group_name, 1)); ?>"
                           style="<?php if ($is_active): ?>
                                    background: linear-gradient(135deg, #0d6efd, #dc3545) !important; 
                                    color: white !important; 
                                    border: none !important;
                                  <?php else: ?>
                                    background: rgba(255,255,255,0.1) !important; 
                                    color: rgba(255,255,255,0.9) !important; 
                                    border: 1px solid rgba(255,255,255,0.2) !important;
                                  <?php endif; ?>
                                  border-radius: 10px !important; 
                                  font-weight: 500; 
                                  transition: all 0.3s ease; 
                                  margin: 2px;
                                  padding: 0.375rem 0.75rem;
                                  font-size: 0.875rem;">
                            <?php echo escape_html(group_label($group_name)); ?>
                            <span class="badge <?php echo $is_active ? 'bg-light text-dark' : 'bg-primary'; ?> ms-2" style="vertical-align: middle; font-size: 0.75rem;">
                                <?php echo count($group_items); ?>
                            </span>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
        <?php endif; ?>
        
        <!-- Image Grid -->
        <div class="row g-1 g-sm-3 my-3" id="imageGrid">
            <?php if (empty($images)): ?>
                <!-- Empty State -->
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="fas fa-images fa-5x text-muted mb-4"></i>
                        <h3 class="text-muted mb-3">No Images Yet</h3>
                    </div>
                </div>
            <?php else: ?>
                <?php foreach ($images as $image): ?>
                <div class="col-4">
                    <a class="grid-item" href="<?php echo escape_html($image['href']); ?>">
                        <div class="grid-item__wrapper">
                            <img src="<?php echo escape_html($image['src']); ?>"
                                 alt="<?php echo escape_html($image['alt']); ?>"
                                 class="grid-item__image">
                        </div>
                    </a>
                </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <!-- Show More Button -->
        <?php if ($current_page < $total_pages): ?>
        <div class="text-center mt-4 mb-5">
            <a id="showMoreBtn" class="btn btn-primary btn-lg px-5"
               href="<?php echo escape_html(grid_url($current_group, $current_page + 1)); ?>">Show More Art</a>
        </div>
        <?php endif; ?>
    </div>
</main>

<?php include 'partials/footer.php'; ?>