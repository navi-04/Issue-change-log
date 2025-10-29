# Installation Guide

This guide will walk you through the complete installation process for the Issue Change Log app.

## Prerequisites

Before installing the Issue Change Log app, ensure you have:

### **System Requirements**
- ✅ Active Jira Cloud instance
- ✅ Jira administrator privileges (for installation and initial setup)
- ✅ Node.js 18.x or higher (for local development only)
- ✅ npm or yarn package manager (for local development only)

### **User Permissions**
- **For Installation**: Jira administrator or site administrator role
- **For Site Configuration**: Member of `site-admins`, `jira-administrators`, or `administrators` group
- **For Project Configuration**: Project administrator role for specific projects

### **Browser Requirements**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Installation Methods

### Method 1: Install from Atlassian Marketplace (Recommended)

> **Note**: This app may need to be published to the Atlassian Marketplace first.

1. **Navigate to Atlassian Marketplace**
   - Go to [https://marketplace.atlassian.com](https://marketplace.atlassian.com)
   - Sign in with your Atlassian account

2. **Search for the App**
   - Search for "Issue Change Log" in the marketplace
   - Click on the app to view details

3. **Install the App**
   - Click the **"Get it now"** or **"Try it free"** button
   - Select your Jira Cloud site from the dropdown
   - Click **"Install app"**

4. **Grant Permissions**
   - Review the requested permissions:
     - `read:jira-work` - Read Jira issues and projects
     - `read:jira-user` - Read user information
     - `storage:app` - Store app configuration data
   - Click **"Grant access"**

5. **Confirm Installation**
   - Wait for the installation to complete
   - You'll see a success message when the app is installed

### Method 2: Manual Installation via Forge CLI

For development or custom deployments:

#### Step 1: Install Forge CLI

```bash
npm install -g @forge/cli
```

#### Step 2: Clone the Repository

```bash
git clone <repository-url>
cd issue-change-log-cui
```

#### Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install admin panel dependencies
cd static/admin
npm install
cd ../..

# Install main panel dependencies
cd static/hello-world
npm install
cd ../..

# Install project settings dependencies
cd static/project-settings
npm install
cd ../..
```

#### Step 4: Build the App

```bash
# Build admin panel
cd static/admin
npm run build
cd ../..

# Build main panel
cd static/hello-world
npm run build
cd ../..

# Build project settings panel
cd static/project-settings
npm run build
cd ../..
```

#### Step 5: Login to Forge

```bash
forge login
```

Follow the prompts to authenticate with your Atlassian account.

#### Step 6: Deploy the App

```bash
forge deploy
```

This will package and upload your app to the Forge platform.

#### Step 7: Install the App

```bash
forge install
```

Select your Jira site when prompted, and the app will be installed.

## Post-Installation Setup

### Step 1: Verify Installation

1. Navigate to any Jira issue in your instance
2. Look for the **"Issue Changelog"** panel on the right side
3. You should see an access restriction message (this is normal before configuration)

### Step 2: Initial Site Configuration (Administrators Only)

As a Jira administrator, you need to authorize projects:

1. **Access Admin Settings**
   - Go to **Jira Settings** → **Apps** → **Manage apps**
   - Find "Issue Change Log" in the list
   - Click **"Issue ChangeLog Settings"**

2. **Authorize Projects**
   - In the admin panel, you'll see all available projects
   - Select projects that should have access to the app:
     - Check individual projects, OR
     - Use "Select All" to authorize all projects at once
   - Click **"Add Selected Projects"**

3. **Verify Authorization**
   - Authorized projects will appear in the "Currently Allowed Projects" table
   - You can remove projects anytime by clicking the "Remove" button

### Step 3: Project-Level Configuration (Project Admins)

After site authorization, project administrators can enable/disable the app:

1. **Access Project Settings**
   - Go to **Project Settings** → **Apps** → **Issue ChangeLog**

2. **Enable/Disable App**
   - Toggle the "Enable Issue ChangeLog for this project" switch
   - Enabled by default for authorized projects

### Step 4: Test the Installation

1. Open any issue in an authorized and enabled project
2. Scroll to the right panel
3. You should see the "Issue Changelog" panel with change history
4. Test filtering options (24h, 7d, 30d, etc.)
5. Try exporting data to CSV

## Initial Access Setup Script

For bulk project authorization, you can use the provided setup script:

```javascript
// Run in browser console on Jira admin page
// See setup-initial-access.js for the complete script
```

Refer to `setup-initial-access.js` in the root directory for the complete implementation.

## Verification Checklist

After installation, verify the following:

- [ ] App appears in Jira Apps management page
- [ ] Issue Changelog panel visible in issue view
- [ ] Admin settings page accessible to administrators
- [ ] Project settings page accessible to project admins
- [ ] Access control working correctly
- [ ] Change logs displaying for authorized projects
- [ ] CSV export functionality working
- [ ] Time filters operating correctly

## Troubleshooting Installation Issues

### Issue: "App not appearing in issue panel"

**Solution:**
1. Refresh your browser (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache
3. Verify app installation in **Jira Settings** → **Apps** → **Manage apps**
4. Check that the project is authorized by an administrator

### Issue: "Permission denied" during CLI installation

**Solution:**
1. Ensure you have Jira administrator privileges
2. Re-run `forge login` and authenticate again
3. Verify your Atlassian account has access to the site

### Issue: "Build failed" during manual installation

**Solution:**
1. Ensure Node.js 18+ is installed: `node --version`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check for syntax errors in source files
4. Verify all dependencies are compatible

### Issue: "App installed but access denied for all projects"

**Solution:**
This is expected behavior! By design, no projects have access until explicitly authorized:
1. Access the admin settings page
2. Add projects using the admin interface
3. Verify projects appear in the "Currently Allowed Projects" list

### Issue: "Cannot access admin settings"

**Solution:**
1. Verify you're a member of one of these groups:
   - `site-admins`
   - `jira-administrators`
   - `administrators`
2. Contact your Jira administrator to grant appropriate permissions

## Uninstallation

### Via Jira UI

1. Go to **Jira Settings** → **Apps** → **Manage apps**
2. Find "Issue Change Log"
3. Click **"Uninstall"**
4. Confirm the uninstallation

### Via Forge CLI

```bash
forge uninstall
```

Select your site when prompted.

## Data Retention After Uninstallation

- **Jira Data**: Not affected (the app only reads Jira data)
- **App Configuration**: Removed (project access lists are deleted)
- **No External Data**: Nothing stored outside Jira/Forge

## Upgrading the App

### From Marketplace

Updates are automatic when you've installed from the marketplace. You'll be notified of updates.

### Manual Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild all components
cd static/hello-world && npm run build && cd ../..
cd static/admin && npm run build && cd ../..
cd static/project-settings && npm run build && cd ../..

# Deploy update
forge deploy
```

Your configuration (project access lists) will be preserved during upgrades.

## Next Steps

After successful installation:

1. Review [Configuration and Setup](./03-configuration-setup.md)
2. Read the [User Guide](./04-user-guide.md)
3. Configure access for your projects
4. Train your team on using the app

## Support

For installation assistance, see [Support and Contact Information](./07-support-contact.md).
