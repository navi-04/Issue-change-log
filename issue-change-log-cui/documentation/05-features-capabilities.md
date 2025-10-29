# Features and Capabilities

This document provides a comprehensive overview of all features and capabilities of the Issue Change Log app.

## Core Features

### 1. Comprehensive Change Tracking

#### Field Change Tracking
Track modifications to all Jira issue fields:

**Standard Fields:**
- **Status** - Workflow state changes
- **Assignee** - Issue ownership transfers
- **Priority** - Urgency level modifications
- **Reporter** - Issue creator changes
- **Labels** - Tag additions and removals
- **Components** - Component assignments
- **Fix Version/s** - Release planning updates
- **Affects Version/s** - Version impact tracking
- **Resolution** - Issue resolution states
- **Due Date** - Timeline adjustments
- **Sprint** - Agile sprint assignments
- **Story Points** - Estimation changes
- **Epic Link** - Epic associations

**Custom Fields:**
- All custom field types supported
- Text, number, date, select, multi-select, etc.
- Project-specific custom fields included

**Change Details Captured:**
- Previous value (From)
- New value (To)
- Change author
- Exact timestamp
- Issue key reference

#### Comment Tracking
Monitor all issue discussions:

**Comment Information:**
- **Full Content** - Complete comment text
- **Author** - Who added the comment
- **Created Date** - Original comment timestamp
- **Updated Date** - Last edit timestamp (if edited)
- **Comment ID** - Unique identifier

**Comment Features:**
- Chronological ordering
- Edit history tracking
- Time-based filtering
- Export to CSV

#### Attachment Tracking
Track all file uploads:

**Attachment Details:**
- **Filename** - Original file name
- **File Size** - Size in bytes/KB/MB
- **MIME Type** - File format (image/png, application/pdf, etc.)
- **Upload Author** - Who added the file
- **Upload Date** - When file was attached
- **Content URL** - Download link (if permissions allow)

**Supported File Types:**
- Images (PNG, JPG, GIF, SVG, etc.)
- Documents (PDF, DOC, DOCX, XLS, XLSX, etc.)
- Archives (ZIP, RAR, TAR, etc.)
- Code files (Java, Python, JavaScript, etc.)
- All Jira-supported file types

---

### 2. Advanced Filtering System

#### Time-Based Filters

**24 Hours Filter**
- Shows changes from the last 24 hours
- Perfect for daily stand-ups
- Quick overnight activity review
- Minimal data loading time

**7 Days Filter**
- Shows changes from the last week
- Ideal for sprint planning
- Weekly team reviews
- Recent activity analysis

**30 Days Filter**
- Shows changes from the last month
- Sprint retrospectives
- Monthly reporting
- Medium-term trend analysis

**6 Months Filter**
- Shows changes from the last half year
- Quarterly reviews
- Long-term pattern identification
- Performance analysis

**1 Year Filter**
- Shows changes from the last year
- Annual reviews
- Comprehensive trend analysis
- Historical comparisons

**All Time Filter** (Default)
- Shows complete issue history
- Full lifecycle tracking
- Compliance audits
- Root cause investigations

#### Filter Performance
- Instant filter application
- No page reload required
- Optimized data fetching
- Pagination support for large datasets

---

### 3. Data Export Capabilities

#### CSV Export Feature

**Export Functionality:**
- One-click export to CSV
- Respects current time filter
- Includes all visible data
- Automatic file download

**CSV File Format:**
```csv
Type,Field,From,To,Author,Date,Issue Key,Content,Filename,Size
```

**Exported Data:**
- All field changes in filtered timeframe
- All comments with full content
- All attachment metadata
- Author information
- Timestamps in ISO format

**File Naming Convention:**
```
issue-changelog-{ISSUE-KEY}.csv
Example: issue-changelog-KC-123.csv
```

**Use Cases:**
- Offline analysis
- Compliance documentation
- Historical archiving
- Data integration with other tools
- Custom reporting and visualization

#### Post-Export Analysis

**Excel Integration:**
- Open directly in Microsoft Excel
- Apply custom filters and sorting
- Create pivot tables
- Generate charts and graphs
- Advanced data analysis

**Google Sheets Integration:**
- Import via File → Import
- Collaborative analysis
- Real-time sharing
- Cloud-based storage

**Power BI / Tableau:**
- Import CSV as data source
- Create custom dashboards
- Advanced visualizations
- Business intelligence reporting

---

### 4. Two-Tier Access Control

