// src/utils/multerCloudinary.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary'; // import file cloudinary chuẩn ESM

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',               // folder trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, crop: 'limit' }],
  },
});

const parser = multer({ storage });

export default parser;
