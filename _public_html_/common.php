<?php

// Configuration constants
define('NOTES_EXCERPT_LENGTH', 150);

/**
 * Build a clean excerpt from WordPress post content
 * @param string $content The post content
 * @param int $length Maximum length of the excerpt
 * @return string The excerpt
 */
function build_note_excerpt($content, $length = 150) {
    // Strip shortcodes and HTML tags using WordPress helpers if available,
    // otherwise fall back to basic HTML stripping.
    if (function_exists('strip_shortcodes')) {
        $content = strip_shortcodes($content);
    }
    if (function_exists('wp_strip_all_tags')) {
        $content = wp_strip_all_tags($content);
    } else {
        $content = strip_tags($content);
    }

    // Trim whitespace
    $content = trim($content);

    // Truncate to desired length
    if (strlen($content) > $length) {
        $content = substr($content, 0, $length);
        // Try to break at a word boundary
        $lastSpace = strrpos($content, ' ');
        if ($lastSpace !== false) {
            $content = substr($content, 0, $lastSpace);
        }
        $content .= '...';
    }

    return $content;
}

/**
 * Get projects from the projects.json file
 * @param int|null $limit Optional limit for number of projects to return. If null, returns all projects.
 * @return array Array of project objects, sorted by last_updated (newest first)
 */
function getProjects($limit = null) {
    $jsonPath = __DIR__ . '/projects.json';
    
    if (!file_exists($jsonPath)) {
        error_log("Projects JSON file not found: $jsonPath");
        return [];
    }
    
    $jsonContent = file_get_contents($jsonPath);
    if ($jsonContent === false) {
        error_log("Failed to read projects JSON file: $jsonPath");
        return [];
    }
    
    $data = json_decode($jsonContent, true);
    if ($data === null) {
        error_log("Failed to decode projects JSON: " . json_last_error_msg());
        return [];
    }
    
    $projects = $data['projects'] ?? [];
    
    if (empty($projects)) {
        return [];
    }
    
    // Separate projects with and without last_updated dates
    $projectsWithDates = [];
    $projectsWithoutDates = [];
    
    foreach ($projects as $project) {
        if ($project['last_updated'] === null) {
            $projectsWithoutDates[] = $project;
        } else {
            $projectsWithDates[] = $project;
        }
    }
    
    // Sort projects with dates by last_updated (newest first)
    usort($projectsWithDates, function($a, $b) {
        return strcmp($b['last_updated'], $a['last_updated']); // Descending order
    });
    
    // If limit is specified, only return projects with dates (skip null ones)
    if ($limit !== null) {
        return array_slice($projectsWithDates, 0, $limit);
    }
    
    // For all projects, return dated projects first, then undated projects at bottom
    return array_merge($projectsWithDates, $projectsWithoutDates);
}


function getRecentNotes($limit = 3) {
    $notes = [];

    // Fetch recent posts via the WordPress REST API to avoid
    // booting the full WordPress stack in-process.
    $limit = (int) $limit;
    if ($limit <= 0) {
        $limit = 3;
    }

    $apiUrl = 'https://emrahdiril.com/notes/wp-json/wp/v2/posts'
        . '?per_page=' . $limit
        . '&_fields=id,link,title,excerpt,date';

    $response = @file_get_contents($apiUrl);
    if ($response === false) {
        error_log("Failed to fetch recent notes from REST API: $apiUrl");
        return $notes;
    }

    $posts = json_decode($response, true);
    if (!is_array($posts)) {
        error_log("Failed to decode REST API response for recent notes");
        return $notes;
    }

    foreach ($posts as $post) {
        $rawTitle = $post['title']['rendered'] ?? '';
        $rawExcerpt = $post['excerpt']['rendered'] ?? '';
        $rawDate = $post['date'] ?? null;

        $title = html_entity_decode($rawTitle, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $excerpt = html_entity_decode(
            build_note_excerpt($rawExcerpt, NOTES_EXCERPT_LENGTH),
            ENT_QUOTES | ENT_HTML5,
            'UTF-8'
        );

        $date = $rawDate ? date('M j, Y', strtotime($rawDate)) : '';

        $notes[] = [
            'id' => $post['id'] ?? null,
            'title' => $title,
            'url' => $post['link'] ?? '',
            'date' => $date,
            'excerpt' => $excerpt,
        ];
    }

    return $notes;
}

