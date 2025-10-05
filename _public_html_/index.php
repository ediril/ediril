<?php
require_once '_collectiq/component/WaitlistComponent.php';
require_once __DIR__ . '/_banalytiq/banalytiq.php';
require_once 'common.php';
record_visit();
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

	<div class="p-4 mb-4">
        <h2 class="mb-3">RECENT PROJECTS</h2>
		<div class="mb-0">
			<ul class="list-unstyled">
			<?php
			$recentProjects = getProjects(4);
			foreach ($recentProjects as $project) {
				echo '<li id="' . htmlspecialchars($project['id']) . '">';
				echo '<a href="' . htmlspecialchars($project['url']) . '">' . htmlspecialchars($project['name']) . '</a>';
				
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
        <div class="d-flex align-items-baseline mb-4">
			<a class="fs-4" href="projects.php">See All</a>
		</div>
	</div>

	<div class="p-4 mb-5">
        <h2 class="mb-3">RECENT NOTES</h2>
		<div class="mb-0">
			<ul class="list-unstyled">
			<?php
			$recentNotes = getNotes(4);
			foreach ($recentNotes as $note) {
				echo '<li id="' . htmlspecialchars($note['id']) . '">';
				echo '<a href="' . htmlspecialchars($note['url']) . '">' . htmlspecialchars($note['title']) . '</a>';
				
				// Display last updated date if available
				if ($note['last_updated']) {
					echo ' <span class="fs-6" style="color: #a0522d;">(' . htmlspecialchars($note['last_updated']) . ')</span>';
				}
				
				echo '</li>';
			}
			?>
			</ul>
		</div>
        <div class="d-flex align-items-baseline mb-4">
			<a class="fs-4" href="/notes">See All</a>
		</div>
	</div>

	<div class="d-flex justify-content-center my-5">
		<div class="email-form p-4 rounded">
			<h3 class="text-center mb-4">Let's keep in touch</h3>
            <?php echo $waitlist->renderForm('Enter your email address'); ?>
		</div>
	</div>

	<?php include '_partials/footer.php'; ?>
</div>		
    
    <?php echo $waitlist->renderScripts(); ?>
</body>
</html>
