# Support and Contact Information

This document provides comprehensive information about getting support, reporting issues, and contacting the development team.

## Support Channels

### 1. Documentation

**First line of support:** Comprehensive documentation available in this repository.

**Available Guides:**
- [App Overview](./01-app-overview.md) - Introduction and key benefits
- [Installation Guide](./02-installation-guide.md) - Setup instructions
- [Configuration and Setup](./03-configuration-setup.md) - Access control configuration
- [User Guide](./04-user-guide.md) - Detailed usage instructions
- [Features and Capabilities](./05-features-capabilities.md) - Complete feature list
- [FAQ / Troubleshooting](./06-faq-troubleshooting.md) - Common issues and solutions
- [Security and Privacy](./09-security-privacy.md) - Data protection information

**Search Tips:**
- Use Ctrl+F (Cmd+F on Mac) to search within documents
- Check FAQ first for quick answers
- Review troubleshooting section for common issues

---

### 2. Atlassian Marketplace

**Marketplace Listing:**
- Product page on Atlassian Marketplace
- User reviews and ratings
- Version history and release notes
- Community discussions

**Accessing Marketplace Support:**
1. Visit Atlassian Marketplace
2. Search for "Issue Change Log"
3. Click on the app
4. Use "Support" tab for questions

---

### 3. Issue Tracking

**GitHub Repository:**
```
Repository: navi-04/Issue-change-log
Branch: develop
```

**Reporting Issues:**
1. Go to GitHub repository
2. Navigate to "Issues" tab
3. Click "New Issue"
4. Choose appropriate issue template:
   - Bug report
   - Feature request
   - Documentation improvement
   - Question

**Issue Guidelines:**
- Search existing issues first
- Provide clear, detailed descriptions
- Include reproduction steps
- Add screenshots if relevant
- Tag appropriately

---

### 4. Direct Contact

