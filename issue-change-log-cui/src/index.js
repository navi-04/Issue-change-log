/**
 * Issue Change Log - Backend Resolver
 * 
 * This module handles all backend operations for the Issue Change Log Forge app.
 * It manages:
 * - Project access control (site-wide and project-level)
 * - Changelog data fetching and filtering
 * - Comments and attachments retrieval
 * - Admin operations (project management, permissions)
 * - Project-level settings (enable/disable functionality)
 * 
 * @module index
 */

import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import { storage } from "@forge/api";

/**
 * Checks if a project has access to the Issue Change Log app
 * 
 * @param {string} projectKey - The Jira project key to check
 * @returns {Promise<boolean>} True if project has access, false otherwise
 */
const checkProjectAccess = async (projectKey) => {
  try {
    const allowedProjects = (await storage.get("allowedProjects")) || [];

    // Allow access during initial setup if no projects configured
    if (allowedProjects.length === 0) {
      return true;
    }

    return allowedProjects.includes(projectKey);
  } catch (error) {
    return false;
  }
};

/**
 * Extracts the project key from an issue key
 * 
 * @param {string} issueKey - The Jira issue key (e.g., "KC-123")
 * @returns {Promise<string|null>} The project key or null if not found
 */
const getProjectKeyFromIssue = async (issueKey) => {
  try {
    const res = await api
      .asUser()
      .requestJira(route`/rest/api/3/issue/${issueKey}?fields=project`);
    if (!res.ok) return null;

    const issue = await res.json();
    return issue.fields?.project?.key;
  } catch (error) {
    return null;
  }
};

/**
 * Parses a relative time filter string to a Date cutoff
 * 
 * @param {string} filterValue - Filter value (24h, 7d, 30d, 6m, 1y, all)
 * @returns {Date|null} Cutoff date or null for "all" filter
 */
const parseRelativeTime = (filterValue) => {
  const now = new Date();
  switch (filterValue) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "6m": {
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return sixMonthsAgo;
    }
    case "1y": {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return oneYearAgo;
    }
    case "all":
    default:
      return null;
  }
};

/**
 * Fetches comments for a specific issue
 * 
 * @param {string} issueKey - The Jira issue key
 * @param {Date|null} cutoffDate - Optional date filter (only return comments after this date)
 * @returns {Promise<Array>} Array of formatted comment objects
 */
const fetchIssueComments = async (issueKey, cutoffDate) => {
  try {
    const res = await api
      .asUser()
      .requestJira(route`/rest/api/3/issue/${issueKey}/comment`);

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    const allComments = json.comments || [];

    return allComments
      .filter((comment) => {
        if (!cutoffDate) return true;
        return new Date(comment.created) >= cutoffDate;
      })
      .map((comment) => ({
        issueKey,
        type: "comment",
        author: comment.author?.displayName || "Unknown",
        content:
          comment.body?.content?.[0]?.content?.[0]?.text ||
          comment.body ||
          "Comment content unavailable",
        created: new Date(comment.created).toISOString(),
        updated: comment.updated
          ? new Date(comment.updated).toISOString()
          : null,
        id: comment.id,
      }));
  } catch (e) {
    return [];
  }
};

/**
 * Fetches attachments for a specific issue
 * 
 * @param {string} issueKey - The Jira issue key
 * @param {Date|null} cutoffDate - Optional date filter (only return attachments after this date)
 * @returns {Promise<Array>} Array of formatted attachment objects
 */
const fetchIssueAttachments = async (issueKey, cutoffDate) => {
  try {
    const res = await api
      .asUser()
      .requestJira(route`/rest/api/3/issue/${issueKey}?fields=attachment`);

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    const allAttachments = json.fields?.attachment || [];

    return allAttachments
      .filter((attachment) => {
        if (!cutoffDate) return true;
        return new Date(attachment.created) >= cutoffDate;
      })
      .map((attachment) => ({
        issueKey,
        type: "attachment",
        author: attachment.author?.displayName || "Unknown",
        filename: attachment.filename,
        size: attachment.size,
        mimeType: attachment.mimeType,
        created: new Date(attachment.created).toISOString(),
        id: attachment.id,
        content: attachment.content,
      }));
  } catch (e) {
    return [];
  }
};

/**
 * Main resolver function - Fetches changelog, comments, and attachments for issues
 * 
 * This is the primary backend function that:
 * 1. Validates project access and app enablement
 * 2. Fetches changelog history from Jira
 * 3. Retrieves comments and attachments
 * 4. Filters data based on time range
 * 5. Returns combined results
 * 
 * @param {Object} req - Request object from Forge
 * @param {string|string[]} req.issueKeys - Issue key(s) to fetch data for
 * @param {string} req.filter - Time filter (24h, 7d, 30d, 6m, 1y, all)
 * @returns {Promise<Object>} Combined changelog, comments, and attachments data
 */
