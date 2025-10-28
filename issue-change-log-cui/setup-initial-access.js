/**
 * Initial Setup Script for Issue Change Log
 * 
 * This script bootstraps the app with initial project access configuration.
 * It can be run once during initial deployment to set up the first projects
 * that will have access to the Issue Change Log app.
 * 
 * After initial setup, administrators can manage project access through the
 * Admin UI interface.
 * 
 * @module setup-initial-access
 */

import { storage } from "@forge/api";

/**
 * Sets up initial project access for the Issue Change Log app
 * 
 * This function checks if any projects are already configured with access.
 * If no projects exist and projectKeys are provided, it adds them to storage.
 * If projects already exist, it reports the current configuration.
 * 
 * @param {string[]} projectKeys - Array of Jira project keys to grant initial access
 * @returns {Promise<Object>} Result object with success status and message
 * @property {boolean} success - Whether the operation was successful
 * @property {string} message - Descriptive message about the operation result
 * 
 * @example
 * // Grant access to specific projects
 * await setupInitialAccess(["KC", "PROJ", "DEMO"]);
 * 
 * @example
 * // Initialize with no projects (admin will add via UI)
 * await setupInitialAccess([]);
 */
export const setupInitialAccess = async (projectKeys = []) => {
  try {
    const existingProjects = await storage.get("allowedProjects") || [];
    
    if (existingProjects.length === 0 && projectKeys.length > 0) {
      await storage.set("allowedProjects", projectKeys);
      return { success: true, message: `Added initial access for: ${projectKeys.join(", ")}` };
    } else if (existingProjects.length > 0) {
      return { success: true, message: `Access already configured for: ${existingProjects.join(", ")}` };
    } else {
      return { success: false, message: "No initial projects specified" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Bootstrap with empty array - admins can add projects via UI
setupInitialAccess([]);
