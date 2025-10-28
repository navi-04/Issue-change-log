import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import Button from "@atlaskit/button";
import Toggle from "@atlaskit/toggle";
import Spinner from "@atlaskit/spinner";
import Banner from "@atlaskit/banner";
import "@atlaskit/css-reset";

export default function ProjectSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isAppEnabled, setIsAppEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    fetchProjectSettings();
  }, []);

  const fetchProjectSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await invoke("getProjectSettings");
      
      if (result.success) {
        setProjectName(result.project?.name || "Unknown Project");
        setHasPermission(result.hasPermission);
        setIsAppEnabled(result.isEnabled || false);
      } else {
        // Even if not successful, try to get project name if available
        if (result.project?.name) {
          setProjectName(result.project.name);
        }
        setError(result.message || "Failed to load project settings");
      }
    } catch (err) {
      setError(`Error: ${err.message || "An error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newState = !isAppEnabled;
      const result = await invoke("toggleProjectApp", { enabled: newState });
      
      if (result.success) {
        setIsAppEnabled(newState);
      } else {
        setError(result.message || "Failed to update settings");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !projectName) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "200px",
        flexDirection: "column"
      }}>
        <Spinner size="large" />
        <p style={{ marginTop: "16px", color: "#6b778c" }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "24px",
        maxWidth: "600px"
      }}>
        <div>
          <p style={{ 
            fontSize: "14px",
            color: "#5E6C84",
            marginBottom: "16px",
            lineHeight: "1.5"
          }}>
            {error}
          </p>
          <Button 
            appearance="primary" 
            onClick={fetchProjectSettings}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div style={{ 
        padding: "24px", 
        maxWidth: "600px", 
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" 
      }}>
        <h1 style={{ 
          color: "#172b4d", 
          fontSize: "24px", 
          fontWeight: "500", 
          marginBottom: "8px" 
        }}>
          Issue ChangeLog Settings
        </h1>
        <p style={{ 
          color: "#5e6c84", 
          fontSize: "14px", 
          marginBottom: "32px" 
        }}>
          {projectName}
        </p>

        {/* Not Authorized Status */}
        <div style={{
          padding: "20px",
          background: "#fff4e6",
          border: "1px solid #ffab00",
          borderRadius: "6px",
          fontSize: "14px",
          color: "#974f0c"
        }}>
          <strong>⚠ Not Authorized</strong>
          <p style={{ margin: "8px 0 0 0", fontSize: "13px", lineHeight: "1.5" }}>
            This project is not authorized to use the Issue ChangeLog app. 
            Please contact your Jira site administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: "600px", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" 
    }}>
      <h1 style={{ 
        color: "#172b4d", 
        fontSize: "24px", 
        fontWeight: "500", 
        marginBottom: "8px" 
      }}>
        Issue ChangeLog Settings
      </h1>
      <p style={{ 
        color: "#5e6c84", 
        fontSize: "14px", 
        marginBottom: "32px" 
      }}>
        {projectName}
      </p>

      {/* Enable/Disable Toggle */}
      <div style={{
        background: "#f4f5f7",
        border: "1px solid #dfe1e6",
        borderRadius: "8px",
        padding: "24px",
        marginBottom: "16px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              color: "#172b4d", 
              fontSize: "16px",
              fontWeight: "500" 
            }}>
              Enable Issue ChangeLog
            </h3>
            <p style={{ 
              margin: 0, 
              color: "#5e6c84", 
              fontSize: "14px" 
            }}>
              {isAppEnabled 
                ? "The app is currently enabled for this project" 
                : "The app is currently disabled for this project"}
            </p>
          </div>
          <Toggle
            isChecked={isAppEnabled}
            onChange={handleToggleChange}
            isDisabled={loading}
            size="large"
          />
        </div>
      </div>

      {/* Authorization Status */}
      <div style={{
        padding: "16px",
        background: isAppEnabled ? "#e3fcef" : "#f4f5f7",
        border: `1px solid ${isAppEnabled ? "#57d9a3" : "#dfe1e6"}`,
        borderRadius: "6px",
        fontSize: "14px",
        color: isAppEnabled ? "#006644" : "#5e6c84"
      }}>
        <strong>{isAppEnabled ? "✓ Authorized & Enabled" : "✓ Authorized"}</strong>
        <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
          {isAppEnabled 
            ? "This project is authorized and the app is currently enabled."
            : "This project is authorized. Enable the app above to use it."}
        </p>
      </div>
    </div>
  );
}