const devSuvitha = async (req) => {
  try {
    // Determine issue keys from various possible sources
    let issueKeys = req.issueKeys || req.payload?.issueKeys;
    let contextKey = req?.context?.extension?.issue?.key;

    if (!issueKeys) {
      if (contextKey) {
        issueKeys = [contextKey];
      } else {
        const singleKey = req.issueKey || req.payload?.issueKey || "KC-24";
        issueKeys = [singleKey];
      }
    }

    // Validate project access for each issue
    for (const issueKey of issueKeys) {
      const projectKey = await getProjectKeyFromIssue(issueKey);

      if (!projectKey) {
        return {
          error: "Unable to determine the project for this issue. Please try refreshing the page or contact your administrator if the problem persists.",
          changelog: [],
          comments: [],
          attachments: [],
          total: 0,
        };
      }

      const hasAccess = await checkProjectAccess(projectKey);

      if (!hasAccess) {
        return {
          error: `This project is not authorized to use the Issue Change Log app. Please contact your Jira administrator to grant access for this project.`,
          changelog: [],
          comments: [],
          attachments: [],
          total: 0,
        };
      }

      // Check if app is enabled for this specific project
      const projectSettings = (await storage.get(`project_${projectKey}_settings`)) || {};
      const isProjectAppEnabled = projectSettings.enabled !== false;
      
      if (!isProjectAppEnabled) {
        return {
          error: `The Issue Change Log app has been disabled for this project. Please contact your project administrator to enable it.`,
          changelog: [],
          comments: [],
          attachments: [],
          total: 0,
        };
      }
    }

    // Parse and apply time filter
    const rawFilter = req.filter || req.payload?.filter || "all";
    const filterValue =
      typeof rawFilter === "string" ? rawFilter : rawFilter?.value || "all";
    const cutoffDate = parseRelativeTime(filterValue);

    let allChangelog = [];
    let allComments = [];
    let allAttachments = [];

    // Fetch data for each issue
    for (const issueKey of issueKeys) {
      const res = await api
        .asUser()
        .requestJira(route`/rest/api/3/issue/${issueKey}?expand=changelog`);
      if (!res.ok) {
        continue;
      }

      const json = await res.json();
      const allChanges = json.changelog?.histories || [];

      // Filter and format changelog entries
      const changelogEntries = allChanges
        .filter((entry) => {
          if (!cutoffDate) return true;
          return new Date(entry.created) >= cutoffDate;
        })
        .flatMap((entry) =>
          entry.items.map((item) => ({
            issueKey,
            type: "changelog",
            author: entry.author?.displayName || "Unknown",
            field: item.field,
            from: item.fromString || "-",
            to: item.toString || "-",
            date: new Date(entry.created).toISOString(),
          }))
        );

      // Fetch associated comments and attachments
      const comments = await fetchIssueComments(issueKey, cutoffDate);
      const attachments = await fetchIssueAttachments(issueKey, cutoffDate);

      allChangelog.push(...changelogEntries);
      allComments.push(...comments);
      allAttachments.push(...attachments);
    }

    return {
      changelog: allChangelog,
      comments: allComments,
      attachments: allAttachments,
      total: allChangelog.length + allComments.length + allAttachments.length,
    };
  } catch (e) {
    return {
      error: e.message,
      changelog: [],
      comments: [],
      attachments: [],
      total: 0,
    };
  }
};

/**
 * Admin function - Gets list of projects with app access
 * Includes metadata migration for legacy projects
 * 
 * @param {Object} req - Request object
 * @returns {Promise<Object>} Object containing allowed projects and their metadata
 */
