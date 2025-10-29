# User Guide / Usage Instructions

This comprehensive guide will help you effectively use the Issue Change Log app to track, analyze, and export Jira issue changes.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Viewing Change Logs](#viewing-change-logs)
3. [Filtering Changes](#filtering-changes)
4. [Understanding Change Types](#understanding-change-types)
5. [Exporting Data](#exporting-data)
6. [Admin Functions](#admin-functions)
7. [Project Admin Functions](#project-admin-functions)
8. [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### Accessing the Change Log

1. **Navigate to any Jira issue** in an authorized project
2. **Look for the right sidebar** panel area
3. **Find "Issue Changelog"** panel
4. The change log will automatically load

### First-Time Access

When you first access the app:
- If your project is authorized and enabled, you'll see the change history immediately
- If not authorized, you'll see a clear message explaining the access restriction
- Contact your Jira administrator to request access if needed

---

## Viewing Change Logs

### Main Interface Components

#### 1. **Time Filter Dropdown**
Located at the top of the panel, this allows you to filter changes by time period.

**Available Options:**
- **24h** - Changes in the last 24 hours
- **7d** - Changes in the last 7 days
- **30d** - Changes in the last 30 days
- **6m** - Changes in the last 6 months
- **1y** - Changes in the last year
- **All** - All changes since issue creation (default)

**How to Use:**
1. Click the time filter dropdown
2. Select your desired time period
3. The change log will automatically refresh

#### 2. **Export Button**
Click **"Export to CSV"** to download all visible changes as a CSV file.

#### 3. **Change Log Table**

The main table displays all changes with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| **Type** | Type of change (Field/Comment/Attachment) | Field Change |
| **Field** | What was changed | Status, Priority, Assignee |
| **From** | Previous value | In Progress |
| **To** | New value | Done |
| **Author** | Who made the change | John Doe |
| **Date** | When the change occurred | 2024-01-15 14:30:25 |

#### 4. **Pagination**
- Navigate through pages using **Next** and **Previous** buttons
- Shows 20 changes per page by default
- Total count displayed at the bottom

---

## Filtering Changes

### Time-Based Filtering

#### Use Case: Recent Activity
**Filter: 24h or 7d**
- Perfect for daily stand-ups
- Quick overview of recent work
- Identify immediate issues

**Example Workflow:**
```
1. Select "24h" filter
2. Review what changed yesterday
3. Discuss in team meeting
4. Document decisions
```

#### Use Case: Sprint Review
**Filter: 7d or 30d**
- Review sprint progress
- Track feature implementations
- Identify blockers

**Example Workflow:**
```
1. Select "30d" filter
2. Export to CSV
3. Analyze sprint velocity
4. Present in retrospective
```

#### Use Case: Historical Analysis
**Filter: 6m, 1y, or All**
- Long-term trend analysis
- Compliance audits
- Root cause investigation

**Example Workflow:**
```
1. Select "All" filter
2. Review entire issue lifecycle
3. Identify process improvements
4. Document lessons learned
```

### Advanced Filtering Techniques

While the app provides time-based filters, you can combine with CSV export for advanced analysis:

1. **Export to CSV** with "All" filter
2. **Open in Excel/Google Sheets**
3. **Apply custom filters:**
   - Filter by specific authors
   - Filter by specific fields (Status, Priority, etc.)
   - Filter by date ranges
   - Create pivot tables for analysis

---

## Understanding Change Types

### 1. Field Changes

Field changes represent modifications to issue attributes.

**Common Field Changes:**

#### **Status Changes**
```
Type: Field Change
Field: Status
From: In Progress
To: Done
Author: Jane Smith
Date: 2024-01-15 10:30:00
```
**What it means:** Issue status was updated, typically indicating workflow progression.

#### **Priority Changes**
```
Type: Field Change
Field: Priority
From: Medium
To: High
Author: Project Manager
Date: 2024-01-14 15:45:00
```
**What it means:** Issue priority was adjusted, often due to changing business needs.

#### **Assignee Changes**
```
Type: Field Change
Field: Assignee
From: Developer A
To: Developer B
Author: Team Lead
Date: 2024-01-13 09:20:00
```
**What it means:** Issue responsibility was transferred to a different team member.

#### **Custom Field Changes**
```
Type: Field Change
Field: Story Points
From: 5
To: 8
Author: Scrum Master
Date: 2024-01-12 14:00:00
```
**What it means:** Custom field values were updated per project requirements.

### 2. Comments

Comments represent discussions and notes added to issues.

**Comment Format:**
```
Type: Comment
Author: John Doe
Content: "This issue is blocked by PROJ-123"
Created: 2024-01-15 11:30:00
Updated: 2024-01-15 11:45:00 (if edited)
```

**Comment Analysis:**
- **New Comments:** Created timestamp only
- **Edited Comments:** Both created and updated timestamps
- **Content:** Full text of the comment

### 3. Attachments

Attachments represent files uploaded to issues.

**Attachment Format:**
```
Type: Attachment
Filename: screenshot.png
Size: 245 KB
MIME Type: image/png
Author: Developer
Created: 2024-01-15 16:00:00
```

**Attachment Information:**
- **Filename:** Original file name
- **Size:** File size in bytes/KB/MB
- **Type:** MIME type of the file
- **Download:** Content URL for downloading (if permissions allow)

---

## Exporting Data

### CSV Export

#### How to Export

1. **Select Time Filter** (optional - to limit exported data)
2. Click **"Export to CSV"** button
3. File downloads automatically as `issue-changelog-{issueKey}.csv`

#### CSV File Structure

The exported CSV contains these columns:

```csv
Type,Field,From,To,Author,Date,Issue Key,Content,Filename,Size
Field Change,Status,In Progress,Done,John Doe,2024-01-15 10:30:00,KC-123,,,
Comment,,,,Jane Smith,2024-01-15 11:30:00,KC-123,"This issue is blocked",,
Attachment,,,File Upload,Bob Wilson,2024-01-15 16:00:00,KC-123,,screenshot.png,245000
```

#### Opening CSV Files

**Microsoft Excel:**
1. Open Excel
2. File → Open → Select CSV file
3. Data will be automatically formatted

**Google Sheets:**
1. Open Google Sheets
2. File → Import → Upload CSV
3. Choose "Replace current sheet" or "Create new sheet"

**Excel Power Query:**
```
1. Data → Get Data → From File → From Text/CSV
2. Select CSV file
3. Configure import settings
4. Click "Load"
```

### Use Cases for Exported Data

#### 1. **Compliance Reporting**
- Export all changes for audit period
- Include in compliance documentation
- Demonstrate change control processes

#### 2. **Performance Analysis**
```
Analysis Steps:
1. Export all changes (All filter)
2. Create pivot table by Author
3. Count changes per person
4. Analyze team workload distribution
```

#### 3. **Workflow Analysis**
```
Analysis Steps:
1. Export status changes only
2. Calculate time in each status
3. Identify bottlenecks
4. Optimize workflow
```

#### 4. **Historical Documentation**
- Archive issue history for closed projects
- Maintain records beyond Jira retention
- Support knowledge management

---

## Admin Functions

### Accessing Admin Panel

**Requirements:**
- Member of `site-admins`, `jira-administrators`, or `administrators` group

**How to Access:**
1. Open any Jira issue
2. Find "Issue Changelog" panel
3. Click **"Show Admin Panel"** button (visible to admins only)
4. Admin interface appears

### Managing Project Access

#### Adding Projects

**Single Project:**
1. Scroll to "Add Projects" section
2. Find the project in the list
3. Check the checkbox next to the project
4. Click **"Add Selected Projects"**
5. Project appears in "Currently Allowed Projects" table

**Multiple Projects:**
1. Check multiple project checkboxes
2. Click **"Add Selected Projects"**
3. All selected projects are added

**All Projects (Bulk Add):**
1. Check **"Select All"** checkbox at the top
2. All projects are selected
3. Click **"Add Selected Projects"**
4. All projects are added at once

#### Removing Projects

**Single Project:**
1. Find project in "Currently Allowed Projects" table
2. Click **"Remove"** button next to the project
3. Confirm removal
4. Project is immediately removed

**Multiple Projects:**
1. Check checkboxes next to projects to remove
2. Click **"Remove Selected"** button
3. Confirm bulk removal
4. All selected projects are removed

#### Viewing Project Information

For each authorized project, you can see:
- **Project Key** (e.g., KC, PROJ)
- **Project Name** (full name)
- **Project Type** (software, business, service-desk)
- **Date Added** (authorization timestamp)
- **Project ID** (internal Jira ID)

### Admin Best Practices

1. **Regular Reviews**
   - Monthly audit of authorized projects
   - Remove access for archived projects
   - Document authorization decisions

2. **Access Documentation**
   - Maintain a list of why each project has access
   - Track approval process
   - Note compliance requirements

3. **Communication**
   - Notify project admins when adding their projects
   - Explain enablement controls
   - Provide user training resources

---

## Project Admin Functions

### Accessing Project Settings

**Requirements:**
- Project Administrator role for the specific project

**How to Access:**
1. Go to **Project Settings**
2. Navigate to **Apps** section
3. Click **"Issue ChangeLog"**

### Enabling/Disabling the App

#### Enable the App

**When to Enable:**
- Project team needs change tracking
- Compliance requirements demand it
- Historical analysis is valuable

**How to Enable:**
1. In project settings, find the toggle switch
2. Switch to **"Enable Issue ChangeLog for this project"**
3. App is immediately active for all users
4. Users can see change logs in issues

#### Disable the App

**When to Disable:**
- Project is archived or completed
- Temporary suspension needed
- Performance optimization required
- Seasonal project is inactive

**How to Disable:**
1. In project settings, find the toggle switch
2. Switch to **"Disable Issue ChangeLog for this project"**
3. App is immediately disabled
4. Users see disabled message in issues

### Project Admin Best Practices

1. **Clear Communication**
   - Notify team when enabling/disabling
   - Explain impact on workflows
   - Provide timeline for changes

2. **Periodic Review**
   - Quarterly assessment of app value
   - Gather user feedback
   - Adjust enablement as needed

3. **Training**
   - Ensure team knows how to use the app
   - Share export capabilities
   - Document use cases for your team

---

## Tips and Best Practices

### For End Users

#### 1. **Daily Workflow Integration**
```
Morning Routine:
1. Open assigned issues
2. Check "24h" filter in changelog
3. Review overnight changes
4. Plan daily work accordingly
```

#### 2. **Efficient Filtering**
- Use shortest relevant time filter for speed
- Start with 24h, expand if needed
- Use "All" only for comprehensive analysis

#### 3. **Export Strategy**
- Export before major milestones
- Include in sprint reports
- Archive for compliance

#### 4. **Understanding Context**
- Read author names to understand who made changes
- Check timestamps for chronological understanding
- Review comments for additional context

### For Project Managers

#### 1. **Sprint Tracking**
```
Weekly Review:
1. Export last 7 days
2. Analyze status changes
3. Identify blocked issues
4. Report to stakeholders
```

#### 2. **Team Performance**
```
Monthly Analysis:
1. Export last 30 days
2. Group by author
3. Analyze contribution patterns
4. Balance workload
```

#### 3. **Process Improvement**
```
Quarterly Review:
1. Export last 6 months
2. Analyze workflow patterns
3. Identify bottlenecks
4. Optimize processes
```

### For Compliance Officers

#### 1. **Audit Preparation**
```
Audit Workflow:
1. Export all changes
2. Filter by audit period
3. Review change patterns
4. Document in audit report
```

#### 2. **Change Control**
```
Monthly Review:
1. Export recent changes
2. Verify authorization
3. Check approval processes
4. Document compliance
```

### For Development Teams

#### 1. **Bug Investigation**
```
Investigation Process:
1. Open affected issue
2. Select "All" time filter
3. Review all changes
4. Identify when bug was introduced
5. Trace to specific change
```

#### 2. **Code Review Context**
```
Review Process:
1. Check issue changelog
2. Understand requirement evolution
3. Review related comments
4. Make informed review decisions
```

---

## Keyboard Shortcuts

The app doesn't have custom keyboard shortcuts, but you can use standard browser shortcuts:

- **Ctrl/Cmd + F** - Search within the page
- **Ctrl/Cmd + S** - Save/Export (triggers CSV download if focused)
- **Tab** - Navigate between interactive elements

---

## Accessibility Features

The app is designed with accessibility in mind:
- **Screen Reader Compatible** - All elements are properly labeled
- **Keyboard Navigation** - Full functionality without mouse
- **High Contrast** - Compatible with high contrast modes
- **Responsive Design** - Works on various screen sizes

---

## Common Workflows

### Workflow 1: Daily Stand-up Preparation
```
1. Select "24h" filter
2. Review changes since last stand-up
3. Note blocked issues (from comments)
4. Prepare status update
```

### Workflow 2: Sprint Retrospective
```
1. Select "30d" filter (or sprint length)
2. Export to CSV
3. Analyze status change patterns
4. Identify process improvements
5. Document in retrospective notes
```

### Workflow 3: Compliance Audit
```
1. Determine audit period
2. Select appropriate time filter
3. Export to CSV
4. Open in Excel/Sheets
5. Filter by compliance-relevant fields
6. Include in audit documentation
```

### Workflow 4: Root Cause Analysis
```
1. Open problematic issue
2. Select "All" filter
3. Review entire history
4. Identify when problem started
5. Trace to specific change/comment
6. Document findings
```

---

## Troubleshooting User Issues

### Issue: "No changes displayed"

**Possible Causes:**
- Time filter too restrictive
- Issue has no history yet
- Access issues

**Solutions:**
1. Change filter to "All"
2. Refresh the page
3. Verify issue has been modified
4. Check project authorization

### Issue: "Export button not working"

**Possible Causes:**
- Browser pop-up blocker
- JavaScript errors
- No changes to export

**Solutions:**
1. Disable pop-up blocker for Jira
2. Try different browser
3. Check browser console for errors
4. Ensure changes exist to export

### Issue: "Changes load slowly"

**Possible Causes:**
- Large change history
- Network issues
- Browser performance

**Solutions:**
1. Use shorter time filter
2. Clear browser cache
3. Close unnecessary browser tabs
4. Check internet connection

---

## Next Steps

- **Troubleshooting**: See [FAQ / Troubleshooting](./06-faq-troubleshooting.md)
- **Configuration**: See [Configuration and Setup](./03-configuration-setup.md)
- **Features**: See [Features and Capabilities](./02-features-capabilities.md)

## Support

For usage assistance, see [Support and Contact Information](./07-support-contact.md).
