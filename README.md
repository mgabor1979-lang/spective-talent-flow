# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7b18c785-f101-419f-afe4-c039dd314091

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7b18c785-f101-419f-afe4-c039dd314091) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

# Step 5 (Optional): Start the email server and cron jobs
npm run dev:full  # Starts frontend, email API, and cron jobs
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run dev:api` - Start the email server only  
- `npm run dev:full` - Start everything (frontend + email API)
- `npm run build` - Build the project for production

## Vercel Cron Jobs

This project includes **Vercel Cron Jobs** for automated email processing:

- **Availability Email Reminders**: Runs daily at 6:00 AM UTC
- Processes pending availability reminder emails
- Automatically updates professional profiles when availability dates arrive
- **Serverless**: No additional infrastructure needed

For detailed deployment information, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

### Testing Cron Jobs

After deployment to Vercel, test the cron job manually:
```
https://your-app.vercel.app/api/test-cron
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7b18c785-f101-419f-afe4-c039dd314091) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
