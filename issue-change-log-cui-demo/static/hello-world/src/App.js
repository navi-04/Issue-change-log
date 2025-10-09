import React, { useEffect, useState, useMemo } from "react";
import { invoke } from "@forge/bridge";
import DynamicTable from "@atlaskit/dynamic-table";
import Button from "@atlaskit/button";
import TextField from "@atlaskit/textfield";
import Select from "@atlaskit/select";
import Spinner from "@atlaskit/spinner";
import Lozenge from "@atlaskit/lozenge";
import Banner from "@atlaskit/banner";
import Pagination from "@atlaskit/pagination";
import { DatePicker } from "@atlaskit/datetime-picker";
import "@atlaskit/css-reset";

const currentDev = "devSahanaa";

const useUserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

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

const escapeCSV = (str) => `"${(str || "").replace(/"/g, '""')}"`;

const exportCSV = (data, timeZone) => {
  const headers = ["Author", "Field/Content", "From", "To", "Date"];
  const rows = data.map((row) =>
    [
      escapeCSV(row.author),
      escapeCSV(
        row.type === "changelog"
          ? row.field
          : row.type === "comment"
          ? "Comment"
          : row.filename || ""
      ),
      escapeCSV(row.type === "changelog" ? row.from || "-" : "-"),
      escapeCSV(
        row.type === "changelog"
          ? row.to || "-"
          : row.type === "attachment"
          ? `${Math.round(row.size / 1024)}KB`
          : row.type === "comment"
          ? row.content
          : "-"
      ),
      escapeCSV(formatDate(row.date || row.created, timeZone)),
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

const mergeUniqueActivities = (result) => {
  const allActivities = [
    ...(result.changelog || []),
    ...(result.comments || []),
    ...(result.attachments || []),
  ];

  const seen = new Set();
  return allActivities.filter((item) => {
    let key = `${item.type}-${item.date || item.created}`;
    if (item.type === "changelog") key += `-${item.field || ""}-${item.from || ""}-${item.to || ""}`;
    if (item.type === "attachment") key += `-${item.filename || ""}`;
    if (item.type === "comment") key += `-${item.content || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const matchesDateFilter = (item, dateFilter, fromDate, toDate) => {
  const itemDate = new Date(item.date || item.created);
  if (isNaN(itemDate)) return false;
  const now = new Date();
  switch (dateFilter) {
    case "all":
    case "":
      return true;
    case "just_now":
      return (now - itemDate) / 1000 <= 60;
    case "5_minutes":
      return (now - itemDate) / 1000 / 60 <= 5;
    case "2_hours":
      return (now - itemDate) / 1000 / 60 / 60 <= 2;
    case "3_days":
      return (now - itemDate) / 1000 / 60 / 60 / 24 <= 3;
    case "1_week":
      return (now - itemDate) / 1000 / 60 / 60 / 24 <= 7;
    case "1_month":
      return (now - itemDate) / 1000 / 60 / 60 / 24 <= 30;
    case "custom": {
      if (!fromDate || !toDate) return false;
      const from = new Date(fromDate);
      const to = new Date(toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      return itemDate >= from && itemDate <= to;
    }
    default:
      return true;
  }
};

export default function App() {
  const [data, setData] = useState([]); // FULL data fetched once
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [filters, setFilters] = useState({
    author: "",
    field: "",
    from: "",
    to: "",
    date: "all",
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const userTimeZone = useUserTimeZone();

  // Fetch all data ONCE when component mounts or filters.date/fromDate/toDate changes (optional to refetch on date filter)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch ALL data once (no filter sent)
        const result = await invoke(currentDev, {}); 
        if (result && result.error) {
          setError(result.error);
          setData([]);
          return;
        }
        const uniqueActivities = mergeUniqueActivities(result);
        setData(uniqueActivities);
      } catch (err) {
        setError(err.message || "Unknown error");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // no dependency removes re-fetch on filter change!

  const filterOptions = useMemo(() => ({
  authors: Array.from(new Set(data.map(d => d.author))).map(a => ({ label: a, value: a })),
  fields: Array.from(new Set(
    data.map(d => d.type === 'changelog' ? d.field :
                 d.type === 'comment' ? 'Comment' :
                 d.type === 'attachment' ? d.filename : '')
  )).map(f => ({ label: f, value: f })),
  dates: [
    { label: "All", value: "all" },
    { label: "Just now", value: "just_now" },
    { label: "Last 5 minutes", value: "5_minutes" },
    { label: "Last 2 hours", value: "2_hours" },
    { label: "Last 3 days", value: "3_days" },
    { label: "Last 1 week", value: "1_week" },
    { label: "Last 1 month", value: "1_month" },
    { label: "Custom", value: "custom" },
  ],
}), [data]);

  // FILTER DATA LOCALLY using useMemo - this is the main change from your previous code
  const filteredData = useMemo(() => {
  return data.filter(item => {
    // Author filter (case-insensitive)
    if (filters.author && !(item.author || "").toLowerCase().includes(filters.author.toLowerCase())) {
      return false;
    }

    // Field filter
    if (filters.field !== "") {
      if (item.type === "changelog" && !(item.field || "").toLowerCase().includes(filters.field.toLowerCase())) {
        return false;
      } else if (item.type === "comment" && !"comment".includes(filters.field.toLowerCase())) {
        return false;
      } else if (item.type === "attachment" && !(item.filename || "").toLowerCase().includes(filters.field.toLowerCase())) {
        return false;
      }
    }

    // From filter
    if (filters.from && !(item.from || "").toLowerCase().includes(filters.from.toLowerCase())) {
      return false;
    }

    // To filter
    if (filters.to !== "") {
      if (item.type === "changelog" && !(item.to || "").toLowerCase().includes(filters.to.toLowerCase())) {
        return false;
      } else if (item.type === "attachment" && !`${Math.round(item.size / 1024)}kb`.toLowerCase().includes(filters.to.toLowerCase())) {
        return false;
      } else if (item.type === "comment" && !(item.content || "").toLowerCase().includes(filters.to.toLowerCase())) {
        return false;
      }
    }

    // Date filter
    if (!matchesDateFilter(item, filters.date, fromDate, toDate)) {
      return false;
    }

    return true;
  });
}, [data, filters, fromDate, toDate]);

  // Sort then paginate filtered data
  const sortedData = useMemo(() => {
    return [...filteredData].sort(
      (a, b) => new Date(b.date || b.created) - new Date(a.date || a.created)
    );
  }, [filteredData]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, filteredData.length]);

  const handleManualRefresh = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await invoke(currentDev, {}); // fetch all data
    if (result?.error) {
      setError(result.error);
      setData([]);
      return;
    }
    setData(mergeUniqueActivities(result));
  } catch (err) {
    setError(err.message);
    setData([]);
  } finally {
    setLoading(false);
  }
};

          
useEffect(() => {
    if (filters.date === "custom" && fromDate && toDate) {
      setCurrentPage(1);
    }
  }, [filters.date, fromDate, toDate]);

  const updateFilter = (column, value) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
  };

  const clearFilters = () => {
    setFilters({
      author: "",
      field: "",
      from: "",
      to: "",
      date: "all",
    });
    setFromDate("");
    setToDate("");
  };
  const hasActiveFilters =
    !!(
      filters.author ||
      filters.field ||
      filters.from ||
      filters.to ||
      filters.date !== "all" ||
      fromDate ||
      toDate
    );
  if (error && error.includes("Access denied")) {
    return (
      <div style={{ padding: "16px" }}>
        <Banner appearance="error" icon="🔒">
          <strong>Access Restricted</strong>
          <p>{error}</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>
            Please contact your site administrator to request access for this project.
            Admin can manage project access in Jira Settings → Apps → Issue Change Log Settings.
          </p>
        </Banner>
      </div>
    );
  }

  const head = {
    cells: [
      {
        key: "author",
        content: (
          <div>
            <strong>Author</strong>
            <div style={{ marginTop: "4px" }}>
              <Select
                placeholder="Filter by author..."
                options={filterOptions.authors}
                value={filterOptions.authors.find(opt => opt.value === filters.author) || null}
                onChange={(option) => updateFilter("author", option ? option.value : "")}
                isClearable
                isSearchable={true}
                styles={{
                  container: (provided) => ({ ...provided, minWidth: "150px" }),
                  control: (provided) => ({ ...provided, minHeight: "32px" })
                }}
              />
            </div>
          </div>
        ),
        isSortable: false,
        width: 20
      },
      {
        key: "field",
        content: (
          <div>
            <strong>Field/Content</strong>
            <div style={{ marginTop: "4px" }}>
              <Select
                placeholder="Filter by field..."
                options={filterOptions.fields}
                value={filterOptions.fields.find(opt => opt.value === filters.field) || null}
                onChange={(option) => updateFilter("field", option ? option.value : "")}
                isClearable
                isSearchable={true}
                styles={{
                  container: (provided) => ({ ...provided, minWidth: "150px" }),
                  control: (provided) => ({ ...provided, minHeight: "32px" })
                }}
              />
            </div>
          </div>
        ),
        isSortable: false,
        width: 25
      },
      {
        key: "from",
        content: (
          <div>
            <strong>From</strong>
            <div style={{ marginTop: "4px" }}>
              <TextField
                placeholder="Filter from value..."
                value={filters.from}
                onChange={(e) => updateFilter("from", e.target.value)}
                elemAfterInput={
                  filters.from && (
                    <Button
                      appearance="subtle"
                      spacing="compact"
                      onClick={() => updateFilter("from", "")}
                    >
                      ✕
                    </Button>
                  )
                }
              />
            </div>
          </div>
        ),
        isSortable: false,
        width: 15
      },
      {
        key: "to",
        content: (
          <div>
            <strong>To</strong>
            <div style={{ marginTop: "4px" }}>
              <TextField
                placeholder="Filter to value..."
                value={filters.to}
                onChange={(e) => updateFilter("to", e.target.value)}
                elemAfterInput={
                  filters.to && (
                    <Button
                      appearance="subtle"
                      spacing="compact"
                      onClick={() => updateFilter("to", "")}
                    >
                      ✕
                    </Button>
                  )
                }
              />
            </div>
          </div>
        ),
        isSortable: false,
        width: 15
      },
      {
        key: "date",
        content: (
          <div>
            <strong>Date</strong>
            <div style={{ marginTop: "4px" }}>
              <Select
                placeholder="Filter by time..."
                options={filterOptions.dates}
                value={filterOptions.dates.find(opt => opt.value === filters.date) || null}
                onChange={(option) => {
                const val = option?.value || "";
                updateFilter("date", val);
                if (val !== "custom") {
                setFromDate("");
                setToDate("");
                }
                }}
                isClearable
                isSearchable={false}
                styles={{
                  container: (provided) => ({ ...provided, minWidth: "150px" }),
                  control: (provided) => ({ ...provided, minHeight: "32px" })
                }}
              />
            </div>

            {filters.date === "custom" && (
              <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                <div>
                  <strong>From Date</strong>
                  <DatePicker
                  value={fromDate || ""}
                  onChange={(date) => {
                    setFromDate(date || "");
                  }}
                  width="180px"
                  isClearable
                  />
                </div>
                <div>
                  <strong>To Date</strong>
                  <DatePicker
                  value={toDate || ""}
                  onChange={(date) => {
                    setToDate(date || "");
                  }}
                  width="180px"
                  isClearable
                  />
                </div>
              </div>
            )}
          </div>
        ),
        isSortable: false,
        width: 20
      }
    ]
  };

  const rows = paginatedData.map((entry, index) => ({
    key: `row-${index}`,
    cells: [
      { key: "author", content: entry.author || "-" },
      {
        key: "field",
        content: (
          <div>
            {entry.type === "changelog" && (
              <>
                {entry.field === "status" && "🚦 "}
                {entry.field === "priority" && "⚠️ "}
                {entry.field === "assignee" && "👤 "}
                {entry.field || "-"}
              </>
            )}
            {entry.type === "comment" && <span>💬 Comment</span>}
            {entry.type === "attachment" && entry.filename}
          </div>
        )
      },
      { key: "from", content: entry.type === "changelog" ? (entry.from || "-") : "-" },
      {
        key: "to",
        content: entry.type === "changelog"
          ? (entry.to || "-")
          : entry.type === "attachment"
            ? `${Math.round(entry.size / 1024)}KB`
            : entry.type === "comment"
              ? <span title={entry.content}>{entry.content || "-"}</span>
              : "-"
      },
      {
        key: "date",
        content: (
          <div>
            <div>{formatDate(entry.date || entry.created, userTimeZone)}</div>
            <div style={{ fontSize: "12px", color: "#6b778c", marginTop: "2px" }}>
              {getRelativeTime(entry.date || entry.created)}
            </div>
          </div>
        )
      }
    ]
  }));

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", flexDirection: "column" }}>
        <Spinner size="large" />
        <p style={{ marginTop: "16px", color: "#6b778c" }}>Loading change log...</p>
      </div>
    );
  }

  if (error && !error.includes("Access denied")) {
    return (
      <div style={{ padding: "16px" }}>
        <Banner appearance="error">
          <strong>Error loading data</strong>
          <p>{error}</p>
        </Banner>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ margin: 0, color: "#172b4d" }}>Issue Change Log</h3>
            <Button appearance="primary" onClick={handleManualRefresh} isLoading={loading} spacing="compact" title="Refresh data">
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          <p style={{ margin: "4px 0 0 0", color: "#6b778c", fontSize: "14px" }}>
            {sortedData.length} total {sortedData.length === 1 ? "activity" : "activities"}
            {hasActiveFilters && ` (${filteredData.length} filtered)`}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {hasActiveFilters && (
            <Button appearance="subtle" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
          <Button appearance="primary" onClick={() => exportCSV(sortedData, userTimeZone)} isDisabled={sortedData.length === 0}>
            Export CSV
          </Button>
        </div>
      </div>

      <DynamicTable head={head} rows={rows} rowsPerPage={pageSize} defaultPage={1}
        emptyView={
          <div style={{ textAlign: "center", padding: "32px" }}>
            <p style={{ fontSize: "16px", margin: "0 0 8px 0", color: "#6b778c" }}>
              {hasActiveFilters ? "No activities match your current filters" : "No activities found"}
            </p>
            <p style={{ fontSize: "14px", margin: "0 0 16px 0", color: "#6b778c" }}>
              {hasActiveFilters
                ? "Try adjusting or clearing your filters to see more results."
                : "There are no change log entries for this issue yet."
              }
            </p>
            {hasActiveFilters && (
              <Button appearance="link" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        }
      />

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#6b778c" }}>Items per page:</span>
            <Select
              value={{ label: pageSize.toString(), value: pageSize }}
              options={[
                { label: "10", value: 10 },
                { label: "25", value: 25 },
                { label: "50", value: 50 },
                { label: "100", value: 100 }
              ]}
              onChange={(option) => {
                setPageSize(option.value);
                setCurrentPage(1);
              }}
              isSearchable={false}
              styles={{ container: (provided) => ({ ...provided, minWidth: "80px" }) }}
            />
          </div>

          <Pagination
            pages={[...Array(totalPages)].map((_, i) => ({
              href: `#page-${i + 1}`,
              label: (i + 1).toString(),
              'aria-label': `Page ${i + 1}`
            }))}
            selectedIndex={currentPage - 1}
            onChange={(_, page) => setCurrentPage(page + 1)}
          />
        </div>
      )}
    </div>
  );
}
