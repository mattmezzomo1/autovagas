#!/bin/bash

cd /mnt/persist/workspace

echo "=== Checking all branches ==="
git branch -a

echo -e "\n=== Checking remotes ==="
git remote -v

echo -e "\n=== Checking if there are any refs ==="
find .git/refs -type f 2>/dev/null

echo -e "\n=== Checking git objects ==="
find .git/objects -name "*" -type f 2>/dev/null | head -10

echo -e "\n=== Trying to fetch if remote exists ==="
git fetch --all 2>/dev/null || echo "No remotes to fetch from"

echo -e "\n=== Checking branches again after fetch ==="
git branch -a

echo -e "\n=== Checking for any hidden or dot files ==="
ls -la | grep -v "^total"