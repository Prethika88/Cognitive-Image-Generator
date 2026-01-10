import { Request, Response } from 'express'
import axios from 'axios'
import { createImage, findAllImages } from '../service/image.service'
import ResponseHandler from '../utils/responseHandler'
import { cloudinary } from '../config/config'

// ---------------- FETCH ALL IMAGES ----------------

export const fetchAllImages = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(_req.query.page) || 1
    const limit = Number(_req.query.limit) || 8
    const skip = limit * (page - 1)

    const images = await findAllImages(limit, skip)
    ResponseHandler.success(res, images)
  } catch (error) {
    ResponseHandler.serverError(res, error)
  }
}

// ---------------- GENERATE IMAGE ----------------

export const generateImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prompt } = req.body

  if (!prompt || prompt.trim() === '') {
    ResponseHandler.badRequest(res, null, 'Prompt is required.')
    return
  }

  try {
    const hfResponse = await axios.post(
      'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
      { inputs: prompt },
      {
        headers: {
  Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'image/png',   //  THIS IS REQUIRED
},

        responseType: 'arraybuffer',
        timeout: 60_000,
        validateStatus: () => true,
      }
    )

    const contentType = hfResponse.headers['content-type'] || ''

    // If Hugging Face did NOT return an image
    if (!contentType.includes('image')) {
      const text = Buffer.from(hfResponse.data).toString()
      console.error('HF non-image response:', text)

      ResponseHandler.serverError(
        res,
        null,
        'Image model is loading or rate-limited. Please try again in 30 seconds.'
      )
      return
    }

    const imageBase64 = Buffer.from(hfResponse.data).toString('base64')
    const imageData = `data:image/png;base64,${imageBase64}`

    const uploadedImage = await cloudinary.uploader.upload(imageData, {
      folder: 'ai-images',
    })

    const imageUrl = uploadedImage.secure_url

    await createImage({ imageUrl, prompt })

    ResponseHandler.created(res, { imageUrl })
  } catch (error: any) {
    console.error('Generate Image Error:', error)
    ResponseHandler.serverError(
      res,
      null,
      'Image generation failed (backend error)'
    )
  }
}
