<?php
require_once __DIR__ . '/_banalytiq/banalytiq.php';
record_visit();
?>

<!DOCTYPE HTML>
<html>
<head>
	<title>EMRAH DIRIL</title>
	<meta name="robots" content="noarchive">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <link rel="canonical" href="https://emrahdiril.com" />
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
			background-color: #0a0a0a;
			color: #e6c08a;
			line-height: 1.4;
			margin: 0;
			padding: 0;
		}

		.container {
			margin: 36px auto 0 auto;
			width: 800px;
			max-width: 90%;
			padding: 0 20px;
		}

		h1 {
			font-size: 3.5rem;
			color: #e6c08a;
			font-weight: 600;
			font-variant: small-caps;
			margin: 0;
			line-height: 1;
		}

		.social-links {
			display: flex;
			gap: 8px;
			margin-bottom: 50px;
			display: flex;
			align-items: flex-end;
		}

		.social-links a {
			font-size: 1.5rem;
			text-decoration: none;
			display: inline-block;
			transition: transform 0.2s ease;
		}

		.social-links a:hover {
			transform: scale(1.2);
			text-decoration: none;
		}

		h2 {
			font-size: 1.85rem;
			color: #e6c08a;
			font-weight: 500;
			text-shadow: 0 0 20px rgba(230, 192, 138, 0.6);
            margin: 0;
		}

		ul {
			list-style-type: none;
			padding: 0;
		}

		li {
			margin-bottom: 16px;
		}

		li p {
			margin: 0;
			font-size: 1.1rem;
			color: #9a8260;
			font-weight: 400;
		}

		a {
			color: #d4a574;
			text-decoration: none;
		}

		a:hover {
			color: #e6c08a;
			text-decoration: underline;
		}

		footer {
			text-align: center;
			margin-top: 90px;
			margin-bottom: 40px;
		}

		footer p {
			color: #9a8260;
		}

		footer a {
			color: #d4a574;
			margin: 0 8px;
			text-decoration: none;
		}

		footer a:hover {
			color: #e6c08a;
		}

		.footer-img {
			width:178px; 
			height:178px; 
			display: block; 
			margin: 0 auto; 
			border: 1px solid #999; 
			border-radius: 6px;
		}

		/* Mobile styles */
		@media (max-width: 768px) {
			.container {
				margin: 20px auto 0 auto;
				padding: 0 15px;
			}

			h1 {
				font-size: 2.2rem;
			}

			h2 {
				font-size: 1.5rem;
			}

			li {
				margin-bottom: 18px;
			}

			li p {
				font-size: 1rem;
			}

			footer {
				margin-top: 60px;
				margin-bottom: 30px;
			}

			.footer-img {
				width: 140px;
				height: 140px;
			}

			footer a {
				margin: 0 4px;
				font-size: 0.9rem;
			}
		}

		@media (max-width: 480px) {
			h1 {
				font-size: 1.8rem;
			}

			h2 {
				font-size: 1.3rem;
			}

			li p {
				font-size: 0.95rem;
			}

			.footer-img {
				width: 120px;
				height: 120px;
			}
		}
	</style>
</head>
<body>

<div class="container">
	<h1><a href="https://emrahdiril.com">Emrah Diril</a></h1>
	<div class="social-links">
		<a href="http://x.com/emrahdma" title="X (Twitter)">𝕏</a>
		<a href="http://linkedin.com/in/ediril" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
		<a href="http://github.com/ediril" title="GitHub"><i class="fab fa-github"></i></a>
        <a href="https://instagram.com/emrahdiril" title="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="https://emrahdiril.com/notes" title="My Notes"><i class="fa fa-file"></i></a>
	</div>

	<h2>PROJECTS</h2>
    <h3>
        <ul>
        <li><a href="https://artlovershub.com">Art Lovers Hub</a>
			<p>Showcasing beautiful art and creative moments</p>
		</li>
        <li><a href="https://bingeworthyshows.tv">Binge-Worthy Shows</a> <a href="https://github.com/ediril/binge-worthy-public"><i class="fab fa-github"></i></a>
			<p>A curated list of binge-worthy shows on YouTube</p>
		</li>
        <li><a href="https://founderfodder.com">FounderFodder</a>
			<p>Inspiration for founders, makers and tinkerers</p>
		</li>
		<li><a href="https://emrahdiril.com/chatgpt2pdf">ChatGPT Conversation Exporter</a>
			<p>Save and print your ChatGPT conversations as clean PDFs</p>
		</li>
		<li><a href="https://banalytiq.com">Banalytiq</a> <a href="https://github.com/ediril/banalytiq"><i class="fab fa-github"></i></a>
			<p>A simple yet sufficient server-side analytics library</p>
		</li>
		<li><a href="https://emrahdiril.com/scrubbler">Scrubbler</a>
			<p>A special video player that makes it easier to learn piano pieces via synesthesia videos on YouTube</p>
		</li>
		<li><i class="fab fa-instagram"></i> <a href="https://instagram.com/dream_vistas.art"> dream_vistas.art</a>
			<p>"The Dreamtress creates surreal, natured-inspired dreams infused with psychotropic wonder for all"</p>
			<p>-- Surrealist dream-like art inspired by nature and psychotropia</p>
		</li>
        <li><a href="https://reddswan.com">ReddSwan</a>
			<p>Pros don't use GMail</p>
		</li>
        <li>Traqen</a>
			<p>Track anything</p>
		</li>
	</ul></h3>

	<footer class="footer">
		<img src="_img/emrah.jpg" class="footer-img">
		<p style="margin-bottom: 4px;">Sometimes I believe as many as six impossible things before breakfast</p>
	</footer>
</div>		

</body>
</html>
