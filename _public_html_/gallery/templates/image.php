<?php include 'partials/head.php'; ?>

<header class="image-bar">
    <a class="image-bar__back" href="<?php echo escape_html($back_url); ?>" data-nav="back">
        <i class="fas fa-arrow-left me-2"></i>Gallery &middot; <?php echo escape_html($page_title); ?>
    </a>
    <span class="image-bar__position"><?php echo $image['position']; ?> / <?php echo $image['count']; ?></span>
</header>

<main class="image-stage">
    <?php if ($prev_url): ?>
        <a class="image-stage__nav" href="<?php echo escape_html($prev_url); ?>" rel="prev" data-nav="prev" aria-label="Previous image">
            <i class="fas fa-chevron-left"></i>
        </a>
    <?php else: ?>
        <span class="image-stage__nav disabled" aria-hidden="true"><i class="fas fa-chevron-left"></i></span>
    <?php endif; ?>

    <img class="image-stage__image<?php echo $image['flipped'] ? ' is-flipped' : ''; ?>"
         src="<?php echo escape_html($image['src']); ?>"
         alt="<?php echo escape_html($image['alt']); ?>"
         width="<?php echo $image['width']; ?>"
         height="<?php echo $image['height']; ?>"
         style="width: min(100%, calc((100svh - 5.5rem) * <?php echo $image['width'] / $image['height']; ?>));">

    <?php if ($next_url): ?>
        <a class="image-stage__nav" href="<?php echo escape_html($next_url); ?>" rel="next" data-nav="next" aria-label="Next image">
            <i class="fas fa-chevron-right"></i>
        </a>
    <?php else: ?>
        <span class="image-stage__nav disabled" aria-hidden="true"><i class="fas fa-chevron-right"></i></span>
    <?php endif; ?>
</main>

<?php if ($next_image_src): ?>
<link rel="prefetch" href="<?php echo escape_html($next_image_src); ?>" as="image">
<?php endif; ?>

<?php include 'partials/footer.php'; ?>
