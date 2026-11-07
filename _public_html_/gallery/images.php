<?php
// Shared by the gallery and the site's front page so both agree on which images exist and their order.

const GALLERY_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Each folder in static/ is a gallery tab. Returns folder => filenames in reverse natural order
// (206_… before 10_… before 2_…), folders alphabetical so the first one is the default tab.
function gallery_groups() {
    $groups = [];
    foreach (glob(__DIR__ . '/static/*', GLOB_ONLYDIR) as $dir) {
        $files = array_filter(scandir($dir), fn($file) => $file[0] !== '.'
            && in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), GALLERY_IMAGE_EXTENSIONS, true));
        usort($files, fn($a, $b) => strnatcasecmp($b, $a));
        if ($files) {
            $groups[basename($dir)] = $files;
        }
    }
    return $groups;
}

// URL path of an image relative to the gallery root.
function gallery_image_path($folder, $file) {
    return 'static/' . rawurlencode($folder) . '/' . rawurlencode($file);
}
