import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import { storage } from "@forge/api";

/**
 * Check if a project has access to the app
 */
const checkProjectAccess = async (projectKey) => {
  try {
    const allowedProjects = await storage.get("allowedProjects") || [];
    
    // If no projects are configured yet, allow access (for initial setup)
    if (allowedProjects.length === 0) {
      console.log("No projects configured yet, allowing access for initial setup");
      return true;
    }
    
    return allowedProjects.includes(projectKey);
  } catch (error) {
    console.error("Error checking project access:", error);
    return false;
  }
};

/**
 * Check if current user is a site admin
 */
const checkSiteAdminAccess = async () => {
  try {
    const res = await api.asUser().requestJira(route`/rest/api/3/myself`);
    if (!res.ok) return false;
    
    const user = await res.json();
    const groups = user.groups?.items || [];
    
    // Check if user is in site-admins group or jira-administrators
    return groups.some(group => 
      group.name === "site-admins" || 
      group.name === "jira-administrators" ||
      group.name === "administrators"
    );
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
};

/**
 * Get project key from issue key
 */
const getProjectKeyFromIssue = async (issueKey) => {
  try {
    const res = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}?fields=project`);
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
          error: "Access denied: Could not determine project",
          changelog: [], 
          comments: [], 
          attachments: [], 
          total: 0 
        };
      }

      const hasAccess = await checkProjectAccess(projectKey);
      console.log(`Project ${projectKey} has access: ${hasAccess}`);
      
      if (!hasAccess) {
        console.log(`Access denied for project: ${projectKey}`);
        return { 
          error: `Access denied: Project ${projectKey} is not authorized to use this app`,
          changelog: [], 
          comments: [], 
          attachments: [], 
          total: 0 
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
      total: 0 
    };
  }
};

/**
 * Admin function to get allowed projects
 */
const getAllowedProjects = async (req) => {
  try {
    const isAdmin = await checkSiteAdminAccess();
    if (!isAdmin) {
      return { error: "Access denied: Admin privileges required" };
    }

    const allowedProjects = await storage.get("allowedProjects") || [];
    return { allowedProjects };
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
    const isAdmin = await checkSiteAdminAccess();
    if (!isAdmin) {
      return { error: "Access denied: Admin privileges required" };
    }

    const { projectKey } = req.payload || req;
    if (!projectKey) {
      return { error: "Project key is required" };
    }

    const allowedProjects = await storage.get("allowedProjects") || [];
    if (!allowedProjects.includes(projectKey)) {
      allowedProjects.push(projectKey);
      await storage.set("allowedProjects", allowedProjects);
    }

    return { success: true, allowedProjects };
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
    const isAdmin = await checkSiteAdminAccess();
    if (!isAdmin) {
      return { error: "Access denied: Admin privileges required" };
    }

    const { projectKey } = req.payload || req;
    if (!projectKey) {
      return { error: "Project key is required" };
    }

    const allowedProjects = await storage.get("allowedProjects") || [];
    const updatedProjects = allowedProjects.filter(key => key !== projectKey);
    await storage.set("allowedProjects", updatedProjects);

    return { success: true, allowedProjects: updatedProjects };
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
    const isAdmin = await checkSiteAdminAccess();
    if (!isAdmin) {
      return { error: "Access denied: Admin privileges required" };
    }

    const res = await api.asUser().requestJira(route`/rest/api/3/project`);
    if (!res.ok) {
      return { error: "Failed to fetch projects" };
    }

    const projects = await res.json();
    return { 
      projects: projects.map(p => ({
        key: p.key,
        name: p.name,
        projectTypeKey: p.projectTypeKey
      }))
    };
  } catch (error) {
    console.error("Error getting all projects:", error);
    return { error: error.message };
  }
};

/**
 * Utility function to check current user's admin status and project access info
 */
const getAccessInfo = async (req) => {
  try {
    const isAdmin = await checkSiteAdminAccess();
    const allowedProjects = await storage.get("allowedProjects") || [];
    
    // Get current project if issue context is available
    let currentProject = null;
    const contextKey = req?.context?.extension?.issue?.key;
    if (contextKey) {
      currentProject = await getProjectKeyFromIssue(contextKey);
    }

    return {
      isAdmin,
      allowedProjects,
      currentProject,
      hasAccess: currentProject ? allowedProjects.includes(currentProject) : null
    };
  } catch (error) {
    console.error("Error getting access info:", error);
    return { error: error.message };
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

export const handler = resolver.getDefinitions();
