import { EnvConfig } from '../types/EnvConfig'
import Joi from 'joi'
import { config as cfg } from 'dotenv'
import path from 'path'
import { v2 as cloudinarySetup } from 'cloudinary'

cfg({ path: path.join(__dirname, '../../.env') })

// ---------------- ENV VALIDATION ----------------

const envVarsSchema = Joi.object({
  MONGODB_URL: Joi.string().required().messages({ 'any.required': 'Provide MongoDB URL.' }),
  HUGGINGFACE_API_KEY: Joi.string().required().messages({ 'any.required': 'Provide Hugging Face API key.' }),
  CLOUDINARY_CLOUD_NAME: Joi.string().required().messages({ 'any.required': 'Provide Cloudinary cloud name.' }),
  CLOUDINARY_API_KEY: Joi.string().required().messages({ 'any.required': 'Provide Cloudinary API key.' }),
  CLOUDINARY_API_SECRET: Joi.string().required().messages({ 'any.required': 'Provide Cloudinary API secret.' }),
}).unknown()

const { value: envVars, error } = envVarsSchema.validate(process.env)

if (error) {
  throw new Error(`### ENV Setup Error ####\n ${error.message}`)
}

// ---------------- CONFIG OBJECT ----------------

export const config: EnvConfig = {
  databaseUrl: envVars.MONGODB_URL,
  huggingFaceApiKey: envVars.HUGGINGFACE_API_KEY,
  cloudinary: {
    name: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
}

// ---------------- CLOUDINARY SETUP ----------------

cloudinarySetup.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

export const cloudinary = cloudinarySetup
