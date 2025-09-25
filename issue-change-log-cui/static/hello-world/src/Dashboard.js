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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: isHovered ? "scaleY(1.1)" : "scale(1)",
          zIndex: isHovered ? 10 : 1,
          position: "relative",
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
  const [timeFilter, setTimeFilter] = useState("30d");

  const userTimeZone = useUserTimeZone();

  // Process data to create timeline information
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by issue key
    const groupedByIssue = {};

    data.forEach((item) => {
      if (item.type === "changelog" && item.field === "status") {
        if (!groupedByIssue[item.issueKey]) {
          groupedByIssue[item.issueKey] = [];
        }
        groupedByIssue[item.issueKey].push(item);
      }
    });

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

          const duration = endDate
            ? new Date(endDate) - new Date(startDate)
            : new Date() - new Date(startDate);

          statusTimeline.push({
            status: change.to,
            startDate,
            endDate,
            duration,
            durationText: calculateDuration(startDate, endDate),
            author: change.author,
          });
        });

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
    );

    // Sort by last update (most recent first)
    return processedIssues.sort(
      (a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate)
    );
  }, [data]);

  const timeFilterOptions = [
    { label: "Last 24 hours", value: "24h" },
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 6 months", value: "6m" },
    { label: "Last year", value: "1y" },
    { label: "All time", value: "all" },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching dashboard data...");
      const result = await invoke(currentDev, {
        filter: timeFilter,
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
  }, [timeFilter]);

  // Manual refresh
  const handleManualRefresh = () => {
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
          <Select
            value={timeFilterOptions.find((opt) => opt.value === timeFilter)}
            options={timeFilterOptions}
            onChange={(option) => setTimeFilter(option.value)}
            styles={{
              container: (provided) => ({ ...provided, minWidth: "200px" }),
            }}
          />
          <Button
            appearance="primary"
            onClick={handleManualRefresh}
            isLoading={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
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