const getAllowedProjects = async (req) => {
  try {
    const allowedProjects = (await storage.get("allowedProjects")) || [];
    let allowedProjectsData = (await storage.get("allowedProjectsData")) || {};
    
    // Populate metadata for existing projects without it (migration)
    let needsUpdate = false;
    for (const projectKey of allowedProjects) {
      if (!allowedProjectsData[projectKey]) {
        try {
          const projectResponse = await api.asUser().requestJira(route`/rest/api/3/project/${projectKey}`);
          if (projectResponse.ok) {
            const projectDetails = await projectResponse.json();
            allowedProjectsData[projectKey] = {
              key: projectKey,
              name: projectDetails.name || projectKey,
              id: projectDetails.id || projectKey,
              dateAdded: new Date().toISOString()
            };
            needsUpdate = true;
          }
        } catch (error) {
          // Set minimal data if fetch fails
          allowedProjectsData[projectKey] = {
            key: projectKey,
            name: projectKey,
            id: "N/A",
            dateAdded: new Date().toISOString()
          };
          needsUpdate = true;
        }
      }
    }
    
    // Save updated metadata if migration occurred
    if (needsUpdate) {
      await storage.set("allowedProjectsData", allowedProjectsData);
    }
    
    return { allowedProjects, allowedProjectsData };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Admin function - Adds a project to the allowed list
 * Fetches project details from Jira and stores metadata
 * 
 * @param {Object} req - Request object
 * @param {string} req.payload.projectKey - Jira project key to add
 * @returns {Promise<Object>} Updated list of allowed projects
 */
const addAllowedProject = async (req) => {
  try {
    const { projectKey } = req.payload || req;
    if (!projectKey) {
      return { error: "Project key is required" };
    }

    // Get or initialize projects with metadata
    const allowedProjectsData = (await storage.get("allowedProjectsData")) || {};
    
    if (!allowedProjectsData[projectKey]) {
      const projectResponse = await api.asUser().requestJira(route`/rest/api/3/project/${projectKey}`);
      
      if (!projectResponse.ok) {
        return { error: "Failed to fetch project details" };
      }
      
      const projectDetails = await projectResponse.json();
      
      allowedProjectsData[projectKey] = {
        key: projectKey,
        name: projectDetails.name || projectKey,
        id: projectDetails.id || projectKey,
        dateAdded: new Date().toISOString()
      };
      
      await storage.set("allowedProjectsData", allowedProjectsData);
      
      // Initialize project settings with enabled: true by default
      await storage.set(`project_${projectKey}_settings`, { enabled: true });
      
      // Maintain simple array for backward compatibility
      const allowedProjects = Object.keys(allowedProjectsData);
      await storage.set("allowedProjects", allowedProjects);
    }

    const allowedProjects = Object.keys(allowedProjectsData);
    return { success: true, allowedProjects, allowedProjectsData };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Admin function - Removes a project from the allowed list
 * 
 * @param {Object} req - Request object
 * @param {string} req.payload.projectKey - Jira project key to remove
 * @returns {Promise<Object>} Updated list of allowed projects
 */
const removeAllowedProject = async (req) => {
  try {
    const { projectKey } = req.payload || req;
    if (!projectKey) {
      return { error: "Project key is required" };
    }

    // Remove from metadata
    const allowedProjectsData = (await storage.get("allowedProjectsData")) || {};
    delete allowedProjectsData[projectKey];
    await storage.set("allowedProjectsData", allowedProjectsData);

    // Update simple array
    const allowedProjects = Object.keys(allowedProjectsData);
    await storage.set("allowedProjects", allowedProjects);

    return { success: true, allowedProjects, allowedProjectsData };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Admin function - Gets all available projects in the Jira instance
 * 
 * @param {Object} req - Request object
 * @returns {Promise<Object>} Object containing array of all projects
 */
const getAllProjects = async (req) => {
  try {
    const res = await api.asUser().requestJira(route`/rest/api/3/project`);
    if (!res.ok) {
      return { error: "Failed to fetch projects" };
    }

    const projects = await res.json();
    return {
      projects: projects.map((p) => ({
        key: p.key,
        name: p.name,
        id: p.id,
        projectTypeKey: p.projectTypeKey,
      })),
    };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Utility function - Returns current user's project access information
 * Used for debugging and access validation
 * 
 * @param {Object} req - Request object with optional issue context
 * @returns {Promise<Object>} Access information including allowed projects and current project
 */
const getAccessInfo = async (req) => {
  try {
    const allowedProjects = (await storage.get("allowedProjects")) || [];

    // Get current project from issue context if available
    let currentProject = null;
    const contextKey = req?.context?.extension?.issue?.key;
    if (contextKey) {
      currentProject = await getProjectKeyFromIssue(contextKey);
    }

    return {
      allowedProjects,
      currentProject,
      hasAccess: currentProject
        ? allowedProjects.includes(currentProject)
        : null,
    };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Checks if the current user is a project administrator
 * 
 * @param {string} projectKey - The Jira project key
 * @returns {Promise<boolean>} True if user has ADMINISTER_PROJECTS permission
 */
const checkProjectAdminAccess = async (projectKey) => {
  try {
    // Get current user
    const userRes = await api.asUser().requestJira(route`/rest/api/3/myself`);
    if (!userRes.ok) return false;
    
    const user = await userRes.json();
    const userId = user.accountId;

    // Check project admin permissions
    const permRes = await api.asUser().requestJira(
      route`/rest/api/3/mypermissions?projectKey=${projectKey}&permissions=ADMINISTER_PROJECTS`
    );
    
    if (!permRes.ok) return false;
    
    const permissions = await permRes.json();
    return permissions.permissions?.ADMINISTER_PROJECTS?.havePermission || false;
  } catch (error) {
    return false;
  }
};

/**
 * Gets project-specific settings and access information
 * Used by project settings UI to determine current state
 * 
 * @param {Object} req - Request object with project context
 * @returns {Promise<Object>} Project settings including enabled status and permissions
 */
const getProjectSettings = async (req) => {
  try {
    // Extract project key from various possible context sources
    let projectKey = req?.context?.extension?.project?.key ||
                    req?.context?.project?.key ||
                    req?.context?.extension?.context?.project?.key ||
                    req?.payload?.projectKey ||
                    req?.projectKey;
    
    if (!projectKey) {
      return { 
        success: false, 
        message: "No project context available - please ensure you are accessing this from a project settings page"
      };
    }

    // Fetch project details
    const projectRes = await api.asUser().requestJira(route`/rest/api/3/project/${projectKey}`);
    let projectData = { key: projectKey };
    
    if (projectRes.ok) {
      const project = await projectRes.json();
      projectData = {
        key: project.key,
        name: project.name,
        projectTypeKey: project.projectTypeKey
      };
    }

    // Check site-wide authorization
    const allowedProjects = (await storage.get("allowedProjects")) || [];
    const hasPermission = allowedProjects.includes(projectKey);
    
    if (!hasPermission) {
      return {
        success: true,
        hasPermission: false,
        project: projectData,
        isEnabled: false
      };
    }

    // Check project admin status
    const isProjectAdmin = await checkProjectAdminAccess(projectKey);

    // Get project-specific app settings
    const projectSettings = (await storage.get(`project_${projectKey}_settings`)) || {};
    const isEnabled = projectSettings.enabled !== false;
    
    return {
      success: true,
      project: projectData,
      hasPermission: true,
      isEnabled: isEnabled,
      isProjectAdmin: isProjectAdmin
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Toggles app enablement status for a specific project
 * Requires project admin permissions
 * 
 * @param {Object} req - Request object
 * @param {boolean} req.payload.enabled - Desired enabled state
 * @returns {Promise<Object>} Result of toggle operation
 */
const toggleProjectApp = async (req) => {
  try {
    const { enabled } = req.payload || req;
    // Extract project key from context
    const projectKey = req?.context?.extension?.project?.key ||
                      req?.context?.project?.key ||
                      req?.context?.extension?.context?.project?.key ||
                      req?.payload?.projectKey ||
                      req?.projectKey;
    
    if (!projectKey) {
      return { 
        success: false, 
        message: "No project context available - please ensure you are accessing this from a project settings page" 
      };
    }

    // Verify site-wide authorization
    const allowedProjects = (await storage.get("allowedProjects")) || [];
    if (!allowedProjects.includes(projectKey)) {
      return {
        success: false,
        message: "Project is not authorized by site administrator"
      };
    }

    // Verify project admin permissions
    const isProjectAdmin = await checkProjectAdminAccess(projectKey);
    if (!isProjectAdmin) {
      return {
        success: false,
        message: "Access denied: Project administrator privileges required"
      };
    }

    // Update project settings
    const projectSettings = (await storage.get(`project_${projectKey}_settings`)) || {};
    projectSettings.enabled = enabled;
    projectSettings.lastUpdated = new Date().toISOString();
    
    await storage.set(`project_${projectKey}_settings`, projectSettings);
    
    return {
      success: true,
      enabled: enabled,
      message: `App ${enabled ? 'enabled' : 'disabled'} for project ${projectKey}`
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Register all resolver functions
 */
const resolver = new Resolver();
resolver.define("devSuvitha", devSuvitha);
resolver.define("getAllowedProjects", getAllowedProjects);
resolver.define("addAllowedProject", addAllowedProject);
resolver.define("removeAllowedProject", removeAllowedProject);
resolver.define("getAllProjects", getAllProjects);
resolver.define("getAccessInfo", getAccessInfo);
resolver.define("getProjectSettings", getProjectSettings);
resolver.define("toggleProjectApp", toggleProjectApp);

export const handler = resolver.getDefinitions();
