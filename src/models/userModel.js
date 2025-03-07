import mongoose from "mongoose";

// Create a schema for registering the chatbot
const registerChatbotSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  userid: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"], 
    default: "user"
  },
  isActiveTrial: {
    type: Boolean,
    default: true // Trial starts as active
  },
  payment: {
    type: String,
    enum: ["No", "Yes"],
    default: "No" // No payment by default
  },
  startDate: {
    type: Date,
    default: Date.now  // Set the start date to current time when the user registers
  }
});

// Middleware to automatically update trial status
registerChatbotSchema.pre("save", function(next) {
  // Check if the user has been in the system for more than 15 days
  const trialDuration = 15; // Days
  const currentDate = new Date();
  const trialEndDate = new Date(this.startDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialDuration);

  // If the trial period has passed, set isActiveTrial to false
  if (currentDate > trialEndDate) {
    this.isActiveTrial = false;
  }

  next(); // Proceed with the save operation
});

// Create a model from the schema
const ChatbotModel = mongoose.model("ChatbotModel", registerChatbotSchema);

export default ChatbotModel;

