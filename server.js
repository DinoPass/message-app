const express = require('express')
const Kafka = require('node-rdkafka')
const cors = require('cors')
const app = express()

const producerStream = new Kafka.createWriteStream({
    'metadata.broker.list': 'localhost:9092'
}, {}, {topic: 'first_topic'})

const consumerStream = new Kafka.createReadStream({
    'metadata.broker.list': 'localhost:9092', 'group.id': 'messages'
  }, {}, {topics: ['first_topic', 'second_topic']})

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.post('/producer', (req, res) => {
    console.log('producer is writing message')
    // Buffer - an array of binary data
    const success = producerStream.write(Buffer.from(req.body.message))
    if(success) {
        console.log('message was sent')
        res.send('OK')
    } else {
        console.log('producer couldnt write to partition')
        res.status(433).send('failed')
    }
})

const port = 3000
const server = require('http').createServer(app)
const io = require('socket.io')(server)

consumerStream.on('data', (message) => {
    console.log('message recieved', message.value.toString())
    io.emit('message', message.value.toString())
})

io.on('connection', (socket) => {
    console.log('user is connected')
})
server.listen(port, () => {
    
})

