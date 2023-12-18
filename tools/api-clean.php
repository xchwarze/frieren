<?php

error_reporting(E_ALL);

if (!isset($argv[1]) || !isset($argv[2])) {
    echo "Usage: php api-clean.php [source_directory] [destination_directory]\n";
    exit(1);
}

$sourceDir = $argv[1];
$targetDir = $argv[2];
if (!file_exists($sourceDir) || !is_dir($sourceDir)) {
    echo "Source directory does not exist: $sourceDir\n";
    exit(1);
}

if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

function packer_strips($str) {
    $newStr = '';

    $commentTokens = [T_COMMENT];
    if (defined('T_DOC_COMMENT')) {
        $commentTokens[] = T_DOC_COMMENT;
    }

    $tokens = token_get_all($str);
    foreach ($tokens as $token) {
        if (is_array($token) && in_array($token[0], $commentTokens)) {
            continue;
        }

        $newStr .= is_array($token) ? $token[1] : $token;
    }

    $newStr = preg_replace('!/\*.*?\*/!s', '', $newStr);
    $newStr = preg_replace('/\n\s*\n/', "\n", $newStr);

    return $newStr;
}


function processPhpFiles($sourceDir, $targetDir) {
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($sourceDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($files as $file) {
        $targetPath = $targetDir . DIRECTORY_SEPARATOR . $files->getSubPathName();
        if (!is_dir(dirname($targetPath))) {
            mkdir(dirname($targetPath), 0777, true);
        }

        if ($file->getExtension() === 'php') {
            $content = file_get_contents($file->getRealPath());
            $newContent = packer_strips($content);
            file_put_contents($targetPath, $newContent);
        } else {
            copy($file->getRealPath(), $targetPath);
        }
    }
}

processPhpFiles($sourceDir, $targetDir);

echo "Processing complete.\n";
