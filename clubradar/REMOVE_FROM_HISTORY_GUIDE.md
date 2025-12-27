# Guide: Removing .env.local.example from Git History

⚠️ **IMPORTANT**: This file contains sensitive Supabase keys that need to be removed from history.

## Prerequisites

Before starting, make sure:

1. ✅ All team members are aware you're rewriting history
2. ✅ You have a backup of your repository
3. ✅ You're the only one working on this branch, OR you've coordinated with your team
4. ✅ You understand that this will require force pushing

## Method 1: Using git-filter-repo (Recommended)

### Step 1: Install git-filter-repo

**On macOS:**

```bash
brew install git-filter-repo
```

**On Linux:**

```bash
pip3 install git-filter-repo
```

**On Windows:**

```bash
pip install git-filter-repo
```

### Step 2: Navigate to your repository

```bash
cd "/Users/plodiwal/Desktop/Medical app/clubradar"
```

### Step 3: Remove the file from all history

```bash
git filter-repo --path .env.local.example --invert-paths
```

This will:

- Remove the file from all commits in history
- Rewrite commit hashes
- Update all branches

### Step 4: Force push to GitHub

```bash
git push origin --force --all
git push origin --force --tags
```

⚠️ **Warning**: Force pushing rewrites history. Make sure your team knows about this!

### Step 5: Rotate your Supabase keys (CRITICAL!)

Since your keys were exposed in git history:

1. Go to https://app.supabase.com/project/_/settings/api
2. **Regenerate** your `SUPABASE_SERVICE_ROLE_KEY` (this is critical!)
3. Update your local `.env.local` with the new keys
4. Update your production environment variables

## Method 2: Using BFG Repo-Cleaner (Alternative)

### Step 1: Install BFG

```bash
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
# Or use Homebrew on macOS:
brew install bfg
```

### Step 2: Clone a fresh copy (BFG needs a bare repository)

```bash
cd /tmp
git clone --mirror /Users/plodiwal/Desktop/Medical\ app/clubradar/.git clubradar-clean.git
```

### Step 3: Remove the file

```bash
cd /tmp/clubradar-clean.git
bfg --delete-files .env.local.example
```

### Step 4: Clean up and push

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
cd "/Users/plodiwal/Desktop/Medical app/clubradar"
git remote set-url origin /tmp/clubradar-clean.git
git fetch
git push origin --force --all
```

## Method 3: Manual git filter-branch (Not Recommended)

This is more complex and error-prone. Only use if the above methods don't work.

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local.example" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

## After Removing from History

1. **Rotate all exposed keys immediately:**

   - Supabase Service Role Key (CRITICAL - this has admin access)
   - Supabase Anon Key (if you want to be extra safe)
   - Any other keys that were in the file

2. **Verify the file is gone:**

   ```bash
   git log --all --full-history -- .env.local.example
   ```

   This should return nothing.

3. **Update your team:**
   - Tell them to delete their local repository
   - Have them clone fresh from GitHub
   - Or have them run: `git fetch origin && git reset --hard origin/main`

## Prevention for Future

✅ Your `.gitignore` is now updated to prevent `.env*.example` files from being committed.

**Additional recommendations:**

- Use a tool like `git-secrets` to scan commits before pushing
- Consider using environment variable management tools (Vercel, Railway, etc.)
- Never commit actual keys, even in example files - use placeholders like `your_key_here`

## Quick Command Summary (Method 1)

```bash
# Install (macOS)
brew install git-filter-repo

# Remove from history
cd "/Users/plodiwal/Desktop/Medical app/clubradar"
git filter-repo --path .env.local.example --invert-paths

# Force push
git push origin --force --all
git push origin --force --tags

# ROTATE YOUR SUPABASE KEYS IMMEDIATELY!
```
