# Jira Issue Activity Timeline Forge App

A powerful Forge app for Jira Cloud that displays a comprehensive **Issue Activity Timeline** panel in every Jira issue. This app aggregates and displays changelogs, comments, and attachments for the current issue, as well as for all its linked issues and subtasks, with advanced filtering and CSV export.

---

## 🚀 Features

- **Aggregated Activity Timeline**: View all changelogs, comments, and attachments for the current issue, its linked issues, and subtasks in one place.
- **Time Filtering**: Filter activities by time (all, last 24h, 7d, 30d, 6m, 1y).
- **CSV Export**: Export the full activity log as a CSV file for reporting or analysis.
- **Context Awareness**: Automatically detects the current issue key from the Jira context.
- **Modern UI**: Uses Forge UI components for a clean, accessible, and responsive table layout.
- **Debugging Info**: Console logs and UI debug info to help with troubleshooting and development.

---

## 📦 How It Works

- The app appears as a panel in every Jira issue (right sidebar).
- On load, it fetches the current issue key from the Jira context.
- The backend resolver fetches:
  - Changelog (field history) for the issue
  - Comments for the issue
  - Attachments for the issue
  - The same for all linked issues and subtasks (if you extend the backend)
- All activities are merged, sorted by date, and displayed in a table.
- Users can filter by time and export the data as CSV.

---

## 🗂️ File Structure

- `src/frontend/index.jsx` — Main React frontend, renders the activity timeline, filter, and export button.
- `src/resolvers/devSuvitha.js` — Main backend resolver, fetches and aggregates all activity data.
- `manifest.yml` — Forge app manifest, defines modules, permissions, and resources.
- `README.md` — This documentation file.

---

## ⚡ Quick Start

1. **Edit the frontend** in `src/frontend/index.jsx`.
2. **Edit the backend** in `src/resolvers/devSuvitha.js`.
3. **Build the frontend**:
   ```sh
   npm run build
   ```
4. **Deploy your app**:
   ```sh
   forge deploy --environment development
   ```
5. **Install the app** to your Jira site:
   ```sh
   forge install --environment development
   ```
6. **Develop with live reload**:
   ```sh
   forge tunnel
   ```

---

## 🛠️ Usage

- The app will appear in the right panel of every Jira issue.
- Use the dropdown to filter activities by time.
- Click **Export CSV** to download the activity log.

---

## 🧩 Backend Details

- The backend uses the Jira REST API to fetch changelogs, comments, and attachments.
- It supports fetching for a single issue (from context) or a list of issue keys (if provided).
- The backend is context-aware: it uses `req.context.extension.issue.key` if available, otherwise falls back to a default.
- All data is merged and returned to the frontend for display.

---

## 🐞 Troubleshooting

- **Panel not showing?**
  - Make sure you have built and deployed the app (`npm run build`, `forge deploy`).
  - Make sure the app is installed on your Jira site (`forge install`).
  - Try a hard refresh or incognito mode in your browser.
- **No data showing?**
  - Check the browser console for logs.
  - Check Forge logs with `forge logs --environment development`.
  - Make sure the issue has changelogs, comments, or attachments.
- **Outdated CLI warning?**
  - Update with `npm install -g @forge/cli@latest`.
- **Want to fetch for all issues in a project?**
  - Extend the backend to use the Jira search API to get all issue keys, then aggregate as shown in `devSuvitha.js`.

---

## 🔧 Extending the App

- **Fetch for all issues in a project:**
  - Use the Jira search API to get all issue keys, then aggregate.
- **Custom filters or columns:**
  - Edit the frontend table and backend data structure as needed.
- **User selection of issues:**
  - Add a Select or Autocomplete in the frontend and pass the selected keys to the backend.

---

## 📚 Resources & Support

- [Forge Documentation](https://developer.atlassian.com/platform/forge/)
- [Forge UI Kit Reference](https://developer.atlassian.com/platform/forge/ui-kit-components/)
- [Jira REST API Reference](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Get Help](https://developer.atlassian.com/platform/forge/get-help/)

---

## 📝 License

This project is for demonstration and internal use. See Atlassian Forge terms for more information.
