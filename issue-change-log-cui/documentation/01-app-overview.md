# Issue Change Log - App Overview

## Introduction

The **Issue Change Log** is a powerful Atlassian Forge application designed for Jira that provides comprehensive tracking and visualization of all changes made to Jira issues. This app enables teams to maintain complete audit trails, monitor issue evolution, and enhance transparency in their project workflows.

## What is Issue Change Log?

Issue Change Log is a native Jira app that displays detailed change history for issues including:
- Field modifications and updates
- Comments and their revisions
- Attachments and file uploads
- Status transitions
- Custom field changes
- Time-based filtering of changes

## Key Benefits

### 🔍 **Complete Visibility**
Track every change made to your Jira issues with detailed timestamps, authors, and modification details.

### 🔒 **Enterprise-Grade Access Control**
- Site-level authorization managed by Jira administrators
- Project-level enablement controlled by project administrators
- Granular permission system ensures only authorized users access the app

### 📊 **Enhanced Reporting**
- Export change logs to CSV format
- Filter by time periods (24 hours, 7 days, 30 days, 6 months, 1 year, or all time)
- Track multiple issues simultaneously

### ⚡ **Seamless Integration**
- Native Jira issue panel integration
- Admin settings page for site-wide management
- Project settings page for project-level control
- Works with Jira Cloud without additional infrastructure

### 🚀 **Performance Optimized**
- Efficient data fetching with pagination
- Optimized API calls to Jira REST API
- Fast loading times even with large change histories

## Target Audience

### **Development Teams**
Track code-related changes, bug fixes, and feature implementations through issue history.

### **Project Managers**
Monitor project progress, identify bottlenecks, and maintain comprehensive audit trails.

### **Compliance Officers**
Ensure regulatory compliance with detailed change tracking and audit capabilities.

### **Quality Assurance Teams**
Review testing cycles, track bug resolutions, and verify issue lifecycle management.

### **DevOps Teams**
Monitor deployment-related changes, track release cycles, and maintain operational visibility.

## Use Cases

### **Audit and Compliance**
Maintain detailed records of all issue modifications for compliance requirements (SOC 2, ISO 27001, GDPR, etc.).

### **Root Cause Analysis**
Investigate when and why specific changes were made to identify issues or process improvements.

### **Team Transparency**
Provide visibility into who made what changes and when, fostering accountability and collaboration.

### **Quality Tracking**
Monitor how issues evolve through different stages and identify patterns in workflow efficiency.

### **Historical Analysis**
Analyze patterns in issue modifications over time to improve processes and workflows.

## How It Works

1. **Installation**: Install the app from Atlassian Marketplace to your Jira Cloud instance
2. **Site Authorization**: Jira administrators authorize projects that can use the app
3. **Project Enablement**: Project administrators enable/disable the app for their projects
4. **Usage**: Authorized users view detailed change logs directly in the issue panel
5. **Export**: Users can export change data to CSV for further analysis

## Platform Compatibility

- **Jira Cloud**: Fully supported
- **Jira Data Center/Server**: Not supported (Forge apps are Cloud-only)
- **Supported Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: Responsive design works on mobile browsers

## Architecture

Issue Change Log is built on the **Atlassian Forge platform**, which provides:
- Secure, isolated runtime environment
- Built-in authentication and authorization
- Direct integration with Jira APIs
- Automatic scaling and performance optimization
- Zero infrastructure management required

## Data Privacy

- **No External Storage**: All data remains within your Jira instance
- **Forge Storage Only**: Only project access configurations are stored in Forge app storage
- **No Third-Party Access**: The app does not share data with any external services
- **Jira Permissions Respected**: Users can only see data they have permission to access

## Next Steps

- **Installation**: See [Installation Guide](./02-installation-guide.md)
- **Configuration**: See [Configuration and Setup](./03-configuration-setup.md)
- **User Guide**: See [User Guide](./04-user-guide.md)
- **Troubleshooting**: See [FAQ / Troubleshooting](./06-faq-troubleshooting.md)

## Version Information

- **Current Version**: 1.2.15
- **License**: MIT
- **Runtime**: Node.js 22.x
- **Forge API Version**: 6.1.1

## Support

For questions, issues, or feature requests, please see our [Support and Contact Information](./07-support-contact.md).
