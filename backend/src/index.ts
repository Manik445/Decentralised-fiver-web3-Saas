const express = require('express')
const app = express(); 
const port = 2000; 
import userRoutes from './routes/user'
import workerRoutes from './routes/worker'

export const SECRET_KEY = 'manikGuptaJwtsecretkey'


// middlewares for user and workers (signin : using wallets4) 
app.use('/v1/user' , userRoutes); 
app.use('/v1/worker' , workerRoutes);    




app.listen(port , ()=>{
    console.log(`server is listening at ${port}`)
})   

