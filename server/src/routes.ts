import express from 'express';
import {celebrate, Joi} from 'celebrate'
//
import multerConfig from './config/multer';
import PointersControllers from './controllers/PointersControllers'
import ItemsControllers from './controllers/ItemsController'
import multer from 'multer';


const router = express.Router();
const pointersConstrollers = new PointersControllers();
const itemsController = new ItemsControllers();
const upload = multer(multerConfig);


// index, show, create, update, delete
router.get('/', (req, res) => {
  return res.json({ message: 'Hello Word' });
})


router.get('/items', itemsController.index);

router.get('/points', pointersConstrollers.index);

router.post('/points',
  upload.single('image'),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    }),
  },{
    abortEarly: false
  }),
  pointersConstrollers.create);

router.get('/points/:id', pointersConstrollers.show);

export default router;