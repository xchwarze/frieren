<?php

namespace frieren\orm;

/**
 * Simple ORM class for handling database operations with SQLite.
 */
class SQLite
{
    /**
     * @var \SQLite3 Instance of SQLite3 database.
     */
    private $db;

    /**
     * Constructor.
     * 
     * @param string $databasePath Path to the SQLite database file.
     * @param bool $enableExceptions Flag to enable or disable SQLite3 exceptions.
     */
    public function __construct($databasePath, bool $enableExceptions = true)
    {
        $this->db = new \SQLite3($databasePath);
        $this->db->busyTimeout(20000);
        $this->db->enableExceptions($enableExceptions);
    }

    /**
     * Destructor. Closes the database connection.
     */
    public function __destruct()
    {
        if ($this->db) {
            $this->db->close();
        }
    }

    /**
     * Executes a SELECT query and returns the results.
     *
     * @param string $sql SQL query string.
     * @param array $params Parameters for the SQL query.
     * @return array The result set as an associative array.
     */
    public function query(string $sql, array $params = []): array
    {
        $stmt = $this->db->prepare($sql);
        $this->bindParams($stmt, $params);
        $result = $stmt->execute();

        $data = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $data[] = $row;
        }

        return $data;
    }

    /**
     * Executes an INSERT, UPDATE, or DELETE query.
     *
     * @param string $sql SQL query string.
     * @param array $params Parameters for the SQL query.
     * @return bool True on success, false on failure.
     */
    public function exec(string $sql, array $params = []): bool
    {
        $stmt = $this->db->prepare($sql);
        $this->bindParams($stmt, $params);

        return $stmt->execute() ? true : false;
    }

    /**
     * Binds parameters to a prepared statement.
     *
     * @param \SQLite3Stmt $stmt The SQLite3 statement object.
     * @param array $params Parameters to bind to the statement.
     */
    private function bindParams($stmt, array $params): void
    {
        foreach ($params as $i => $param) {
            $stmt->bindValue($i + 1, $param);
        }
    }

    /**
     * Finds a specific record based on conditions.
     *
     * @param string $table Table name.
     * @param array $conditions Conditions for the WHERE clause.
     * @param array $columns Columns to select.
     * @return array The fetched record.
     */
    public function find(string $table, array $conditions, array $columns = []): array
    {
        $columnString = $this->processColumns($columns);
        $whereClause = $this->buildWhereClause($conditions);
        $sql = "SELECT {$columnString} FROM {$table} {$whereClause}";

        $stmt = $this->db->prepare($sql);
        $this->bindParams($stmt, array_values($conditions));
        $result = $stmt->execute();

        return $result->fetchArray(SQLITE3_ASSOC) ?: [];
    }

    /**
     * Finds all records from a table.
     *
     * @param string $table Table name.
     * @param array $columns Columns to select.
     * @return array An array of records.
     */
    public function findAll(string $table, array $columns = []): array
    {
        $columnString = $this->processColumns($columns);
        $sql = "SELECT {$columnString} FROM {$table}";

        return $this->query($sql);
    }

    /**
     * Processes an array of columns into a string for SQL query.
     *
     * @param array $columns Array of column names.
     * @return string A string of column names for SQL query.
     */
    private function processColumns(array $columns): string
    {
        return empty($columns) ? '*' : implode(', ', $columns);
    }

    /**
     * Inserts a new record into a table.
     *
     * @param string $table Table name.
     * @param array $data Data to insert.
     * @return bool True on success, false on failure.
     */
    public function insert(string $table, array $data): bool
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";

        return $this->exec($sql, array_values($data));
    }

    /**
     * Updates records in a table based on conditions.
     *
     * @param string $table Table name.
     * @param array $data Data to update.
     * @param array $conditions Conditions for the WHERE clause.
     * @return bool True on success, false on failure.
     */
    public function update(string $table, array $data, array $conditions): bool
    {
        $setClause = implode(', ', array_map(function ($key) {
            return "{$key} = ?";
        }, array_keys($data)));
        $whereClause = $this->buildWhereClause($conditions);
        $sql = "UPDATE {$table} SET {$setClause} {$whereClause}";
        $params = array_merge(array_values($data), array_values($conditions));

        return $this->exec($sql, $params);
    }

    /**
     * Deletes records from a table based on conditions.
     *
     * @param string $table Table name.
     * @param array $conditions Conditions for the WHERE clause.
     * @return bool True on success, false on failure.
     */
    public function delete(string $table, array $conditions = []): bool
    {
        $whereClause = $this->buildWhereClause($conditions);
        $sql = "DELETE FROM {$table} {$whereClause}";

        return $this->exec($sql, array_values($conditions));
    }

    /**
     * Builds a WHERE clause from an array of conditions.
     *
     * @param array $conditions Conditions for the WHERE clause.
     * @return string The WHERE clause.
     */
    private function buildWhereClause(array $conditions): string
    {
        if (empty($conditions)) {
            return '';
        }

        return ' WHERE ' . implode(' AND ', array_map(function ($key) {
            return "{$key} = ?";
        }, array_keys($conditions)));
    }

    /**
     * Counts the number of rows in a table that meet specified conditions.
     *
     * @param string $table Name of the table.
     * @param array $conditions Associative array of conditions for the WHERE clause.
     * @return int The count of rows that match the conditions.
     */
    public function count(string $table, array $conditions): int
    {
        $whereClause = $this->buildWhereClause($conditions);
        $sql = "SELECT COUNT(*) FROM {$table} {$whereClause}";

        $stmt = $this->db->prepare($sql);
        $this->bindParams($stmt, array_values($conditions));
        $result = $stmt->execute();
        
        $row = $result->fetchArray();
        return (int) $row[0];
    }
}
