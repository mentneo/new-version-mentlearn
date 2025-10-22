# 🔒 How to Make Your GitHub Repository Private

**Repository:** mentneo/admissions  
**Date:** October 19, 2025  
**Purpose:** Protect company project from unauthorized access

---

## ⚠️ Important: Company Project Protection

This is a **company project** and should be **PRIVATE** to prevent:
- ❌ Unauthorized cloning
- ❌ Code theft
- ❌ Exposure of sensitive information
- ❌ Competitor access to proprietary features

---

## 🔐 Method 1: GitHub Web Interface (Recommended)

### Step 1: Navigate to Repository Settings

1. **Go to GitHub:** https://github.com/mentneo/admissions
2. **Click on "Settings"** tab (top right of repository page)
3. **Scroll down** to the "Danger Zone" section at the bottom

### Step 2: Change Visibility to Private

1. **Find:** "Change repository visibility" section
2. **Click:** "Change visibility" button
3. **Select:** "Make private"
4. **Confirm:** Type the repository name `mentneo/admissions` to confirm
5. **Click:** "I understand, make this repository private"

### Step 3: Verify Privacy

✅ You should see a "Private" badge next to your repository name  
✅ Only invited collaborators can now view and clone the repository

---

## 🛡️ Method 2: Using GitHub CLI (Alternative)

If you have GitHub CLI installed:

```bash
# Install GitHub CLI if not installed
brew install gh

# Login to GitHub
gh auth login

# Make repository private
gh repo edit mentneo/admissions --visibility private
```

---

## 👥 Managing Access After Making Private

### Add Authorized Team Members

1. **Go to:** Repository Settings → Collaborators and teams
2. **Click:** "Add people" or "Add teams"
3. **Search:** For team members by username
4. **Select:** Permission level:
   - **Read:** Can view and clone only
   - **Write:** Can push changes
   - **Admin:** Full access
5. **Send invitation**

### Recommended Access Levels

- **Developers:** Write access
- **Reviewers:** Read access
- **Project Managers:** Admin access
- **External Contractors:** Read access (if needed)

---

## 🔒 Additional Security Measures

### 1. Protect Main Branch

```bash
# Settings → Branches → Add rule
```

**Configure:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Require conversation resolution before merging
- ✅ Include administrators in restrictions

### 2. Enable Two-Factor Authentication

**For all team members:**
1. GitHub Settings → Password and authentication
2. Enable Two-factor authentication
3. Use authenticator app (Google Authenticator, Authy)

### 3. Disable Forking (Important!)

1. **Go to:** Repository Settings
2. **Scroll to:** "Features" section
3. **Uncheck:** "Allow forking"
4. **Save changes**

This prevents even collaborators from creating public forks!

### 4. Review Repository Secrets

1. **Go to:** Settings → Secrets and variables → Actions
2. **Verify:** All sensitive data is stored as secrets
3. **Never commit:**
   - API keys
   - Database passwords
   - Service account credentials
   - `.env` files with real credentials

---

## 📋 Security Checklist

Before making repository private, ensure:

- [ ] All team members have GitHub accounts
- [ ] You know who needs access
- [ ] `.env` is in `.gitignore`
- [ ] No sensitive data in commit history
- [ ] Firebase credentials are not exposed
- [ ] MongoDB connection strings are not exposed

After making repository private:

- [ ] Repository shows "Private" badge
- [ ] Test cloning without authentication (should fail)
- [ ] Invite all authorized team members
- [ ] Enable branch protection rules
- [ ] Disable forking
- [ ] Enable 2FA for all team members
- [ ] Review and rotate any exposed credentials

---

## ⚠️ Files Currently in Repository That Should NOT Be Public

Based on your project, these files contain sensitive information:

### 🔴 Critical Files (Already Committed)
```
.env                                    # Environment variables
mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json  # Firebase admin SDK
firebase.json                           # Firebase configuration
firestore.rules                         # Database security rules
```

### ✅ Action Required

1. **Immediately make repository private**
2. **Rotate all credentials:**
   - Firebase service account key
   - MongoDB connection strings
   - Any API keys in `.env`
3. **Add to `.gitignore`:**
   ```
   .env
   .env.local
   .env.production
   *.json # Firebase service account keys
   ```

---

## 🔄 If Repository Was Public Before

### Security Response Actions

1. **Make Private Immediately** (follow steps above)

2. **Rotate All Credentials:**
   ```bash
   # Firebase
   - Generate new service account key in Firebase Console
   - Delete old service account key
   
   # MongoDB
   - Change MongoDB password
   - Update connection string
   
   # API Keys
   - Regenerate all API keys
   - Update in .env
   ```

3. **Check Commit History:**
   ```bash
   # Search for exposed secrets
   git log --all --full-history -- .env
   git log --all --full-history -- "*.json"
   ```

4. **Remove Sensitive Files from History (if needed):**
   ```bash
   # Use BFG Repo-Cleaner
   brew install bfg
   
   # Remove .env from all commits
   bfg --delete-files .env
   
   # Remove Firebase keys
   bfg --delete-files "*.json"
   
   # Clean up
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   
   # Force push (WARNING: This rewrites history!)
   git push origin --force --all
   ```

---

## 📞 Quick Action Steps (DO THIS NOW!)

### Immediate Actions (5 minutes):

1. **Go to:** https://github.com/mentneo/admissions/settings
2. **Scroll down** to "Danger Zone"
3. **Click:** "Change visibility"
4. **Select:** "Make private"
5. **Type:** `mentneo/admissions`
6. **Confirm:** Make private

### Within 24 Hours:

1. Invite authorized team members
2. Enable branch protection
3. Disable forking
4. Rotate Firebase service account key
5. Change MongoDB credentials
6. Enable 2FA for all team members

---

## 🎯 Result After Completing

✅ **Repository is private** - Only authorized users can access  
✅ **Branch protected** - Prevents direct pushes to main  
✅ **Forking disabled** - Prevents unauthorized copies  
✅ **Credentials rotated** - Old exposed keys are invalid  
✅ **Team has access** - Authorized members can collaborate  
✅ **2FA enabled** - Additional security layer  

---

## 📚 Additional Resources

- [GitHub Repository Visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [Managing Access to Repositories](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

## ⚡ Quick Command Reference

```bash
# Check current repository visibility
gh repo view mentneo/admissions --json visibility

# Make repository private
gh repo edit mentneo/admissions --visibility private

# List collaborators
gh api repos/mentneo/admissions/collaborators

# Add collaborator
gh api repos/mentneo/admissions/collaborators/USERNAME -X PUT

# Enable branch protection
gh api repos/mentneo/admissions/branches/main/protection -X PUT \
  -f required_pull_request_reviews[required_approving_review_count]=1
```

---

**🚨 ACTION REQUIRED: Make repository private NOW to protect company assets!**

**Last Updated:** October 19, 2025  
**Maintained By:** MentNeo Development Team
