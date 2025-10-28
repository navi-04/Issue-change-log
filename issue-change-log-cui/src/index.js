import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import { storage } from "@forge/api";

/**
 * Check if a project has access to the app
 */
const checkProjectAccess = async (projectKey) => {
  try {
    const allowedProjects = (await storage.get("allowedProjects")) || [];

    // If no projects are configured yet, allow access (for initial setup)
    if (allowedProjects.length === 0) {
      console.log(
        "No projects configured yet, allowing access for initial setup"
      );
      return true;
    }

    return allowedProjects.includes(projectKey);
  } catch (error) {
    console.error("Error checking project access:", error);
    return false;
  }
};

/**
 * Get project key from issue key
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
    console.error("Error getting project key:", error);
    return null;
  }
};

/**
 * Parse a relative time filter string to a Date cutoff.
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
 * Fetch comments for an issue
 */
const fetchIssueComments = async (issueKey, cutoffDate) => {
  try {
    const res = await api
      .asUser()
      .requestJira(route`/rest/api/3/issue/${issueKey}/comment`);

    if (!res.ok) {
      console.error(`Error fetching comments for ${issueKey}:`, res.status);
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
    console.error(`Error fetching comments for ${issueKey}:`, e);
    return [];
  }
};

/**
 * Fetch attachments for an issue
 */
const fetchIssueAttachments = async (issueKey, cutoffDate) => {
  try {
    const res = await api
      .asUser()
      .requestJira(route`/rest/api/3/issue/${issueKey}?fields=attachment`);

    if (!res.ok) {
      console.error(`Error fetching attachments for ${issueKey}:`, res.status);
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
    console.error(`Error fetching attachments for ${issueKey}:`, e);
    return [];
  }
};

/**
 * Main resolver function
 */
const devSuvitha = async (req) => {
  try {
    console.log("Request received:", JSON.stringify(req, null, 2));

    // Determine issue keys
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

    console.log("Processing issue keys:", issueKeys);

    // Check project access for each issue
    for (const issueKey of issueKeys) {
      const projectKey = await getProjectKeyFromIssue(issueKey);
      console.log(`Issue ${issueKey} belongs to project: ${projectKey}`);

      if (!projectKey) {
        console.error(`Could not determine project for issue: ${issueKey}`);
        return {
          error: "Unable to determine the project for this issue. Please try refreshing the page or contact your administrator if the problem persists.",
          changelog: [],
          comments: [],
          attachments: [],
          total: 0,
        };
      }

      const hasAccess = await checkProjectAccess(projectKey);
      console.log(`Project ${projectKey} has access: ${hasAccess}`);

      if (!hasAccess) {
        console.log(`Access denied for project: ${projectKey}`);
        return {
          error: `This project is not authorized to use the Issue Change Log app. Please contact your Jira administrator to grant access for this project.`,
          changelog: [],
          comments: [],
          attachments: [],
          total: 0,
        };
      }

      // Check if the app is enabled for this specific project
      const projectSettings = (await storage.get(`project_${projectKey}_settings`)) || {};
      const isProjectAppEnabled = projectSettings.enabled !== false; // Default to true if not set
      
      if (!isProjectAppEnabled) {
        console.log(`App disabled for project: ${projectKey}`);
        return {
          error: `The Issue Change Log app has been disabled for this project. Please contact your project administrator to enable it.`,
          changelog: [],
          comments: [],
          attachments: [],
          total: 0,
        };
      }
    }

    // Parse filter
    const rawFilter = req.filter || req.payload?.filter || "all";
    const filterValue =
      typeof rawFilter === "string" ? rawFilter : rawFilter?.value || "all";
    const cutoffDate = parseRelativeTime(filterValue);

    let allChangelog = [];
    let allComments = [];
    let allAttachments = [];

    for (const issueKey of issueKeys) {
      // Fetch issue with changelog
      const res = await api
        .asUser()
        .requestJira(route`/rest/api/3/issue/${issueKey}?expand=changelog`);
      if (!res.ok) {
        console.error("Jira API error:", res.status, await res.text());
        continue;
      }

      const json = await res.json();
      const allChanges = json.changelog?.histories || [];

      // Filter changelog entries
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

      // Fetch comments + attachments
      const comments = await fetchIssueComments(issueKey, cutoffDate);
      const attachments = await fetchIssueAttachments(issueKey, cutoffDate);

      allChangelog.push(...changelogEntries);
      allComments.push(...comments);
      allAttachments.push(...attachments);
    }

    const result = {
      changelog: allChangelog,
      comments: allComments,
      attachments: allAttachments,
      total: allChangelog.length + allComments.length + allAttachments.length,
    };

    console.log("Result summary:", {
      changelogCount: allChangelog.length,
      commentsCount: allComments.length,
      attachmentsCount: allAttachments.length,
      total: result.total,
    });

    return result;
  } catch (e) {
    console.error("Error fetching changelog:", e);
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
 * Admin function to get allowed projects
 */
const getAllowedProjects = async (req) => {
  try {
    const allowedProjects = (await storage.get("allowedProjects")) || [];
    let allowedProjectsData = (await storage.get("allowedProjectsData")) || {};
    
    // Migration: Populate metadata for existing projects without it
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
          console.error(`Error fetching details for project ${projectKey}:`, error);
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
    console.error("Error getting allowed projects:", error);
    return { error: error.message };
  }
};

/**
 * Admin function to add a project to allowed list
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
      // Fetch project details
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
      
      // Also maintain the simple array for backward compatibility
      const allowedProjects = Object.keys(allowedProjectsData);
      await storage.set("allowedProjects", allowedProjects);
    }

    const allowedProjects = Object.keys(allowedProjectsData);
    return { success: true, allowedProjects, allowedProjectsData };
  } catch (error) {
    console.error("Error adding allowed project:", error);
    return { error: error.message };
  }
};

/**
 * Admin function to remove a project from allowed list
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

    // Update the simple array
    const allowedProjects = Object.keys(allowedProjectsData);
    await storage.set("allowedProjects", allowedProjects);

    return { success: true, allowedProjects, allowedProjectsData };
  } catch (error) {
    console.error("Error removing allowed project:", error);
    return { error: error.message };
  }
};

/**
 * Admin function to get all available projects in the instance
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
    console.error("Error getting all projects:", error);
    return { error: error.message };
  }
};

/**
 * Utility function to check current user's project access info
 */
const getAccessInfo = async (req) => {
  try {
    const allowedProjects = (await storage.get("allowedProjects")) || [];

    // Get current project if issue context is available
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
    console.error("Error getting access info:", error);
    return { error: error.message };
  }
};

/**
 * Check if current user is a project admin
 */
const checkProjectAdminAccess = async (projectKey) => {
  try {
    // Get current user info
    const userRes = await api.asUser().requestJira(route`/rest/api/3/myself`);
    if (!userRes.ok) return false;
    
    const user = await userRes.json();
    const userId = user.accountId;

    // Check if user has project admin permissions
    const permRes = await api.asUser().requestJira(
      route`/rest/api/3/mypermissions?projectKey=${projectKey}&permissions=ADMINISTER_PROJECTS`
    );
    
    if (!permRes.ok) return false;
    
    const permissions = await permRes.json();
    return permissions.permissions?.ADMINISTER_PROJECTS?.havePermission || false;
  } catch (error) {
    console.error("Error checking project admin access:", error);
    return false;
  }
};

/**
 * Get current project context and settings
 */
const getProjectSettings = async (req) => {
  try {
    console.log("getProjectSettings request:", JSON.stringify(req, null, 2));
    
    // Get current project from context - try multiple possible paths for project admin pages
    let projectKey = req?.context?.extension?.project?.key ||
                    req?.context?.project?.key ||
                    req?.context?.extension?.context?.project?.key ||
                    req?.payload?.projectKey ||
                    req?.projectKey;
    
    console.log("Project key from context:", projectKey);
    
    // If still no project key, try to extract from URL context or other admin page contexts
    if (!projectKey && req?.context) {
      console.log("Full context object:", JSON.stringify(req.context, null, 2));
    }
    
    if (!projectKey) {
      return { 
        success: false, 
        message: "No project context available - please ensure you are accessing this from a project settings page",
        debug: {
          contextExtension: req?.context?.extension,
          context: req?.context,
          payload: req?.payload
        }
      };
    }

    // Get project details first
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

    // Check if project is allowed by site admin
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

    // Check if user is project admin
    const isProjectAdmin = await checkProjectAdminAccess(projectKey);
    console.log("Is project admin:", isProjectAdmin);

    // Get project-specific app settings
    const projectSettings = (await storage.get(`project_${projectKey}_settings`)) || {};
    const isEnabled = projectSettings.enabled !== false; // Default to true if not set
    
    return {
      success: true,
      project: projectData,
      hasPermission: true,
      isEnabled: isEnabled,
      isProjectAdmin: isProjectAdmin
    };
  } catch (error) {
    console.error("Error getting project settings:", error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Toggle app enablement for a project
 */
const toggleProjectApp = async (req) => {
  try {
    console.log("toggleProjectApp request:", JSON.stringify(req, null, 2));
    
    const { enabled } = req.payload || req;
    // Get current project from context - try multiple possible paths for project admin pages
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

    // Check if project is allowed by site admin
    const allowedProjects = (await storage.get("allowedProjects")) || [];
    if (!allowedProjects.includes(projectKey)) {
      return {
        success: false,
        message: "Project is not authorized by site administrator"
      };
    }

    // Check if user is project admin
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
    console.error("Error toggling project app:", error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Register resolver
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
