import z from 'zod'


const createTaskUrl = z.object({
    options : z.array(z.object ({
        imageUrl : z.string()
    })) ,
    title : z.string().optional(), 
    signature : z.string()
}) 

export default createTaskUrl