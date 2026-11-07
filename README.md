# IT SUPPORT — Your Complete IT Troubleshooting Guide

A complete, open-access enterprise IT troubleshooting knowledge base, CLI command reference, networking calculator suite, interview preparation hub, career roadmap, and server-side Gemini AI diagnostic assistant (**IT SUPPORT AI**).

## Key Features
- **100% Public Access (Zero Login Walls)**: No signup, login, user accounts, or authentication barriers anywhere.
- **325 Unique Real-World IT Issues Across 25 Categories**: Every issue includes Title, Category, Error Code (where applicable), Short Description, Symptoms, Possible Causes, Step-by-Step Solution, Copyable CMD/PowerShell/Bash Commands, Safety Warnings, Expected Result, Prevention Tips, Difficulty Level, and Estimated Time.
- **Smart Search Engine**: Live autocomplete search across error codes (`0x80070005`), symptoms, commands (`ipconfig /flushdns`), categories, and difficulty levels.
- **IT SUPPORT AI (`/ai-assistant`)**: Powered by Google Gemini (`@google/genai` `gemini-3.8-flash`) via a secure server-side endpoint (`/api/ai/troubleshoot`) with IP rate limiting, structured diagnostic JSON output, safe command guardrails, and automatic offline Knowledge Base matching.
- **Interactive Networking Tools (`/networking-tools`)**: Real-time IPv4 Subnet Calculator, CIDR Prefix Calculator, Bidirectional Subnet Mask Converter, IP Classification Inspector, DNS Lookup Command Builder, Common Port Reference, OSI 7-Layer & TCP/IP Models, and Private vs Public IPv4 Guide.
- **IT Commands Library (`/commands`)**, **11-Track IT Interview Prep (`/interview-questions`)**, and **3-Phase IT Learning Roadmap (`/roadmap`)**.
- **SEO Ready**: Clean canonical URLs (`/issues/:slug`), dynamic meta descriptions, JSON-LD `TechArticle` / `WebApplication` structured data, `/robots.txt`, and dynamic `/sitemap.xml` covering all 343 pages.

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   APP_URL=http://localhost:3000
   ```
3. Run unit tests:
   ```bash
   npm test
   ```
4. Start the full-stack development server on port `3000`:
   ```bash
   npm run dev
   ```

---

## Deployment Workflow: Google AI Studio → GitHub → Vercel

1. **Export to GitHub** from Google AI Studio Build.
2. **Import Repository into Vercel**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Configure Vercel Environment Variables** (Project Settings → Environment Variables):
   - `GEMINI_API_KEY`: Your Google Gemini API key (keeps your key strictly server-side inside Vercel Serverless Function `/api/ai/troubleshoot.ts`).
   - `APP_URL`: Your production URL (e.g., `https://itsupport.yourdomain.com`).
4. **Deploy**: `vercel.json` automatically routes `/api/ai/troubleshoot` and `/sitemap.xml` to serverless handlers while serving all SPA client routes cleanly.
