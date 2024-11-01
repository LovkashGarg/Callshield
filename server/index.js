const express = require('express');
const app = express();
const axios = require('axios');
 // Load environment variables from .env file
require('dotenv').config();
app.use(express.json());

app.post('/start-recording', async (req, res) => {
   
      
    });
    app.get('/',(req,res)=>{
        res.send(
            "Hello I am running"
        )
    })
 // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
    
