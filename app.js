import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import connectDB from './src/config/db.js';
import router from './src/routes/chatRoutes.js';
// import { cleanupInactiveSessions } from './src/services/authSessionCleanup.js';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware



const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH'], // Allow only specific methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cookieParser());

// Database Connection
connectDB()
// Routes
app.use('/v1', router);    
app.use(express.static("views"));


app.get('/',(req, res)=>{
  res.send("Hello World")
});





const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
