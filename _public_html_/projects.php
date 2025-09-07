<?php
require_once '_collectiq/component/WaitlistComponent.php';
require_once __DIR__ . '/_banalytiq/banalytiq.php';
require_once 'common.php';
record_visit();
?>

<!DOCTYPE HTML>
<html>
<?php
$pageTitle = 'EMRAH DIRIL - PROJECTS';
$canonicalUrl = 'https://emrahdiril.com/projects';
include '_partials/head.php';
?>
<body>

<div class="container">
	<?php include '_partials/header.php'; ?>

	<h2 class="mb-4">PROJECTS</h2>
	<div class="mb-5">
        <ul class="list-unstyled">
        <?php
        $allProjects = getProjects();
        foreach ($allProjects as $project) {
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

	<?php include '_partials/footer.php'; ?>
</div>		
</body>
</html>