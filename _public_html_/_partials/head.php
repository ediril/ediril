<?php
// Default values if not provided
$pageTitle = $pageTitle ?? 'EMRAH DIRIL';
$canonicalUrl = $canonicalUrl ?? 'https://emrahdiril.com';
?>
<head>
	<title><?php echo htmlspecialchars($pageTitle); ?></title>
	<meta name="robots" content="noarchive">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="canonical" href="<?php echo htmlspecialchars($canonicalUrl); ?>" />
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
    <?php $waitlist = new WaitlistComponent('_collectiq'); echo $waitlist->renderStyles(); ?>
	<link rel="stylesheet" href="style.css">
</head>