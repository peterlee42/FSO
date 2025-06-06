const mongoose = require('mongoose')

if (process.argv.length < 3){
    console.log("Give a password as an argument")
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack1:${password}@cluster0.t2dfaoi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set("strictQuery", false)

mongoose.connect(url)