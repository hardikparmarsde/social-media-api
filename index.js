// IMPORTANT: dotenv must load before any other import that reads process.env
// (e.g. config/cloudinary.js runs cloudinary.config() at module-eval time,
//  so the dotenv side-effect must happen before that chain is pulled in).
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import postRoutes from './routes/posts.js'
import userRoutes from './routes/user.js';

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use('/public', express.static('public'));
app.use('/posts', postRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
    res.send('This is the api for social media application');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => app.listen(PORT, () => console.log('Server running on port '+ PORT))
).catch(
    (error) => console.log(error.message)
);

//mongoose.set('useFindAndModify', false);