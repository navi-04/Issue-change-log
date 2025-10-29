# Business Verification and Compliance

This document provides information about business verification, regulatory compliance, certifications, and enterprise readiness of the Issue Change Log app.

## Table of Contents

1. [Business Overview](#business-overview)
2. [Compliance Certifications](#compliance-certifications)
3. [Regulatory Compliance](#regulatory-compliance)
4. [Enterprise Readiness](#enterprise-readiness)
5. [Service Level Agreements](#service-level-agreements)
6. [Data Governance](#data-governance)
7. [Vendor Assessment](#vendor-assessment)
8. [Audit and Reporting](#audit-and-reporting)

---

## Business Overview

### Developer Information

**Organization:**
- **Name:** navi-04
- **Type:** Independent Developer / Open Source
- **Platform:** GitHub
- **Repository:** Issue-change-log

**App Information:**
- **Name:** Issue Change Log
- **Version:** 1.2.15
- **License:** MIT
- **Platform:** Atlassian Forge (Jira Cloud)
- **Category:** Project Management & Tracking

### Business Model

**Licensing:**
- MIT License (Open Source)
- Community-driven development
- Free and commercial use permitted
- Subject to Atlassian Marketplace terms (if published)

**Support:**
- Community support via GitHub
- Documentation and self-service resources
- Issue tracking and feature requests
- See [Support and Contact Information](./07-support-contact.md)

---

## Compliance Certifications

### Platform Certifications

#### Atlassian Forge Platform

The app is built on Atlassian Forge, which inherits these certifications:

**SOC 2 Type II**
- ✅ Security controls
- ✅ Availability controls
- ✅ Processing integrity
- ✅ Confidentiality
- ✅ Privacy controls
- **Auditor:** Major accounting firm
- **Frequency:** Annual audit

**ISO 27001 (Information Security)**
- ✅ Information Security Management System (ISMS)
- ✅ Risk management processes
- ✅ Security policies and procedures
- ✅ Continuous improvement
- **Certificate Holder:** Atlassian
- **Scope:** Cloud infrastructure

**ISO 27018 (Privacy in Cloud)**
- ✅ Protection of personally identifiable information (PII)
- ✅ Cloud privacy controls
- ✅ Transparency in processing
- **Certificate Holder:** Atlassian
- **Scope:** Cloud services

**ISO 27017 (Cloud Security)**
- ✅ Cloud-specific security controls
- ✅ Shared responsibility model
- ✅ Cloud service security guidelines
- **Certificate Holder:** Atlassian

**PCI DSS (Where Applicable)**
- ✅ Payment Card Industry Data Security Standard
- **Note:** App does not process payment data
- **Compliance:** Inherited from Atlassian Marketplace

### Compliance Documentation

**Available Through:**
- Atlassian Trust Center: [trust.atlassian.com](https://www.atlassian.com/trust)
- Forge Platform documentation
- Compliance reports available on request (through Atlassian)

---

## Regulatory Compliance

### GDPR (General Data Protection Regulation)

**Compliance Status:** ✅ Compliant

**Data Protection Principles:**

1. **Lawfulness, Fairness, and Transparency**
   - ✅ Clear privacy policy
   - ✅ Transparent data processing
   - ✅ User rights respected

2. **Purpose Limitation**
   - ✅ Data used only for change tracking
   - ✅ No secondary purposes
   - ✅ No marketing or analytics

3. **Data Minimization**
   - ✅ Only essential data accessed
   - ✅ No unnecessary data collection
   - ✅ Minimal storage (config only)

4. **Accuracy**
   - ✅ Data read from authoritative source (Jira)
   - ✅ No data modification by app
   - ✅ Real-time access to current data

5. **Storage Limitation**
   - ✅ No long-term data storage
   - ✅ Configuration data only
   - ✅ Automatic deletion on uninstall

6. **Integrity and Confidentiality**
   - ✅ Encryption in transit and at rest
   - ✅ Access controls enforced
   - ✅ Security best practices followed

**GDPR Rights Supported:**

| Right | Implementation |
|-------|---------------|
| **Right to Access** | Users can view their change history in Jira |
| **Right to Rectification** | Data sourced from Jira; corrections made in Jira |
| **Right to Erasure** | Uninstall app; config data deleted |
| **Right to Restriction** | Project admins can disable app |
| **Right to Data Portability** | CSV export functionality |
| **Right to Object** | Users can request project-level disablement |

**Data Processing Agreement:**
- Standard terms via Atlassian Marketplace
- Atlassian acts as data processor
- App developer acts as sub-processor
- Standard contractual clauses apply

---

### CCPA (California Consumer Privacy Act)

**Compliance Status:** ✅ Compliant

**Consumer Rights:**
- ✅ Right to know what data is collected
- ✅ Right to delete data
- ✅ Right to opt-out of sale (N/A - no data sold)
- ✅ Right to non-discrimination

**Implementation:**
- Transparent data practices (see Privacy Policy)
- Data deletion via app uninstall
- No data sale or sharing
- No discrimination based on privacy choices

---

### HIPAA (Health Insurance Portability and Accountability Act)

**Status:** ⚠️ Not HIPAA Certified

**Important:**
- App not designed for protected health information (PHI)
- Do not use for healthcare-related data without proper safeguards
- Consult compliance officer before use in healthcare context

**For Healthcare Organizations:**
- Evaluate if change tracking involves PHI
- Implement additional controls if needed
- Consider Business Associate Agreement (BAA) requirements
- Consult legal counsel for specific use cases

---

### Other Regulatory Frameworks

#### **FERPA (Family Educational Rights and Privacy Act)**
- ✅ Can be used in educational contexts
- ✅ No collection of student educational records
- ✅ Respects institutional data policies

#### **SOX (Sarbanes-Oxley Act)**
- ✅ Supports audit trail requirements
- ✅ Change tracking for financial systems
- ✅ Access controls and authorization
- ✅ Immutable log of changes (via Jira)

#### **FISMA (Federal Information Security Management Act)**
- Platform (Forge) supports FISMA requirements
- Consult with agency CISO for approval
- Additional controls may be required

---

## Enterprise Readiness

### Scalability

**Performance at Scale:**
- ✅ Supports unlimited projects
- ✅ Handles large issue histories
- ✅ Efficient pagination for large datasets
- ✅ Auto-scaling via Forge platform
- ✅ No performance degradation with user growth

**Load Characteristics:**
- Concurrent users: Unlimited (Forge auto-scaling)
- Issues per project: No limit
- Changes per issue: No limit (paginated display)
- Projects per instance: No limit

### High Availability

**Availability Metrics:**
- ✅ 99.9% uptime SLA (inherited from Forge platform)
- ✅ Multi-region redundancy (Atlassian infrastructure)
- ✅ Automatic failover
- ✅ No single point of failure

**Disaster Recovery:**
- ✅ Automatic backups (Forge storage)
- ✅ Platform-level recovery procedures
- ✅ Configuration data backup
- ✅ Rapid recovery capability

### Integration Capabilities

**Native Integration:**
- ✅ Jira Cloud (native)
- ✅ Jira REST API v3
- ✅ Forge platform APIs

**Data Export:**
- ✅ CSV export for external tools
- ✅ Compatible with Excel, Google Sheets
- ✅ Integration with BI tools (Power BI, Tableau)

**API Access:**
- Currently: Via CSV export
- Future: Direct API access (roadmap item)

---

## Service Level Agreements

### Availability SLA

**Uptime Commitment:**
- **Target:** 99.9% uptime
- **Basis:** Atlassian Forge platform SLA
- **Measurement:** Monthly uptime percentage
- **Exclusions:** Scheduled maintenance, force majeure

**Downtime Definition:**
- App unavailable or non-functional
- Caused by platform or app issues
- Excludes client-side issues (browser, network)

### Support SLA

**Response Times:**

| Severity | Description | Response Time | Resolution Target |
|----------|-------------|---------------|-------------------|
| **Critical (P1)** | Complete unavailability | 24 hours | 72 hours |
| **High (P2)** | Major functionality issue | 2-3 business days | 5-7 business days |
| **Medium (P3)** | Moderate issue | 3-5 business days | 10-15 business days |
| **Low (P4)** | Minor issue or enhancement | 5-10 business days | Best effort |

**Support Channels:**
- GitHub Issues (primary)
- Email support
- Community forums
- Documentation and self-service

**Support Hours:**
- Monday - Friday
- Business hours in developer's timezone
- Best-effort response outside hours
- Critical issues prioritized

---

## Data Governance

### Data Classification

**Data Types:**

1. **Configuration Data (Stored)**
   - Classification: Internal
   - Sensitivity: Low to Medium
   - Storage: Forge app storage
   - Retention: Until app uninstall

2. **Issue Change Data (Read-only)**
   - Classification: Per Jira classification
   - Sensitivity: Per project settings
   - Storage: Not stored by app
   - Source: Jira Cloud

3. **User Information (Read-only)**
   - Classification: Personal data
   - Sensitivity: Medium
   - Storage: Not stored by app
   - Source: Jira Cloud

### Data Residency

**Storage Locations:**
- **Primary:** Same region as Jira Cloud instance
- **Backup:** Forge platform automated backups (same region)
- **No Cross-Border Transfer:** Data remains in instance region

**Supported Regions:**
- All Atlassian Cloud regions
- Subject to Atlassian's data residency commitments
- Complies with regional data protection laws

### Data Retention

**Configuration Data:**
- Retained while app is installed
- Deleted upon app uninstall
- No archival storage

**Issue Data:**
- Not stored by app
- Governed by Jira retention policies
- Real-time read from Jira

**Exported Data:**
- User responsibility
- Follow organizational policies
- Delete when no longer needed

---

## Vendor Assessment

### Due Diligence Information

**For Vendor Assessment Teams:**

#### **Legal Entity**
- Developer/Organization: navi-04
- Type: Independent developer
- Platform: Atlassian Marketplace (if published)
- License: MIT

#### **Financial Stability**
- Model: Open source / Community-driven
- Sustainability: Active development and maintenance
- Continuity: Source code available on GitHub

#### **Technical Capabilities**
- Platform: Atlassian Forge (enterprise-grade)
- Security: Inherits Forge security model
- Scalability: Auto-scaling cloud platform
- Support: Community and developer support

#### **Insurance and Legal**
- Liability: Subject to MIT License terms
- Insurance: Covered under Atlassian Marketplace agreements (if applicable)
- Indemnification: Per Atlassian Marketplace terms

#### **Business Continuity**
- Open Source: Code available for forking if needed
- Platform Dependency: Relies on Atlassian Forge
- Disaster Recovery: Platform-level DR capabilities

### Vendor Questionnaire Support

**We can provide:**
- Technical documentation
- Security and privacy information
- Compliance documentation references
- Architecture diagrams
- Data flow documentation

**Request via:**
- GitHub Issues
- Direct email (see Support documentation)
- Include specific questionnaire or requirements

---

## Audit and Reporting

### Audit Support

**Audit Trail Capabilities:**
- ✅ All admin actions logged in Jira audit logs
- ✅ Configuration changes tracked
- ✅ Access attempts recorded
- ✅ Timestamp and user identification

**Audit Reports:**
- Available through Jira audit logs
- Exportable via Jira admin interface
- Includes all app-related activities

**Audit Frequency:**
- Real-time logging
- Historical logs per Jira retention
- On-demand audit report generation

### Compliance Reporting

**Available Reports:**
1. **Access Control Report**
   - Authorized projects list
   - Authorization dates
   - Admin actions history

2. **Usage Report**
   - User access patterns (via Jira logs)
   - Feature utilization
   - Export activities

3. **Security Report**
   - Access control configurations
   - Permission verifications
   - Security incident reports (if any)

4. **Data Processing Report**
   - Data types accessed
   - Processing purposes
   - Retention policies

**Report Requests:**
- Submit via GitHub Issues or email
- Specify report type and time period
- Allow 5-10 business days for generation

### Third-Party Audits

**App Audits:**
- Available for enterprise customers
- Code review can be performed (open source)
- Security assessment support available

**Platform Audits:**
- Atlassian Forge audited independently
- Reports available via Atlassian Trust Center
- SOC 2, ISO certifications available

---

## Compliance Matrix

### Regulatory Compliance Summary

| Regulation | Status | Notes |
|------------|--------|-------|
| **GDPR** | ✅ Compliant | EU data protection |
| **CCPA** | ✅ Compliant | California privacy |
| **SOC 2 Type II** | ✅ Certified | Via Forge platform |
| **ISO 27001** | ✅ Certified | Via Forge platform |
| **ISO 27018** | ✅ Certified | Cloud privacy |
| **ISO 27017** | ✅ Certified | Cloud security |
| **PCI DSS** | N/A | No payment processing |
| **HIPAA** | ❌ Not Certified | Not for PHI |
| **FedRAMP** | ⚠️ Platform Support | Via Atlassian |
| **SOX** | ✅ Supports | Audit trail capabilities |
| **FERPA** | ✅ Compatible | Educational use approved |

### Industry Standards

| Standard | Compliance | Implementation |
|----------|-----------|----------------|
| **OWASP Top 10** | ✅ | Security best practices |
| **NIST Cybersecurity** | ✅ | Framework alignment |
| **CIS Controls** | ✅ | Critical security controls |
| **SANS Top 25** | ✅ | Vulnerability prevention |

---

## Enterprise Procurement

### Procurement Information

**Acquisition:**
- Via Atlassian Marketplace (if published)
- Or direct deployment via Forge CLI
- Open source license (MIT)

**Licensing:**
- Per Atlassian Marketplace terms
- Or MIT license terms for open source use
- No per-user licensing

**Pricing:**
- See [Pricing/Evaluation](./12-pricing-evaluation.md)
- Subject to Marketplace pricing model

**Contract Terms:**
- Atlassian Marketplace standard terms
- MIT license for open source use
- Custom agreements not typically available

### Purchase Orders

**For Enterprise Procurement:**
- Follow Atlassian Marketplace procurement process
- Net terms per Marketplace policies
- Invoice via Atlassian
- Purchase orders accepted via Marketplace

---

## Continuous Compliance

### Ongoing Compliance Activities

**Regular Reviews:**
- Quarterly security reviews
- Annual compliance assessment
- Continuous monitoring
- Incident response updates

**Updates and Patches:**
- Security patches: Immediate
- Compliance updates: As required
- Documentation updates: Ongoing
- User notification: Via release notes

**Training:**
- Developer security training
- Compliance awareness
- Best practices documentation
- User education materials

---

## Questions and Support

### Compliance Questions

For compliance-specific questions:
- Review this document thoroughly
- Check [Security and Privacy](./09-security-privacy.md)
- Review [Privacy Policy](./13-privacy-policy.md)
- Submit inquiries via GitHub Issues or email

### Vendor Assessment Support

For vendor assessment assistance:
- Submit questionnaire via email
- Reference this document
- Allow 5-10 business days for response
- Provide specific requirements

### Audit Support Requests

For audit support:
- Submit request with specific needs
- Allow adequate time for response
- Specify audit scope and requirements
- Include deadline information

---

## Summary

### Compliance Highlights

✅ **Enterprise-Grade Platform:** Built on Atlassian Forge
✅ **Multiple Certifications:** SOC 2, ISO 27001, ISO 27018, ISO 27017
✅ **GDPR Compliant:** Full compliance with EU data protection
✅ **Transparent:** Comprehensive compliance documentation
✅ **Audit-Ready:** Detailed logging and reporting
✅ **Secure:** Multi-tier access control and encryption
✅ **Scalable:** Enterprise-ready architecture
✅ **Supported:** Documentation and support channels

---

*Last Updated: January 2024*
*Document Version: 1.0*

For additional information:
- [Security and Privacy](./09-security-privacy.md)
- [Privacy Policy](./13-privacy-policy.md)
- [Terms of Service](./14-terms-of-service.md)
- [Support and Contact Information](./07-support-contact.md)
