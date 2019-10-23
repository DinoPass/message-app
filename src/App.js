import React, {useEffect, useState} from 'react';
import axios from 'axios'
import io from 'socket.io-client'
import logo from './logo.svg';
import './App.css';
// import Kafka from 'node-rdkafka'

const socket = io.connect('http://localhost:5000')

function App() {
  
const [message, setMessage] = useState('')
const [topicState, setTopicState] = useState({
  topicName: '',
  replicationFactor: 1,
  partitions: 1
})

  useEffect(() => {
    socket.connect()
     socket.on('message', (data) => {
        console.log(data)
     })
     return () => {
       socket.disconnect()
     }
  }, [])

  function sendTopic(e) {
    e.preventDefault()
    axios.post('http://localhost:5000/createtopic', topicState)
      .then(res => {
        if(res.status === 200) {
          console.log(res.data)
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  function sendMessage(e) {
    e.preventDefault()
    axios.post('http://localhost:5000/producer', {message: message})
      .then((res) => {
        if(res.status === 200 ) {
          console.log(res.data)
        } 
      })
      .catch((err) => {
        console.log(err)
      })
  }
  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={sendTopic} >
          <input type="text" placeholder="topic name" onChange={(e) => {setTopicState({...topicState, topicName: e.target.value})}} />
          <input type="number" placeholder="replication factor" defaultValue="1" onChange={(e) => {setTopicState({...topicState, replicationFactor: parseInt(e.target.value)})}} />
          <input type="number" placeholder="partition" defaultValue="1" onChange={(e) => {setTopicState({...topicState, partitions: parseInt(e.target.value)})}}  />
          <button type="submit">create topic</button>
        </form>
        <img src={logo} className="App-logo" alt="logo" />
      <form onSubmit={sendMessage}>
       <input type='text' onChange={(e) => {
         setMessage(e.target.value) 
       }} />
       <button type='submit'>send</button>
       </form>
      </header>
    </div>
  );
}

export default App;
