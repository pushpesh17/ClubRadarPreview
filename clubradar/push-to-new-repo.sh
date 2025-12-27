#!/bin/bash

# Script to push to the new ClubRadarPreview repository

set -e

REPO_URL="git@github.com:pushpesh17/ClubRadarPreview.git"

echo "🚀 Preparing to push to ClubRadarPreview repository..."
echo ""

# Check if remote exists, if not add it
if git remote | grep -q "^origin$"; then
    current_url=$(git remote get-url origin)
    if [ "$current_url" != "$REPO_URL" ]; then
        echo "⚠️  Remote 'origin' points to: $current_url"
        read -p "Do you want to change it to $REPO_URL? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            git remote set-url origin "$REPO_URL"
            echo "✅ Remote updated"
        fi
    else
        echo "✅ Remote is already set correctly"
    fi
else
    echo "Adding remote repository..."
    git remote add origin "$REPO_URL"
    echo "✅ Remote added"
fi

echo ""
echo "Verifying repository access..."
if git ls-remote origin &>/dev/null; then
    echo "✅ Repository is accessible!"
else
    echo "❌ Cannot access repository. Please verify:"
    echo "   1. The repository exists at: $REPO_URL"
    echo "   2. You have push access to it"
    echo "   3. Your SSH key is added to GitHub"
    exit 1
fi

echo ""
echo "Fetching remote branches..."
git fetch origin

# Check if remote has a main branch with commits
if git ls-remote --heads origin main | grep -q main; then
    echo "⚠️  Remote repository already has a 'main' branch"
    echo "   This usually means it has a README.md file"
    echo ""
    read -p "Do you want to merge with remote? (yes/no): " merge_remote
    if [ "$merge_remote" = "yes" ]; then
        echo "Merging remote main branch..."
        git pull origin main --allow-unrelated-histories --no-edit || {
            echo "⚠️  Merge conflict or issue. You may need to resolve manually."
            exit 1
        }
        echo "✅ Merged successfully"
    else
        echo "Skipping merge. You may need to resolve conflicts manually."
    fi
fi

echo ""
echo "Pushing to repository..."
git push -u origin main

echo ""
echo "✅ Successfully pushed to ClubRadarPreview repository!"
echo ""
echo "Your repository is now available at:"
echo "https://github.com/pushpesh17/ClubRadarPreview"

