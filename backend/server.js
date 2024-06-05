const exp=require('express')
const cors=require('cors')
const app=exp()
require('dotenv').config()
const path=require('path')
//connnecting databse
const mongoClient=require('mongodb').MongoClient;

// deploying react build
app.use(exp.static(path.join(__dirname,'../client/build')))
mongoClient.connect(process.env.db_url)
.then(client=>{
    //get db obj
    const fp=client.db('fp')
    //get collection obj
    const facultycollection=fp.collection('facultycollection')
    const studentsdatacollection=fp.collection('studentsdatacollection')
    //share collection obj with express app
    app.set('facultycollection',facultycollection)
    app.set('studentsdatacollection',studentsdatacollection)
    //confirm db conn status
    console.log("db connection success")
})
.catch()

//parsing body of req
app.use(exp.json())


const facultyApp=require('./APIs/faculty-api')


app.use('/faculty-api',facultyApp)


app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'../client/build/index.html'))
})

//error handling
app.use((err,req,res,next)=>{
    res.send({message:'error',payload:err.message})
})



const port=process.env.PORT || 4000;
app.listen(port,()=>console.log(`Web server on port ${port}`))