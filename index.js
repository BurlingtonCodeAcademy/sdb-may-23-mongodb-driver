require("dotenv").config()
const express = require("express")
const { MongoClient } = require("mongodb")
const app = express()


const PORT = process.env.PORT || 4000
const HOST = process.env.HOST || "127.0.0.1"
const DB_URL = process.env.DB_URL

// Instantiate a new Mongo Client
const client = new MongoClient(DB_URL)

async function dbConnect() {
    // establish connection with the database process
    await client.connect()
    // create a database or connect if one exists
    const db = await client.db("mongolesson")
    // Create a collection within our new database
    const collection = await db.collection("user")
    return collection
}

app.use(express.json())
app.post("/create", async (req, res) => {
    try {
        // connect to our database and collection
        const connect = await dbConnect()
        // push the contents of the body into our collection as a document
        const insertOne = await connect.insertOne(req.body)

        res.status(201).json({
            message: `User created`,
            insertOne
        })
    } catch(err) {
        console.log(err)
    }
})

app.get("/getusers", async (req, res) => {
    try {
        const connect = await dbConnect()
        // ! .find() method returns a cursor object. It needs to be iterated with loop or array method.
        // ? OR
        // ! use .toArray() method to turn cursor into an object
        const userList = await connect.find({}).toArray()
        

        res.status(200).json({
            userList
        })

    } catch(err) {
        console.log(err)
    }
})

/* 
    ! Challenge
    * create an endpoint that takes a parameter of name
    * it should return a query from the db matching the requested name
*/

app.get("/getusers/:name", async (req, res) => {
    try {
        const { name } = req.params
        
        const connect = await dbConnect()
        const foundOne = await connect.find({ name: {$regex: name} }).toArray()
        
        if (foundOne.length === 0) throw Error("Document not found")

        res.status(200).json(foundOne)

    } catch(err) {
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }
})

app.delete("/delete/:email", async (req, res) => {
    try {
        const { email } = req.params
        const connect = await dbConnect()
        const deleteOne = await connect.findOneAndDelete({ email })

        if (!deleteOne.value) throw Error("Entry not found")
        
        res.status(200).json({
            message: `User deleted`,
            user: deleteOne.value
        })
    } catch(err) {
        console.log(err)
        res.status(500).json({
            message: `${err}`
        })
    }
})

app.listen(PORT, HOST, () => {
    console.log(`[server] listening on ${HOST}:${PORT}`)
})