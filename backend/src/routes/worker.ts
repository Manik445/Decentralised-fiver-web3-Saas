import { Router } from "express";
const router = Router(); 


router.post('/sigin' , (req , res)=>{
    res.send('worker signin')
})

export default router; 