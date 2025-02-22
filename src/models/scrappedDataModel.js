import mongoose from 'mongoose';

// Define the schema for storing scraped data
const scrapedDataSchema = new mongoose.Schema({
  userid:{
    type: String,
    required:true
  },
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ScrapedData = mongoose.model('ScrapedData', scrapedDataSchema);

export default ScrapedData;
