// src/App.js
import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import Button from "@atlaskit/button";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";


const currentDev = "devSuvitha";

// 📍 Get user's local timezone
const useUserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// 📍 Date Formatter
const formatDate = (dateString, timeZone) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString(undefined, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 📍 Relative Time
const getRelativeTime = (date) => {
  if (!date) return "";
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) return "";

  const now = new Date();
  const diffInMs = now - targetDate;
  const absDiff = Math.abs(diffInMs);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

// 📍 CSV Export
const exportCSV = (data, timeZone) => {
  const headers = ["Author", "Field", "From", "To", "Date"];
  const rows = data.map((row) =>
    [
      row.author,
      row.field,
      row.from,
      row.to,
      formatDate(row.date, timeZone),
    ].join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "changelog.csv";
  a.click();
};

export default function App() {
  const filterOptions = [
    { label: "All Time", value: "all" },
    { label: "Last 24 hours", value: "24h" },
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 6 months", value: "6m" },
    { label: "Last 1 year", value: "1y" },
  ];

  const [filter, setFilter] = useState(filterOptions[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logsPerPage, setLogsPerPage] = useState(25);
  const [page, setPage] = useState(1);

  const userTimeZone = useUserTimeZone();

  useEffect(() => {
    let intervalId;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await invoke(currentDev, {
          filter: filter.value,
          issueKey: "KC-24",
        });
        if (result && typeof result === "object") {
          const allActivities = [
            ...(result.changelog || []),
            ...(result.comments || []),
            ...(result.attachments || []),
          ];
          // Deduplicate
          const seen = new Set();
          const uniqueActivities = allActivities.filter((item) => {
            let key = `${item.type}-${item.date || item.created}`;
            if (item.type === "changelog") {
              key += `-${item.field || ""}-${item.from || ""}-${item.to || ""}`;
            } else if (item.type === "attachment") {
              key += `-${item.filename || ""}`;
            } else if (item.type === "comment") {
              key += `-${item.content || ""}`;
            }
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setData(uniqueActivities);
        } else {
          setData(result || []);
        }
      } catch (err) {
        setError(err.message || "Unknown error");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    intervalId = setInterval(fetchData, 100000000000);
    return () => clearInterval(intervalId);
  }, [filter]);

  useEffect(() => {
    setPage(1);
  }, [filter, logsPerPage]);

  const sortedData = [...data].sort(
    (a, b) => new Date(b.date || b.created) - new Date(a.date || a.created)
  );
  const totalPages =
    sortedData.length > 0 ? Math.ceil(sortedData.length / logsPerPage) : 1;
  const pagedData = sortedData.slice(
    (page - 1) * logsPerPage,
    page * logsPerPage
  );

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
      {/* Filters */}
      <div style={{ marginBottom: "16px" }}>
        <p>Filter by Time: </p>
        <DropdownMenu trigger={filter.label} shouldRenderToParent>
              <DropdownItemGroup>
                {filterOptions.map((opt) => (
                  <DropdownItem
                    key={opt.value}
                    onClick={() => setFilter(opt)}
                    isSelected={filter.value === opt.value}
                  >
                    {opt.label}
                  </DropdownItem>
                ))}
              </DropdownItemGroup>
            </DropdownMenu>
        <Button
          style={{ marginLeft: "12px" }}
          onClick={() => exportCSV(sortedData, userTimeZone)}
          appearance="primary"
        >
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#f9f9f9",
        }}
      >
        <thead>
          <tr>
            {["Type", "Author", "Field/Content", "From", "To", "Date"].map(
              (header) => (
                <th
                  key={header}
                  style={{
                    borderBottom: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6}>Loading...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={6} style={{ color: "red" }}>
                Error: {error}
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={6}>No activities found.</td>
            </tr>
          ) : (
            pagedData.map((entry, i) => (
              <tr key={i}>
                <td style={{ padding: "6px" }}>
                  {entry.type === "changelog" && "📝 Change"}
                  {entry.type === "comment" && "💬 Comment"}
                  {entry.type === "attachment" && "📎 Attachment"}
                </td>
                <td style={{ padding: "6px" }}>{entry.author || "-"}</td>
                <td style={{ padding: "6px" }}>
                  {entry.type === "changelog" && (
                    <>
                      {entry.field === "status" && "🚦 "}
                      {entry.field === "priority" && "⚠️ "}
                      {entry.field === "assignee" && "👤 "}
                      {entry.field || "-"}
                    </>
                  )}
                  {entry.type === "comment" &&
                    (entry.content?.substring(0, 50) || "-")}
                  {entry.type === "attachment" && entry.filename}
                </td>
                <td style={{ padding: "6px" }}>
                  {entry.type === "changelog" ? entry.from || "-" : "-"}
                </td>
                <td style={{ padding: "6px" }}>
                  {entry.type === "changelog"
                    ? entry.to || "-"
                    : entry.type === "attachment"
                    ? `${Math.round(entry.size / 1024)}KB`
                    : "-"}
                </td>
                <td style={{ padding: "6px" }}>
                  {formatDate(entry.date || entry.created, userTimeZone)}{" "}
                  <span style={{ color: "#888", fontSize: "12px" }}>
                    ({getRelativeTime(entry.date || entry.created)})
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {sortedData.length > 0 && (
        <div style={{ marginTop: "16px", display: "flex", alignItems: "center" }}>
          <span>Logs per page: </span>
          <select
            value={logsPerPage}
            onChange={(e) => setLogsPerPage(Number(e.target.value))}
            style={{ marginLeft: "8px" }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <div style={{ marginLeft: "16px" }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                disabled={p === page}
                style={{
                  fontWeight: p === page ? "bold" : "normal",
                  margin: "0 2px",
                }}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </button>
            <span style={{ marginLeft: "8px", color: "#888" }}>
              of {totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
