import api, { route } from "@forge/api";

/**
 * Parse a relative time filter string to a Date cutoff.
 * @param {string} filterValue Relative time filter: '24h', '7d', '30d', '6m', '1y', 'all'
 * @returns {Date|null} Date object for cutoff, or null for no filtering.
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
 * Fetch comments for a specific issue
 * @param {string} issueKey The issue key
 * @param {Date|null} cutoffDate Filter cutoff date
 * @returns {Promise<Array>} Comments
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
        const commentDate = new Date(comment.created);
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
 * Fetch attachments for a specific issue
 * @param {string} issueKey The issue key
 * @param {Date|null} cutoffDate Filter cutoff date
 * @returns {Promise<Array>} Attachments
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
        const attachmentDate = new Date(attachment.created);
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
 * Fetches and filters Jira issue changelog entries by a relative date filter.
 * @param {object} req The incoming request containing issueKey(s) and filter.
 * @returns {Promise<object>} Object containing changelog, comments, and attachments for all keys.
 */
const devSuvitha = async (req) => {
  try {
    // Use context extension issue key if available
    let issueKeys = req.issueKeys || req.payload?.issueKeys;
    let contextKey = req?.context?.extension?.issue?.key;
    if (!issueKeys) {
      // fallback to context key, then single key logic
      if (contextKey) {
        console.log("Context issue key:", contextKey);
        issueKeys = [contextKey];
      } else {
        const singleKey = req.issueKey || req.payload?.issueKey || "KC-24";
        issueKeys = [singleKey];
      }
    }
    const rawFilter = req.filter || req.payload?.filter || "all";
    const filterValue =
      typeof rawFilter === "string" ? rawFilter : rawFilter?.value || "all";
    const cutoffDate = parseRelativeTime(filterValue);

    let allChangelog = [];
    let allComments = [];
    let allAttachments = [];

    for (const issueKey of issueKeys) {
      // Fetch issue with changelog expanded
      const res = await api
        .asUser()
        .requestJira(route`/rest/api/3/issue/${issueKey}?expand=changelog`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Jira API error:", res.status, errorText);
        continue;
      }
      const json = await res.json();
      const allChanges = json.changelog?.histories || [];
      // Filter changelog entries by cutoff date
      const changelogEntries = allChanges
        .filter((entry) => {
          if (!cutoffDate) return true;
          const entryDate = new Date(entry.created);
          return entryDate >= cutoffDate;
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
      // Fetch comments and attachments
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
      changelog: [],
      comments: [],
      attachments: [],
      total: 0,
    };
  }
};

export default devSuvitha;