**Development Team:**
- **Email:** [Contact via GitHub profile]
- **GitHub:** [@navi-04](https://github.com/navi-04)
- **Response Time:** Typically within 2-3 business days

**What to Include in Support Requests:**
- Issue description
- Steps to reproduce
- Expected vs actual behavior
- Browser and version
- Jira Cloud site (if not sensitive)
- Screenshots or screen recordings
- Error messages (from browser console)
- Urgency level

---

## Getting Help

### Self-Service Support

#### Step 1: Check Documentation
- Review relevant documentation section
- Search FAQ for your specific issue
- Follow troubleshooting steps

#### Step 2: Diagnostic Information
Gather this information before seeking help:
```
- What were you trying to do?
- What happened instead?
- Error messages (exact text)
- Browser and version
- Steps to reproduce
- Screenshots/recordings
```

#### Step 3: Browser Console
For technical issues:
1. Press F12 (or Cmd+Option+I on Mac)
2. Click "Console" tab
3. Look for red errors
4. Copy error messages
5. Include in support request

---

### Support Request Template

When contacting support, please use this template:

```markdown
## Issue Summary
[Brief description of the problem]

## Environment
- Jira Cloud Site: [your-site.atlassian.net]
- Browser: [Chrome 120, Firefox 115, etc.]
- App Version: [1.2.15 or latest]
- User Role: [Admin / Project Admin / End User]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Error Messages
[Copy any error messages, including from browser console]

## Screenshots
[Attach relevant screenshots]

## Additional Context
[Any other relevant information]

## Urgency
- [ ] Critical (blocking work)
- [ ] High (major impact)
- [ ] Medium (moderate impact)
- [ ] Low (minor issue)
```

---

## Support by User Type

### For End Users

**Common Issues:**
- Cannot see changelog data
- Access denied messages
- Export not working
- Performance issues

**Support Path:**
1. Check [User Guide](./04-user-guide.md)
2. Review [FAQ](./06-faq-troubleshooting.md)
3. Contact your Jira administrator
4. Contact project administrator
5. Submit support request if unresolved

**Important:** Most user issues are related to access control. Check with your administrators first.

---

### For Project Administrators

**Common Issues:**
- Cannot access project settings
- Toggle switch not working
- Enablement not taking effect
- User access questions

**Support Path:**
1. Verify site-level authorization
2. Check [Configuration Guide](./03-configuration-setup.md)
3. Review project admin permissions
4. Contact site administrator
5. Submit support request if unresolved

**Resources:**
- [Configuration and Setup](./03-configuration-setup.md) - Project-level section
- [FAQ](./06-faq-troubleshooting.md) - Project Settings section

---

### For Site Administrators

**Common Issues:**
- Admin panel not showing
- Cannot add/remove projects
- Bulk operations not working
- Permission questions

**Support Path:**
1. Verify admin group membership
2. Check [Configuration Guide](./03-configuration-setup.md)
3. Review [FAQ](./06-faq-troubleshooting.md)
4. Test in different browser
5. Submit support request with diagnostic info

**Resources:**
- [Configuration and Setup](./03-configuration-setup.md) - Site-level section
- [Installation Guide](./02-installation-guide.md)
- [FAQ](./06-faq-troubleshooting.md) - Admin Issues section

---

### For Developers

**Technical Support:**
- Review source code on GitHub
- Check Forge documentation
- Review API integration details
- Submit pull requests for improvements

**Developer Resources:**
- [Forge Documentation](https://developer.atlassian.com/platform/forge/)
- [Jira REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- Project source code on GitHub
- Technical architecture in code comments

**Contributing:**
1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request
5. Follow contribution guidelines

---

## Service Level Expectations

### Response Times

**Community Support:**
- **Bug Reports:** 2-3 business days
- **Feature Requests:** 5-7 business days
- **Questions:** 1-2 business days
- **Critical Issues:** Within 24 hours

**Note:** These are target response times, not resolution times. Complex issues may take longer to resolve.

### Severity Levels

**Critical (P1):**
- App completely unavailable
- Data loss or corruption
- Security vulnerability
- **Response:** Within 24 hours

**High (P2):**
- Major functionality broken
- Workaround available but difficult
- Affects multiple users
- **Response:** 2-3 business days

**Medium (P3):**
- Moderate functionality issue
- Workaround available
- Affects some users
- **Response:** 3-5 business days

**Low (P4):**
- Minor cosmetic issue
- Feature request
- Documentation improvement
- **Response:** 5-10 business days

---

## Known Issues

### Current Known Issues

Check the [Release Notes](./08-release-notes.md) for current known issues and workarounds.

**Where to Find:**
- GitHub Issues labeled "known-issue"
- Release notes "Known Issues" section
- Atlassian Marketplace "Known Issues" tab

---

## Community Support

### Atlassian Community

**Forums:**
- [Atlassian Community](https://community.atlassian.com/)
- Search for "Issue Change Log"
- Post questions in Jira Cloud category
- Tag with relevant keywords

**Benefits:**
- Community knowledge sharing
- Peer support from other users
- Atlassian employee participation
- Searchable knowledge base

---

### Stack Overflow

**Tagging:**
- Use tags: `jira`, `forge`, `issue-change-log`
- Search existing questions first
- Follow Stack Overflow guidelines
- Include code examples when relevant

---

## Feature Requests

### Submitting Feature Requests

**Process:**
1. Check if already requested (GitHub Issues)
2. Describe the feature in detail
3. Explain use case and benefit
4. Include mockups/examples if applicable
5. Submit via GitHub Issues

**Feature Request Template:**
```markdown
## Feature Request

### Feature Description
[Clear description of the requested feature]

### Use Case
[Why is this feature needed?]

### Current Workaround
[How do you currently solve this problem?]

### Proposed Solution
[Your ideas for implementation]

### Benefits
[Who benefits and how?]

### Priority
- [ ] Must have
- [ ] Should have
- [ ] Nice to have
```

---

### Feature Voting

**How to Vote:**
- Find existing feature request on GitHub
- Add 👍 reaction to the issue
- Comment with your use case
- Subscribe for updates

**Prioritization:**
Features are prioritized based on:
- Number of votes (👍 reactions)
- Impact on users
- Implementation complexity
- Alignment with roadmap

---

## Bug Reports

### Effective Bug Reports

**Include:**
1. **Clear Title:** Descriptive and specific
2. **Environment:** Browser, Jira version, app version
3. **Steps to Reproduce:** Numbered, specific steps
4. **Expected Result:** What should happen
5. **Actual Result:** What actually happens
6. **Error Messages:** From browser console
7. **Screenshots:** Visual evidence
8. **Frequency:** Always, sometimes, once

**Bug Report Template:**
```markdown
## Bug Report

### Description
[Clear, concise description of the bug]

### Environment
- Jira Cloud Site: [URL]
- Browser: [Chrome 120, etc.]
- OS: [Windows 11, macOS 14, etc.]
- App Version: [1.2.15]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Error Messages
```
[Paste error messages here]
```

### Screenshots
[Attach screenshots]

### Frequency
- [ ] Always happens
- [ ] Sometimes happens
- [ ] Happened once

### Workaround
[Any temporary solution you've found]
```

---

## Security Issues

### Reporting Security Vulnerabilities

**IMPORTANT:** Do NOT report security vulnerabilities publicly.

**Secure Reporting:**
1. Email directly to development team (via GitHub profile)
2. Include "SECURITY" in subject line
3. Provide detailed description
4. Allow time for fix before disclosure

**What to Include:**
- Vulnerability description
- Potential impact
- Steps to reproduce
- Proof of concept (if applicable)
- Suggested fix (if known)

**Response:**
- Acknowledgment within 24 hours
- Assessment within 3 business days
- Fix timeline based on severity
- Coordinated disclosure

See [Security and Privacy](./09-security-privacy.md) for more information.

---

## Training and Onboarding

### User Training

**Self-Paced Resources:**
- [User Guide](./04-user-guide.md) - Complete usage instructions
- [Video Tutorials](#) - Coming soon
- [Best Practices](#) - Tips and tricks

**Group Training:**
- Contact support for bulk training needs
- Custom training for large organizations
- Webinar sessions (scheduled periodically)

---

### Admin Training

**Resources:**
- [Configuration Guide](./03-configuration-setup.md)
- [Admin FAQ](./06-faq-troubleshooting.md#admin-issues)
- Setup assistance available on request

---

## Feedback

### Providing Feedback

**We value your feedback!**

**Types of Feedback:**
- Feature suggestions
- Usability improvements
- Documentation enhancements
- Bug reports
- Performance feedback

**Channels:**
- GitHub Issues
- Atlassian Marketplace reviews
- Direct email
- Community forums

**Feedback Template:**
```markdown
## Feedback

### Category
- [ ] Feature suggestion
- [ ] Usability improvement
- [ ] Documentation
- [ ] Performance
- [ ] Other

### Description
[Your feedback here]

### Impact
[How does this affect your work?]

### Suggestions
[Your ideas for improvement]
```

---

## Service Status

### Checking Service Status

**Atlassian Status:**
- [status.atlassian.com](https://status.atlassian.com)
- Subscribe to status updates
- Check before reporting issues

**App-Specific Status:**
- GitHub repository issues
- Atlassian Marketplace updates
- Community announcements

---

## Best Practices for Getting Help

### 1. Search First
- Review documentation
- Search FAQ
- Check GitHub Issues
- Look in community forums

### 2. Provide Context
- Complete environment information
- Detailed reproduction steps
- Error messages and screenshots
- Expected vs actual behavior

### 3. Be Specific
- Clear, concise descriptions
- Exact error messages
- Specific examples
- Relevant details only

### 4. Be Patient
- Allow time for response
- Provide additional info if requested
- Test suggested solutions
- Report back on results

### 5. Be Respectful
- Courteous communication
- Acknowledge help received
- Share solutions that work
- Help others when you can

---

## Contact Information Summary

| Channel | Use For | Response Time |
|---------|---------|---------------|
| Documentation | Self-service help | Immediate |
| FAQ | Common issues | Immediate |
| GitHub Issues | Bug reports, features | 2-3 business days |
| Atlassian Marketplace | Product questions | 3-5 business days |
| Email | Direct support | 2-3 business days |
| Community Forums | Peer support | Varies |
| Security Email | Security issues | 24 hours |

---

## Office Hours

**Community Support Hours:**
- Available: Monday - Friday
- Time Zone: As per development team location
- Holidays: Limited support during major holidays

**Note:** This is a community/open-source project. Support is provided on a best-effort basis.

---

## Escalation Process

### When to Escalate

Escalate if:
- No response after 5 business days
- Critical issue affecting business
- Security vulnerability identified
- Issue requires management attention

### How to Escalate

1. Reply to existing support thread
2. Mark as "URGENT" or "ESCALATION"
3. Explain business impact
4. Provide deadline if applicable

---

## Useful Links

### Documentation
- [Full Documentation Index](./README.md)
- [Installation Guide](./02-installation-guide.md)
- [User Guide](./04-user-guide.md)
- [FAQ](./06-faq-troubleshooting.md)

### External Resources
- [Atlassian Forge Documentation](https://developer.atlassian.com/platform/forge/)
- [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Atlassian Community](https://community.atlassian.com/)
- [Atlassian Status Page](https://status.atlassian.com)

### Project Resources
- [GitHub Repository](https://github.com/navi-04/Issue-change-log)
- [Atlassian Marketplace](#) - Link to be added
- [Release Notes](./08-release-notes.md)

---

## Thank You

Thank you for using Issue Change Log! Your feedback and support help us improve the app for everyone.

**Questions?** Don't hesitate to reach out through any of the support channels listed above.

**Found a bug?** Please report it - you're helping make the app better!

**Have an idea?** We'd love to hear your feature suggestions!

---

## Legal and Compliance

For legal, licensing, and compliance questions:
- Review [Terms of Service](./14-terms-of-service.md)
- Review [Privacy Policy](./13-privacy-policy.md)
- Review [Security and Privacy](./09-security-privacy.md)
- Contact via GitHub for specific inquiries

---

*Last Updated: January 2024*
*Document Version: 1.0*
