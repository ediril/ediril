<?php
require_once __DIR__ . '/images.php';

const IMAGES_PER_PAGE = 9;

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

function grid_url($folder, $page) {
    $query = array_filter([
        'g' => $folder === DEFAULT_GROUP ? null : $folder,
        'page' => $page > 1 ? $page : null,
    ]);
    return BASE . ($query ? '?' . http_build_query($query) : '');
}

function redirect($url) {
    header("Location: $url", true, 301);
    exit;
}

function not_found() {
    http_response_code(404);
    $page_title = '404 - Page Not Found';
    include __DIR__ . '/templates/404.php';
    exit;
}

$request_path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
if ($request_path === rtrim(BASE, '/')) {
    $query = parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY);
    redirect(BASE . ($query ? "?$query" : ''));
}
if (!str_starts_with($request_path, BASE)) {
    not_found();
}
$segments = array_map('rawurldecode', explode('/', rtrim(substr($request_path, strlen(BASE)), '/')));

$groups = gallery_groups();
define('DEFAULT_GROUP', array_key_first($groups));

if ($segments === [''] || $segments === ['index.php']) {
    $current_group = array_key_exists($_GET['g'] ?? '', $groups) ? $_GET['g'] : DEFAULT_GROUP;
    $group_files = $current_group === null ? [] : $groups[$current_group];

    $total_pages = (int) ceil(count($group_files) / IMAGES_PER_PAGE);
    $current_page = max(1, (int) ($_GET['page'] ?? 1));
    $images = array_map(fn($file) => [
        'src' => BASE . gallery_image_path($current_group, $file),
        'href' => BASE . gallery_page_path($current_group, $file),
        'alt' => pathinfo($file, PATHINFO_FILENAME),
        'flipped' => gallery_is_flipped($file),
    ], array_slice($group_files, ($current_page - 1) * IMAGES_PER_PAGE, IMAGES_PER_PAGE));

    include __DIR__ . '/templates/index.php';
    exit;
}

if (!isset($groups[$segments[0]])) {
    not_found();
}
$folder = $segments[0];
$files = $groups[$folder];

if (count($segments) === 1) {
    redirect(grid_url($folder, 1));
}

$index = count($segments) === 2
    ? array_search($segments[1], array_map(fn($file) => pathinfo($file, PATHINFO_FILENAME), $files), true)
    : false;
if ($index === false) {
    not_found();
}

$file = $files[$index];
$image = [
    'src' => BASE . gallery_image_path($folder, $file),
    'alt' => pathinfo($file, PATHINFO_FILENAME),
    'flipped' => gallery_is_flipped($file),
    'position' => $index + 1,
    'count' => count($files),
];
[$image['width'], $image['height']] = getimagesize(__DIR__ . "/static/$folder/$file") ?: [1, 1];

$prev_url = isset($files[$index - 1]) ? BASE . gallery_page_path($folder, $files[$index - 1]) : null;
$next_url = isset($files[$index + 1]) ? BASE . gallery_page_path($folder, $files[$index + 1]) : null;
$next_image_src = isset($files[$index + 1]) ? BASE . gallery_image_path($folder, $files[$index + 1]) : null;
$back_url = grid_url($folder, intdiv($index, IMAGES_PER_PAGE) + 1);

$page_title = group_label($folder);
$origin = (($_SERVER['HTTPS'] ?? 'off') !== 'off' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
$og = [
    'title' => "$page_title - Gallery",
    'url' => $origin . BASE . gallery_page_path($folder, $file),
    'image' => $origin . $image['src'],
];

include __DIR__ . '/templates/image.php';
