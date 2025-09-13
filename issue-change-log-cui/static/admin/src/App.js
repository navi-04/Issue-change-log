import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import Button from "@atlaskit/button";
import "@atlaskit/css-reset";

export default function AdminApp() {
  const [allowedProjects, setAllowedProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!initialLoading) setLoading(true);
    try {
      const [allowedResult, allResult] = await Promise.all([
        invoke("getAllowedProjects"),
        invoke("getAllProjects")
      ]);

      if (allowedResult && !allowedResult.error) {
        setAllowedProjects(allowedResult.allowedProjects || []);
      } else {
        setMessage(`Error loading allowed projects: ${allowedResult?.error || "Unknown error"}`);
      }

      if (allResult && !allResult.error) {
        setAllProjects(allResult.projects || []);
      } else {
        setMessage(`Error loading projects: ${allResult?.error || "Unknown error"}`);
      }
    } catch (error) {
      setMessage(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const addProject = async () => {
    if (!selectedProject) {
      setMessage("Please select a project to add");
      return;
    }

    setLoading(true);
    try {
      const result = await invoke("addAllowedProject", { projectKey: selectedProject });
      if (result.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setAllowedProjects(result.allowedProjects || []);
        setSelectedProject("");
        setMessage("Project added successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage(`Error adding project: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeProject = async (projectKey) => {
    setLoading(true);
    try {
      const result = await invoke("removeAllowedProject", { projectKey });
      if (result.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setAllowedProjects(result.allowedProjects || []);
        setMessage("Project removed successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage(`Error removing project: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const availableProjects = allProjects.filter(
    project => !allowedProjects.includes(project.key)
  );

  if (initialLoading) {
    return (
      <div style={{ 
        padding: "24px", 
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        textAlign: "center"
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "24px", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      maxWidth: "800px",
      margin: "0 auto"
    }}>
      <h1 style={{ 
        color: "#172b4d", 
        fontSize: "24px", 
        fontWeight: "500",
        marginBottom: "8px" 
      }}>
        Issue Change Log Settings
      </h1>
      
      <p style={{ 
        color: "#5e6c84", 
        fontSize: "14px",
        marginBottom: "32px" 
      }}>
        Manage which projects can access the Issue Change Log app. Only authorized projects will be able to view change logs.
      </p>

      {message && (
        <div style={{
          background: message.includes("Error") ? "#ffebee" : "#e8f5e8",
          border: `1px solid ${message.includes("Error") ? "#f44336" : "#4caf50"}`,
          borderRadius: "4px",
          padding: "12px",
          marginBottom: "24px",
          fontSize: "14px",
          color: message.includes("Error") ? "#c62828" : "#2e7d32"
        }}>
          {message}
        </div>
      )}

      {/* Add New Project Section */}
      <div style={{ 
        background: "#f4f5f7",
        border: "1px solid #dfe1e6", 
        borderRadius: "8px", 
        padding: "20px", 
        marginBottom: "32px" 
      }}>
        <h2 style={{ 
          margin: "0 0 16px 0", 
          fontSize: "16px", 
          fontWeight: "600",
          color: "#172b4d" 
        }}>
          Add Project Access
        </h2>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ minWidth: "250px", flex: "1" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "4px", 
              fontSize: "12px", 
              fontWeight: "600",
              color: "#5e6c84",
              textTransform: "uppercase"
            }}>
              Select Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ 
                width: "100%",
                padding: "8px 12px", 
                border: "2px solid #dfe1e6", 
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "white",
                color: "#172b4d"
              }}
              disabled={loading}
            >
              <option value="">Choose a project...</option>
              {availableProjects.map(project => (
                <option key={project.key} value={project.key}>
                  {project.key} - {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            appearance="primary"
            onClick={addProject}
            isDisabled={loading || !selectedProject}
          >
            Add Access
          </Button>
        </div>
        
        {availableProjects.length === 0 && allProjects.length > 0 && (
          <p style={{ 
            margin: "12px 0 0 0", 
            fontSize: "14px", 
            color: "#5e6c84",
            fontStyle: "italic" 
          }}>
            All projects already have access to the app.
          </p>
        )}
      </div>

      {/* Current Allowed Projects */}
      <div>
        <h2 style={{ 
          margin: "0 0 16px 0", 
          fontSize: "16px", 
          fontWeight: "600",
          color: "#172b4d" 
        }}>
          Authorized Projects ({allowedProjects.length})
        </h2>
        
        {allowedProjects.length === 0 ? (
          <div style={{
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            padding: "16px",
            color: "#856404"
          }}>
            <p style={{ margin: 0, fontSize: "14px" }}>
              ⚠️ No projects are currently authorized. The app will be inaccessible until you add at least one project.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "12px" 
          }}>
            {allowedProjects.map(projectKey => {
              const project = allProjects.find(p => p.key === projectKey);
              return (
                <div
                  key={projectKey}
                  style={{
                    background: "white",
                    border: "1px solid #dfe1e6",
                    borderRadius: "4px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ 
                      fontWeight: "600", 
                      fontSize: "14px",
                      color: "#172b4d",
                      marginBottom: "4px"
                    }}>
                      {projectKey}
                    </div>
                    {project && (
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#5e6c84" 
                      }}>
                        {project.name}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    appearance="subtle"
                    onClick={() => removeProject(projectKey)}
                    isDisabled={loading}
                    spacing="compact"
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loading && (
        <div style={{ 
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "20px",
          borderRadius: "4px",
          border: "1px solid #dfe1e6"
        }}>
          Processing...
        </div>
      )}

      {/* Info Footer */}
      <div style={{
        marginTop: "48px",
        padding: "16px",
        background: "#f4f5f7",
        borderRadius: "4px",
        fontSize: "12px",
        color: "#5e6c84"
      }}>
        <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>How it works:</p>
        <ul style={{ margin: 0, paddingLeft: "16px" }}>
          <li>Only projects listed above can access the Issue Change Log app</li>
          <li>Users in unauthorized projects will see an access denied message</li>
          <li>Site administrators can manage access through this settings page</li>
          <li>Changes take effect immediately</li>
        </ul>
      </div>
    </div>
  );
}