#!/bin/bash

# Script to set up and push to a new GitHub repository

set -e

echo "🚀 Setting up new GitHub repository..."
echo ""

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' already exists!"
    read -p "Do you want to remove it and add a new one? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        git remote remove origin
        echo "✅ Old remote removed"
    else
        echo "Aborted."
        exit 1
    fi
fi

# Get repository URL from user
echo ""
echo "Enter your new GitHub repository URL:"
echo "Examples:"
echo "  - git@github.com:username/repo-name.git (SSH)"
echo "  - https://github.com/username/repo-name.git (HTTPS)"
read -p "Repository URL: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ Repository URL cannot be empty!"
    exit 1
fi

# Add remote
echo ""
echo "Adding remote repository..."
git remote add origin "$repo_url"

# Verify remote
echo ""
echo "✅ Remote added successfully!"
echo "Current remotes:"
git remote -v

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo ""
    echo "⚠️  You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to commit these changes before pushing? (yes/no): " commit_changes
    if [ "$commit_changes" = "yes" ]; then
        read -p "Enter commit message: " commit_msg
        git add -A
        git commit -m "${commit_msg:-Update files}"
    fi
fi

# Push to new repository
echo ""
echo "Pushing to new repository..."
read -p "Ready to push? (yes/no): " confirm_push

if [ "$confirm_push" = "yes" ]; then
    git push -u origin main
    echo ""
    echo "✅ Successfully pushed to new repository!"
    echo ""
    echo "Your repository is now available at:"
    echo "$repo_url"
else
    echo "Push cancelled. You can push manually later with:"
    echo "  git push -u origin main"
fi

