<?php
include 'partials/head.php';
include 'partials/header.php';
?>

<main class="main-content">
    <div class="container image-page">
        <a class="image-page__back" href="<?php echo escape_html($back_url); ?>" data-nav="back">
            <i class="fas fa-arrow-left me-2"></i><?php echo escape_html($page_title); ?>
        </a>

        <figure class="image-page__figure">
            <img class="image-page__image"
                 src="<?php echo escape_html($image['src']); ?>"
                 alt="<?php echo escape_html($image['alt']); ?>"
                 width="<?php echo $image['width']; ?>"
                 height="<?php echo $image['height']; ?>"
                 style="width: min(100%, calc((100svh - 15rem) * <?php echo $image['width'] / $image['height']; ?>));">
        </figure>

        <nav class="image-nav" aria-label="Image navigation">
            <?php if ($prev_url): ?>
                <a class="btn btn-outline-secondary" href="<?php echo escape_html($prev_url); ?>" rel="prev" data-nav="prev">
                    <i class="fas fa-chevron-left me-1"></i>Previous
                </a>
            <?php else: ?>
                <span class="btn btn-outline-secondary disabled" aria-disabled="true"><i class="fas fa-chevron-left me-1"></i>Previous</span>
            <?php endif; ?>

            <span class="image-nav__position text-muted"><?php echo $image['position']; ?> / <?php echo $image['count']; ?></span>

            <?php if ($next_url): ?>
                <a class="btn btn-outline-secondary" href="<?php echo escape_html($next_url); ?>" rel="next" data-nav="next">
                    Next<i class="fas fa-chevron-right ms-1"></i>
                </a>
            <?php else: ?>
                <span class="btn btn-outline-secondary disabled" aria-disabled="true">Next<i class="fas fa-chevron-right ms-1"></i></span>
            <?php endif; ?>
        </nav>
    </div>
</main>

<?php if ($next_image_src): ?>
<link rel="prefetch" href="<?php echo escape_html($next_image_src); ?>" as="image">
<?php endif; ?>

<?php include 'partials/footer.php'; ?>
