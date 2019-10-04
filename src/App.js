import React, {useEffect, useState} from 'react';
import axios from 'axios'
import io from 'socket.io-client'
import logo from './logo.svg';
import './App.css';
// import Kafka from 'node-rdkafka'

const socket = io.connect('http://localhost:3000')

function App() {
  
const [message, setMessage] = useState('') 

  useEffect(() => {
    socket.connect()
     socket.on('message', (data) => {
        console.log(data)
     })
     return () => {
       socket.disconnect()
     }
  }, [])
  function sendMessage(e) {
    e.preventDefault()
    axios.post('http://localhost:3000/producer', {message: message})
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
