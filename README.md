# HireAI — AI-Powered Interview Platform

An end-to-end AI interview system built with React + Claude API.

## Features

- 📄 **Resume Upload** — PDF, TXT, DOCX supported
- 🎯 **JD Matching** — Claude analyzes resume vs job description (ATS-style)
- 🤖 **Live AI Interview** — Text-to-speech questions, speech recognition answers
- 📊 **Smart Evaluation** — Per-question scoring, SHORTLISTED/REJECTED verdict
- ⬇️ **Downloadable Report** — Full interview transcript with AI feedback

## Tech Stack

- React 18 + Vite
- Claude claude-sonnet-4-6 via Anthropic API
- Web Speech API (SpeechSynthesis + SpeechRecognition)
- No external UI libraries

## Setup

```bash
npm install
npm run dev
```

> Speech recognition works best in **Google Chrome**.

## How It Works

1. Upload resume → paste job description
2. Claude scores the match (0–100%) and lists matched/missing skills
3. If score passes threshold → AI interview begins
4. Claude generates 5 tailored questions based on resume + JD
5. AI speaks each question via TTS; mic auto-records your answer (15s each)
6. Claude evaluates all answers → gives SHORTLISTED or REJECTED verdict

## API

Uses `https://api.anthropic.com/v1/messages` with `claude-sonnet-4-6`.
The API key is injected at runtime by the Claude.ai artifact environment.

## Deploy

```bash
npm run build
# deploy /dist to Netlify, Vercel, or any static host
```
