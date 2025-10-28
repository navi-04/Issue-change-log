/**
 * Issue Change Log Component
 * 
 * This component displays a comprehensive changelog for Jira issues, including:
 * - Field changes (status, priority, assignee, etc.)
 * - Comments
 * - Attachments
 * 
 * Features:
 * - Multi-column filtering (Author, Field, From, To, Date)
 * - Pagination with customizable page sizes
 * - CSV export functionality
 * - Date range filtering with custom date picker
 * - Real-time data refresh
 * - User timezone support
 * - Responsive design
 * 
 * @component
 */

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

// Environment configuration - identifies the backend service endpoint
const currentDev = "devSuvitha";

/**
 * Hook to get the user's local timezone
 * @returns {string} User's timezone (e.g., "America/New_York")
 */
const useUserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Formats a date string to a localized date-time string
 * @param {string} dateString - ISO date string to format
 * @param {string} timeZone - Target timezone for formatting
 * @returns {string} Formatted date string or "-" if invalid
 */
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

/**
 * Converts a date to a human-readable relative time string
 * @param {string|Date} date - Date to convert
 * @returns {string} Relative time string (e.g., "5 minutes ago", "2 days ago")
 */
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

/**
 * Exports the changelog data to a CSV file
 * @param {Array} data - Array of changelog entries to export
 * @param {string} timeZone - Timezone for date formatting in CSV
 */
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

/**
 * Main App Component
 * Renders the Issue Change Log interface with filtering, pagination, and export capabilities
 */
