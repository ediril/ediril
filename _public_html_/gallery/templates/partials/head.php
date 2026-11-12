<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <title><?php echo !empty($page_title) ? $page_title . ' - Gallery' : 'Gallery'; ?></title>
    <?php if (isset($og)): ?>
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?php echo escape_html($og['title']); ?>">
    <meta property="og:url" content="<?php echo escape_html($og['url']); ?>">
    <meta property="og:image" content="<?php echo escape_html($og['image']); ?>">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" href="<?php echo escape_html($og['url']); ?>">
    <?php endif; ?>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<?php echo get_asset_url('styles.css'); ?>">
</head>
<body>