#### Site-Level Authorization

**Administrator Control:**
- Jira administrators manage which projects can use the app
- Explicit authorization required
- No default access (zero-trust model)
- Bulk authorization supported ("Select All" feature)

**Authorization Features:**
- Add projects individually or in bulk
- Remove projects individually or in bulk
- View project metadata (name, type, key, ID)
- Track authorization date
- Search and filter project lists

**Security Benefits:**
- Prevents unauthorized data access
- Clear audit trail
- Centralized control
- Compliance-friendly

#### Project-Level Enablement

**Project Administrator Control:**
- Project admins toggle app on/off for their project
- Independent of site authorization
- Immediate effect on users
- Enabled by default when authorized

**Enablement Features:**
- Simple toggle switch
- Clear status indicators
- Permission verification
- Instant activation/deactivation

**Use Cases:**
- Temporary suspension for maintenance
- Phased rollout to teams
- Project-specific compliance requirements
- Performance optimization

---

### 5. User Interface Features

#### Main Panel Interface

**Layout:**
- Clean, intuitive design
- Responsive for all screen sizes
- Consistent with Jira UI patterns
- Accessible and keyboard-navigable

**Components:**
1. **Time Filter Dropdown** - Top of panel
2. **Export Button** - Right side of header
3. **Change Log Table** - Main content area
4. **Pagination Controls** - Bottom of table
5. **Total Count Display** - Shows number of changes

**Table Features:**
- Sortable columns
- Fixed header
- Responsive columns
- Clear data formatting
- Loading indicators

#### Admin Panel Interface

**Admin Features:**
- Toggle visibility with "Show Admin Panel" button
- Two-section layout:
  - Currently Allowed Projects (top)
  - Add Projects (bottom)
- Bulk selection with "Select All" checkbox
- Search/filter for projects
- Inline removal buttons
- Bulk removal for multiple projects

**Project Information Display:**
- Project key (e.g., KC)
- Project name
- Project type
- Authorization date
- Project ID

#### Project Settings Interface

**Settings Page:**
- Accessible via Project Settings → Apps → Issue ChangeLog
- Clear status indicators
- Simple enable/disable toggle
- Permission status display
- Help text and guidance

**Information Displayed:**
- Project name and key
- Site authorization status
- Current enablement state
- Admin permission status
- Clear error messages if issues

---

### 6. Performance Optimizations

#### Data Loading

**Pagination:**
- 20 items per page (default)
- Reduces initial load time
- Smooth navigation between pages
- Total count always visible

**Lazy Loading:**
- Changes loaded on demand
- Only visible data fetched
- Optimized API calls
- Minimal bandwidth usage

**Caching:**
- Intelligent data caching
- Reduced API calls
- Faster filter switching
- Improved user experience

#### API Optimization

**Efficient Fetching:**
- Single API call per issue
- Batch processing for multiple issues
- Parallel requests where possible
- Error handling and retry logic

**Rate Limiting:**
- Respects Jira API rate limits
- Automatic throttling
- Queue management
- User feedback during delays

---

### 7. Security Features

#### Data Privacy

**No External Storage:**
- All data stays within Jira
- No third-party services
- No external databases
- Forge app storage for config only

**Permission Respect:**
- Honors Jira permission schemes
- Cannot bypass user permissions
- Project access validated
- Issue visibility enforced

**Secure Communication:**
- HTTPS only
- Forge platform security
- Encrypted data transmission
- Secure token handling

#### Access Control

**Multi-Level Security:**
1. Forge platform authentication
2. Jira user authentication
3. Site-level project authorization
4. Project-level app enablement
5. Jira issue permissions

**Audit Trail:**
- All admin actions logged
- Authorization changes tracked
- Jira audit logs integration
- Compliance-ready logging

---

### 8. Compatibility

#### Platform Support

**Jira Cloud:**
- ✅ Fully supported
- ✅ All Jira Cloud plans
- ✅ Latest Jira version
- ✅ Backward compatible

**Jira Data Center/Server:**
- ❌ Not supported (Forge is Cloud-only)

#### Browser Support

**Fully Supported Browsers:**
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Mobile Browsers:**
- ✅ Chrome Mobile
- ✅ Safari Mobile
- ✅ Firefox Mobile
- Responsive design adapts to screen size

#### Project Type Support

**Supported Project Types:**
- ✅ Software projects
- ✅ Business projects
- ✅ Service Desk projects
- ✅ All Jira project types

---

