import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import userRouter from './routes/users';
import swipeRouter from './routes/swipes';
import matchRouter from './routes/matches';
import messageRouter from './routes/messages';
import profileRouter from './routes/profile';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Forkeep API is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/swipes', swipeRouter);
app.use('/api/matches', matchRouter);
app.use('/api/messages', messageRouter);
app.use('/api/profile', profileRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
