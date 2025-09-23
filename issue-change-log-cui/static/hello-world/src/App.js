import React, { useEffect, useState, useMemo } from "react";
import { invoke } from "@forge/bridge";
import DynamicTable from "@atlaskit/dynamic-table";
import Button from "@atlaskit/button";
import Textfield from "@atlaskit/textfield";
import Select from "@atlaskit/select";
import Spinner from "@atlaskit/spinner";
import Lozenge from "@atlaskit/lozenge";
import Banner from "@atlaskit/banner";
import Pagination from "@atlaskit/pagination";
import "@atlaskit/css-reset";

const currentDev = "devSuvitha";

// Get user's local timezone
const useUserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// Date Formatter
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

// Relative Time
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

// CSV Export
const exportCSV = (data, timeZone) => {
  const headers = ["Type", "Author", "Field/Content", "From", "To", "Date"];
  const rows = data.map((row) =>
    [
      row.type,
      row.author,
      row.type === "changelog" ? row.field : (row.filename || row.content?.substring(0, 50) || ""),
      row.type === "changelog" ? (row.from || "-") : "-",
      row.type === "changelog" ? (row.to || "-") : (row.type === "attachment" ? `${Math.round(row.size / 1024)}KB` : "-"),
      formatDate(row.date || row.created, timeZone),
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

// Type Lozenge Component
const TypeLozenge = ({ type }) => {
  const config = {
    changelog: { appearance: "success", text: "📝 Change" },
    comment: { appearance: "inprogress", text: "💬 Comment" },
    attachment: { appearance: "new", text: "📎 Attachment" }
  };
  
  const { appearance, text } = config[type] || { appearance: "default", text: type };
  
  return <Lozenge appearance={appearance}>{text}</Lozenge>;
};

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Column filters
  const [filters, setFilters] = useState({
    type: "",
    author: "",
    field: "",
    from: "",
    to: "",
    date: ""
  });

  const userTimeZone = useUserTimeZone();

  // Available filter options (computed from data)
  const filterOptions = useMemo(() => {
    const types = [...new Set(data.map(item => item.type))];
    const authors = [...new Set(data.map(item => item.author).filter(Boolean))];
    const fields = [...new Set(data.map(item => item.field).filter(Boolean))];
    
    return {
      type: types.map(t => ({ label: t, value: t })),
      author: authors.map(a => ({ label: a, value: a })),
      field: fields.map(f => ({ label: f, value: f }))
    };
  }, [data]);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return (
        (filters.type === "" || item.type.toLowerCase().includes(filters.type.toLowerCase())) &&
        (filters.author === "" || (item.author || "").toLowerCase().includes(filters.author.toLowerCase())) &&
        (filters.field === "" || (item.field || "").toLowerCase().includes(filters.field.toLowerCase())) &&
        (filters.from === "" || (item.from || "").toLowerCase().includes(filters.from.toLowerCase())) &&
        (filters.to === "" || (item.to || "").toLowerCase().includes(filters.to.toLowerCase())) &&
        (filters.date === "" || formatDate(item.date || item.created, userTimeZone).toLowerCase().includes(filters.date.toLowerCase()))
      );
    });
  }, [data, filters, userTimeZone]);

  // Sort filtered data by date (newest first)
  const sortedData = useMemo(() => {
    return [...filteredData].sort(
      (a, b) => new Date(b.date || b.created) - new Date(a.date || a.created)
    );
  }, [filteredData]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching data...");
        const result = await invoke(currentDev, {
          filter: "all" // Always fetch all data, filter on frontend
        });
        
        console.log("Result received:", result);
        
        if (result && result.error) {
          setError(result.error);
          setData([]);
          return;
        }

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
        console.error("Error fetching data:", err);
        setError(err.message || "Unknown error");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Update a specific filter
  const updateFilter = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: "",
      author: "",
      field: "",
      from: "",
      to: "",
      date: ""
    });
  };

  // If there's an access error, show access denied message
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

  // Define table columns
  const head = {
    cells: [
      {
        key: "type",
        content: (
          <div>
            <strong>Type</strong>
            <div style={{ marginTop: "4px" }}>
              <Select
                placeholder="Filter by type..."
                options={filterOptions.type}
                value={filterOptions.type.find(opt => opt.value === filters.type) || null}
                onChange={(option) => updateFilter("type", option ? option.value : "")}
                isClearable
                isSearchable={false}
                styles={{
                  container: (provided) => ({ ...provided, minWidth: "120px" }),
                  control: (provided) => ({ ...provided, minHeight: "32px" })
                }}
              />
            </div>
          </div>
        ),
        isSortable: false,
        width: 15
      },
      {
        key: "author",
        content: (
          <div>
            <strong>Author</strong>
            <div style={{ marginTop: "4px" }}>
              <Textfield
                placeholder="Filter by author..."
                value={filters.author}
                onChange={(e) => updateFilter("author", e.target.value)}
                elemAfterInput={
                  filters.author && (
                    <Button
                      appearance="subtle"
                      spacing="compact"
                      onClick={() => updateFilter("author", "")}
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
        width: 20
      },
      {
        key: "field",
        content: (
          <div>
            <strong>Field/Content</strong>
            <div style={{ marginTop: "4px" }}>
              <Textfield
                placeholder="Filter by field..."
                value={filters.field}
                onChange={(e) => updateFilter("field", e.target.value)}
                elemAfterInput={
                  filters.field && (
                    <Button
                      appearance="subtle"
                      spacing="compact"
                      onClick={() => updateFilter("field", "")}
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
        width: 25
      },
      {
        key: "from",
        content: (
          <div>
            <strong>From</strong>
            <div style={{ marginTop: "4px" }}>
              <Textfield
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
              <Textfield
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
              <Textfield
                placeholder="Filter by date..."
                value={filters.date}
                onChange={(e) => updateFilter("date", e.target.value)}
                elemAfterInput={
                  filters.date && (
                    <Button
                      appearance="subtle"
                      spacing="compact"
                      onClick={() => updateFilter("date", "")}
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
        width: 20
      }
    ]
  };

  // Create table rows
  const rows = paginatedData.map((entry, index) => ({
    key: `row-${index}`,
    cells: [
      {
        key: "type",
        content: <TypeLozenge type={entry.type} />
      },
      {
        key: "author",
        content: entry.author || "-"
      },
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
            {entry.type === "comment" && (
              <span title={entry.content}>
                {entry.content?.substring(0, 50) || "-"}
                {entry.content && entry.content.length > 50 && "..."}
              </span>
            )}
            {entry.type === "attachment" && entry.filename}
          </div>
        )
      },
      {
        key: "from",
        content: entry.type === "changelog" ? (entry.from || "-") : "-"
      },
      {
        key: "to",
        content: entry.type === "changelog" 
          ? (entry.to || "-") 
          : entry.type === "attachment" 
            ? `${Math.round(entry.size / 1024)}KB` 
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
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "200px",
        flexDirection: "column"
      }}>
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

  const hasActiveFilters = Object.values(filters).some(filter => filter !== "");

  return (
    <div style={{ padding: "16px" }}>
      {/* Header with actions */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "8px"
      }}>
        <div>
          <h3 style={{ margin: 0, color: "#172b4d" }}>
            Issue Change Log
          </h3>
          <p style={{ margin: "4px 0 0 0", color: "#6b778c", fontSize: "14px" }}>
            {sortedData.length} total {sortedData.length === 1 ? "activity" : "activities"}
            {hasActiveFilters && ` (${filteredData.length} filtered)`}
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {hasActiveFilters && (
            <Button 
              appearance="subtle" 
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
          <Button
            appearance="primary"
            onClick={() => exportCSV(sortedData, userTimeZone)}
            isDisabled={sortedData.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      {sortedData.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "48px 16px",
          color: "#6b778c"
        }}>
          <p style={{ fontSize: "16px", margin: "0 0 8px 0" }}>No activities found</p>
          <p style={{ fontSize: "14px", margin: 0 }}>
            There are no change log entries for this issue yet.
          </p>
        </div>
      ) : (
        <>
          <DynamicTable
            head={head}
            rows={rows}
            rowsPerPage={pageSize}
            defaultPage={1}
            loadingSpinnerSize="large"
            isLoading={loading}
            emptyView={
              <div style={{ textAlign: "center", padding: "32px" }}>
                <p>No activities match your current filters.</p>
                <Button appearance="link" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            }
          />

          {/* Custom Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginTop: "16px",
              flexWrap: "wrap",
              gap: "16px"
            }}>
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
                  styles={{
                    container: (provided) => ({ ...provided, minWidth: "80px" })
                  }}
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
        </>
      )}
    </div>
  );
}
