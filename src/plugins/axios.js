import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://starnavi-frontend-test-task.herokuapp.com',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default instance
