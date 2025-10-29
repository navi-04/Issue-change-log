# FAQ / Troubleshooting

This document provides answers to frequently asked questions and solutions to common issues.

## Table of Contents

1. [General Questions](#general-questions)
2. [Installation and Setup](#installation-and-setup)
3. [Access and Permissions](#access-and-permissions)
4. [Using the App](#using-the-app)
5. [Data Export](#data-export)
6. [Performance Issues](#performance-issues)
7. [Error Messages](#error-messages)
8. [Admin Issues](#admin-issues)
9. [Project Settings](#project-settings)
10. [Technical Issues](#technical-issues)

---

## General Questions

### What is Issue Change Log?

Issue Change Log is a Jira Cloud app that tracks and displays all changes made to Jira issues, including field modifications, comments, and attachments. It provides filtering, export capabilities, and granular access control.

### Who can use this app?

Any user with access to Jira issues in an authorized project can view change logs. Site administrators manage which projects have access, and project administrators can enable/disable the app for their projects.

### Is my data stored outside Jira?

No. All issue data remains in Jira. The app only stores minimal configuration data (project access lists) in Forge app storage, which is part of the Atlassian platform.

### What's the difference between site authorization and project enablement?

- **Site Authorization** (by Jira admins): Determines which projects *can* use the app
- **Project Enablement** (by project admins): Determines whether the app *is* active in an authorized project

Both must be configured for the app to work.

### Does this work with Jira Data Center or Server?

No. Issue Change Log is built on Atlassian Forge, which only supports Jira Cloud. It is not compatible with Jira Data Center or Server.

### How much does it cost?

Pricing information is available on the Atlassian Marketplace listing. See [Pricing/Evaluation](./12-pricing-evaluation.md) for details.

---

## Installation and Setup

### Q: The app isn't appearing after installation

**A:** Try these steps:

1. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
2. **Clear browser cache**
3. **Verify installation:**
   - Go to **Jira Settings** → **Apps** → **Manage apps**
   - Confirm "Issue Change Log" is listed and enabled
4. **Check project authorization:**
   - The app won't work until projects are authorized by an administrator

### Q: Installation failed with "permission denied" error

**A:** Possible solutions:

1. **Verify admin rights:**
   - Ensure you have Jira administrator privileges
   - Check with your site administrator if unsure
2. **Re-authenticate:**
   ```bash
   forge logout
   forge login
   ```
3. **Check site permissions:**
   - Your Atlassian account must have admin access to the site

### Q: How do I uninstall the app?

**A:** Two methods:

**Via Jira UI:**
1. Go to **Jira Settings** → **Apps** → **Manage apps**
2. Find "Issue Change Log"
3. Click **Uninstall**
4. Confirm

**Via Forge CLI:**
```bash
forge uninstall
```

**Note:** Your configuration data will be deleted, but Jira issue data is unaffected.

### Q: Can I install on multiple Jira sites?

**A:** Yes. Install separately on each site. Each installation has independent configuration.

---

## Access and Permissions

### Q: Users see "Access Restricted" or "Access Denied" message

**A:** This means access control is working correctly. Solutions:

**For Site Admins:**
1. Access the admin panel
2. Add the project to the authorized list
3. Verify the project appears in "Currently Allowed Projects"

**For Project Admins:**
1. Verify site authorization is granted first
2. Check project settings (Project Settings → Apps → Issue ChangeLog)
3. Enable the app if disabled

**For Users:**
- Contact your Jira administrator to request project authorization
- Contact your project administrator to verify app is enabled

### Q: Admin panel button not showing

**A:** The "Show Admin Panel" button only appears for users in these groups:
- `site-admins`
- `jira-administrators`
- `administrators`

**Solutions:**
1. **Verify group membership:**
   - Go to **Jira Settings** → **User management**
   - Check your group memberships
2. **Request admin access** from your organization's Jira administrator
3. **Log out and back in** to refresh permissions

### Q: Project admin can't access project settings

**A:** Verify the following:

1. **User has project admin role:**
   - Go to **Project Settings** → **People**
   - Verify user is listed as project administrator
2. **Project is authorized at site level** (site admin must do this first)
3. **App is installed** and enabled in Jira

### Q: Some users can see the changelog, others can't

**A:** Check these factors:

1. **Jira issue permissions:**
   - Users must have Jira permission to view the issue
   - Check project permission schemes
2. **Project authorization:**
   - Verify project is in the allowed list
3. **Project enablement:**
   - Verify app is enabled in project settings
4. **Browser issues:**
   - Try different browser
   - Clear cache
   - Disable browser extensions

---

## Using the App

### Q: No changes are displayed

**A:** Possible causes and solutions:

**1. Time filter too restrictive:**
- Change filter to "All" to see all changes
- The issue may not have recent changes

**2. Issue has no history:**
- Newly created issues may have minimal changes
- Check if the issue has been modified at all

**3. Access issues:**
- Verify you can see the issue in Jira normally
- Check error messages in browser console (F12)

**4. Data loading issue:**
- Refresh the page
- Try a different browser
- Check internet connection

### Q: Changes are loading very slowly

**A:** Performance optimization steps:

**1. Use shorter time filters:**
- Try "7d" or "30d" instead of "All"
- Reduces data volume significantly

**2. Browser optimization:**
- Close unnecessary tabs
- Clear browser cache
- Disable unnecessary extensions

**3. Network issues:**
- Check internet connection speed
- Try switching networks (e.g., from VPN to direct)

**4. Large dataset:**
- Issues with thousands of changes may load slowly
- Use pagination to navigate through results

### Q: CSV export shows different data than the UI

**A:** This shouldn't happen, but if it does:

1. **Verify filter settings** - Export respects the current time filter
2. **Refresh the page** - Ensure data is current
3. **Check export timestamp** - Ensure you're looking at the correct export file
4. **Browser cache** - Clear cache and try again

### Q: Can I view changes for multiple issues at once?

**A:** Currently, the app displays one issue at a time.

**Workarounds:**
1. Export each issue to CSV
2. Combine CSV files in Excel/Google Sheets
3. Use Jira JQL and automation for bulk analysis

---

## Data Export

### Q: Export button does nothing

**A:** Troubleshooting steps:

**1. Browser pop-up blocker:**
- Check if pop-ups are blocked
- Allow pop-ups for your Jira domain
- Look for blocked pop-up indicator in address bar

**2. JavaScript errors:**
- Open browser console (F12)
- Check for error messages
- Report errors to support

**3. No data to export:**
- Verify changes are visible in the UI
- Try changing time filter

**4. Browser compatibility:**
- Try a different browser (Chrome recommended)
- Update your browser to the latest version

### Q: CSV file won't open in Excel

**A:** Solutions:

**Method 1: Import as CSV**
1. Open Excel
2. **Data** → **Get Data** → **From File** → **From Text/CSV**
3. Select the CSV file
4. Configure import settings
5. Click **Load**

**Method 2: Change file association**
1. Right-click the CSV file
2. **Open with** → **Excel**
3. Select "Always use this app"

**Method 3: Use UTF-8 encoding**
- Some versions of Excel require UTF-8 encoding
- Try opening in Google Sheets first, then download as Excel

### Q: CSV export is missing some data

**A:** Verify the following:

1. **Time filter applied:**
   - Export respects the current time filter
   - Change to "All" to export everything
2. **Pagination:**
   - Export includes all pages of data
   - Not limited to current page view
3. **Permissions:**
   - Some data may not be visible due to Jira permissions
   - Contact admin if you believe you should see more data

### Q: Can I customize the CSV export format?

**A:** Currently, the CSV format is standardized.

**Workarounds:**
1. Export to CSV
2. Open in Excel/Google Sheets
3. Format as needed
4. Save in desired format

**Columns included:**
- Type, Field, From, To, Author, Date, Issue Key, Content, Filename, Size

---

## Performance Issues

### Q: App is slow to load

**A:** Performance optimization:

**1. Use time filters:**
```
Fastest → Slowest:
24h < 7d < 30d < 6m < 1y < All
```

**2. Browser optimization:**
- Clear cache: Settings → Privacy → Clear browsing data
- Disable extensions temporarily
- Use incognito/private mode for testing

**3. Network:**
- Check internet speed
- Disable VPN temporarily
- Try different network

**4. Issue-specific:**
- Very large issues with thousands of changes will be slower
- This is expected behavior
- Use pagination and time filters

### Q: Page freezes or becomes unresponsive

**A:** Immediate actions:

1. **Refresh the page** (Ctrl+F5 or Cmd+Shift+R)
2. **Close other tabs** to free up browser memory
3. **Use shorter time filter** to reduce data volume
4. **Try different browser** - Chrome is recommended

**Preventive measures:**
- Keep browser updated
- Use time filters proactively
- Don't open too many issue panels simultaneously

### Q: Pagination is slow

**A:** Pagination should be fast. If slow:

1. **Network latency** - Check internet connection
2. **Large datasets** - Use time filters to reduce data
3. **Browser issues** - Clear cache and try again

---

## Error Messages

### Q: "This project is not authorized to use the Issue Change Log app"

**A:** This is the expected access control message.

**Meaning:** The project has not been authorized by site administrators.

**Solution for Site Admins:**
1. Access the admin panel
2. Add the project to authorized projects list
3. Verify it appears in "Currently Allowed Projects"

**Solution for Users:**
- Contact your Jira administrator
- Request authorization for your project
- Provide project key (e.g., "KC", "PROJ")

### Q: "The Issue Change Log app has been disabled for this project"

**A:** The app was disabled by a project administrator.

**Meaning:** Site authorization exists, but project admin disabled the app.

**Solution for Project Admins:**
1. Go to **Project Settings** → **Apps** → **Issue ChangeLog**
2. Toggle to enable the app
3. App will be immediately active

**Solution for Users:**
- Contact your project administrator
- Request app enablement for the project

### Q: "Unable to determine the project for this issue"

**A:** Rare error indicating issue data fetch failure.

**Possible causes:**
1. **Temporary API issue** - Refresh the page
2. **Deleted/archived project** - Issue may be in an inaccessible project
3. **Permission issue** - You may not have access to the issue

**Solutions:**
1. Refresh the page
2. Verify you can see the issue in Jira normally
3. Check with administrator if problem persists
4. Try accessing from issue search results

### Q: "Failed to fetch projects" in admin panel

**A:** Admin panel can't load project list.

**Possible causes:**
1. **API permission issue** - App lacks required permissions
2. **Jira API problem** - Temporary Atlassian service issue
3. **Network problem** - Connection interrupted

**Solutions:**
1. **Refresh the page**
2. **Verify app permissions:**
   - Go to **Jira Settings** → **Apps** → **Manage apps**
   - Click on Issue Change Log
   - Verify `read:jira-work` permission is granted
3. **Check Atlassian status:**
   - Visit [status.atlassian.com](https://status.atlassian.com)
   - Check for service disruptions
4. **Contact support** if issue persists

### Q: "Access denied: Project administrator privileges required"

**A:** User attempted project-level action without proper permissions.

**Solution:**
- Only project administrators can enable/disable the app
- Contact your project administrator
- Or request project admin permissions from Jira admin

---

## Admin Issues

### Q: Can't add projects in admin panel

**A:** Troubleshooting steps:

**1. Verify admin permissions:**
- Must be in `site-admins`, `jira-administrators`, or `administrators` group
- Check **Jira Settings** → **User management**

**2. Check for errors:**
- Open browser console (F12)
- Look for error messages
- Share errors with support if needed

**3. Try different approach:**
- Add projects individually instead of bulk
- Refresh admin page
- Try different browser

**4. Storage issues:**
- Rare but possible
- Contact support if confirmed

### Q: Removed project still has access

**A:** This shouldn't happen. If it does:

**1. Verify removal:**
- Check "Currently Allowed Projects" table
- Project should not be listed

**2. Cache issue:**
- Users may need to refresh their browsers
- Access is checked on each request

**3. Different project:**
- Verify you removed the correct project key
- Project keys are case-sensitive

**4. Re-remove the project:**
- Try adding and removing again
- This may clear any cache issues

### Q: "Select All" not working

**A:** If "Select All" checkbox doesn't select all projects:

**1. Scroll through list:**
- Ensure all projects are loaded
- May need to scroll to trigger lazy loading

**2. JavaScript error:**
- Check browser console (F12)
- Report errors to support

**3. Browser compatibility:**
- Try Chrome (recommended browser)
- Update browser to latest version

### Q: How do I bulk remove multiple projects?

**A:** Two methods:

**Method 1: Checkboxes**
1. In "Currently Allowed Projects" table, check multiple projects
2. Click **"Remove Selected"** button
3. Confirm bulk removal

**Method 2: Individual removal**
1. Click **"Remove"** button next to each project
2. Confirm each removal

---

## Project Settings

### Q: Project settings page shows "No project context available"

**A:** The app couldn't determine which project you're configuring.

**Solutions:**
1. **Access via correct path:**
   - Go to **Project Settings** (not Jira Settings)
   - Must be in a specific project
2. **Verify URL** contains project key
3. **Try different project** to test

### Q: Project settings shows "Project is not authorized by site administrator"

**A:** Expected message when site authorization is missing.

**Solution:**
- Contact site administrator
- Request site-level authorization
- Site admin must add project in admin panel first

### Q: Toggle switch doesn't work

**A:** Troubleshooting steps:

**1. Verify permissions:**
- Must be project administrator
- Check **Project Settings** → **People**

**2. Check site authorization:**
- Project must be authorized at site level first
- Verify with site administrator

**3. Browser issues:**
- Try different browser
- Clear cache
- Check browser console for errors

**4. JavaScript errors:**
- Open browser console (F12)
- Look for errors
- Report to support

---

## Technical Issues

### Q: Browser console shows JavaScript errors

**A:** Common errors and solutions:

**CORS errors:**
- Expected for Forge apps
- Does not indicate actual problem
- Can be ignored unless functionality is broken

**Network errors:**
- Check internet connection
- Verify Jira is accessible
- Try different network

**Permission errors:**
- Verify app permissions in Jira settings
- Re-grant permissions if necessary

**Unexpected errors:**
- Note the error message
- Include in support ticket
- Provide steps to reproduce

### Q: App not compatible with my browser

**A:** Supported browsers:
- Chrome 90+  (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Solutions:**
1. **Update browser** to latest version
2. **Switch browser** if using unsupported version
3. **Enable JavaScript** (required)
4. **Disable problematic extensions** temporarily

### Q: Mobile browser issues

**A:** The app is responsive but optimized for desktop.

**Mobile tips:**
1. **Use landscape mode** for better table viewing
2. **Zoom as needed** for small text
3. **Use native Jira app** for primary mobile work
4. **Access via browser** for occasional changelog views

### Q: Network or API errors

**A:** If you see network-related errors:

**1. Check Atlassian status:**
- Visit [status.atlassian.com](https://status.atlassian.com)
- Verify Jira Cloud is operational

**2. Test Jira access:**
- Try accessing Jira normally
- Verify you can view issues

**3. Network troubleshooting:**
- Check internet connection
- Try different network/VPN
- Disable proxy temporarily

**4. API rate limiting:**
- Rare but possible with heavy usage
- Wait a few minutes and retry

---

## Advanced Troubleshooting

### Diagnostic Steps for Complex Issues

**1. Gather Information:**
```
- What were you trying to do?
- What happened instead?
- Error messages (exact text)?
- Browser and version?
- Can you reproduce it?
```

**2. Check Browser Console:**
```
1. Press F12 (or Cmd+Option+I on Mac)
2. Go to "Console" tab
3. Look for red error messages
4. Copy error text
```

**3. Test in Incognito/Private Mode:**
```
Why: Rules out extension conflicts and cache issues
1. Open incognito/private window
2. Log in to Jira
3. Test the app
4. Compare behavior
```

**4. Test Different Browser:**
```
Try Chrome if you're not using it already
- Chrome has best compatibility
- Rules out browser-specific issues
```

**5. Check Forge CLI Logs (Developers):**
```bash
forge logs
```

### Getting Help

If issues persist after troubleshooting:

1. **Document the issue:**
   - Exact steps to reproduce
   - Screenshots or screen recording
   - Error messages (from browser console)
   - Browser and version info

2. **Check existing resources:**
   - Review relevant documentation sections
   - Search FAQ for similar issues
   - Check Atlassian Community forums

3. **Contact support:**
   - See [Support and Contact Information](./07-support-contact.md)
   - Include all diagnostic information
   - Provide your Jira instance details (cloud URL)

---

## Prevention Tips

### Best Practices to Avoid Issues

**1. Regular Maintenance:**
- Keep browser updated
- Clear cache monthly
- Review authorized projects quarterly

**2. Proper Configuration:**
- Document authorization decisions
- Train admins on proper setup
- Test after configuration changes

**3. User Training:**
- Educate users on time filters
- Explain export functionality
- Share troubleshooting tips

**4. Performance Management:**
- Use appropriate time filters
- Don't open too many panels at once
- Export large datasets for offline analysis

**5. Access Control:**
- Regularly audit authorized projects
- Remove access for completed projects
- Document access approval process

---

## Still Need Help?

If this FAQ doesn't answer your question:

- **Support**: See [Support and Contact Information](./07-support-contact.md)
- **User Guide**: See detailed [User Guide](./04-user-guide.md)
- **Configuration**: See [Configuration and Setup](./03-configuration-setup.md)
- **Features**: See [Features and Capabilities](./05-features-capabilities.md)

---

## Contributing to This FAQ

Found an issue not covered here? Help improve this documentation:

1. Document the issue and solution
2. Submit via support channels
3. We'll add it to future versions

Your feedback helps everyone! Thank you for using Issue Change Log.
