# Configuration and Setup

This guide covers all configuration options and setup procedures for the Issue Change Log app.

## Overview

The Issue Change Log app uses a **two-tier access control system**:

1. **Site-Level Authorization** (Managed by Jira Administrators)
2. **Project-Level Enablement** (Managed by Project Administrators)

Both levels must be configured for the app to function in a project.

---

## Site-Level Configuration

### Who Can Configure?

Users who are members of any of these groups:
- `site-admins`
- `jira-administrators`
- `administrators`

### Accessing Admin Settings

**Method 1: Via Jira Settings**
1. Go to **Jira Settings** (⚙️ icon in top right)
2. Navigate to **Apps** → **Manage apps**
3. Find **"Issue ChangeLog Settings"** in the sidebar
4. Click to open the admin page

**Method 2: Via App Navigation**
1. Open any Jira issue
2. Find the "Issue Changelog" panel
3. If you're an admin, you'll see a **"Show Admin Panel"** button
4. Click to toggle the admin interface

### Authorizing Projects

#### Adding Individual Projects

1. In the admin panel, scroll to **"Add Projects"** section
2. You'll see a list of all projects in your Jira instance
3. Check the boxes next to projects you want to authorize
4. Click **"Add Selected Projects"**
5. Authorized projects will appear in the **"Currently Allowed Projects"** table

#### Adding All Projects (Bulk Authorization)

1. In the admin panel, find the **"Select All"** checkbox at the top of the project list
2. Check **"Select All"** to select all available projects
3. Click **"Add Selected Projects"**
4. All projects will be added to the allowed list

#### Project Information Displayed

For each project, you'll see:
- **Project Key** (e.g., "KC", "PROJ", "DEMO")
- **Project Name** (full project name)
- **Project Type** (software, business, service-desk)
- **Date Added** (when the project was authorized)

### Removing Project Access

#### Remove Individual Projects

1. In the **"Currently Allowed Projects"** table, find the project
2. Click the **"Remove"** button next to the project
3. Confirm the removal
4. The project will immediately lose access to the app

#### Bulk Removal

1. Check the boxes next to multiple projects in the allowed projects table
2. Click **"Remove Selected"** button
3. Confirm the bulk removal
4. All selected projects will lose access

### Default Access Policy

**Important:** By design, if no projects are authorized, **no projects have access** to the app. This ensures:
- Explicit authorization required
- No accidental data exposure
- Clear security posture

---

## Project-Level Configuration

### Who Can Configure?

Users with **Project Administrator** permissions for the specific project.

### Accessing Project Settings

1. Navigate to your project
2. Go to **Project Settings** (⚙️ icon in project sidebar)
3. Scroll to **Apps** section
4. Click **"Issue ChangeLog"**

### Enabling/Disabling the App

#### Enable the App

1. In project settings, you'll see the current status
2. If disabled, toggle the switch to **"Enable Issue ChangeLog for this project"**
3. The app will be immediately enabled for all project users
4. Users will see change logs in issue panels

#### Disable the App

1. In project settings, toggle the switch to **"Disable Issue ChangeLog for this project"**
2. The app will be immediately disabled
3. Users will see a disabled message in issue panels
4. Site authorization remains intact (can be re-enabled later)

### Project Settings Information

The project settings page displays:
- **Project Name and Key**
- **Site Authorization Status** (whether site admin has authorized the project)
- **App Enablement Status** (current enabled/disabled state)
- **Permission Status** (whether you have project admin rights)

### When to Disable at Project Level

Consider disabling the app for specific projects when:
- **Temporary Suspension**: Project is on hold or archived
- **Performance Concerns**: Large projects experiencing performance issues
- **Compliance Requirements**: Specific data access restrictions
- **Testing/Staging**: Projects used for testing should be disabled
- **Seasonal Projects**: Disable when project is inactive

---

## Access Control Flow

### Access Validation Process

When a user opens an issue:

1. **Extract Project Key**: App identifies which project the issue belongs to
2. **Check Site Authorization**: Verify project is in the allowed list (admin-configured)
3. **Check Project Enablement**: Verify app is enabled for the project (project admin-configured)
4. **Check User Permissions**: Verify user has permission to view the issue (Jira-level)
5. **Grant or Deny Access**: Show changelog or display appropriate error message

### Access Scenarios

| Site Authorization | Project Enabled | Result |
|-------------------|-----------------|--------|
| ✅ Yes | ✅ Yes | ✅ **Full Access** - App works normally |
| ✅ Yes | ❌ No | ❌ **Access Denied** - "App disabled for this project" |
| ❌ No | ✅ Yes | ❌ **Access Denied** - "Project not authorized" |
| ❌ No | ❌ No | ❌ **Access Denied** - "Project not authorized" |

---

## Storage Configuration

### What Data is Stored?

The app stores minimal configuration data in Forge app storage:

#### Site-Level Storage

