import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import { storage } from "@forge/api";


const checkProjectAccess = async (projectKey) => {
  try {
    const allowedProjects = (await storage.get("allowedProjects")) || [];

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

const checkSiteAdminAccess = async () => {
  try {
    const res = await api
      .asUser()
      .requestJira(route`/rest/api/3/myself?expand=groups`);

    if (!res.ok) return false;

    const user = await res.json();

    const groups = user.groups?.items || [];

    console.log("User:", user.displayName);
    console.log("Groups:", groups);

    return groups.some(
      (group) =>
        group.name === "site-admins" || group.name === "jira-administrators" || group.name === "org-admins"
    );
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
};

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

const parseRelativeTime = (filterValue) => {
  if (!filterValue || filterValue === "all") return null;

  const now = new Date();

  switch (filterValue) {
    case "just_now":
      return new Date(now.getTime() - 60 * 1000); // 1 minute ago
    case "5_minutes":
      return new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    case "2_hours":
      return new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    case "3_days":
      return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    case "1_week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
    case "1_month":
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return oneMonthAgo;
    case "custom":
      return null; // handled separately in frontend using fromDate/toDate
    default:
      return null;
  }
};

/**
 * Fetch comments for an issue
 */
const fetchIssueComments = async (issueKey, cutoffDate, filterValue, fromDate, toDate) => {
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
    // In fetchIssueComments:
return allComments.filter((comment) => {
  const commentDate = new Date(comment.created);
  console.log(`Comment date: ${commentDate}, fromDate: ${fromDate}, toDate: ${toDate}`);
  if (filterValue === "custom") {
    if (fromDate && commentDate < fromDate) return false;
    if (toDate && commentDate > toDate) return false;
    return true;
  }
  if (!cutoffDate) return true;
  return commentDate >= cutoffDate;
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
const fetchIssueAttachments = async (issueKey, cutoffDate, filterValue, fromDate, toDate) => {
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
    return allAttachments.filter((attachment) => {
      const attachmentDate = new Date(attachment.created);
      console.log(`Attachment date: ${attachmentDate}, fromDate: ${fromDate}, toDate: ${toDate}`);
      if (filterValue === "custom") {
        if (fromDate && attachmentDate < fromDate) return false;
        if (toDate && attachmentDate > toDate) return false;
        return true;
      }
      if (!cutoffDate) return true; 
      return attachmentDate >= cutoffDate;
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
const devSahanaa = async (req) => {
  try {
    console.log("Request received:", JSON.stringify(req, null, 2));
    const fromDateReq = req.fromDate || req.payload?.fromDate;
    const toDateReq = req.toDate || req.payload?.toDate;
    const fromDate = fromDateReq ? new Date(fromDateReq) : null;
    const toDate = toDateReq ? new Date(toDateReq) : null;
    if (toDate) toDate.setHours(23, 59, 59, 999); 

    // Determine issue keys
    let issueKeys = req.issueKeys || req.payload?.issueKeys;
    let contextKey = req?.context?.extension?.issue?.key;

    if (!issueKeys) {
      if (contextKey) {
        issueKeys = [contextKey];
      } else {
        const singleKey = req.issueKey || req.payload?.issueKey || "ECWD-10";
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
          total: 0,
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
          total: 0,
        };
      }
    }

    // Parse filter
    const rawFilter = req.filter || req.payload?.filter || "all";
    const filterValue =
      typeof rawFilter === "string" ? rawFilter : rawFilter?.value || "all";
      console.log(`Filtering with filterValue=${filterValue}, fromDate=${fromDate}, toDate=${toDate}`);
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
    const entryDate = new Date(entry.created);
    if (filterValue === "custom") {
      if (fromDate && toDate) return entryDate >= fromDate && entryDate <= toDate;
      if (fromDate) return entryDate >= fromDate;
      if (toDate) return entryDate <= toDate;
      return true;
    } else {
      if (!cutoffDate) return true;
      return entryDate >= cutoffDate;
    }
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
      const comments = await fetchIssueComments(issueKey, cutoffDate, filterValue, fromDate, toDate);
      const attachments = await fetchIssueAttachments(issueKey, cutoffDate, filterValue, fromDate, toDate);


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
    const isAdmin = await checkSiteAdminAccess();
    if (!isAdmin) {
      return { error: "Access denied: Admin privileges required" };
    }

    const allowedProjects = (await storage.get("allowedProjects")) || [];
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

    const allowedProjects = (await storage.get("allowedProjects")) || [];
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

    const allowedProjects = (await storage.get("allowedProjects")) || [];
    const updatedProjects = allowedProjects.filter((key) => key !== projectKey);
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
      projects: projects.map((p) => ({
        key: p.key,
        name: p.name,
        projectTypeKey: p.projectTypeKey,
      })),
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
    const allowedProjects = (await storage.get("allowedProjects")) || [];

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
 * Register resolver
 */
const resolver = new Resolver();
resolver.define("resolver", devSahanaa);
resolver.define("devSahanaa", devSahanaa);
resolver.define("getAllowedProjects", getAllowedProjects);
resolver.define("addAllowedProject", addAllowedProject);
resolver.define("removeAllowedProject", removeAllowedProject);
resolver.define("getAllProjects", getAllProjects);
resolver.define("getAccessInfo", getAccessInfo);

export const handler = resolver.getDefinitions();