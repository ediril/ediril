<?php
// Shared by the gallery and the site's front page so both agree on which images exist and their order.

const GALLERY_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Each folder in static/ is a gallery tab. Returns folder => filenames in reverse natural order
// (206_… before 10_… before 2_…), folders alphabetical so the first one is the default tab.
// An image's page URL is its filename without the extension, so files that differ only by extension
// (x.png next to x.jpg) are one image; the extension listed first in GALLERY_IMAGE_EXTENSIONS wins.
function gallery_groups() {
    $groups = [];
    foreach (glob(__DIR__ . '/static/*', GLOB_ONLYDIR) as $dir) {
        $by_name = [];
        foreach (scandir($dir) as $file) {
            $rank = array_search(strtolower(pathinfo($file, PATHINFO_EXTENSION)), GALLERY_IMAGE_EXTENSIONS, true);
            $name = pathinfo($file, PATHINFO_FILENAME);
            if ($file[0] !== '.' && $rank !== false && (!isset($by_name[$name]) || $rank < $by_name[$name]['rank'])) {
                $by_name[$name] = ['file' => $file, 'rank' => $rank];
            }
        }
        $files = array_column($by_name, 'file');
        usort($files, fn($a, $b) => strnatcasecmp($b, $a));
        if ($files) {
            $groups[basename($dir)] = $files;
        }
    }
    return $groups;
}

// URL path of an image file relative to the gallery root.
function gallery_image_path($folder, $file) {
    return 'static/' . rawurlencode($folder) . '/' . rawurlencode($file);
}

// About this share of images are shown mirrored, for variety. The filename decides, so an image is
// flipped the same way in the grid, on its page, on the front page, and on every visit.
const GALLERY_FLIP_PERCENT = 30;

function gallery_is_flipped($file) {
    return crc32(pathinfo($file, PATHINFO_FILENAME)) % 100 < GALLERY_FLIP_PERCENT;
}

// URL path of an image's own page relative to the gallery root, e.g. abstract/206_s0.77_7b530af9.
function gallery_page_path($folder, $file) {
    return rawurlencode($folder) . '/' . rawurlencode(pathinfo($file, PATHINFO_FILENAME));
}