```javascript
{
  "allowedProjects": ["KC", "PROJ", "DEMO"],
  "allowedProjectsData": {
    "KC": {
      "key": "KC",
      "name": "Kanban Central",
      "id": "10001",
      "dateAdded": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Project-Level Storage

```javascript
{
  "project_KC_settings": {
    "enabled": true,
    "lastUpdated": "2024-01-20T14:45:00.000Z"
  }
}
```

### Storage Limits

- Forge app storage has no practical limit for this app's use case
- Data is automatically backed up by Atlassian
- Storage is isolated per Forge app installation
- No external databases or services used

---

## Performance Configuration

### Optimization Settings

The app is optimized by default, but you can manage performance by:

#### 1. **Pagination**
- Change logs are paginated (20 items per page by default)
- Reduces initial load time
- Improves browser performance for large histories

#### 2. **Time Filtering**
- Use shorter time periods for faster loading
- Default filter: "All time" (can be changed by users)
- Filters: 24h, 7d, 30d, 6m, 1y, all

#### 3. **Selective Project Authorization**
- Only authorize projects that need the app
- Reduces overall system load
- Improves administrative clarity

### Performance Best Practices

- **Large Projects** (>10,000 issues): Consider using shorter default time filters
- **High Activity Projects**: Monitor load times and adjust pagination if needed
- **Archive Old Projects**: Disable the app for archived or completed projects

---

## Permission Configuration

### Required Jira Permissions

The app requires these Forge permissions:

```yaml
permissions:
  scopes:
    - read:jira-work       # Read issues, projects, and changelogs
    - read:jira-user       # Verify user permissions
    - storage:app          # Store project access configurations
```

### User-Level Permissions

Users must have Jira permissions to:
- **Browse Projects**: View projects and their issues
- **View Issues**: Access issue details
- **View Comments**: See issue comments (if included in changelog)

The app respects all Jira permission schemes and cannot bypass them.

---

## Advanced Configuration

### Custom Deployment Settings

For organizations with specific requirements:

#### Environment Variables

```yaml
# manifest.yml configuration
app:
  runtime:
    name: nodejs22.x
  id: your-app-id
```

#### Resource Configuration

```yaml
resources:
  - key: main
    path: static/hello-world/build
    tunnel:
      port: 3002
```

### Multi-Site Deployment

For organizations with multiple Jira instances:

1. Install the app on each site separately
2. Configure project access independently for each site
3. Each site maintains its own access configuration
4. No data is shared between sites

---

## Security Configuration

### Access Control Best Practices

1. **Principle of Least Privilege**
   - Only authorize projects that require change log tracking
   - Regularly review and remove unnecessary project access

2. **Regular Audits**
   - Monthly review of authorized projects
   - Verify project admins are managing enablement appropriately
   - Check for unused or archived projects

3. **Role Separation**
   - Site admins manage which projects *can* use the app
   - Project admins manage whether the app *is* used
   - Clear separation of responsibilities

4. **Access Logging**
   - Monitor which projects are using the app
   - Review access patterns for anomalies
   - Use Jira audit logs for compliance

### Compliance Configuration

For organizations with compliance requirements:

- **Data Residency**: All data stays within Jira/Forge infrastructure
- **Audit Trails**: All admin actions are logged in Jira audit logs
- **Access Controls**: Two-tier authorization system provides granular control
- **No External Access**: No data leaves the Atlassian ecosystem

---

## Troubleshooting Configuration Issues

### Issue: Projects not appearing in admin panel

**Possible Causes:**
- Permission issues with Jira API
- Project visibility restrictions

**Solutions:**
1. Verify app has `read:jira-work` permission
2. Check that you can see the projects in Jira normally
3. Try refreshing the admin page
4. Check browser console for API errors

### Issue: Unable to add projects

**Possible Causes:**
- Not a site administrator
- Storage write errors

**Solutions:**
1. Verify you're in an admin group (`site-admins`, `jira-administrators`, or `administrators`)
2. Check Forge app status in **Apps** → **Manage apps**
3. Try logging out and back in
4. Contact Atlassian support if storage errors persist

### Issue: Project enabled but users see "access denied"

**Possible Causes:**
- Site authorization not granted
- Project key mismatch

**Solutions:**
1. Verify project is in the site admin's allowed list
2. Check project key matches exactly (case-sensitive)
3. Verify user has Jira permissions to view issues
4. Try re-adding the project in admin settings

### Issue: Admin panel not showing

**Possible Causes:**
- Not a site administrator
- Group membership not synced

**Solutions:**
1. Verify group membership in **Jira Settings** → **User management**
2. Log out and log back in to refresh permissions
3. Clear browser cache
4. Contact site admin to verify group membership

---

## Configuration Checklist

### Initial Setup
- [ ] Install app on Jira instance
- [ ] Verify admin access to settings
- [ ] Authorize necessary projects (site-level)
- [ ] Configure project enablement (project-level)
- [ ] Test access with regular users
- [ ] Document project access decisions

### Ongoing Maintenance
- [ ] Monthly review of authorized projects
- [ ] Remove access for archived projects
- [ ] Monitor performance and user feedback
- [ ] Update documentation for new projects
- [ ] Train new admins on configuration procedures

---

## Next Steps

- **User Training**: See [User Guide](./04-user-guide.md)
- **Troubleshooting**: See [FAQ / Troubleshooting](./06-faq-troubleshooting.md)
- **Feature Details**: See [Features and Capabilities](./02-features-capabilities.md)

## Support

For configuration assistance, see [Support and Contact Information](./07-support-contact.md).
