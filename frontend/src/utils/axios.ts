import axiosLib from 'axios'

// Vite env variable
const baseURL = import.meta.env.VITE_API_HOST_URL

if (!baseURL) {
    throw new Error('VITE_API_HOST_URL is not defined')
}

const axios = axiosLib.create({
    baseURL: `${baseURL}/api`,
})

export default axios

