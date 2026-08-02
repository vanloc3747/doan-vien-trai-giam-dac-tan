import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { membersRouter } from './routes/members.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { chaptersRouter } from './routes/chapters.routes';
import { departmentsRouter } from './routes/departments.routes';
import { roleTitlesRouter } from './routes/role-titles.routes';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { appSettingsRouter } from './routes/app-settings.routes';
import { commendationsRouter } from './routes/member-commendations.routes';
import { calendarNotesRouter } from './routes/calendar-notes.routes';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/members', requireAuth, membersRouter);
app.use('/api/dashboard', requireAuth, dashboardRouter);
app.use('/api/chapters', requireAuth, chaptersRouter);
app.use('/api/departments', requireAuth, departmentsRouter);
app.use('/api/role-titles', requireAuth, roleTitlesRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/app-settings', requireAuth, appSettingsRouter);
app.use('/api/commendations', requireAuth, commendationsRouter);
app.use('/api/calendar-notes', requireAuth, calendarNotesRouter);

app.use(errorHandler);

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
