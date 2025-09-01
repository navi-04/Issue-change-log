import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Text,
  Inline,
  Box,
  Strong,
  xcss,
  Button,
  Select,
} from "@forge/react";
import { invoke } from "@forge/bridge";

const currentDev = "devSuvitha";

// 📍 Get user's local timezone
const useUserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// 📍 Styling helper
const useStyles = () => {
  const tableStyle = xcss({
    width: "100%",
    padding: "space.100",
    backgroundColor: "color.background.neutral",
  });

  const rowStyle = xcss({
    paddingBottom: "space.050",
    borderBottom: "1px solid",
    borderColor: "color.border",
  });

  const cellStyle = xcss({
    width: "20%",
  });

  return { tableStyle, rowStyle, cellStyle };
};

// 📍 Header Cell component
const HeaderCell = ({ children, cellStyle }) => (
  <Box xcss={cellStyle}>
    <Text>
      <Strong>{children}</Strong>
    </Text>
  </Box>
);

// 📍 Data Cell component
const DataCell = ({ children, cellStyle }) => (
  <Box xcss={cellStyle}>
    <Text>{children}</Text>
  </Box>
);

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

  try {
    const targetDate = new Date(date);
    const now = new Date();

    if (isNaN(targetDate.getTime())) return "";

    const diffInMs = now - targetDate;
    const absDiff = Math.abs(diffInMs);

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (seconds < 60) {
      return "just now";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (days < 30) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (months < 12) {
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
      return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
  } catch {
    return "";
  }
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

// 📍 Main App
const App = () => {
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
  const { tableStyle, rowStyle, cellStyle } = useStyles();

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
          // Remove duplicates based on type+date+field+from+to+filename
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
      } catch (error) {
        setError(error.message || "Unknown error");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    intervalId = setInterval(fetchData, 10000);
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
    <Box xcss={tableStyle}>
      {/* Relative Time Filter */}
      <Box marginBlockEnd="space.100">
        <Text>
          <Strong>Filter by Time:</Strong>
        </Text>
        <Select options={filterOptions} value={filter} onChange={setFilter} />

        <Box marginBlockStart="space.100" />
        <Button
          text="Export CSV"
          onClick={() => exportCSV(sortedData, userTimeZone)}
        />
      </Box>

      {/* Table Header */}
      <Inline alignBlock="start" xcss={rowStyle}>
        <HeaderCell cellStyle={cellStyle}>Type</HeaderCell>
        <HeaderCell cellStyle={cellStyle}>Author</HeaderCell>
        <HeaderCell cellStyle={cellStyle}>Field/Content</HeaderCell>
        <HeaderCell cellStyle={cellStyle}>From</HeaderCell>
        <HeaderCell cellStyle={cellStyle}>To</HeaderCell>
        <HeaderCell cellStyle={cellStyle}>Date</HeaderCell>
      </Inline>

      {/* Table Rows */}
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text tone="critical">Error: {error}</Text>
      ) : sortedData.length === 0 ? (
        <Text>No activities found.</Text>
      ) : (
        pagedData.map((entry, index) => (
          <Inline alignBlock="start" key={index} xcss={rowStyle}>
            <DataCell cellStyle={cellStyle}>
              {entry.type === "changelog" && "📝 Change"}
              {entry.type === "comment" && "💬 Comment"}
              {entry.type === "attachment" && "📎 Attachment"}
            </DataCell>
            <DataCell cellStyle={cellStyle}>{entry.author || "-"}</DataCell>
            <DataCell cellStyle={cellStyle}>
              {entry.type === "changelog" && (
                <>
                  {entry.field === "status" ? "🚦 " : ""}
                  {entry.field === "priority" ? "⚠️ " : ""}
                  {entry.field === "assignee" ? "👤 " : ""}
                  {entry.field || "-"}
                </>
              )}
              {entry.type === "comment" && (
                <Text>{entry.content?.substring(0, 50)}...</Text>
              )}
              {entry.type === "attachment" && <Text>{entry.filename}</Text>}
            </DataCell>
            <DataCell cellStyle={cellStyle}>
              {entry.type === "changelog" ? entry.from || "-" : "-"}
            </DataCell>
            <DataCell cellStyle={cellStyle}>
              {entry.type === "changelog"
                ? entry.to || "-"
                : entry.type === "attachment"
                ? `${Math.round(entry.size / 1024)}KB`
                : "-"}
            </DataCell>
            <DataCell cellStyle={cellStyle}>
              <Text>
                {formatDate(entry.date || entry.created, userTimeZone)}{" "}
                <Text as="span" size="small" tone="subtle">
                  ({getRelativeTime(entry.date || entry.created)})
                </Text>
              </Text>
            </DataCell>
          </Inline>
        ))
      )}

      {/* Pagination Controls */}
      {sortedData.length > 0 && (
        <Box
          marginBlockStart="space.200"
          display="flex"
          alignItems="center"
          gap="space.200"
        >
          <Text>Logs per page:</Text>
          <Select
            options={[10, 25, 50, 100].map((n) => ({
              label: n.toString(),
              value: n,
            }))}
            value={{ label: logsPerPage.toString(), value: logsPerPage }}
            onChange={(val) => {
              setLogsPerPage(val.value);
              setPage(1);
            }}
            width="80px"
          />
          <Box marginInlineStart="space.200" />
          <Button
            appearance="subtle"
            isDisabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            &lt;
          </Button>
          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              appearance={p === page ? "primary" : "subtle"}
              isDisabled={p === page}
              onClick={() => setPage(p)}
              style={{ minWidth: 32 }}
            >
              {p}
            </Button>
          ))}
          <Button
            appearance="subtle"
            isDisabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
          >
            &gt;
          </Button>
          <Text style={{ marginLeft: 8, color: "#888" }}>of {totalPages}</Text>
        </Box>
      )}
    </Box>
  );
};

ForgeReconciler.render(<App />);
