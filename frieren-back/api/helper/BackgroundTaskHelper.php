<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\helper;

/**
 * Standardizes the background task execution and polling pattern.
 * Manages flag files (completion markers) and log files (output capture)
 * in /tmp for background operations that are polled from the frontend.
 */
class BackgroundTaskHelper
{
    const FILE_PREFIX = 'task-';

    /**
     * Returns the flag file path for a given task name.
     *
     * @param string $taskName Unique identifier for the background task.
     * @return string Absolute path to the flag file in /tmp.
     */
    public static function getFlagPath($taskName)
    {
        return '/tmp/' . self::FILE_PREFIX . "{$taskName}.flag";
    }

    /**
     * Returns the log file path for a given task name.
     *
     * @param string $taskName Unique identifier for the background task.
     * @return string Absolute path to the log file in /tmp.
     */
    public static function getLogPath($taskName)
    {
        return '/tmp/' . self::FILE_PREFIX . "{$taskName}.log";
    }

    /**
     * Starts a background task with automatic output capture and completion flag.
     * Cleans previous task files before starting. The command's stdout and stderr
     * are captured to the log file, and the flag file is touched on completion
     * regardless of the command's exit status.
     *
     * @param string $taskName Unique identifier for the background task.
     * @param string $command Shell command to execute.
     */
    public static function start($taskName, $command)
    {
        $flagPath = self::getFlagPath($taskName);
        $logPath = self::getLogPath($taskName);

        @unlink($flagPath);
        @unlink($logPath);

        OpenWrtHelper::execBackground(
            "sh -c \"{$command}; touch {$flagPath}\"",
            "{$logPath} 2>&1"
        );
    }

    /**
     * Returns the current status of a background task.
     *
     * @param string $taskName Unique identifier for the background task.
     * @return array Associative array with 'completed' (bool) and 'output' (string).
     */
    public static function getStatus($taskName)
    {
        return [
            'completed' => file_exists(self::getFlagPath($taskName)),
            'output' => @file_get_contents(self::getLogPath($taskName)) ?: '',
        ];
    }

    /**
     * Returns whether a background task has completed.
     *
     * @param string $taskName Unique identifier for the background task.
     * @return bool True if the task's flag file exists.
     */
    public static function isCompleted($taskName)
    {
        return file_exists(self::getFlagPath($taskName));
    }

    /**
     * Returns whether a background task is currently running.
     * A task is running once its log file exists but the completion flag has not been set yet.
     *
     * @param string $taskName Unique identifier for the background task.
     * @return bool True if the task is in progress.
     */
    public static function isRunning($taskName)
    {
        return file_exists(self::getLogPath($taskName)) && !file_exists(self::getFlagPath($taskName));
    }

    /**
     * Removes flag and log files for a background task.
     *
     * @param string $taskName Unique identifier for the background task.
     */
    public static function cleanup($taskName)
    {
        @unlink(self::getFlagPath($taskName));
        @unlink(self::getLogPath($taskName));
    }
}
