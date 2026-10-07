
# QuizMaster

## Supabase setup

1. Create a Supabase project.
2. Open the Supabase SQL editor and run [`supabase/schema.sql`](./supabase/schema.sql) to create the quiz and attempt tables and their Row Level Security policies. If the tables already exist, rerun the updated script to replace the old public quiz-write policy with teacher-only management rules.
3. In Supabase **Authentication → Users**, create and confirm the teacher account with email `teacher@quizmaster.local` and the requested password. The app's teacher username `Teacher` signs in through this account; it does not store the password in browser code.
4. Copy `.env.example` to `.env.local` and set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_KEY` from the Supabase project API settings. The key should start with `sb_publishable_`. Do not commit `.env.local`. Restart the development server after changing environment variables.
5. Start the app with `npm start`.

Students can continue as guests, take quizzes, and save names to the leaderboard. Teachers sign in to access the quiz manager, where they can create, edit, and delete teacher-created quizzes. Quiz definitions, submissions (including answers and scores), and leaderboard names are stored in Supabase. Built-in category question sets are copied into Supabase the first time the categories page loads and are then launched from the database.

The supplied SQL policies allow public quiz reads, built-in quiz initialization, attempt creation, leaderboard reads, and naming an unnamed attempt. Only the confirmed teacher Auth account can create, update, or delete quizzes. The requested demo password is weak; change it before exposing the app publicly. The publishable key is public by design; never use a secret or service-role key in the browser.
