/**
 * Initial setup script to add the first project access
 * This can be run once to bootstrap the app with initial project access
 */

import { storage } from "@forge/api";

// Function to set up initial project access
export const setupInitialAccess = async (projectKeys = []) => {
  try {
    const existingProjects = await storage.get("allowedProjects") || [];
    
    if (existingProjects.length === 0 && projectKeys.length > 0) {
      await storage.set("allowedProjects", projectKeys);
      console.log(`Initial project access set up for: ${projectKeys.join(", ")}`);
      return { success: true, message: `Added initial access for: ${projectKeys.join(", ")}` };
    } else if (existingProjects.length > 0) {
      console.log(`Project access already configured: ${existingProjects.join(", ")}`);
      return { success: true, message: `Access already configured for: ${existingProjects.join(", ")}` };
    } else {
      console.log("No initial projects specified");
      return { success: false, message: "No initial projects specified" };
    }
  } catch (error) {
    console.error("Error setting up initial access:", error);
    return { success: false, message: error.message };
  }
};

// Example usage:
// To give initial access to specific projects, call:
// setupInitialAccess(["KC", "PROJ", "DEMO"]);

// For now, let's bootstrap with an empty array - admins can add projects via UI
setupInitialAccess([]);
