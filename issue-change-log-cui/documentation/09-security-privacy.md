# Security and Privacy

This document provides comprehensive information about security measures, data privacy, and compliance considerations for the Issue Change Log app.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Data Privacy](#data-privacy)
3. [Access Control](#access-control)
4. [Data Storage](#data-storage)
5. [Encryption and Transport](#encryption-and-transport)
6. [Authentication and Authorization](#authentication-and-authorization)
7. [Compliance](#compliance)
8. [Security Best Practices](#security-best-practices)
9. [Incident Response](#incident-response)
10. [Audit and Monitoring](#audit-and-monitoring)

---

## Security Overview

### Security Model

Issue Change Log is built on the **Atlassian Forge platform**, which provides enterprise-grade security:

**Platform Security:**
- ✅ Secure, isolated runtime environment
- ✅ Automatic security patches
- ✅ DDoS protection
- ✅ Infrastructure security managed by Atlassian
- ✅ SOC 2 Type II certified platform
- ✅ ISO 27001 certified infrastructure

**App-Specific Security:**
- ✅ Zero-trust security model
- ✅ Explicit authorization required
- ✅ Multi-tier access control
- ✅ Principle of least privilege
- ✅ No external data transmission
- ✅ Secure API communication

### Security Principles

#### 1. **Zero Trust**
- No default access to any project
- Explicit authorization required at multiple levels
- Continuous verification of access rights

#### 2. **Defense in Depth**
- Multiple security layers:
  - Forge platform security
  - Jira authentication
  - Site-level authorization
  - Project-level enablement
  - Jira permission schemes
  - Issue-level visibility

#### 3. **Least Privilege**
- Users only see data they're authorized to access
- Admins have clearly defined permissions
- Project admins have limited scope
- No privilege escalation possible

#### 4. **Privacy by Design**
- Minimal data collection
- No external data storage
- Transparent data handling
- User consent respected

---

## Data Privacy

### What Data Does the App Access?

#### **Issue Data (Read-Only)**
The app reads but does not store:
- Issue field changes (status, priority, assignee, etc.)
- Comments and their content
- Attachments metadata (filename, size, author)
- Issue keys and project associations
- Author/user information for changes

#### **Project Data (Read-Only)**
The app reads:
- Project keys and names
- Project types
- Project IDs
- User permissions for projects

#### **Configuration Data (Stored)**
The app stores in Forge app storage:
```javascript
{
  "allowedProjects": ["KC", "PROJ"],
  "allowedProjectsData": {
    "KC": {
      "key": "KC",
      "name": "Kanban Central",
      "id": "10001",
      "dateAdded": "2024-01-15T10:30:00.000Z"
    }
  },
  "project_KC_settings": {
    "enabled": true,
    "lastUpdated": "2024-01-20T14:45:00.000Z"
  }
}
```

### What Data is NOT Collected?

The app does NOT collect, store, or transmit:
- ❌ Personal user information beyond what's in Jira
- ❌ Usage analytics or telemetry
- ❌ Issue content or descriptions
- ❌ Attachment file contents
- ❌ User passwords or credentials
- ❌ Payment information
- ❌ Third-party service data

### Data Retention

**Issue Data:**
- Not stored by the app
- Only read from Jira in real-time
- Governed by Jira's retention policies

**Configuration Data:**
- Stored in Forge app storage
- Retained until app is uninstalled
- Automatically deleted upon uninstallation
- No backup to external systems

### Data Deletion

**User-Initiated Deletion:**
- Uninstall the app to delete all configuration data
- Issue data remains in Jira (app never stored it)

**Automatic Deletion:**
- Configuration deleted when app is uninstalled
- No residual data in external systems

---

## Access Control

### Multi-Tier Access Control

#### Tier 1: Forge Platform Authentication
- User must be authenticated with Atlassian
- Managed by Atlassian Identity
- SSO support where configured
- Multi-factor authentication (if enabled in Jira)

#### Tier 2: Jira User Authentication
- User must have valid Jira account
- Account must have access to Jira instance
- Session management by Jira

#### Tier 3: Site-Level Project Authorization
- Jira administrators explicitly authorize projects
- No default access to any project
- Centralized control by admin group

#### Tier 4: Project-Level App Enablement
- Project administrators enable/disable app
- Independent of site authorization
- Allows project-specific control

#### Tier 5: Jira Permission Schemes
- User must have Jira permissions to view issues
- App respects all Jira permission schemes
- Cannot bypass Jira security

#### Tier 6: Issue-Level Visibility
- User can only see issues they have permission to view
- Issue security levels respected
- Field-level security honored

### Administrator Access

**Site Administrators:**
- Must be member of: `site-admins`, `jira-administrators`, or `administrators`
- Can authorize/revoke project access
- Can view all projects (subject to Jira permissions)
- Cannot bypass project-level controls

**Project Administrators:**
- Must have "Administer Projects" permission
- Can enable/disable app for their project
- Cannot modify site-level authorization
- Cannot access other projects' settings

**Regular Users:**
- Can view change logs for authorized projects
- Can export data they can view
- Cannot access admin functions
- Cannot modify configurations

### Access Validation Process

Every request is validated:
```
1. Verify Forge authentication
2. Verify Jira user authentication
3. Extract project key from issue
4. Check site-level authorization
5. Check project-level enablement
6. Verify Jira issue permissions
7. Grant or deny access
```

---

## Data Storage

### Storage Architecture

**Forge App Storage:**
- Managed by Atlassian Forge platform
- Encrypted at rest
- Isolated per app installation
- Automatic backups by platform

**What's Stored:**
- Project authorization list
- Project metadata (name, key, type, date)
- Project-level settings (enabled/disabled)

**What's NOT Stored:**
- Issue data
- Attachment contents
- User credentials
- Personal information

### Storage Location

**Data Residency:**
- Stored in Atlassian Forge infrastructure
- Same region as your Jira Cloud instance
- Subject to Atlassian's data residency policies
- No third-party storage services

**Compliance:**
- Inherits Atlassian's compliance certifications
- GDPR compliant
- SOC 2 Type II
- ISO 27001

### Storage Security

**Encryption:**
- ✅ Encrypted at rest (managed by Forge)
- ✅ Encrypted in transit (HTTPS only)
- ✅ No plaintext storage of sensitive data

**Access Control:**
- ✅ Isolated per app installation
- ✅ Only accessible via app code
- ✅ No direct database access
- ✅ No external API exposure

---

## Encryption and Transport

### Data in Transit

**HTTPS Everywhere:**
- All communication over HTTPS
- TLS 1.2+ required
- Strong cipher suites only
- Certificate validation enforced

**API Communication:**
```
User Browser ←HTTPS→ Jira Cloud ←HTTPS→ Forge Platform ←HTTPS→ App
```

**No Unencrypted Transmission:**
- No HTTP allowed
- No cleartext protocols
- No unencrypted data storage
- No external data transmission

### Data at Rest

**Forge Storage Encryption:**
- Managed by Atlassian Forge
- Industry-standard encryption
- Automatic key management
- Transparent to app developers

**Jira Data Encryption:**
- Managed by Atlassian Jira Cloud
- Enterprise-grade encryption
- Compliance certifications
- Regular security audits

---

## Authentication and Authorization

### Authentication Methods

**Atlassian Identity:**
- Primary authentication mechanism
- SSO support (SAML, OAuth)
- Multi-factor authentication (MFA)
- Session management

**Forge Platform:**
- Automatic user context
- Secure token handling
- No password storage in app
- Identity verification by platform

### Authorization Model

**Role-Based Access Control (RBAC):**
- Site Administrator role
- Project Administrator role
- Regular User role
- Permissions enforced at API level

**Permission Verification:**
```javascript
// Every request checks permissions
const hasAccess = await checkProjectAccess(projectKey);
const isAdmin = await checkAdminPermissions(user);
const isProjectAdmin = await checkProjectAdminAccess(projectKey);
```

### Token Security

**Secure Token Handling:**
- Managed by Forge platform
- Short-lived tokens
- Automatic rotation
- No token exposure to client

**API Authentication:**
- OAuth 2.0 for Jira API
- Secure credential storage
- No hardcoded secrets
- Automatic credential refresh

---

## Compliance

### Regulatory Compliance

#### **GDPR (General Data Protection Regulation)**
- ✅ Minimal data collection
- ✅ No unnecessary personal data storage
- ✅ Data processing transparency
- ✅ User rights respected (access, deletion)
- ✅ Data residency compliance
- ✅ No third-party data sharing

#### **SOC 2 Type II**
- ✅ Inherited from Forge platform
- ✅ Security controls
- ✅ Availability controls
- ✅ Confidentiality controls

#### **ISO 27001**
- ✅ Inherited from Atlassian infrastructure
- ✅ Information security management
- ✅ Risk management processes

#### **Privacy Shield / Standard Contractual Clauses**
- ✅ Compliant with data transfer regulations
- ✅ Standard contractual clauses available
- ✅ Adequate data protection

### Industry Standards

**OWASP Top 10:**
- ✅ Protection against injection attacks
- ✅ Secure authentication
- ✅ Sensitive data protection
- ✅ Access control enforcement
- ✅ Security misconfiguration prevention
- ✅ XSS protection
- ✅ Insecure deserialization prevention
- ✅ Logging and monitoring
- ✅ Known vulnerability management

**NIST Cybersecurity Framework:**
- ✅ Identify: Asset and risk management
- ✅ Protect: Access control and data security
- ✅ Detect: Monitoring and detection
- ✅ Respond: Incident response procedures
- ✅ Recover: Recovery planning

### Audit Support

**Compliance Documentation:**
- This security document
- Privacy policy
- Terms of service
- Data processing agreement (via Atlassian)

**Audit Trail:**
- All admin actions logged in Jira audit logs
- Configuration changes tracked
- Access attempts recorded

---

## Security Best Practices

### For Administrators

**1. Access Management**
```
✅ DO: Regularly review authorized projects
✅ DO: Remove access for completed/archived projects
✅ DO: Document authorization decisions
✅ DO: Use principle of least privilege
✅ DO: Audit admin group membership

❌ DON'T: Authorize all projects without review
❌ DON'T: Share admin credentials
❌ DON'T: Leave unused projects authorized
```

**2. Configuration Management**
```
✅ DO: Document configuration changes
✅ DO: Test changes in non-production first
✅ DO: Keep authorization lists current
✅ DO: Review settings regularly

❌ DON'T: Make undocumented changes
❌ DON'T: Grant access without approval
```

**3. User Management**
```
✅ DO: Verify user Jira permissions
✅ DO: Train users on security practices
✅ DO: Monitor for suspicious activity

❌ DON'T: Override Jira permission schemes
❌ DON'T: Grant unnecessary admin access
```

### For Users

**1. Account Security**
```
✅ DO: Use strong passwords
✅ DO: Enable multi-factor authentication
✅ DO: Keep browser updated
✅ DO: Log out from shared devices

❌ DON'T: Share your Jira account
❌ DON'T: Use weak passwords
❌ DON'T: Disable security features
```

**2. Data Handling**
```
✅ DO: Export only necessary data
✅ DO: Protect exported CSV files
✅ DO: Delete exports when no longer needed
✅ DO: Follow company data policies

❌ DON'T: Share exported data publicly
❌ DON'T: Store exports in unsecure locations
❌ DON'T: Email sensitive change data
```

### For Organizations

**1. Policy and Governance**
```
✅ DO: Establish clear access policies
✅ DO: Document approval processes
✅ DO: Regular security reviews
✅ DO: Incident response procedures

❌ DON'T: Allow ad-hoc access decisions
❌ DON'T: Ignore security incidents
```

**2. Training and Awareness**
```
✅ DO: Train admins on security features
✅ DO: Educate users on data protection
✅ DO: Regular security awareness programs

❌ DON'T: Assume everyone knows security
```

---

## Incident Response

### Security Incident Reporting

**If you discover a security vulnerability:**

1. **DO NOT** disclose publicly
2. **Report via secure channel:**
   - Email development team (see GitHub profile)
   - Subject line: "SECURITY: [Brief Description]"
   - Include detailed information
3. **Allow time for fix** before disclosure
4. **Coordinate disclosure** with development team

**What to Include:**
- Vulnerability description
- Steps to reproduce
- Potential impact
- Affected versions
- Proof of concept (if applicable)
- Contact information

### Response Process

**Our Commitment:**
1. **Acknowledgment:** Within 24 hours
2. **Assessment:** Within 3 business days
3. **Fix Development:** Based on severity
4. **Testing:** Before release
5. **Deployment:** Coordinated with reporter
6. **Disclosure:** Coordinated public disclosure

**Severity Levels:**
- **Critical:** Immediate response and fix
- **High:** Fix within 7 days
- **Medium:** Fix in next release
- **Low:** Scheduled fix

---

## Audit and Monitoring

### Logging

**What's Logged:**
- Admin actions (add/remove projects)
- Configuration changes
- Access authorization events
- Project enablement changes
- API errors and exceptions

**Where Logs Are Stored:**
- Forge platform logs
- Jira audit logs (for admin actions)
- Browser console (for client errors)

**Log Retention:**
- Subject to Forge platform policies
- Jira audit logs per Jira retention settings
- No separate log storage by app

### Monitoring

**Automated Monitoring:**
- Forge platform health monitoring
- API error rate monitoring
- Performance metrics

**Manual Monitoring:**
- Admin review of authorized projects
- Periodic access audits
- User feedback and reports

### Audit Trail

**Configuration Changes:**
- All admin actions logged in Jira audit logs
- Timestamp and user identification
- Before/after states recorded

**Access Attempts:**
- Successful access logged
- Failed access logged with reason
- Pattern detection for anomalies

---

## Third-Party Services

### Services Used

**Atlassian Services Only:**
- ✅ Forge Platform (hosting and runtime)
- ✅ Jira Cloud (data source)
- ✅ Atlassian Identity (authentication)

**No Other Third-Party Services:**
- ❌ No external analytics
- ❌ No external storage
- ❌ No external APIs
- ❌ No ad networks
- ❌ No social media integrations

### Data Sharing

**Data is NOT shared with:**
- ❌ Third-party services
- ❌ Analytics providers
- ❌ Marketing companies
- ❌ Other Jira instances
- ❌ External databases

**Data Stays Within:**
- ✅ Your Jira Cloud instance
- ✅ Atlassian Forge infrastructure
- ✅ Your organization's control

---

## Security Certifications

### Platform Certifications

**Inherited from Atlassian Forge:**
- SOC 2 Type II
- ISO 27001
- ISO 27018
- PCI DSS (where applicable)
- Privacy Shield certified (while framework existed)

**Compliance Documentation:**
- Available through Atlassian Trust Center
- [trust.atlassian.com](https://www.atlassian.com/trust)

---

## Vulnerability Management

### Security Updates

**Process:**
1. Regular security reviews
2. Dependency vulnerability scanning
3. Platform security updates by Atlassian
4. Timely patching of identified issues

**Update Policy:**
- Security patches released immediately
- Users notified of security updates
- Update notes include security details (after fix)

### Dependencies

**Managed Dependencies:**
```json
{
  "@forge/api": "6.1.1",
  "@forge/resolver": "1.7.0"
}
```

**Security:**
- Regular dependency updates
- Vulnerability scanning
- Only trusted, well-maintained dependencies
- Minimal dependency footprint

---

## Questions and Concerns

### Contact for Security Issues

**Secure Reporting:**
- Email: [See GitHub profile]
- Subject: "SECURITY: [Issue]"
- Do not disclose publicly

**General Security Questions:**
- See [Support and Contact Information](./07-support-contact.md)
- Review [FAQ](./06-faq-troubleshooting.md)
- Check documentation

---

## Summary

### Security Highlights

✅ **Built on Secure Platform:** Atlassian Forge with enterprise security
✅ **Multi-Tier Access Control:** Multiple layers of authorization
✅ **No External Data Storage:** All data stays in Jira/Forge
✅ **Zero Trust Model:** Explicit authorization required
✅ **Compliance Ready:** GDPR, SOC 2, ISO 27001
✅ **Transparent:** Clear documentation of security measures
✅ **Regular Updates:** Security patches and improvements
✅ **Responsible Disclosure:** Coordinated vulnerability handling

### Your Responsibilities

As an administrator or user:
- Follow security best practices
- Keep credentials secure
- Report security concerns
- Comply with organizational policies
- Protect exported data

---

*Last Updated: January 2024*
*Document Version: 1.0*

For additional information, see:
- [Privacy Policy](./13-privacy-policy.md)
- [Terms of Service](./14-terms-of-service.md)
- [Support and Contact Information](./07-support-contact.md)
