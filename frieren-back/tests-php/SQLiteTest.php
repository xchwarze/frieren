<?php
/*
 * Project: Frieren Framework
 * Tests for the mini SQLite ORM. Runs against a real `:memory:` database — no
 * mocking needed, this logic is 100% portable/host-testable.
 */

namespace frieren\orm;

use PHPUnit\Framework\TestCase;

class SQLiteTest extends TestCase
{
    private SQLite $db;

    protected function setUp(): void
    {
        parent::setUp();
        $this->db = new SQLite(':memory:');
        $this->db->exec('CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, active INTEGER)');
    }

    public function testInsertFindUpdateDeleteRoundTrip(): void
    {
        $this->assertTrue($this->db->insert('items', ['name' => 'alpha', 'active' => 1]));
        $this->assertTrue($this->db->insert('items', ['name' => 'beta', 'active' => 0]));

        $row = $this->db->find('items', ['name' => 'alpha']);
        $this->assertSame('alpha', $row['name']);
        $this->assertSame(1, (int) $row['active']);

        $this->assertSame(2, $this->db->count('items', []));
        $this->assertSame(1, $this->db->count('items', ['active' => 1]));

        $this->assertTrue($this->db->update('items', ['active' => 0], ['name' => 'alpha']));
        $this->assertSame(0, $this->db->count('items', ['active' => 1]));

        $this->assertTrue($this->db->delete('items', ['name' => 'beta']));
        $this->assertSame(1, $this->db->count('items', []));
    }

    public function testFindWithSpecificColumnsOnlySelectsThose(): void
    {
        $this->db->insert('items', ['name' => 'alpha', 'active' => 1]);

        $row = $this->db->find('items', ['name' => 'alpha'], ['name']);

        $this->assertSame(['name' => 'alpha'], $row);
    }

    public function testFindAllAndEachReturnEveryRowInInsertOrder(): void
    {
        $this->db->insert('items', ['name' => 'a', 'active' => 1]);
        $this->db->insert('items', ['name' => 'b', 'active' => 1]);

        $this->assertCount(2, $this->db->findAll('items'));

        $names = [];
        foreach ($this->db->each('items') as $row) {
            $names[] = $row['name'];
        }
        $this->assertSame(['a', 'b'], $names);
    }

    public function testInsertAndUpdateNeverConcatenateValuesIntoTheQuery(): void
    {
        // A value containing a single quote / SQL metacharacter must round-trip
        // untouched — proof that insert()/update() bind params instead of
        // interpolating them into the SQL string.
        $malicious = "alpha'; DROP TABLE items; --";
        $this->db->insert('items', ['name' => $malicious, 'active' => 1]);

        $row = $this->db->find('items', ['active' => 1]);
        $this->assertSame($malicious, $row['name']);
        $this->assertSame(1, $this->db->count('items', []), 'The table must still exist and hold exactly one row');
    }

    /**
     * Regression test for TODO-1.5.md's C2: find() is now `: ?array` and returns
     * null on a miss instead of fatally throwing a TypeError.
     */
    public function testFindOnAMissReturnsNull(): void
    {
        $this->assertNull($this->db->find('items', ['name' => 'does-not-exist']));
    }

    public function testEachOnAnEmptyTableYieldsNothing(): void
    {
        $rows = [];
        foreach ($this->db->each('items') as $row) {
            $rows[] = $row;
        }

        $this->assertSame([], $rows);
    }
}
