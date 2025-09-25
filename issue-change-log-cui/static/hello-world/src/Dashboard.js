import React, { useEffect, useState, useMemo } from "react";
import { invoke } from "@forge/bridge";
import Button from "@atlaskit/button";
import Spinner from "@atlaskit/spinner";
import Banner from "@atlaskit/banner";
import Select from "@atlaskit/select";
import Lozenge from "@atlaskit/lozenge";
import Tooltip from "@atlaskit/tooltip";
import "@atlaskit/css-reset";
import "./Dashboard.css";

const currentDev = "devSuvitha";

// Status color mapping
const getStatusColor = (status) => {
  const statusColors = {
    "To Do": "#6B778C",
    "In Progress": "#0052CC",
    Done: "#00875A",
    Backlog: "#97A0AF",
    "Selected for Development": "#0747A6",
    "In Review": "#FF8B00",
    Testing: "#8777D9",
    Blocked: "#DE350B",
    Reopened: "#FF5630",
  };
  return statusColors[status] || "#6B778C";
};

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

// Calculate duration between two dates
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end - start;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays}d ${diffInHours % 24}h`;
  }
  return `${diffInHours}h`;
};

const TimelineBar = ({ statusChange, totalDuration, userTimeZone, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const widthPercentage =
    totalDuration > 0
      ? Math.max((statusChange.duration / totalDuration) * 100, 2)
      : 100;

  const tooltip = (
    <div className="timeline-tooltip">
      <div>
        <strong>Status:</strong> {statusChange.status}
      </div>
      <div>
        <strong>Duration:</strong> {statusChange.durationText || "Ongoing"}
      </div>
      <div>
        <strong>Start:</strong>{" "}
        {formatDate(statusChange.startDate, userTimeZone)}
      </div>
      {statusChange.endDate && (
        <div>
          <strong>End:</strong> {formatDate(statusChange.endDate, userTimeZone)}
        </div>
      )}
      <div>
        <strong>Changed by:</strong> {statusChange.author}
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltip} position="top">
      <div
        className="timeline-bar"
        style={{
          width: `${widthPercentage}%`,
          backgroundColor: getStatusColor(statusChange.status),
          minWidth: "20px",
          height: "30px",
          display: "block",
          color: "white",
          fontSize: "0px",
          lineHeight: "0",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: isHovered ? "scaleY(1.1)" : "scale(1)",
          zIndex: isHovered ? 10 : 1,
          position: "relative",
          margin: "0",
          padding: "0",
          border: "none",
          outline: "none",
          boxSizing: "border-box",
          float: "left",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="timeline-bar-text">{statusChange.status}</span>
      </div>
    </Tooltip>
  );
};

const IssueTimeline = ({ issueKey, statusChanges, userTimeZone }) => {
  if (!statusChanges || statusChanges.length === 0) {
    return (
      <div className="timeline-container">
        <div className="timeline-header">
          <h4>{issueKey}</h4>
          <span className="timeline-subtitle">No status changes</span>
        </div>
      </div>
    );
  }

  // Calculate total duration
  const firstChange = statusChanges[0];
  const lastChange = statusChanges[statusChanges.length - 1];
  const totalDurationMs = lastChange.endDate
    ? new Date(lastChange.endDate) - new Date(firstChange.startDate)
    : new Date() - new Date(firstChange.startDate);

  const totalDurationText = calculateDuration(
    firstChange.startDate,
    lastChange.endDate || new Date().toISOString()
  );

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <div>
          <h4>{issueKey}</h4>
          <span className="timeline-subtitle">
            Total time: {totalDurationText} • {statusChanges.length} status
            changes
          </span>
        </div>
        <div className="current-status">
          <Lozenge
            appearance="inprogress"
            style={{
              backgroundColor: getStatusColor(
                statusChanges[statusChanges.length - 1].status
              ),
            }}
          >
            {statusChanges[statusChanges.length - 1].status}
          </Lozenge>
        </div>
      </div>

      <div className="timeline-bars">
        {statusChanges.map((statusChange, index) => (
          <TimelineBar
            key={`${issueKey}-${index}`}
            statusChange={statusChange}
            totalDuration={totalDurationMs}
            userTimeZone={userTimeZone}
            index={index}
          />
        ))}
      </div>

      {/* Timeline labels */}
      <div className="timeline-labels">
        <span className="timeline-label-start">
          {formatDate(firstChange.startDate, userTimeZone)}
        </span>
        <span className="timeline-label-end">
          {lastChange.endDate
            ? formatDate(lastChange.endDate, userTimeZone)
            : "Now"}
        </span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter mode state - defaults to "all time" on refresh
  const [filterMode, setFilterMode] = useState("relative");
  const [relativeFilter, setRelativeFilter] = useState("all");

  // Date range state with default all time range
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 10); // 10 years ago for "all time"
    return date.toISOString().slice(0, 10); // YYYY-MM-DD format for date input
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10); // Today
  });

  const userTimeZone = useUserTimeZone();

  // Relative filter options
  const relativeFilterOptions = [
    { label: "Last 24 hours", value: "24h" },
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 6 months", value: "6m" },
    { label: "Last year", value: "1y" },
    { label: "All time", value: "all" },
  ];

  // Process data to create timeline information
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Calculate effective date range based on filter mode
    let startDateObj, endDateObj;
    
    if (filterMode === "custom") {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
      console.log("Custom filter - Start:", startDate, "End:", endDate);
    } else {
      // Relative filtering
      const now = new Date();
      startDateObj = new Date();

      switch (relativeFilter) {
        case "24h":
          startDateObj.setHours(startDateObj.getHours() - 24);
          break;
        case "7d":
          startDateObj.setDate(startDateObj.getDate() - 7);
          break;
        case "30d":
          startDateObj.setDate(startDateObj.getDate() - 30);
          break;
        case "6m":
          startDateObj.setMonth(startDateObj.getMonth() - 6);
          break;
        case "1y":
          startDateObj.setFullYear(startDateObj.getFullYear() - 1);
          break;
        case "all":
          startDateObj.setFullYear(startDateObj.getFullYear() - 10);
          break;
        default:
          startDateObj.setDate(startDateObj.getDate() - 30);
      }

      endDateObj = now;
      console.log("Relative filter:", relativeFilter, "Start:", startDateObj, "End:", endDateObj);
    }

    endDateObj.setHours(23, 59, 59, 999); // Include entire end date

    // Group by issue key
    const groupedByIssue = {};

    let totalItems = 0;
    let filteredItems = 0;

    data.forEach((item) => {
      if (item.type === "changelog" && item.field === "status") {
        totalItems++;
        const itemDate = new Date(item.date);

        console.log(`Processing change: ${item.issueKey} - ${item.from} → ${item.to} on ${item.date} (${itemDate.toISOString()})`);

        // Apply date range filter
        if (itemDate >= startDateObj && itemDate <= endDateObj) {
          console.log(`✓ Change included in filter range`);
          filteredItems++;
          if (!groupedByIssue[item.issueKey]) {
            groupedByIssue[item.issueKey] = [];
          }
          groupedByIssue[item.issueKey].push(item);
        } else {
          console.log(`✗ Change outside filter range (${startDateObj.toISOString()} to ${endDateObj.toISOString()})`);
        }
      }
    });

    console.log(`Filtering: ${filteredItems}/${totalItems} items match date range (${startDateObj.toISOString()} to ${endDateObj.toISOString()})`);

    // Process each issue's status changes
    const processedIssues = Object.entries(groupedByIssue).map(
      ([issueKey, changes]) => {
        // Sort changes by date
        const sortedChanges = changes.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        const statusTimeline = [];

        sortedChanges.forEach((change, index) => {
          const startDate = change.date;
          const endDate =
            index < sortedChanges.length - 1
              ? sortedChanges[index + 1].date
              : null;

          // Only include timeline segments that overlap with the selected date range
          const changeStartDate = new Date(startDate);
          const changeEndDate = endDate ? new Date(endDate) : new Date();

          // Check if this timeline segment overlaps with our filter range
          const segmentOverlaps = changeStartDate <= endDateObj && changeEndDate >= startDateObj;
          
          console.log(`Checking segment for ${issueKey}: ${change.to} (${changeStartDate.toISOString()} to ${changeEndDate.toISOString()}) against filter range (${startDateObj.toISOString()} to ${endDateObj.toISOString()}) - Overlaps: ${segmentOverlaps}`);
          
          if (segmentOverlaps) {
            // Clamp the segment dates to fit within the filter range
            const clampedStartDate = new Date(Math.max(changeStartDate.getTime(), startDateObj.getTime()));
            const clampedEndDate = new Date(Math.min(changeEndDate.getTime(), endDateObj.getTime()));
            
            // Only include segments that have meaningful duration within the filter range
            const duration = clampedEndDate - clampedStartDate;
            
            if (duration > 0) {
              console.log(`Including timeline segment for ${issueKey}: ${change.to} from ${clampedStartDate.toISOString()} to ${clampedEndDate.toISOString()} (duration: ${Math.round(duration / (1000 * 60 * 60 * 24))} days)`);

              statusTimeline.push({
                status: change.to,
                startDate: clampedStartDate.toISOString(),
                endDate: clampedEndDate < new Date() ? clampedEndDate.toISOString() : null,
                duration,
                durationText: calculateDuration(clampedStartDate.toISOString(), clampedEndDate < new Date() ? clampedEndDate.toISOString() : null),
                author: change.author,
              });
            } else {
              console.log(`Skipping zero-duration segment for ${issueKey}: ${change.to}`);
            }
          }
        });

        // Only return issues that have timeline segments within the date range
        if (statusTimeline.length > 0) {
          return {
            issueKey,
            statusChanges: statusTimeline,
            totalDuration: statusTimeline.reduce(
              (sum, status) => sum + status.duration,
              0
            ),
            lastUpdate: sortedChanges[sortedChanges.length - 1]?.date,
          };
        }
        return null;
      }
    );

    // Filter out null values and sort by last update (most recent first)
    return processedIssues
      .filter(issue => issue !== null)
      .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
  }, [data, startDate, endDate, filterMode, relativeFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching dashboard data...");
      // Send all data request and filter on client side for better performance
      const result = await invoke(currentDev, {
        filter: "all", // Get all data and filter client-side
      });

      console.log("Dashboard result received:", result);

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
        setData(allActivities);
      } else {
        setData(result || []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Unknown error");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Only fetch data on component mount

  // Manual refresh - resets filters to "All time"
  const handleManualRefresh = () => {
    // Reset filters to default "All time" state
    setFilterMode("relative");
    setRelativeFilter("all");

    // Reset date range to all time
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 10);
    const endDate = new Date();

    setStartDate(startDate.toISOString().slice(0, 10));
    setEndDate(endDate.toISOString().slice(0, 10));

    // Fetch fresh data
    fetchData();
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          flexDirection: "column",
        }}
      >
        <Spinner size="large" />
        <p style={{ marginTop: "16px", color: "#6b778c" }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error && error.includes("Access denied")) {
    return (
      <div style={{ padding: "16px" }}>
        <Banner appearance="error" icon="🔒">
          <strong>Access Restricted</strong>
          <p>{error}</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>
            Please contact your site administrator to request access for this
            project.
          </p>
        </Banner>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px" }}>
        <Banner appearance="error">
          <strong>Error loading dashboard</strong>
          <p>{error}</p>
        </Banner>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 style={{ margin: 0, color: "#172b4d" }}>
            📊 Status Timeline Dashboard
          </h2>
          <p
            style={{ margin: "4px 0 0 0", color: "#6b778c", fontSize: "14px" }}
          >
            Visual timeline showing status changes across issues
          </p>
        </div>

        <div className="dashboard-controls">
          {/* Filter Mode Toggle */}
          <div className="filter-mode-toggle">
            <Button
              appearance={filterMode === "relative" ? "primary" : "default"}
              onClick={() => setFilterMode("relative")}
            >
              Relative
            </Button>
            <Button
              appearance={filterMode === "custom" ? "primary" : "default"}
              onClick={() => {
                console.log("Switching to custom filter mode");
                setFilterMode("custom");
              }}
            >
              Custom Range
            </Button>
          </div>

          {/* Relative Filter */}
          {filterMode === "relative" && (
            <Select
              value={relativeFilterOptions.find(
                (opt) => opt.value === relativeFilter
              )}
              options={relativeFilterOptions}
              onChange={(option) => setRelativeFilter(option.value)}
              styles={{
                container: (provided) => ({ ...provided, minWidth: "200px" }),
              }}
            />
          )}

          {/* Custom Date Range */}
          {filterMode === "custom" && (
            <div className="date-range-picker">
              <div className="date-input-wrapper">
                <label htmlFor="start-date" className="date-label">
                  Start:
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    console.log("Start date changed to:", e.target.value);
                    setStartDate(e.target.value);
                  }}
                  className="date-picker-input"
                  placeholder="Start Date"
                />
              </div>

              <div className="date-input-wrapper">
                <label htmlFor="end-date" className="date-label">
                  End:
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    console.log("End date changed to:", e.target.value);
                    setEndDate(e.target.value);
                  }}
                  className="date-picker-input"
                  placeholder="End Date"
                />
              </div>
            </div>
          )}

          {/* Active Filter Indicator */}
          <div className="active-filter-display">
            {filterMode === "relative" ? (
              <span className="filter-info">
                📅{" "}
                {
                  relativeFilterOptions.find(
                    (opt) => opt.value === relativeFilter
                  )?.label
                }
              </span>
            ) : (
              <span className="filter-info">
                📅 {new Date(startDate).toLocaleDateString()} →{" "}
                {new Date(endDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <Button
            appearance="primary"
            onClick={handleManualRefresh}
            isLoading={loading}
          >
            {loading ? "Refreshing..." : "🔄 Reset & Refresh"}
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {processedData.length === 0 ? (
          <div className="dashboard-empty">
            <h3>No Status Changes Found</h3>
            <p>
              No status change activities found for the selected time period.
            </p>
            <p>
              Try selecting a different time range or check if there are any
              issues with status changes.
            </p>
          </div>
        ) : (
          <div className="timeline-list">
            <div className="dashboard-summary">
              <div className="summary-card">
                <h3>{processedData.length}</h3>
                <p>Issues Tracked</p>
              </div>
              <div className="summary-card">
                <h3>
                  {processedData.reduce(
                    (sum, issue) => sum + issue.statusChanges.length,
                    0
                  )}
                </h3>
                <p>Status Changes</p>
              </div>
              <div className="summary-card">
                <h3>
                  {Math.round(
                    processedData.reduce(
                      (sum, issue) => sum + issue.totalDuration,
                      0
                    ) /
                      (1000 * 60 * 60 * 24)
                  )}
                </h3>
                <p>Total Days</p>
              </div>
            </div>

            {processedData.map((issueData) => (
              <IssueTimeline
                key={issueData.issueKey}
                issueKey={issueData.issueKey}
                statusChanges={issueData.statusChanges}
                userTimeZone={userTimeZone}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
