#!/bin/bash

# Script to remove .env.local.example from git history
# WARNING: This will rewrite git history and require force pushing

set -e

echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  Make sure you've backed up your repository and coordinated with your team!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Step 1: Removing .env.local.example from all git history..."
git filter-repo --path .env.local.example --invert-paths

echo ""
echo "✅ File removed from history!"
echo ""
echo "Step 2: Verifying removal..."
if git log --all --full-history -- .env.local.example 2>/dev/null | grep -q .; then
    echo "❌ File still found in history!"
    exit 1
else
    echo "✅ File successfully removed from history!"
fi

echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Force push to GitHub:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "2. ROTATE YOUR SUPABASE KEYS IMMEDIATELY:"
echo "   - Go to: https://app.supabase.com/project/_/settings/api"
echo "   - Regenerate SUPABASE_SERVICE_ROLE_KEY (CRITICAL!)"
echo "   - Update your .env.local and production environment variables"
echo ""
echo "3. Notify your team to re-clone or reset their local repos"

