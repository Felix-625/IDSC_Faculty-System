# Faculty Management System

A web-based Faculty Management System developed to manage faculty information through a React frontend, an Express.js backend, and a PostgreSQL database.

## Technologies Used

- **Frontend:** React.js, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **API Documentation:** OpenAPI, Swagger UI
- **Version Control:** Git and GitHub

## Prerequisites

Install the following tools before running the project:

- [Node.js (LTS)](https://nodejs.org/)
- npm (included with Node.js)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads/)

Verify the installations:

```bash
node --version
npm --version
git --version
psql --version
```

## Getting Started

Follow these steps to run the project on your local computer.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

Replace the repository URL and folder name with the actual project details.

### 2. Set Up the PostgreSQL Database

Open PostgreSQL using pgAdmin or the `psql` command-line tool.

Create a database for the project:

```sql
CREATE DATABASE faculty_db;
```

Connect to the database and execute the project's database schema or migration files, if provided.

> Make sure the database tables and any required initial data are created before starting the application.

### 3. Configure the Backend

Navigate to the backend directory:

```bash
cd server
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file based on the provided `.env.example` file:

```bash
copy .env.example .env
```

Update the `.env` file with your local PostgreSQL credentials and backend configuration.

Example configuration (use the variable names required by the application):

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/faculty_db
```

Do not commit your `.env` file or share real database passwords.

Start the backend using the script defined in `server/package.json`, for example:

```bash
npm run dev
```

If the project does not provide a `dev` script, use the actual script configured in `package.json`.

### 4. Configure the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd <FRONTEND_DIRECTORY>
```

Install dependencies:

```bash
npm install
```

Configure the frontend API URL if required by the project. For Vite, frontend environment variables generally use the `VITE_` prefix.

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in the terminal, commonly:

```text
http://localhost:5173
```

### 5. Verify the Application

Confirm that:

- The PostgreSQL database is running.
- The Express backend starts without errors.
- The React + Vite frontend loads in the browser.
- The frontend can communicate with the backend.
- Faculty records can be retrieved and managed using the available features.

## API Documentation

If Swagger UI is configured, open:

```text
http://localhost:5000/docs
```

Health check endpoint:

```http
GET /api/v1/health
```

Expected response:

```json
{
  "status": "ok"
}
```

The API base path is:

```text
/api/v1
```

## Project Structure

The exact folder structure may vary depending on the implementation.

```text
faculty-api/
├── README.md
├── docs/
│   └── ADR-001-use-express.md
└── server/
    ├── app.js
    ├── server.js
    ├── openapi.yaml
    ├── routes/
    ├── services/
    └── data/
```

The React + Vite frontend may be located in a separate directory or repository. Update this section to reflect the actual structure.

## Troubleshooting

**PostgreSQL connection failed**
- Confirm that PostgreSQL is running.
- Check the database name, username, password, host, and port.
- Confirm that the database schema has been applied.

**Backend dependencies or scripts failed**
- Run `npm install` in the backend directory.
- Check the scripts in `package.json`.
- Verify that the required environment variables are configured.

**Frontend cannot connect to the API**
- Confirm that the backend is running.
- Check the frontend API URL and CORS configuration.
- Verify that the requested API endpoint exists.

**Port already in use**
- Stop the other application using the port or configure an available port.

## Security Notes

- Never commit `.env` files or database passwords.
- Keep `.env.example` free of real credentials.
- Do not commit `node_modules`.
- Use your own local database credentials.

## Contributors

Faculty Management System development team.
Sephanne Flor
Ser Mikayel Bidol
Jerald Pontigon
Felix Almero