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
  const [projectData, setProjectData] = useState(null);
  const [isAppEnabled, setIsAppEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isProjectAdmin, setIsProjectAdmin] = useState(false);

  useEffect(() => {
    fetchProjectSettings();
  }, []);

  const fetchProjectSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching project settings...");
      const result = await invoke("getProjectSettings");
      console.log("Project settings result:", result);
      
      if (result.success) {
        setProjectData(result.project);
        setHasPermission(result.hasPermission);
        setIsAppEnabled(result.isEnabled || false);
        setIsProjectAdmin(result.isProjectAdmin || false);
        console.log("Settings loaded successfully:", {
          project: result.project,
          hasPermission: result.hasPermission,
          isEnabled: result.isEnabled,
          isProjectAdmin: result.isProjectAdmin
        });
      } else {
        console.error("Failed to load settings:", result);
        setError(result.message || "Failed to load project settings");
        
        // Show debug information if available
        if (result.debug) {
          console.log("Debug info:", result.debug);
        }
      }
    } catch (err) {
      console.error("Error fetching project settings:", err);
      setError(`Error: ${err.message || "An error occurred while fetching project settings"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage("");
      
      const newState = !isAppEnabled;
      const result = await invoke("toggleProjectApp", { enabled: newState });
      
      if (result.success) {
        setIsAppEnabled(newState);
        setMessage(
          newState 
            ? "Issue ChangeLog app has been enabled for this project" 
            : "Issue ChangeLog app has been disabled for this project"
        );
      } else {
        setError(result.message || "Failed to update app settings");
      }
    } catch (err) {
      console.error("Error updating app settings:", err);
      setError(err.message || "An error occurred while updating settings");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !projectData) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "200px",
        flexDirection: "column"
      }}>
        <Spinner size="large" />
        <p style={{ marginTop: "16px", color: "#6b778c" }}>Loading project settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Banner appearance="error">
          <strong>Error loading project settings</strong>
          <p>{error}</p>
        </Banner>
        <div style={{ marginTop: "16px" }}>
          <Button onClick={fetchProjectSettings}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div style={{ padding: "24px" }}>
        <Banner appearance="warning">
          <strong>App Not Authorized for This Project</strong>
          <p>
            The Issue ChangeLog app has not been authorized for this project by your Jira site administrator.
            Please contact your site administrator to request access.
          </p>
          <div style={{ marginTop: "12px" }}>
            <p style={{ fontSize: "14px", margin: 0 }}>
              Site administrators can manage app access in <strong>Jira Settings → Apps → Issue ChangeLog Settings</strong>
            </p>
          </div>
        </Banner>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: "600px", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" 
    }}>
      <div style={{ marginBottom: "32px" }}>
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
          marginBottom: "8px" 
        }}>
          Configure the Issue ChangeLog app for <strong>{projectData?.name || "this project"}</strong>
        </p>
        <p style={{ 
          color: "#5e6c84", 
          fontSize: "12px", 
          marginBottom: "0" 
        }}>
          Project Key: {projectData?.key || "N/A"} • {isProjectAdmin ? "You have project administrator permissions" : "Project administrator permissions required"}
        </p>
      </div>

      {message && (
        <div style={{ marginBottom: "24px" }}>
          <Banner appearance="success">
            {message}
          </Banner>
        </div>
      )}

      {!isProjectAdmin && (
        <div style={{ marginBottom: "24px" }}>
          <Banner appearance="warning">
            <strong>Project Administrator Access Required</strong>
            <p>
              You need project administrator permissions to modify these settings. 
              The current app status is displayed below but cannot be changed.
            </p>
          </Banner>
        </div>
      )}

      <div style={{
        background: "#f4f5f7",
        border: "1px solid #dfe1e6",
        borderRadius: "8px",
        padding: "24px",
        marginBottom: "24px",
        opacity: isProjectAdmin ? 1 : 0.6
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px"
        }}>
          <div>
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
              Allow users in this project to view issue change logs
            </p>
          </div>
          <Toggle
            isChecked={isAppEnabled}
            onChange={handleToggleChange}
            isDisabled={loading || !isProjectAdmin}
            size="large"
          />
        </div>

        <div style={{
          padding: "16px",
          background: "#ffffff",
          borderRadius: "4px",
          border: "1px solid #dfe1e6"
        }}>
          <h4 style={{ 
            margin: "0 0 8px 0", 
            color: "#172b4d", 
            fontSize: "14px",
            fontWeight: "500" 
          }}>
            What this does:
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: "20px", 
            color: "#5e6c84", 
            fontSize: "12px" 
          }}>
            <li>When enabled, users can see the Issue ChangeLog panel in issue detail views</li>
            <li>Users can view change history, comments, and attachment information</li>
            <li>When disabled, the Issue ChangeLog panel will not appear for any issues in this project</li>
            <li>This setting only applies to this specific project</li>
          </ul>
        </div>
      </div>

      <div style={{
        padding: "16px",
        background: "#e3fcef",
        border: "1px solid #57d9a3",
        borderRadius: "4px",
        fontSize: "12px",
        color: "#006644"
      }}>
        <strong>✓ Authorized:</strong> This project has been authorized by your site administrator to use the Issue ChangeLog app.
      </div>
    </div>
  );
}