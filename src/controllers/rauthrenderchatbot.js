import path from "path";
import { fileURLToPath } from "url";

// Get the current module's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getHomePage = (req, res) => {
  try {
    res.setHeader("Content-Type", "text/html"); // Set content type
    res.sendFile(path.join(__dirname, "../views/index.html"));
  } catch (error) {
    res.json({
        message:"error"
    })
    
  }
};
