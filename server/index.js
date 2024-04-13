const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')
const bcrypt = require("bcrypt")
const saltRounds = 10


const db = mysql.createPool({
    host: "179.188.16.167",
    user: "chamadosfacil",
    password: "Centr0#3127",
    database: "chamadosfacil"
})


const port = process.env.PORT || 3001

app.use(cors({
    credentials: true,
    origin: '*',
    methods: ['GET','OPTIONS','PATCH','DELETE','POST','PUT'],
    allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization']
}))

app.use(express.json())

app.get("/", (req, res) =>{
    return res.json("Hello World")
})

app.post("/registeruser", (req, res) => {
    const { name } = req.body
    const { email } = req.body
    const { adress } = req.body
    const { password } = req.body

    console.log(req.body)

    let SQLINSERT = "INSERT INTO users(adress, email, name, password) VALUES(?,?,?,?)"
    let SQL = "select * from users where email = ?"

 
    db.query(SQL, [email, password], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result.length)
            if (result.length == 0) {
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    console.log(password)
                    console.log(hash)
                    db.query(SQLINSERT, [adress, email, name, hash], (err, result) => {
                        if (err) console.log(err)
                        else res.send(result)
                    })

                })
            } else {
                res.send({ msg: "cadastrado" })
            }
        }
    })
})

app.post("/updateUser", (req, res) => {
    const { avatar } = req.body
    const { clientId } = req.body
    const { name } = req.body

    SQL = "update users set name = ? where clientId = ?"

    db.query(SQL, [name, clientId], (err, result) => {
        if (err) console.log(err)
        else res.send(name)
    })
})

app.post("/updateAvatar", (req, res) => {
    const { avatar } = req.body
    const { clientId } = req.body
    const { name } = req.body

    SQL = "update users set avatar = ? where clientId = ?"

    db.query(SQL, [avatar, clientId], (err, result) => {
        if (err) console.log(err)
        else console.log(avatar)
    })
})

app.post("/login", (req, res) => {
    const { name } = req.body
    const { email } = req.body
    const { adress } = req.body
    const { password } = req.body

    let SQL = "select * from users where email = ?"

    db.query(SQL, [email], (err, result) => {
        if (err) console.log(err)
        if (result.length > 0) {
            // res.send(result)            
            bcrypt.compare(password, result[0].password, (err, result) => {
                res.send(result)
            })
        } else {
            res.send({ msg: "inexistente" })
        }

    })
})

app.post("/getUser", (req, res) => {

    const { email } = req.body

    let SQL = "SELECT * from users where email = ?"

    db.query(SQL, [email], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.post("/registertask", (req, res) => {
    const { client } = req.body
    const { created } = req.body
    const { obs } = req.body
    const { priority } = req.body
    const { status } = req.body
    const { subject } = req.body
    const { taskImages } = req.body
    const { type } = req.body
    const { userEmail } = req.body
    const { userId } = req.body

    let SQL = "INSERT INTO tasks(client, created, obs, priority, status, subject, taskImages, type, userEmail, userId) VALUES(?,?,?,?,?,?,?,?,?,?)"

    db.query(SQL, [client, created, obs, priority, status, subject, taskImages, type, userEmail, userId], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.post("/completeTask", (req, res) => {
    const { client } = req.body
    const { created } = req.body
    const { obs } = req.body
    const { priority } = req.body
    const { status } = req.body
    const { subject } = req.body
    // const {taskImages} = req.body
    const { type } = req.body
    const { userEmail } = req.body
    const { userId } = req.body
    const { taskId } = req.body
    const { concluded } = req.body

    let SQL = "INSERT INTO completedtasks(client, created,  priority, status, subject, type, userEmail, userId, taskId, concluded) VALUES(?,?,?,?,?,?,?,?,?,?)"

    db.query(SQL, [client, created, priority, status, subject, type, userEmail, userId, taskId, concluded], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
        console.log(type)
    })
})

app.post("/searchtask", (req, res) => {
    const { client } = req.body
    const { created } = req.body
    const { obs } = req.body
    const { userEmail } = req.body
    const { userId } = req.body

    let SQL = "select * from tasks where client = ? and created = ? and obs = ? and userEmail = ?"

    db.query(SQL, [client, created, obs, userEmail], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.post("/filtertask", (req, res) => {
    const { type } = req.body
    const { table } = req.body

    let SQL = "select * from completedtasks where type = ?"


    db.query(SQL, [type], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.post("/registerobs", (req, res) => {
    console.log(req.body)
    const { client } = req.body
    const { created } = req.body
    const { obs } = req.body
    const { taskid } = req.body


    let SQL = "INSERT INTO obs(taskid, obs, client, created) VALUES(?,?,?,?)"

    db.query(SQL, [taskid, obs, client, created], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.post("/searchObs", (req, res) => {
    const { taskid } = req.body


    let SQL = "select * from obs where taskid = ?"

    db.query(SQL, [taskid], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })


})

app.post("/registerImage", (req, res) => {
    console.log(req.body)
    const { client } = req.body
    const { created } = req.body
    const { image } = req.body
    const { taskid } = req.body


    let SQL = "INSERT INTO images(taskid, image, client, created) VALUES(?,?,?,?)"

    db.query(SQL, [taskid, image, client, created], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.post("/searchImages", (req, res) => {
    const { taskid } = req.body


    let SQL = "select * from images where taskid = ?"

    db.query(SQL, [taskid], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })


})

app.get("/getLastTask", (req, res) => {
    let SQL = "SELECT taskId FROM tasks ORDER BY taskId DESC LIMIT 1"

    db.query(SQL, (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.get("/getCompletedTasks", (req, res) => {

    let SQL = "SELECT * from completedtasks"

    db.query(SQL, (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.get("/getTasks", (req, res) => {

    let SQL = "SELECT * from tasks where isConcluded = 0"

    db.query(SQL, (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.get("/getUsers", (req, res) => {

    let SQL = "SELECT * from users"

    db.query(SQL, (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.get("/getObsList", (req, res) => {

    let SQL = "SELECT * from obs"

    db.query(SQL, (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.put("/editTaskConcluded", (req, res) => {
    const { taskId } = req.body


    let SQL = "update tasks set isConcluded = 1 where taskId = ? "

    db.query(SQL, [taskId], (err, result) => {
        if (err) console.log(err)
        else {
            res.send(result)
            console.log("ok")
        }
    })
})

app.put("/editTask", (req, res) => {
    const { taskId } = req.body
    const { userId } = req.body
    const { client } = req.body
    const { priority } = req.body
    const { subject } = req.body
    const { status } = req.body
    const { type } = req.body

    let SQL = "update tasks set client = ?, priority = ?, subject = ?, status = ?, type = ? where taskId = ? "

    db.query(SQL, [client, priority, subject, status, type, taskId], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.delete("/deletetask/:taskId", (req, res) => {
    const { taskId } = req.params
    let SQL = "delete from tasks where taskId = ?"

    db.query(SQL, [taskId], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.delete("/deleteobs/:taskId", (req, res) => {
    const { taskId } = req.params
    let SQL = "delete from obs where taskId = ?"

    db.query(SQL, [taskId], (err, result) => {
        if (err) console.log(err)
        else res.send(result)
    })
})

app.listen(3001, () => {
    console.log("rodandoooo")
})