export default function App() {
  // State management
  const [data, setData] = useState([]); // All changelog data from API
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState(null); // Error message state
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [pageSize, setPageSize] = useState(25); // Items per page
  const [pageLoading, setPageLoading] = useState(false); // Page transition loading
  
  // Column-based filters
  const [filters, setFilters] = useState({
    author: [], // Multi-select author filter
    field: [], // Multi-select field/content filter
    from: "", // Text filter for "From" column
    to: "", // Text filter for "To" column
    date: "" // Date range filter
  });

  // Custom date range filter states
  const [customDateFilter, setCustomDateFilter] = useState(""); // Selected preset or "custom"
  const [customDateFrom, setCustomDateFrom] = useState(""); // Custom date range start
  const [customDateTo, setCustomDateTo] = useState(""); // Custom date range end

  const userTimeZone = useUserTimeZone();

  /**
   * Generate dynamic filter options from current data
   * Memoized to avoid recalculation on every render
   */
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

  /**
   * Checks if a changelog item matches the selected date filter
   * @param {Object} item - Changelog item to check
   * @param {string} filterValue - Selected date filter value
   * @returns {boolean} True if item matches the filter
   */
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
        // For custom, check if item date is within the date range
        if (!customDateFrom && !customDateTo) return true;
        
        const itemTimestamp = itemDate.getTime();
        
        // If only "from" date is set
        if (customDateFrom && !customDateTo) {
          const fromDate = new Date(customDateFrom);
          fromDate.setHours(0, 0, 0, 0);
          return itemTimestamp >= fromDate.getTime();
        }
        
        // If only "to" date is set
        if (!customDateFrom && customDateTo) {
          const toDate = new Date(customDateTo);
          toDate.setHours(23, 59, 59, 999);
          return itemTimestamp <= toDate.getTime();
        }
        
        // If both dates are set
        const fromDate = new Date(customDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(customDateTo);
        toDate.setHours(23, 59, 59, 999);
        
        return itemTimestamp >= fromDate.getTime() && itemTimestamp <= toDate.getTime();
      default:
        return true;
    }
  };

  /**
   * Filters the complete dataset based on all active filters
   * Supports multi-select filters for Author and Field columns
   * Memoized to recalculate only when data or filters change
   */
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Author filter - now supports multiple selections
      const authorMatch = filters.author.length === 0 || 
        filters.author.some(authorFilter => 
          (item.author || "").toLowerCase().includes(authorFilter.value.toLowerCase())
        );
      
      // Field filter - handle different types - now supports multiple selections
      let fieldMatch = true;
      if (filters.field.length > 0) {
        fieldMatch = filters.field.some(fieldFilter => {
          if (item.type === "changelog") {
            return (item.field || "").toLowerCase().includes(fieldFilter.value.toLowerCase());
          } else if (item.type === "comment") {
            return "comment".toLowerCase().includes(fieldFilter.value.toLowerCase());
          } else if (item.type === "attachment") {
            return (item.filename || "").toLowerCase().includes(fieldFilter.value.toLowerCase());
          }
          return false;
        });
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
  }, [data, filters, userTimeZone, customDateFrom, customDateTo]);

  /**
   * Sorts filtered data by date in descending order (newest first)
   * Memoized to avoid re-sorting on every render
   */
  const sortedData = useMemo(() => {
    return [...filteredData].sort(
      (a, b) => new Date(b.date || b.created) - new Date(a.date || a.created)
    );
  }, [filteredData]);

  /**
   * Extracts the current page of data for display
   * Optimized for large datasets by slicing only the needed items
   * Memoized to recalculate only when sorted data or pagination changes
   */
  const paginatedData = useMemo(() => {
    if (!sortedData || sortedData.length === 0) {
      return [];
    }
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  // Calculate total number of pages
  const totalPages = sortedData.length > 0 ? Math.ceil(sortedData.length / pageSize) : 1;

  /**
   * Fetches changelog data on component mount
   * Retrieves all changelog entries, comments, and attachments
   * Deduplicates entries and combines them into a single array
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await invoke(currentDev, {
          filter: "all" // Fetch all data types: changelog, comments, attachments
        });
        
        if (result && result.error) {
          setError(result.error);
          setData([]);
          return;
        }

        if (result && typeof result === "object") {
          // Combine all activity types into a single array
          const allActivities = [
            ...(result.changelog || []),
            ...(result.comments || []),
            ...(result.attachments || []),
          ];
          
          // Deduplicate entries based on type and key fields
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
  }, []);

  /**
   * Manually refreshes the changelog data
   * Called when user clicks the Refresh button
   */
  const handleManualRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke(currentDev, {
        filter: "all"
      });
      
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
      setError(err.message || "Unknown error");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resets to the first page whenever filters change
   * Prevents showing empty pages when filtered results are fewer
   */
  useEffect(() => {
    setPageLoading(true);
    setCurrentPage(1);
    setTimeout(() => setPageLoading(false), 50);
  }, [filters]);

  /**
   * Updates a specific column filter
   * @param {string} column - Column name (author, field, from, to, date)
   * @param {*} value - Filter value (string, array, or select option)
   */
  const updateFilter = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  /**
   * Clears all active filters and resets custom date range
   */
  const clearFilters = () => {
    setFilters({
      author: [],
      field: [],
      from: "",
      to: "",
      date: ""
    });
    setCustomDateFilter("");
    setCustomDateFrom("");
    setCustomDateTo("");
  };

  /**
   * Table header configuration
   * Each column includes a filter component and styling
   */
  const head = {
    cells: [
      {
        key: "author",
        content: (
          <div style={{ minWidth: "120px", paddingRight: "15px" }}>
            <div style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px", color: "#172b4d" }}>
              Author
            </div>
            <Select
              placeholder="Filter..."
              options={filterOptions.authors}
              value={filters.author}
              onChange={(selectedOptions) => updateFilter("author", selectedOptions || [])}
              isClearable
              isSearchable={true}
              isMulti
              styles={{
                container: (provided) => ({ ...provided, width: "100%" }),
                control: (provided) => ({ 
                  ...provided, 
                  minHeight: "39px",
                  fontSize: "13px"
                }),
                multiValue: (provided) => ({
                  ...provided,
                  fontSize: "12px"
                })
              }}
            />
          </div>
        ),
        isSortable: false,
        width: 12
      },
      {
        key: "field",
        content: (
          <div style={{ minWidth: "140px", paddingRight: "15px" }}>
            <div style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px", color: "#172b4d" }}>
              Field/Content
            </div>
            <Select
              placeholder="Filter..."
              options={filterOptions.fields}
              value={filters.field}
              onChange={(selectedOptions) => updateFilter("field", selectedOptions || [])}
              isClearable
              isSearchable={true}
              isMulti
              styles={{
                container: (provided) => ({ ...provided, width: "100%" }),
                control: (provided) => ({ 
                  ...provided, 
                  minHeight: "39px",
                  fontSize: "13px"
                }),
                multiValue: (provided) => ({
                  ...provided,
                  fontSize: "12px"
                })
              }}
            />
          </div>
        ),
        isSortable: false,
        width: 15
      },
      {
        key: "from",
        content: (
          <div style={{ minWidth: "185px", paddingRight: "15px" }}>
            <div style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px", color: "#172b4d" }}>
              From
            </div>
            <Textfield
              placeholder="Filter..."
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
        ),
        isSortable: false,
        width: 20
      },
      {
        key: "to",
        content: (
          <div style={{ minWidth: "183px", paddingRight: "15px" }}>
            <div style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px", color: "#172b4d" }}>
              To
            </div>
            <Textfield
              placeholder="Filter..."
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
        ),
        isSortable: false,
        width: 20
      },
      {
        key: "date",
        content: (
          <div style={{ minWidth: "160px", paddingRight: "10px" }}>
            <div style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px", color: "#172b4d" }}>
              Date
            </div>
            <Select
              placeholder="Filter..."
              options={filterOptions.dates}
              value={filterOptions.dates.find(opt => opt.value === filters.date) || null}
              onChange={(option) => updateFilter("date", option ? option.value : "")}
              isClearable
              isSearchable={false}
              styles={{
                container: (provided) => ({ ...provided, width: "100%" }),
                control: (provided) => ({ 
                  ...provided, 
                  minHeight: "39px",
                  fontSize: "13px"
                })
              }}
            />
            {filters.date === "custom" && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <label style={{ fontSize: "11px", color: "#6b778c", display: "block", marginBottom: "3px" }}>
                      From:
                    </label>
                    <input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "4px 6px",
                        border: "2px solid #dfe1e6",
                        borderRadius: "3px",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        outline: "none",
                        transition: "border-color 0.2s",
                        cursor: "pointer",
                        boxSizing: "border-box"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#0052cc"}
                      onBlur={(e) => e.target.style.borderColor = "#dfe1e6"}
                    />
                  </div>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <label style={{ fontSize: "11px", color: "#6b778c", display: "block", marginBottom: "3px" }}>
                      To:
                    </label>
                    <input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "4px 6px",
                        border: "2px solid #dfe1e6",
                        borderRadius: "3px",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        outline: "none",
                        transition: "border-color 0.2s",
                        cursor: "pointer",
                        boxSizing: "border-box"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#0052cc"}
                      onBlur={(e) => e.target.style.borderColor = "#dfe1e6"}
                    />
                  </div>
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

  /**
   * Generates table rows from paginated data
   * Handles different entry types (changelog, comment, attachment)
   * Adds empty rows if needed to keep filters visible
   * Memoized to avoid recalculating on every render
   */
  const rows = useMemo(() => {
    if (!paginatedData || paginatedData.length === 0) {
      return [];
    }
    
    const dataRows = paginatedData.map((entry, index) => {
      try {
        return {
          key: `row-${currentPage}-${index}`,
          cells: [
            {
              key: "author",
              content: <div style={{ paddingLeft: "5px" }}>{entry.author || "-"}</div>
            },
            {
              key: "field",
              content: (
                <div style={{ paddingLeft: "5px" }}>
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
              content: <div style={{ paddingLeft: "5px" }}>{entry.type === "changelog" ? (entry.from || "-") : "-"}</div>
            },
            {
              key: "to",
              content: (
                <div style={{ paddingLeft: "5px" }}>
                  {entry.type === "changelog" 
                    ? (entry.to || "-") 
                    : entry.type === "attachment" 
                      ? `${Math.round((entry.size || 0) / 1024)}KB` 
                      : entry.type === "comment"
                      ? (
                        <span title={entry.content || ""}>
                          {(entry.content || "").substring(0, 100) + ((entry.content || "").length > 100 ? "..." : "")}
                        </span>
                      )
                      : "-"}
                </div>
              )
            },
            {
              key: "date",
              content: (
                <div style={{ paddingLeft: "5px" }}>
                  <div>{formatDate(entry.date || entry.created, userTimeZone)}</div>
                  <div style={{ fontSize: "12px", color: "#6b778c", marginTop: "2px" }}>
                    {getRelativeTime(entry.date || entry.created)}
                  </div>
                </div>
              )
            }
          ]
        };
      } catch (error) {
        // Fallback for malformed entries
        return {
          key: `error-row-${index}`,
          cells: [
            { key: "author", content: <div style={{ paddingLeft: "5px" }}>Error</div> },
            { key: "field", content: <div style={{ paddingLeft: "5px" }}>Error loading this row</div> },
            { key: "from", content: <div style={{ paddingLeft: "5px" }}>-</div> },
            { key: "to", content: <div style={{ paddingLeft: "5px" }}>-</div> },
            { key: "date", content: <div style={{ paddingLeft: "5px" }}>-</div> }
          ]
        };
      }
    });

    // Pad with empty rows to maintain minimum table height and keep filters visible
    const minRows = 5;
    if (dataRows.length < minRows && dataRows.length > 0) {
      const emptyRowsNeeded = minRows - dataRows.length;
      for (let i = 0; i < emptyRowsNeeded; i++) {
        dataRows.push({
          key: `empty-row-${currentPage}-${i}`,
          cells: [
            { key: "author", content: <div style={{ height: "40px" }}>&nbsp;</div> },
            { key: "field", content: <div style={{ height: "40px" }}>&nbsp;</div> },
            { key: "from", content: <div style={{ height: "40px" }}>&nbsp;</div> },
            { key: "to", content: <div style={{ height: "40px" }}>&nbsp;</div> },
            { key: "date", content: <div style={{ height: "40px" }}>&nbsp;</div> }
          ]
        });
      }
    }

    return dataRows;
  }, [paginatedData, currentPage, userTimeZone]);

  /**
   * Render authorization/access error state
   * Shows when user lacks permissions or app is disabled
   */
  if (error && (error.includes("not authorized") || error.includes("disabled"))) {
    const isDisabled = error.includes("disabled");
    return (
      <div style={{ 
        padding: "32px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "300px"
      }}>
        <div style={{
          maxWidth: "500px",
          textAlign: "center",
          padding: "32px",
          background: "#FFF",
          borderRadius: "8px",
          border: "1px solid #E1E4E8",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
        }}>
          <div style={{ 
            fontSize: "48px", 
            marginBottom: "16px",
            lineHeight: "1"
          }}>
            {isDisabled ? "⚠️" : "🔒"}
          </div>
          <h2 style={{ 
            fontSize: "20px",
            fontWeight: "600",
            color: "#172B4D",
            marginBottom: "12px",
            marginTop: "0"
          }}>
            {isDisabled ? "App Disabled" : "Access Not Authorized"}
          </h2>
          <p style={{ 
            fontSize: "14px",
            color: "#5E6C84",
            lineHeight: "1.6",
            marginBottom: "20px"
          }}>
            {error}
          </p>
          <div style={{
            padding: "12px 16px",
            background: "#F4F5F7",
            borderRadius: "4px",
            fontSize: "13px",
            color: "#42526E",
            lineHeight: "1.5"
          }}>
            {!isDisabled ? (
              <>
                <strong>Need access?</strong>
                <br />
                Contact your Jira administrator. They can grant access in:
                <br />
                <code style={{ 
                  background: "#FFF",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontSize: "12px",
                  marginTop: "4px",
                  display: "inline-block"
                }}>
                  Jira Settings → Apps → Issue Change Log Settings
                </code>
              </>
            ) : (
              <>
                <strong>Need to enable?</strong>
                <br />
                Contact your project administrator. They can enable it in:
                <br />
                <code style={{ 
                  background: "#FFF",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontSize: "12px",
                  marginTop: "4px",
                  display: "inline-block"
                }}>
                  Project Settings → Apps → Issue Change Log Settings
                </code>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render initial loading state
   */
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "300px",
        flexDirection: "column",
        padding: "32px"
      }}>
        <Spinner size="large" />
        <p style={{ 
          marginTop: "16px", 
          color: "#5E6C84",
          fontSize: "14px",
          fontWeight: "500"
        }}>
          Loading change log...
        </p>
      </div>
    );
  }

  /**
   * Render general error state
   * Shows when data fetch fails for reasons other than authorization
   */
  if (error && !(error.includes("not authorized") || error.includes("disabled"))) {
    return (
      <div style={{ 
        padding: "32px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "300px"
      }}>
        <div style={{
          maxWidth: "500px",
          textAlign: "center",
          padding: "32px",
          background: "#FFF",
          borderRadius: "8px",
          border: "1px solid #FFEBE6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
        }}>
          <div style={{ 
            fontSize: "48px", 
            marginBottom: "16px",
            lineHeight: "1"
          }}>
            ⚠️
          </div>
          <h2 style={{ 
            fontSize: "20px",
            fontWeight: "600",
            color: "#172B4D",
            marginBottom: "12px",
            marginTop: "0"
          }}>
            Error Loading Data
          </h2>
          <p style={{ 
            fontSize: "14px",
            color: "#5E6C84",
            lineHeight: "1.6",
            marginBottom: "20px"
          }}>
            {error}
          </p>
          <Button 
            appearance="primary" 
            onClick={handleManualRefresh}
            style={{ marginTop: "8px" }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Check if any filters are currently active
  const hasActiveFilters = filters.author.length > 0 || filters.field.length > 0 || 
    filters.from !== "" || filters.to !== "" || filters.date !== "" || 
    customDateFrom !== "" || customDateTo !== "";

  /**
   * Main render: Display the changelog table with filters and pagination
   */
  return (
    <div style={{ padding: "16px", minWidth: "320px", overflowX: "auto" }}>
      <style>
        {`
          /* Make text fields match Select dropdown height */
          [data-ds--text-field--container] input {
            font-size: 13px !important;
            line-height: 1.5 !important;
          }
        `}
      </style>
      {/* Header with actions */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ minWidth: "200px", flex: "1 1 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, color: "#172b4d", fontSize: "clamp(16px, 4vw, 20px)" }}>
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
          <p style={{ margin: "4px 0 0 0", color: "#6b778c", fontSize: "clamp(12px, 2.5vw, 14px)" }}>
            {sortedData.length} total {sortedData.length === 1 ? "activity" : "activities"}
            {hasActiveFilters && ` (${filteredData.length} filtered)`}
            {sortedData.length > pageSize && (
              <>
                {" • "}
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
              </>
            )}
          </p>
        </div>
        
        {/* Action buttons section */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {hasActiveFilters && (
            <Button 
              appearance="subtle" 
              onClick={clearFilters}
              spacing="compact"
            >
              Clear Filters
            </Button>
          )}
          <Button
            appearance="primary"
            onClick={() => exportCSV(sortedData, userTimeZone)}
            isDisabled={sortedData.length === 0}
            spacing="compact"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main table container with horizontal scrolling support */}
      <div style={{ overflowX: "auto", marginBottom: "16px" }}>
        <div style={{ minWidth: "800px" }}>
          <DynamicTable
            head={head}
            rows={rows}
            isFixedSize
            loadingSpinnerSize="large"
            isLoading={loading || pageLoading}
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
        </div>
      </div>

      {/* Pagination controls */}
      {sortedData.length > 0 && (
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginTop: "16px",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "clamp(12px, 2.5vw, 14px)", color: "#6b778c", whiteSpace: "nowrap" }}>Items per page:</span>
            <Select
              value={{ label: pageSize.toString(), value: pageSize }}
              options={[
                { label: "10", value: 10 },
                { label: "25", value: 25 },
                { label: "50", value: 50 },
                { label: "100", value: 100 }
              ]}
              onChange={(option) => {
                setPageLoading(true);
                setPageSize(option.value);
                setCurrentPage(1);
                setTimeout(() => setPageLoading(false), 50);
              }}
              isSearchable={false}
              styles={{
                container: (provided) => ({ ...provided, minWidth: "80px", maxWidth: "100px" })
              }}
            />
          </div>

          {/* Page navigation controls */}
          {sortedData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
              {/* Previous page button */}
              <Button 
                appearance="subtle" 
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  if (newPage !== currentPage) {
                    setPageLoading(true);
                    setCurrentPage(newPage);
                    setTimeout(() => setPageLoading(false), 100);
                  }
                }}
                isDisabled={currentPage === 1 || totalPages === 1 || pageLoading}
                spacing="compact"
              >
                ← Prev
              </Button>
              
              {/* Page number buttons or current page indicator */}
              {totalPages <= 7 ? (
                // Show individual page buttons for small page counts
                [...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      appearance={pageNum === currentPage ? "primary" : "subtle"}
                      onClick={() => {
                        if (pageNum !== currentPage) {
                          setPageLoading(true);
                          setCurrentPage(pageNum);
                          setTimeout(() => setPageLoading(false), 100);
                        }
                      }}
                      isDisabled={pageLoading}
                      spacing="compact"
                    >
                      {pageNum}
                    </Button>
                  );
                })
              ) : (
                // Show compact page indicator for large page counts
                <span style={{ fontSize: "clamp(12px, 2.5vw, 14px)", color: "#6b778c", margin: "0 4px", whiteSpace: "nowrap" }}>
                  Page {currentPage} of {totalPages}
                </span>
              )}
              
              {/* Next page button */}
              <Button 
                appearance="subtle" 
                onClick={() => {
                  const newPage = Math.min(totalPages, currentPage + 1);
                  if (newPage !== currentPage) {
                    setPageLoading(true);
                    setCurrentPage(newPage);
                    setTimeout(() => setPageLoading(false), 100);
                  }
                }}
                isDisabled={currentPage === totalPages || totalPages === 1 || pageLoading}
                spacing="compact"
              >
                Next →
              </Button>
              
              {/* Direct page jump input for large page counts */}
              {totalPages > 7 && (
                <div style={{ marginLeft: "8px", display: "flex", alignItems: "center", gap: "4px", flexWrap: "nowrap" }}>
                  <span style={{ fontSize: "clamp(12px, 2.5vw, 14px)", color: "#6b778c", whiteSpace: "nowrap" }}>Go to:</span>
                  <input 
                    type="number" 
                    min="1" 
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value, 10);
                      if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
                        setPageLoading(true);
                        setCurrentPage(page);
                        setTimeout(() => setPageLoading(false), 100);
                      }
                    }}
                    disabled={pageLoading}
                    style={{
                      width: "60px",
                      padding: "4px 8px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      textAlign: "center",
                      fontSize: "clamp(12px, 2.5vw, 14px)"
                    }}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
