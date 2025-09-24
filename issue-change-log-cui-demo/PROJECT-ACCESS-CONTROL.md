# Issue Change Log with Project Access Control

This Forge app provides detailed change logs for Jira issues with project-level access control. Only authorized projects can access the app, and site administrators can manage which projects have access.

## Features

### 📊 Change Log Tracking
- View comprehensive change logs for Jira issues
- Track field changes, comments, and attachments
- Filter by time periods (24h, 7d, 30d, 6m, 1y, all time)
- Export data to CSV format
- Real-time updates with pagination

### 🔒 Project Access Control
- **Restricted Access**: Only specific projects can use the app
- **Admin Management**: Site administrators can add/remove project access
- **Automatic Verification**: Access is checked automatically for each request
- **Clear Messaging**: Users see clear access denied messages when unauthorized

## Access Control Setup

### For Site Administrators

1. **Admin Access**: Users with the following roles can manage project access:
   - `site-admins`
   - `jira-administrators` 
   - `administrators`

2. **Managing Project Access**:
   - Open the app in any issue (as an admin)
   - Click "Show Admin Panel" button
   - Add projects using the dropdown selection
   - Remove projects by clicking the "✕" button next to each project

3. **Initial Setup**:
   - When first installed, no projects have access
   - Admins must manually grant access to each project that should use the app
   - Projects are identified by their project key (e.g., "KC", "PROJ", "DEMO")

### For Regular Users

- **Access Granted**: If your project has access, the app works normally
- **Access Denied**: If your project doesn't have access, you'll see:
  ```
  🔒 Access Restricted
  Access denied: Project [KEY] is not authorized to use this app
  Please contact your site administrator to request access for this project.
  ```

## How It Works

### Backend Security
- Every request checks the project key of the current issue
- Project access is verified against the stored allowed projects list
- Access control happens before any data is processed
- Admin functions require administrator privileges

### Storage
- Allowed projects are stored in Forge app storage
- Data persists across app updates and restarts
- Only administrators can modify the access list

### User Experience
- Non-admin users only see the changelog interface
- Admin users see an additional "Admin Panel" toggle
- Access denied messages are clear and actionable
- No functionality is exposed to unauthorized projects

## Technical Implementation

### Permissions Required
```yaml
permissions:
  scopes:
    - read:jira-work        # Read Jira issues and projects
    - read:jira-user        # Check user permissions  
    - storage:app           # Store project access configuration
```

### API Functions
- `devSuvitha`: Main changelog function with access control
- `getAllowedProjects`: Get list of allowed projects (admin only)
- `addAllowedProject`: Add project to allowed list (admin only)
- `removeAllowedProject`: Remove project from allowed list (admin only)
- `getAllProjects`: Get all available projects (admin only)

## Installation & Deployment

1. Deploy the app using Forge CLI:
   ```bash
   forge deploy
   forge install
   ```

2. Grant initial project access:
   - Site admin opens the app in any project
   - Uses the Admin Panel to add authorized projects

3. Users in authorized projects can now access the app

## Troubleshooting

### "Access denied" errors
- Verify the project key is correct
- Check with site administrator about project authorization
- Ensure the user is viewing an issue from an authorized project

### Admin panel not showing
- Verify user has administrator privileges
- Check user is in correct admin groups:
  - `site-admins`
  - `jira-administrators`
  - `administrators`

### Projects not loading in admin panel
- Verify app has `read:jira-work` permission
- Check Jira API connectivity
- Review app logs for detailed error messages

## Security Notes

- Project access is enforced at the API level
- Admin functions require proper role verification
- All storage operations are secured through Forge platform
- Access control cannot be bypassed through direct API calls

## Support

For issues or questions:
1. Check the app logs in Forge CLI
2. Verify permissions and access configurations
3. Contact your Jira administrator for access requests
