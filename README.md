# SmartPoll (MERN) — Real‑time Polls

## Project Description
SmartPoll is a full‑stack polling platform that solves a common problem: collecting structured opinions quickly and transparently.

Participants can vote using a simple link (access code), while poll creators manage polls from a protected dashboard.

## How it works
- **Create & share**: Authenticated users create a poll and receive an access code (`/poll/:code`).
- **Vote submission**: Users (including guests if enabled) submit answers; the backend validates mandatory questions and stores votes.
- **Live analytics**: After each vote, the server recalculates totals and broadcasts updates via **Socket.IO** (`analytics-update`).
- **Analytics view**: Clients fetch aggregated results using `GET /api/analytics/:pollId` and update in real time.


---

## Features

- **Create polls** with questions and options
- **Share via access code** (`/poll/:code`)
- **Mandatory questions** enforcement on vote submit
- **Anonymous voting** support (toggle per poll)
- **Authenticated dashboard** for managing polls
- **JWT auth + refresh token** (access token in `Authorization`, refresh token in `httpOnly` cookie)
- **Live results** using **Socket.IO** (`analytics-update` events)
- **Analytics endpoint** to fetch aggregated vote counts
- **Poll expiry job** (background worker marks polls expired)

---

## Tech Stack

### Frontend
- React + Vite
- React Router
- TailwindCSS
- Axios (with automatic refresh on `401`)
- Socket.IO client (see `client/src/lib/socket.js`)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT auth utilities
- Background job for poll expiry

---

## Project Structure

- `client/` — React frontend
- `server/` — Express + Socket.IO backend
- `server/src/modules/`
  - `auth/` — authentication & user model
  - `poll/` — poll CRUD & expiry/close logic
  - `response/` — submitting votes
  - `analytics/` — aggregated analytics (counts per option)

---

## Environment Variables

### Server
Create `server/.env` from `server/env.example`.

> Note: exact variable names depend on your `env.example` file.

Typical variables include:
- `PORT`
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV`

### Client
Create a `.env` in `client/` with:
- `VITE_API_URL` — backend base URL (e.g. `http://localhost:5000/api`)
- `VITE_SOCKET_URL` — socket server URL

---

## Installation

### 1) Backend
```bash
cd server
npm install
```

### 2) Frontend
```bash
cd ../client
npm install
```

---

## Run Locally

### Start MongoDB
Make sure MongoDB is running (local or via Docker).

### Backend
```bash
cd server
npm run dev
```

### Frontend
In another terminal:
```bash
cd client
npm run dev
```

Open the frontend URL shown by Vite (commonly `http://localhost:3000`).

---

## API Overview

All backend routes are mounted under `/api`.

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Auth behavior:
- **Access token**: returned in response body and attached by the client as `Authorization: Bearer <token>`.
- **Refresh token**: stored in an **httpOnly cookie**.

### Poll
- `GET /api/poll/:code`
  - Fetch poll by access code
  - Rejects if poll is expired
- `POST /api/poll`
- `GET /api/poll/my`
- `GET /api/poll/edit/:id`
- `PUT /api/poll/:id`
- `PATCH /api/poll/:id/close`
- `DELETE /api/poll/:id`

### Responses (Voting)
- `POST /api/response/:pollId`
  - Uses **optional authentication**
  - Allows anonymous voting
  - Validates mandatory questions
  - Normalizes payload into the stored response schema

### Analytics
- `GET /api/analytics/:pollId`
  - Aggregates votes per question and per option

---

## Realtime Analytics (Socket.IO)

After a successful vote submission:

- Backend emits to Socket.IO room named by `pollId`:
  - event: `analytics-update`
  - payload: `{ pollId, totalResponses }`

The frontend subscribes and updates analytics/live UI.

Room joining is handled via:
- `socket.emit('join-poll', pollId)`

---

## Voting Data Shape (Client → Server)

Frontend submits:

```js
{
  guestName: null | string,
  answers: [
    {
      questionId: "<questionId>",
      selectedOptions: ["<option>"]
    }
  ]
}
```

Backend stores:

```js
answers: [
  {
    questionId: "<questionId>",
    selectedOption: "<option>"
  }
]
```

---

## Deployment (Vercel)

- Frontend can be deployed to Vercel.
- Backend should be deployed as a separate Node service (or on a compatible platform).
- `server/server.js` includes Socket.IO CORS configuration for the production frontend origin.

Environment variables must be configured in both client and server deployments:
- `VITE_API_URL`
- `VITE_SOCKET_URL`
- server JWT and Mongo variables

---

## Troubleshooting

### CORS / Socket issues
- Ensure `VITE_SOCKET_URL` matches the socket server URL.
- If using Vercel/production domains, update Socket.IO CORS origin accordingly.

### `401` after refresh
- The client uses an Axios interceptor to refresh access tokens.
- Confirm refresh endpoint works and cookie is correctly set.

### Poll expired errors
- Backend checks `poll.expiresAt` both when fetching by code and when submitting responses.

---

## License

MIT (or replace with your preferred license). 

