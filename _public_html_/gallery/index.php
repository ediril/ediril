<?php
// Each folder in static/ is a gallery tab; images sort by filename in reverse natural order (206_… before 10_… before 2_…).

const IMAGES_PER_PAGE = 9;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

define('BASE', rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/');

function escape_html($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

function get_asset_url($asset_path) {
    return BASE . 'static/' . $asset_path . '?v=' . filemtime(__DIR__ . '/static/' . $asset_path);
}

function group_label($folder) {
    return ucwords(str_replace(['-', '_'], ' ', $folder));
}

function load_groups() {
    $groups = [];
    foreach (glob(__DIR__ . '/static/*', GLOB_ONLYDIR) as $dir) {
        $files = array_filter(scandir($dir), fn($file) => $file[0] !== '.'
            && in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), IMAGE_EXTENSIONS, true));
        usort($files, fn($a, $b) => strnatcasecmp($b, $a));
        if ($files) {
            $groups[basename($dir)] = array_map(fn($file) => [
                'src' => BASE . 'static/' . rawurlencode(basename($dir)) . '/' . rawurlencode($file),
                'alt' => pathinfo($file, PATHINFO_FILENAME),
            ], $files);
        }
    }
    return $groups;
}

$request_path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
if ($request_path === rtrim(BASE, '/')) {
    $query = parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY);
    header('Location: ' . BASE . ($query ? "?$query" : ''), true, 301);
    exit;
}
if ($request_path !== BASE && $request_path !== BASE . 'index.php') {
    http_response_code(404);
    $page_title = '404 - Page Not Found';
    include __DIR__ . '/templates/404.php';
    exit;
}

$groups = load_groups();
$default_group = array_key_first($groups);
$current_group = array_key_exists($_GET['g'] ?? '', $groups) ? $_GET['g'] : $default_group;
$group_images = $current_group === null ? [] : $groups[$current_group];

$total_pages = (int) ceil(count($group_images) / IMAGES_PER_PAGE);
$current_page = max(1, (int) ($_GET['page'] ?? 1));
$images = array_slice($group_images, ($current_page - 1) * IMAGES_PER_PAGE, IMAGES_PER_PAGE);

include __DIR__ . '/templates/index.php';
