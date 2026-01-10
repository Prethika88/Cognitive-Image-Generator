import axios from '../utils/axios'

const generateImage = (data: { prompt: string }) => {
  return axios.post('/image/generate', data)

}

const fetchImages = (page: number, limit = 8) => {
  return axios.get(`/image/all?page=${page}&limit=${limit}`)
}

const imageService = {
  generateImage,
  fetchImages,
}

export default imageService
