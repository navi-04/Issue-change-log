import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import Button from "@atlaskit/button";
import "@atlaskit/css-reset";

export default function AdminApp() {
  const [allowedProjects, setAllowedProjects] = useState([]);
  const [allowedProjectsData, setAllowedProjectsData] = useState({});
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedForRemoval, setSelectedForRemoval] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
        setAllowedProjectsData(allowedResult.allowedProjectsData || {});
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
    if (selectedProjects.length === 0) {
      setMessage("Please select at least one project to add");
      return;
    }

    setLoading(true);
    try {
      let successCount = 0;
      let errorMessages = [];
      
      for (const projectKey of selectedProjects) {
        const result = await invoke("addAllowedProject", { projectKey });
        if (result.error) {
          errorMessages.push(`${projectKey}: ${result.error}`);
        } else {
          successCount++;
          // Update state with latest data from the last successful call
          setAllowedProjects(result.allowedProjects || []);
          setAllowedProjectsData(result.allowedProjectsData || {});
        }
      }
      
      setSelectedProjects([]);
      
      if (errorMessages.length > 0) {
        setMessage(`Added ${successCount} project(s). Errors: ${errorMessages.join(', ')}`);
      } else {
        setMessage(`Successfully added ${successCount} project(s)!`);
      }
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage(`Error adding projects: ${error.message}`);
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
        setAllowedProjectsData(result.allowedProjectsData || {});
        setSelectedForRemoval([]);
        setMessage("Project removed successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage(`Error removing project: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeSelectedProjects = async () => {
    if (selectedForRemoval.length === 0) {
      setMessage("Please select at least one project to remove");
      return;
    }

    setLoading(true);
    try {
      let successCount = 0;
      let errorMessages = [];
      
      for (const projectKey of selectedForRemoval) {
        const result = await invoke("removeAllowedProject", { projectKey });
        if (result.error) {
          errorMessages.push(`${projectKey}: ${result.error}`);
        } else {
          successCount++;
          // Update state with latest data from the last successful call
          setAllowedProjects(result.allowedProjects || []);
          setAllowedProjectsData(result.allowedProjectsData || {});
        }
      }
      
      setSelectedForRemoval([]);
      
      if (errorMessages.length > 0) {
        setMessage(`Removed ${successCount} project(s). Errors: ${errorMessages.join(', ')}`);
      } else {
        setMessage(`Successfully removed ${successCount} project(s)!`);
      }
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage(`Error removing projects: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectSelection = (projectKey) => {
    setSelectedProjects(prev => 
      prev.includes(projectKey)
        ? prev.filter(k => k !== projectKey)
        : [...prev, projectKey]
    );
  };

  const toggleRemovalSelection = (projectKey) => {
    setSelectedForRemoval(prev => 
      prev.includes(projectKey)
        ? prev.filter(k => k !== projectKey)
        : [...prev, projectKey]
    );
  };

  const toggleAllForRemoval = () => {
    if (selectedForRemoval.length === allowedProjects.length) {
      setSelectedForRemoval([]);
    } else {
      setSelectedForRemoval([...allowedProjects]);
    }
  };

  const availableProjects = allProjects.filter(
    project => !allowedProjects.includes(project.key)
  );

  const filteredAvailableProjects = availableProjects.filter(project => {
    const query = searchQuery.toLowerCase();
    return (
      project.key.toLowerCase().includes(query) ||
      project.name.toLowerCase().includes(query)
    );
  });

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
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "12px", 
            fontWeight: "600",
            color: "#5e6c84",
            textTransform: "uppercase"
          }}>
            Search Projects
          </label>
          <input
            type="text"
            placeholder="Search by project key or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "2px solid #dfe1e6",
              borderRadius: "4px",
              fontSize: "14px",
              boxSizing: "border-box",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
            }}
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "12px", 
            fontWeight: "600",
            color: "#5e6c84",
            textTransform: "uppercase"
          }}>
            Select Projects ({selectedProjects.length} selected)
          </label>
          
          <div style={{ 
            background: "white",
            border: "2px solid #dfe1e6",
            borderRadius: "4px",
            maxHeight: "300px",
            overflowY: "auto"
          }}>
            {availableProjects.length === 0 ? (
              <div style={{ 
                padding: "16px", 
                textAlign: "center",
                color: "#5e6c84",
                fontStyle: "italic"
              }}>
                All projects already have access
              </div>
            ) : filteredAvailableProjects.length === 0 ? (
              <div style={{ 
                padding: "16px", 
                textAlign: "center",
                color: "#5e6c84",
                fontStyle: "italic"
              }}>
                No projects match your search
              </div>
            ) : (
              filteredAvailableProjects.map(project => (
                <label
                  key={project.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid #f4f5f7",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    background: selectedProjects.includes(project.key) ? "#ebecf0" : "white"
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedProjects.includes(project.key)) {
                      e.currentTarget.style.background = "#f4f5f7";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedProjects.includes(project.key)) {
                      e.currentTarget.style.background = "white";
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.key)}
                    onChange={() => toggleProjectSelection(project.key)}
                    disabled={loading}
                    style={{ 
                      marginRight: "12px",
                      width: "16px",
                      height: "16px",
                      cursor: "pointer"
                    }}
                  />
                  <div>
                    <div style={{ 
                      fontWeight: "500", 
                      fontSize: "14px",
                      color: "#172b4d"
                    }}>
                      {project.key}
                    </div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#5e6c84" 
                    }}>
                      {project.name}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <Button
            appearance="subtle"
            onClick={() => setSelectedProjects([])}
            isDisabled={loading || selectedProjects.length === 0}
          >
            Clear Selection
          </Button>
          <Button
            appearance="primary"
            onClick={addProject}
            isDisabled={loading || selectedProjects.length === 0}
          >
            Add {selectedProjects.length > 0 ? `${selectedProjects.length} Project${selectedProjects.length > 1 ? 's' : ''}` : 'Projects'}
          </Button>
        </div>
        
        {availableProjects.length === 0 && allProjects.length > 0 && (
          <p style={{ 
            margin: "12px 0 0 0", 
            fontSize: "14px", 
            color: "#5e6c84",
            fontStyle: "italic",
            textAlign: "center"
          }}>
            All projects already have access to the app.
          </p>
        )}
      </div>

      {/* Current Allowed Projects */}
      <div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "16px" 
        }}>
          <h2 style={{ 
            margin: "0", 
            fontSize: "16px", 
            fontWeight: "600",
            color: "#172b4d" 
          }}>
            Authorized Projects ({allowedProjects.length})
          </h2>
          
          {selectedForRemoval.length > 0 && (
            <Button
              appearance="danger"
              onClick={removeSelectedProjects}
              isDisabled={loading}
            >
              Remove {selectedForRemoval.length} Selected
            </Button>
          )}
        </div>
        
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
            background: "white",
            border: "1px solid #dfe1e6",
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              fontSize: "14px"
            }}>
              <thead>
                <tr style={{ 
                  background: "#f4f5f7",
                  borderBottom: "2px solid #dfe1e6"
                }}>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#5e6c84",
                    fontSize: "12px",
                    width: "50px"
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedForRemoval.length === allowedProjects.length && allowedProjects.length > 0}
                      onChange={toggleAllForRemoval}
                      disabled={loading}
                      style={{ 
                        width: "16px",
                        height: "16px",
                        cursor: "pointer"
                      }}
                      title="Select all"
                    />
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#5e6c84",
                    fontSize: "12px",
                    textTransform: "uppercase"
                  }}>
                    Project Name
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#5e6c84",
                    fontSize: "12px",
                    textTransform: "uppercase"
                  }}>
                    Project ID
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#5e6c84",
                    fontSize: "12px",
                    textTransform: "uppercase"
                  }}>
                    Date of Access
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#5e6c84",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    width: "120px"
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allowedProjects.map((projectKey, index) => {
                  const projectData = allowedProjectsData[projectKey];
                  const project = allProjects.find(p => p.key === projectKey);
                  const projectName = projectData?.name || project?.name || "Unknown";
                  const projectId = projectData?.id || "N/A";
                  const dateAdded = projectData?.dateAdded 
                    ? new Date(projectData.dateAdded).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "N/A";

                  return (
                    <tr
                      key={projectKey}
                      style={{
                        borderBottom: index < allowedProjects.length - 1 ? "1px solid #f4f5f7" : "none",
                        background: selectedForRemoval.includes(projectKey) ? "#fff3cd" : "white"
                      }}
                    >
                      <td style={{ 
                        padding: "12px 16px",
                        textAlign: "center"
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedForRemoval.includes(projectKey)}
                          onChange={() => toggleRemovalSelection(projectKey)}
                          disabled={loading}
                          style={{ 
                            width: "16px",
                            height: "16px",
                            cursor: "pointer"
                          }}
                        />
                      </td>
                      <td style={{ 
                        padding: "12px 16px",
                        color: "#172b4d",
                        fontWeight: "500"
                      }}>
                        {projectName}
                        <div style={{ 
                          fontSize: "12px", 
                          color: "#5e6c84",
                          marginTop: "2px"
                        }}>
                          {projectKey}
                        </div>
                      </td>
                      <td style={{ 
                        padding: "12px 16px",
                        color: "#172b4d"
                      }}>
                        {projectId}
                      </td>
                      <td style={{ 
                        padding: "12px 16px",
                        color: "#5e6c84"
                      }}>
                        {dateAdded}
                      </td>
                      <td style={{ 
                        padding: "12px 16px",
                        textAlign: "center"
                      }}>
                        <Button
                          appearance="subtle"
                          onClick={() => removeProject(projectKey)}
                          isDisabled={loading}
                          spacing="compact"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

    </div>
  );
}