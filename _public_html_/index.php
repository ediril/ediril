<?php
require_once 'common.php';
require_once 'gallery/images.php';
?>

<!DOCTYPE HTML>
<html>
<?php
$pageTitle = 'EMRAH DIRIL';
$canonicalUrl = 'https://emrahdiril.com';
include '_partials/head.php';
?>
<body>

<div class="container">
	<?php include '_partials/header.php'; ?>

    <div class="p-4 mb-5">
        <h2 class="mb-3">RECENT NOTES</h2>
		<div class="mb-0">
            <?php
            $notes = getRecentNotes(4);

            if (empty($notes)) {
                echo '<p class="empty-state">Notes coming soon...</p>';
            } else {
                echo '<ul class="list-unstyled">';
                foreach ($notes as $note) {
                    echo '<li class="note-item" id="' . htmlspecialchars($note['id']) . '">';
                    echo '<a href="' . htmlspecialchars($note['url']) . '">' . htmlspecialchars($note['title']) . '</a>';

                    // Display date
                    echo '<div class="note-date fs-6">' . htmlspecialchars($note['date']) . '</div>';

                    // Display excerpt if available
                    if (!empty($note['excerpt'])) {
                        echo '<p class="note-excerpt">' . htmlspecialchars($note['excerpt']) . '</p>';
                    }

                    echo '</li>';
                }
                echo '</ul>';
            }
            ?>
		</div>
        <div class="d-flex align-items-baseline">
			<a class="fs-4" href="/notes">See All</a>
		</div>
	</div>

	<?php
	$galleryGroups = gallery_groups();
	$galleryFolder = array_key_first($galleryGroups);
	?>
	<?php if ($galleryFolder !== null): ?>
	<div class="p-4 mb-5">
		<h2 class="mb-3">GALLERY</h2>
		<div class="gallery-strip mb-3">
			<?php foreach (array_slice($galleryGroups[$galleryFolder], 0, 4) as $file): ?>
			<a href="/gallery/<?php echo htmlspecialchars(gallery_page_path($galleryFolder, $file)); ?>">
				<img src="/gallery/<?php echo htmlspecialchars(gallery_image_path($galleryFolder, $file)); ?>" alt="<?php echo htmlspecialchars(pathinfo($file, PATHINFO_FILENAME)); ?>" loading="lazy">
			</a>
			<?php endforeach; ?>
		</div>
		<div class="d-flex align-items-baseline">
			<a class="fs-4" href="/gallery/">See All</a>
		</div>
	</div>
	<?php endif; ?>

	<div class="p-4 mb-4">
        <h2 class="mb-3">PROJECTS</h2>
		<div class="mb-0">
			<ul class="list-unstyled">
			<?php
			$recentProjects = getProjects();
			foreach ($recentProjects as $project) {
				echo '<li id="' . htmlspecialchars($project['id']) . '">';

				// Projects still in private development may not have a public URL yet.
				if (!empty($project['url'])) {
					echo '<a href="' . htmlspecialchars($project['url']) . '">' . htmlspecialchars($project['name']) . '</a>';
				} else {
					echo '<span class="project-name">' . htmlspecialchars($project['name']) . '</span>';
				}
				
				// Add GitHub link if available
				if (isset($project['github_url']) && !empty($project['github_url'])) {
					echo ' <a href="' . htmlspecialchars($project['github_url']) . '"><i class="fab fa-github"></i></a>';
				}
				
				// Add Instagram link if available
				if (isset($project['instagram_url']) && !empty($project['instagram_url'])) {
					echo ' <a href="' . htmlspecialchars($project['instagram_url']) . '"><i class="fab fa-instagram"></i></a>';
				}
				
				echo '<p>' . htmlspecialchars($project['description']) . '</p>';
				echo '</li>';
			}
			?>
			</ul>
		</div>
	</div>

	<?php include '_partials/footer.php'; ?>
</div>		
</body>
</html>
