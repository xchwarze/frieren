<?php

/**
 * This script cleans up PHP files in a specified source directory by removing comments and 
 * unnecessary whitespace, then copies the cleaned files to a target directory.
 *
 * Usage: php api-clean.php [source_directory] [destination_directory]
 */

error_reporting(E_ALL);

// Validate command line arguments
if (!isset($argv[1]) || !isset($argv[2])) {
    echo "Usage: php api-clean.php [source_directory] [destination_directory]\n";
    exit(1);
}

$sourceDir = $argv[1];
$targetDir = $argv[2];

// Check if source directory exists
if (!file_exists($sourceDir) || !is_dir($sourceDir)) {
    echo "Source directory does not exist: $sourceDir\n";
    exit(1);
}

// Create target directory if it doesn't exist
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

/**
 * Removes comments and redundant whitespace from the provided PHP source code.
 *
 * @param string $str The PHP source code to clean.
 * @return string The cleaned PHP source code.
 */
function packer_strips($str) {
    $newStr = '';
    $commentTokens = [T_COMMENT];
    if (defined('T_DOC_COMMENT')) {
        $commentTokens[] = T_DOC_COMMENT; // Include PHPDoc comments
    }

    $tokens = token_get_all($str);
    foreach ($tokens as $token) {
        if (is_array($token) && in_array($token[0], $commentTokens)) {
            continue; // Skip comment tokens
        }

        $newStr .= is_array($token) ? $token[1] : $token;
    }

    // Remove block comments and extra blank lines
    $newStr = preg_replace('!/\*.*?\*/!s', '', $newStr);
    $newStr = preg_replace('/\n\s*\n/', "\n", $newStr);

    return $newStr;
}

/**
 * Processes all PHP files in the source directory, cleans them, and copies to the target directory.
 *
 * @param string $sourceDir The source directory path.
 * @param string $targetDir The target directory path.
 */
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

echo "Processing complete. All files have been cleaned and copied successfully.\n";