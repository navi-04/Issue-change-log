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
  const headers = ["Author", "Field/Content", "From", "To", "Date"];
  const rows = data.map((row) =>
    [
      row.author,
      row.type === "changelog" ? row.field : (row.type === "comment" ? "Comment" : (row.filename || "")),
      row.type === "changelog" ? (row.from || "-") : "-",
      row.type === "changelog" ? (row.to || "-") : (row.type === "attachment" ? `${Math.round(row.size / 1024)}KB` : (row.type === "comment" ? row.content : "-")),
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

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Column filters
  const [filters, setFilters] = useState({
    author: "",
    field: "",
    from: "",
    to: "",
    date: ""
  });

  const [customDateFilter, setCustomDateFilter] = useState("");

  const userTimeZone = useUserTimeZone();

  // Generate filter options from data
  const filterOptions = useMemo(() => {
    // Get unique authors
    const authors = [...new Set(data.map(item => item.author).filter(Boolean))]
      .sort()
      .map(author => ({ label: author, value: author }));

    // Get unique fields (including special handling for comments and attachments)
    const fields = new Set();
    data.forEach(item => {
      if (item.type === "changelog" && item.field) {
        fields.add(item.field);
      } else if (item.type === "comment") {
        fields.add("Comment");
      } else if (item.type === "attachment" && item.filename) {
        fields.add(item.filename);
      }
    });
    const fieldOptions = [...fields].sort().map(field => ({ label: field, value: field }));

    // Date filter options
    const dateOptions = [
      { label: "Just now", value: "just_now" },
      { label: "5 minutes ago", value: "5_minutes" },
      { label: "2 hours ago", value: "2_hours" },
      { label: "3 days ago", value: "3_days" },
      { label: "1 week ago", value: "1_week" },
      { label: "1 month ago", value: "1_month" },
      { label: "Custom", value: "custom" }
    ];

    return {
      authors,
      fields: fieldOptions,
      dates: dateOptions
    };
  }, [data]);

  // Helper function to check if an item matches the date filter
  const matchesDateFilter = (item, filterValue) => {
    if (!filterValue || filterValue === "") return true;
    
    const itemDate = new Date(item.date || item.created);
    const now = new Date();
    const diffInMs = now - itemDate;
    
    switch (filterValue) {
      case "just_now":
        return diffInMs < 60000; // Less than 1 minute
      case "5_minutes":
        return diffInMs < 300000; // Less than 5 minutes
      case "2_hours":
        return diffInMs < 7200000; // Less than 2 hours
      case "3_days":
        return diffInMs < 259200000; // Less than 3 days
      case "1_week":
        return diffInMs < 604800000; // Less than 1 week
      case "1_month":
        return diffInMs < 2592000000; // Less than 30 days
      case "custom":
        // For custom, we'll use the custom date filter text input
        return customDateFilter === "" || formatDate(item.date || item.created, userTimeZone).toLowerCase().includes(customDateFilter.toLowerCase());
      default:
        return true;
    }
  };

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Author filter
      const authorMatch = filters.author === "" || (item.author || "").toLowerCase().includes(filters.author.toLowerCase());
      
      // Field filter - handle different types
      let fieldMatch = true;
      if (filters.field !== "") {
        if (item.type === "changelog") {
          fieldMatch = (item.field || "").toLowerCase().includes(filters.field.toLowerCase());
        } else if (item.type === "comment") {
          fieldMatch = "comment".toLowerCase().includes(filters.field.toLowerCase());
        } else if (item.type === "attachment") {
          fieldMatch = (item.filename || "").toLowerCase().includes(filters.field.toLowerCase());
        }
      }
      
      // From and To filters
      const fromMatch = filters.from === "" || (item.from || "").toLowerCase().includes(filters.from.toLowerCase());
      const toMatch = filters.to === "" || 
        (item.type === "changelog" ? (item.to || "").toLowerCase().includes(filters.to.toLowerCase()) :
         item.type === "attachment" ? `${Math.round(item.size / 1024)}KB`.toLowerCase().includes(filters.to.toLowerCase()) :
         item.type === "comment" ? (item.content || "").toLowerCase().includes(filters.to.toLowerCase()) : true);
      
      // Date filter
      const dateMatch = filters.date === "" || matchesDateFilter(item, filters.date);
      
      return authorMatch && fieldMatch && fromMatch && toMatch && dateMatch;
    });
  }, [data, filters, userTimeZone, customDateFilter]);

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
    // Removed automatic refresh - now using manual refresh button
  }, []);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Manual refresh triggered...");
      const result = await invoke(currentDev, {
        filter: "all"
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
      author: "",
      field: "",
      from: "",
      to: "",
      date: ""
    });
    setCustomDateFilter("");
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
              <Select
                placeholder="Filter by time..."
                options={filterOptions.dates}
                value={filterOptions.dates.find(opt => opt.value === filters.date) || null}
                onChange={(option) => updateFilter("date", option ? option.value : "")}
                isClearable
                isSearchable={false}
                styles={{
                  container: (provided) => ({ ...provided, minWidth: "150px" }),
                  control: (provided) => ({ ...provided, minHeight: "32px" })
                }}
              />
              {filters.date === "custom" && (
                <div style={{ marginTop: "4px" }}>
                  <Textfield
                    placeholder="Enter custom date filter..."
                    value={customDateFilter}
                    onChange={(e) => setCustomDateFilter(e.target.value)}
                    isCompact
                  />
                </div>
              )}
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
              <span>💬 Comment</span>
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
            : entry.type === "comment"
            ? (
              <span title={entry.content}>
                {entry.content || "-"}
              </span>
            )
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

  const hasActiveFilters = Object.values(filters).some(filter => filter !== "") || customDateFilter !== "";

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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ margin: 0, color: "#172b4d" }}>
              Issue Change Log
            </h3>
            <Button
              appearance="primary"
              onClick={handleManualRefresh}
              isLoading={loading}
              spacing="compact"
              title="Refresh data"
            >
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
      <DynamicTable
        head={head}
        rows={rows}
        rowsPerPage={pageSize}
        defaultPage={1}
        loadingSpinnerSize="large"
        isLoading={loading}
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
    </div>
  );
}
