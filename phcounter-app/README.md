# 🌿 pH Monitor — Eco-Enzyme IoT Dashboard

A web-based dashboard for monitoring pH levels of Eco-Enzyme production in real-time using IoT sensors.

---

## What It Does

- 📊 **Live pH Monitoring** — View real-time pH readings from connected IoT devices
- 🔔 **Early Warning Alerts** — Get notified when pH goes outside the safe production range
- 📦 **Batch Management** — Track and manage multiple production batches
- 👤 **User Accounts** — Register, login, and manage your profile securely

---

## How to Run

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** — Create a `.env.local` file and fill in your database and API keys

3. **Start the app**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Tech Stack

- **Next.js** — Web framework
- **MongoDB** — Database for storing pH data and user info
- **IoT Sensor** — Hardware device that sends pH readings to the dashboard
