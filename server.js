const express = require('express')
const Kafka = require('node-rdkafka')
const cors = require('cors')
const app = express()
const client = Kafka.AdminClient.create({
    'client.id': 'kafka-admin', 
    'metadata.broker.list': 'localhost:9092'
})
const producer = new Kafka.HighLevelProducer({
    'client.id': 'kafka-producer',
    'metadata.broker.list': 'localhost:9092',
    'dr_cb': true
})
let producerState = {ready: false, connected: true}
// const producerStream = new Kafka.createWriteStream({
//     'metadata.broker.list': 'localhost:9092'
// }, {}, {topic: 'first_topic'})
producer.connect()
producer.setPollInterval(5000)
// producer.flush(2000, (err, data) => {
//     console.log(data)
// })
producer.on('delivery-report', (err, report) => {
    console.log(report)
})

producer.on('ready', () => {
  producerState.ready = true
})

producer.on('disconnected', () => {
    producerState.connected = false
})

const consumerStream = new Kafka.createReadStream({
    'metadata.broker.list': 'localhost:9092', 'group.id': 'messages'
  }, {}, {topics: ['first_topic', 'second_topic']})

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.post('/createtopic', (req, res) => {
    console.log(req.body)
    client.createTopic({
        topic: req.body.topicName,
        num_partitions: req.body.partitions,
        replication_factor: req.body.replicationFactor
    }, err => {
        if(err) {
            console.log(err)
        } else {
            res.send('topic was created')
        }
    })
})
app.post('/producer', (req, res) => {
    console.log('producer is writing message')
    // Buffer - an array of binary data
    console.log('producer endpoint is reached', producerState.ready)
    if(producerState.ready) {

    producer.produce('first_topic', null, Buffer.from(req.body.message), 'user1', Date.now(), 
    (err, offset) => {
        if(err) {
            console.log('producer couldnt write to partition')
            res.status(433).send('failed')
        }
        console.log('message was sent', offset)
        res.send('OK')
    })
} else {
    res.status(422).send('producer not ready')
}
    // const success = producerStream.write(Buffer.from(req.body.message))
    // if(success) {
    //     console.log('message was sent')
    //     res.send('OK')
    // } else {
    //     console.log('producer couldnt write to partition')
    //     res.status(433).send('failed')
    // }
})

const port = 5000
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
    console.log('server is running')
})