### 9. Integration Capabilities

#### Jira Integration

**Native Integration:**
- Issue panel module
- Admin page module
- Project settings module
- Jira REST API v3

**Forge Platform:**
- Built on Atlassian Forge
- Serverless architecture
- Auto-scaling infrastructure
- Zero maintenance required

#### Third-Party Tools

**Data Export for:**
- Microsoft Excel
- Google Sheets
- Power BI
- Tableau
- Custom reporting tools
- Any CSV-compatible software

---

### 10. Scalability

#### Performance at Scale

**Large Datasets:**
- Handles thousands of changes per issue
- Efficient pagination prevents slowdowns
- Time filtering reduces data volume
- Optimized for large Jira instances

**Multi-Project Support:**
- Unlimited projects supported
- Independent project configuration
- Scalable authorization management
- No performance degradation

**User Capacity:**
- Supports unlimited users
- Concurrent access optimized
- No user limits
- Forge platform auto-scaling

---

## Feature Comparison Matrix

### User Types

| Feature | End User | Project Admin | Site Admin |
|---------|----------|---------------|------------|
| View change logs | ✅ | ✅ | ✅ |
| Filter by time | ✅ | ✅ | ✅ |
| Export to CSV | ✅ | ✅ | ✅ |
| Enable/disable project app | ❌ | ✅ | ✅ |
| Authorize projects | ❌ | ❌ | ✅ |
| Bulk project management | ❌ | ❌ | ✅ |

### Change Types

| Change Type | Tracked | Filterable | Exportable |
|-------------|---------|------------|------------|
| Field changes | ✅ | ✅ | ✅ |
| Comments | ✅ | ✅ | ✅ |
| Attachments | ✅ | ✅ | ✅ |
| Status changes | ✅ | ✅ | ✅ |
| Custom fields | ✅ | ✅ | ✅ |

---

## Feature Roadmap

### Potential Future Features

> **Note:** These are potential future enhancements, not currently available.

**Advanced Filtering:**
- Filter by specific fields
- Filter by specific authors
- Multiple filter combinations
- Saved filter presets

**Enhanced Visualizations:**
- Timeline view of changes
- Change frequency graphs
- Author contribution charts
- Field modification heatmaps

**Notifications:**
- Email alerts for specific changes
- In-app notifications
- Webhook integrations
- Custom notification rules

**Bulk Operations:**
- Export multiple issues at once
- Cross-issue change analysis
- Project-wide reporting
- Epic-level change tracking

**Advanced Analytics:**
- Change velocity metrics
- Author productivity stats
- Field modification patterns
- Workflow bottleneck identification

---

## Current Limitations

### Known Limitations

1. **Single Issue View**
   - Currently displays one issue at a time
   - No cross-issue comparison (yet)

2. **Time Filter Only**
   - Cannot filter by specific fields or authors in UI
   - Use CSV export + Excel for advanced filtering

3. **No Custom Notifications**
   - No built-in alerting system
   - Manual monitoring required

4. **Cloud Only**
   - Forge apps only support Jira Cloud
   - Not available for Data Center/Server

5. **CSV Export Format**
   - Single standardized format
   - No custom export templates

### Workarounds

**For Cross-Issue Analysis:**
- Export multiple issues individually
- Combine in Excel/Sheets
- Use custom scripts for automation

**For Advanced Filtering:**
- Export to CSV
- Use Excel/Sheets filters
- Create pivot tables

**For Notifications:**
- Use Jira automation rules
- Set up custom email rules
- Integrate with external monitoring tools

---

## Technical Specifications

### API Integration

**Jira REST API v3:**
- `/rest/api/3/issue/{issueKey}?expand=changelog`
- `/rest/api/3/issue/{issueKey}/comment`
- `/rest/api/3/project`

**Forge API:**
- `@forge/api` version 6.1.1
- `@forge/resolver` version 1.7.0
- Storage API for configuration

### Storage

**Forge App Storage:**
- Project authorization data
- Project metadata
- Project-level settings
- No issue data stored

### Runtime

**Environment:**
- Node.js 22.x
- Serverless execution
- Auto-scaling
- Global availability

---

## Next Steps

- **Installation**: See [Installation Guide](./02-installation-guide.md)
- **Configuration**: See [Configuration and Setup](./03-configuration-setup.md)
- **Usage**: See [User Guide](./04-user-guide.md)

## Support

For feature requests or questions, see [Support and Contact Information](./07-support-contact.md).
