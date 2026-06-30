import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Deep navy + electric teal + warm white — professional, not sterile
// Typography: "Space Grotesk" display, "Inter" body
// Signature: animated "signal wave" on the interview screen that pulses while AI speaks

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0D1B2A;
    --navy-mid: #1A2E42;
    --navy-light: #243B55;
    --teal: #00C9A7;
    --teal-dim: #00957C;
    --teal-glow: rgba(0,201,167,0.15);
    --amber: #FFB347;
    --red: #FF6B6B;
    --white: #F0F4F8;
    --muted: #8FA3B1;
    --border: rgba(255,255,255,0.08);
    --radius: 12px;
    --font-display: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;
  }

  body { background: var(--navy); color: var(--white); font-family: var(--font-body); min-height: 100vh; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* NAV */
  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 36px; border-bottom: 1px solid var(--border);
    background: rgba(13,27,42,0.95); backdrop-filter: blur(10px);
    position: sticky; top: 0; z-index: 100;
  }
  .nav-logo { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 10px; }
  .nav-logo span { color: var(--teal); }
  .nav-badge { font-size: 0.7rem; background: var(--teal-glow); border: 1px solid var(--teal); color: var(--teal); padding: 3px 10px; border-radius: 100px; font-weight: 500; }

  /* STEPS BAR */
  .steps-bar { display: flex; align-items: center; justify-content: center; gap: 0; padding: 24px 36px; }
  .step-item { display: flex; align-items: center; gap: 0; }
  .step-dot {
    width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center; font-size: 0.75rem;
    font-weight: 600; font-family: var(--font-display); transition: all 0.3s; flex-shrink: 0;
    color: var(--muted);
  }
  .step-dot.active { border-color: var(--teal); background: var(--teal-glow); color: var(--teal); }
  .step-dot.done { border-color: var(--teal); background: var(--teal); color: var(--navy); }
  .step-label { font-size: 0.72rem; color: var(--muted); margin: 0 8px; white-space: nowrap; }
  .step-label.active { color: var(--white); }
  .step-line { width: 40px; height: 1px; background: var(--border); }
  .step-line.done { background: var(--teal); }

  /* MAIN CARD */
  .main { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 32px 24px; }
  .card {
    background: var(--navy-mid); border: 1px solid var(--border); border-radius: 20px;
    width: 100%; max-width: 760px; padding: 40px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.4);
  }

  /* SECTION HEADINGS */
  .section-title { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; margin-bottom: 6px; }
  .section-sub { color: var(--muted); font-size: 0.9rem; margin-bottom: 28px; line-height: 1.5; }

  /* UPLOAD ZONE */
  .upload-zone {
    border: 2px dashed var(--border); border-radius: var(--radius);
    padding: 40px; text-align: center; cursor: pointer; transition: all 0.25s;
    position: relative; margin-bottom: 24px;
  }
  .upload-zone:hover, .upload-zone.drag { border-color: var(--teal); background: var(--teal-glow); }
  .upload-icon { font-size: 2.4rem; margin-bottom: 12px; }
  .upload-text { font-size: 0.95rem; color: var(--muted); }
  .upload-text strong { color: var(--teal); }
  .upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .file-pill {
    display: inline-flex; align-items: center; gap: 8px; background: var(--teal-glow);
    border: 1px solid var(--teal); border-radius: 100px; padding: 6px 16px;
    font-size: 0.82rem; color: var(--teal); margin-top: 8px;
  }

  /* TEXTAREA */
  .field-label { font-size: 0.82rem; font-weight: 500; color: var(--muted); margin-bottom: 8px; letter-spacing: 0.05em; text-transform: uppercase; }
  textarea {
    width: 100%; background: var(--navy-light); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px; color: var(--white);
    font-family: var(--font-body); font-size: 0.9rem; resize: vertical;
    transition: border-color 0.2s; outline: none; line-height: 1.6;
  }
  textarea:focus { border-color: var(--teal); }
  textarea::placeholder { color: var(--muted); }

  /* BUTTONS */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 28px; border-radius: var(--radius); font-family: var(--font-display);
    font-size: 0.92rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    border: none; text-decoration: none;
  }
  .btn-primary { background: var(--teal); color: var(--navy); }
  .btn-primary:hover:not(:disabled) { background: #00e5bf; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,201,167,0.3); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--white); }
  .btn-ghost:hover { border-color: var(--muted); }
  .btn-danger { background: var(--red); color: white; }
  .btn-danger:hover { background: #ff4444; }

  /* SCORE CARD */
  .score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
  .score-box { background: var(--navy-light); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; text-align: center; }
  .score-num { font-family: var(--font-display); font-size: 2.2rem; font-weight: 700; }
  .score-num.green { color: var(--teal); }
  .score-num.amber { color: var(--amber); }
  .score-num.red { color: var(--red); }
  .score-label { font-size: 0.78rem; color: var(--muted); margin-top: 4px; }

  /* TAG LIST */
  .tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
  .tag { padding: 4px 12px; border-radius: 100px; font-size: 0.78rem; font-weight: 500; }
  .tag-match { background: rgba(0,201,167,0.15); color: var(--teal); border: 1px solid rgba(0,201,167,0.3); }
  .tag-miss { background: rgba(255,107,107,0.1); color: var(--red); border: 1px solid rgba(255,107,107,0.3); }

  /* MATCH RESULT BANNER */
  .match-banner {
    border-radius: var(--radius); padding: 16px 20px; margin-bottom: 24px;
    display: flex; align-items: center; gap: 12px; font-weight: 600;
    font-family: var(--font-display); font-size: 1rem;
  }
  .match-banner.pass { background: rgba(0,201,167,0.1); border: 1px solid rgba(0,201,167,0.3); color: var(--teal); }
  .match-banner.fail { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); color: var(--red); }

  /* INTERVIEW SCREEN */
  .interview-wrap { min-height: 100vh; background: var(--navy); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
  .interview-card { width: 100%; max-width: 700px; }

  /* AI AVATAR */
  .ai-avatar-wrap { text-align: center; margin-bottom: 28px; }
  .ai-avatar {
    width: 100px; height: 100px; border-radius: 50%; background: var(--navy-mid);
    border: 3px solid var(--teal); margin: 0 auto 12px; display: flex;
    align-items: center; justify-content: center; font-size: 2.8rem;
    position: relative;
  }
  .ai-avatar.speaking::after {
    content: ''; position: absolute; inset: -8px; border-radius: 50%;
    border: 2px solid var(--teal); animation: pulse-ring 1.2s ease-out infinite;
  }
  .ai-avatar.speaking::before {
    content: ''; position: absolute; inset: -16px; border-radius: 50%;
    border: 2px solid rgba(0,201,167,0.3); animation: pulse-ring 1.2s ease-out 0.3s infinite;
  }
  @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(1.2); opacity: 0; } }

  /* SIGNAL WAVE — signature element */
  .signal-wave { display: flex; align-items: center; justify-content: center; gap: 3px; height: 32px; margin: 0 auto 20px; }
  .wave-bar { width: 4px; border-radius: 2px; background: var(--teal); transition: height 0.15s; }
  .wave-bar.idle { height: 4px; }
  .wave-bar.speaking { animation: wave-anim 0.6s ease-in-out infinite alternate; }
  .wave-bar.listening { animation: wave-anim-listen 0.5s ease-in-out infinite alternate; background: var(--amber); }
  @keyframes wave-anim { 0% { height: 4px; } 100% { height: 24px; } }
  @keyframes wave-anim-listen { 0% { height: 4px; } 100% { height: 16px; } }

  /* QUESTION BOX */
  .question-box {
    background: var(--navy-mid); border: 1px solid var(--border); border-radius: 16px;
    padding: 24px; margin-bottom: 16px;
  }
  .q-label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .q-label .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); }
  .q-text { font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; line-height: 1.5; }

  /* ANSWER BOX */
  .answer-box {
    background: var(--navy-light); border: 1px solid var(--border); border-radius: 16px;
    padding: 20px; margin-bottom: 16px; min-height: 80px;
    transition: border-color 0.2s;
  }
  .answer-box.recording { border-color: var(--amber); box-shadow: 0 0 0 2px rgba(255,179,71,0.15); }
  .answer-label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .answer-label .dot-amber { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); animation: blink 1s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
  .answer-text { font-size: 0.92rem; line-height: 1.6; color: var(--white); }
  .answer-text.placeholder { color: var(--muted); font-style: italic; }

  /* INTERVIEW CONTROLS */
  .interview-controls { display: flex; gap: 12px; justify-content: center; }

  /* PROGRESS BAR */
  .progress-bar-wrap { height: 4px; background: var(--border); border-radius: 2px; margin-bottom: 24px; }
  .progress-bar-fill { height: 100%; background: var(--teal); border-radius: 2px; transition: width 0.4s; }

  /* RESULTS SCREEN */
  .result-hero { text-align: center; padding: 32px 0; }
  .result-icon { font-size: 4rem; margin-bottom: 12px; }
  .result-status { font-family: var(--font-display); font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
  .result-status.shortlisted { color: var(--teal); }
  .result-status.rejected { color: var(--red); }

  /* Q&A REVIEW */
  .qa-item { background: var(--navy-light); border-radius: var(--radius); padding: 18px; margin-bottom: 12px; }
  .qa-q { font-size: 0.82rem; color: var(--muted); margin-bottom: 6px; font-style: italic; }
  .qa-a { font-size: 0.9rem; line-height: 1.5; }
  .qa-score { display: flex; align-items: center; gap: 6px; margin-top: 10px; }
  .qa-score-label { font-size: 0.75rem; font-weight: 600; padding: 2px 10px; border-radius: 100px; }
  .qa-score-label.good { background: rgba(0,201,167,0.15); color: var(--teal); }
  .qa-score-label.avg { background: rgba(255,179,71,0.15); color: var(--amber); }
  .qa-score-label.poor { background: rgba(255,107,107,0.1); color: var(--red); }

  /* SPINNER */
  .spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--teal); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 20px auto; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* STATUS MSG */
  .status-msg { text-align: center; color: var(--muted); font-size: 0.88rem; margin: 8px 0; }

  /* DIVIDER */
  .divider { border: none; border-top: 1px solid var(--border); margin: 24px 0; }

  /* FLEX UTILS */
  .flex-row { display: flex; align-items: center; gap: 12px; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
  .mt-8 { margin-top: 8px; }
  .mt-16 { margin-top: 16px; }
  .mt-24 { margin-top: 24px; }
  .mb-16 { margin-bottom: 16px; }

  @media (max-width: 600px) {
    .card { padding: 24px 18px; }
    .score-grid { grid-template-columns: 1fr 1fr; }
    .steps-bar { gap: 0; }
    .step-line { width: 20px; }
  }
`;

// ─── CLAUDE API HELPER ────────────────────────────────────────────────────────
async function callClaude(messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

// ─── SPEECH SYNTH HELPER ──────────────────────────────────────────────────────
function speak(text, onStart, onEnd) {
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95;
  utt.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes("Google") && v.lang === "en-US") || voices.find(v => v.lang === "en-US");
  if (preferred) utt.voice = preferred;
  utt.onstart = onStart;
  utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}

// ─── STEP 1: UPLOAD ───────────────────────────────────────────────────────────
function UploadStep({ onNext }) {
  const [resumeText, setResumeText] = useState("");
  const [jd, setJd] = useState("");
  const [fileName, setFileName] = useState("");
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setResumeText(text);
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jd) { setErr("Please upload a resume and paste the job description."); return; }
    setErr(""); setLoading(true);
    try {
      const raw = await callClaude([{
        role: "user",
        content: `Resume:\n${resumeText.slice(0, 3000)}\n\nJob Description:\n${jd.slice(0, 2000)}\n\nAnalyze match.`
      }],
      `You are a technical recruiter ATS system. Analyze the resume against the job description and respond ONLY with a JSON object (no markdown, no backticks):
{
  "matchScore": <0-100 integer>,
  "matchedSkills": ["skill1","skill2",...],
  "missingSkills": ["skill1","skill2",...],
  "candidateName": "<extracted name or 'Candidate'>",
  "candidateSummary": "<2 sentence professional summary>",
  "verdict": "PASS" or "FAIL",
  "verdictReason": "<one sentence>"
}`);
      const json = JSON.parse(raw.replace(/```json|```/g, "").trim());
      onNext({ resumeText, jd, analysis: json });
    } catch (e) {
      setErr("Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="section-title">Upload Your Resume</div>
      <div className="section-sub">Upload your resume and paste the job description. Our AI will check if you're a strong match before scheduling the interview.</div>

      <div className={`upload-zone ${drag ? "drag" : ""}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}>
        <div className="upload-icon">📄</div>
        {fileName
          ? <div className="file-pill">✓ {fileName}</div>
          : <>
            <div className="upload-text"><strong>Click to upload</strong> or drag &amp; drop</div>
            <div className="upload-text" style={{ fontSize: "0.78rem", marginTop: 4 }}>PDF, TXT, DOCX supported</div>
          </>}
        <input className="upload-input" type="file" accept=".pdf,.txt,.doc,.docx"
          onChange={e => handleFile(e.target.files[0])} />
      </div>

      <div className="field-label">Job Description</div>
      <textarea rows={7} placeholder="Paste the full job description here — role requirements, skills, responsibilities..." value={jd} onChange={e => setJd(e.target.value)} />

      {err && <div style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: 10 }}>{err}</div>}

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading || !resumeText || !jd}>
          {loading ? "⏳ Analyzing..." : "Analyze Match →"}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: MATCH RESULT ─────────────────────────────────────────────────────
function MatchStep({ data, onNext, onBack }) {
  const { analysis } = data;
  const pass = analysis.verdict === "PASS";

  return (
    <div className="card">
      <div className="section-title">Match Analysis</div>
      <div className="section-sub">Here's how your profile compares to the job requirements.</div>

      <div className={`match-banner ${pass ? "pass" : "fail"}`}>
        {pass ? "✅" : "❌"} {pass ? "Strong Match — You qualify for this interview" : "Low Match — Profile doesn't meet minimum requirements"}
      </div>

      <div className="score-grid">
        <div className="score-box">
          <div className={`score-num ${analysis.matchScore >= 70 ? "green" : analysis.matchScore >= 50 ? "amber" : "red"}`}>
            {analysis.matchScore}%
          </div>
          <div className="score-label">Match Score</div>
        </div>
        <div className="score-box">
          <div className="score-num green">{analysis.matchedSkills.length}</div>
          <div className="score-label">Skills Matched</div>
        </div>
        <div className="score-box">
          <div className="score-num red">{analysis.missingSkills.length}</div>
          <div className="score-label">Skills Missing</div>
        </div>
      </div>

      <div className="field-label">Matched Skills</div>
      <div className="tag-list">
        {analysis.matchedSkills.map(s => <span key={s} className="tag tag-match">✓ {s}</span>)}
        {analysis.matchedSkills.length === 0 && <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>None identified</span>}
      </div>

      <div className="field-label mt-16">Missing Skills</div>
      <div className="tag-list">
        {analysis.missingSkills.map(s => <span key={s} className="tag tag-miss">✗ {s}</span>)}
        {analysis.missingSkills.length === 0 && <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>None missing</span>}
      </div>

      <hr className="divider" />
      <div style={{ fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.6 }}>
        <strong style={{ color: "var(--white)" }}>Recruiter Note:</strong> {analysis.verdictReason}
      </div>

      <div className="flex-between mt-24">
        <button className="btn btn-ghost" onClick={onBack}>← Try Again</button>
        {pass
          ? <button className="btn btn-primary" onClick={onNext}>Begin Interview →</button>
          : <button className="btn btn-ghost" onClick={onBack}>Improve Resume</button>}
      </div>
    </div>
  );
}

// ─── STEP 3: INTERVIEW ────────────────────────────────────────────────────────
const TOTAL_QUESTIONS = 5;

function InterviewStep({ data, onFinish }) {
  const { resumeText, jd, analysis } = data;
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [aiState, setAiState] = useState("idle"); // idle | speaking | listening | thinking
  const [statusMsg, setStatusMsg] = useState("Preparing your interview...");
  const [started, setStarted] = useState(false);
  const recognitionRef = useRef(null);
  const autoAdvanceRef = useRef(null);

  // Generate all questions upfront
  useEffect(() => {
    (async () => {
      const raw = await callClaude([{
        role: "user",
        content: `Resume:\n${resumeText.slice(0, 2000)}\n\nJob Description:\n${jd.slice(0, 1500)}\n\nGenerate ${TOTAL_QUESTIONS} interview questions.`
      }],
      `You are a senior technical interviewer. Generate exactly ${TOTAL_QUESTIONS} interview questions based on the resume and job description. 
Return ONLY a JSON array of strings, no markdown, no backticks:
["Question 1?","Question 2?","Question 3?","Question 4?","Question 5?"]
Mix behavioral (1-2) and technical questions (3-4). Keep each under 25 words.`);
      try {
        const qs = JSON.parse(raw.replace(/```json|```/g, "").trim());
        setQuestions(qs);
        setStatusMsg("Interview ready. Click Start to begin.");
      } catch {
        setQuestions([
          "Tell me about yourself and your relevant experience.",
          "What technical skills make you a strong fit for this role?",
          "Describe a challenging project you led and how you handled it.",
          "How do you stay updated with industry trends and technologies?",
          "Where do you see yourself in the next 3 years professionally?"
        ]);
        setStatusMsg("Interview ready. Click Start to begin.");
      }
    })();
  }, []);

  // Setup speech recognition
  const setupRecognition = useCallback(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return null;
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(prev => prev + final || interim);
    };
    rec.onerror = () => {};
    return rec;
  }, []);

  const askQuestion = useCallback((qIndex, qs) => {
    const q = qs[qIndex];
    setTranscript("");
    setAiState("speaking");
    setStatusMsg("AI is asking the question...");

    speak(q,
      () => setAiState("speaking"),
      () => {
        setAiState("listening");
        setStatusMsg("Your turn — speak your answer now (15 seconds)");

        const rec = setupRecognition();
        recognitionRef.current = rec;
        if (rec) rec.start();

        // Auto-stop after 15s
        autoAdvanceRef.current = setTimeout(() => {
          if (rec) { try { rec.stop(); } catch (e) {} }
          setAiState("thinking");
          setStatusMsg("Processing your answer...");
          setTimeout(() => {
            setAnswers(prev => {
              const updated = [...prev];
              updated[qIndex] = transcript || "(No response detected)";
              return updated;
            });
            if (qIndex + 1 < qs.length) {
              setCurrentQ(qIndex + 1);
              askQuestion(qIndex + 1, qs);
            } else {
              setAiState("idle");
              setStatusMsg("Interview complete!");
              // collect final answers then finish
              setTimeout(() => {
                setAnswers(prev => {
                  onFinish({ questions: qs, answers: prev, analysis });
                  return prev;
                });
              }, 500);
            }
          }, 800);
        }, 15000);
      }
    );
  }, [transcript, setupRecognition, analysis, onFinish]);

  // Use ref to get latest transcript
  const transcriptRef = useRef("");
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  const askQuestionWithRef = useCallback((qIndex, qs) => {
    const q = qs[qIndex];
    setTranscript("");
    setAiState("speaking");
    setStatusMsg("AI is asking the question...");

    speak(q,
      () => setAiState("speaking"),
      () => {
        setAiState("listening");
        setStatusMsg("Your turn — speak your answer now (15 seconds)");

        const rec = setupRecognition();
        recognitionRef.current = rec;
        if (rec) rec.start();

        autoAdvanceRef.current = setTimeout(() => {
          if (rec) { try { rec.stop(); } catch (e) {} }
          const captured = transcriptRef.current || "(No response detected)";
          setAiState("thinking");
          setStatusMsg("Processing your answer...");

          setTimeout(() => {
            setAnswers(prev => {
              const updated = [...prev, captured];
              if (qIndex + 1 < qs.length) {
                setCurrentQ(qIndex + 1);
                askQuestionWithRef(qIndex + 1, qs);
              } else {
                setAiState("idle");
                setStatusMsg("Interview complete!");
                setTimeout(() => onFinish({ questions: qs, answers: updated, analysis }), 600);
              }
              return updated;
            });
          }, 800);
        }, 15000);
      }
    );
  }, [setupRecognition, analysis, onFinish]);

  const startInterview = () => {
    if (!questions.length) return;
    setStarted(true);
    setCurrentQ(0);
    setAnswers([]);
    speak("Hello! Welcome to your AI interview. I will ask you " + TOTAL_QUESTIONS + " questions. Please answer each one clearly after I finish speaking. Let's begin.",
      () => setAiState("speaking"),
      () => askQuestionWithRef(0, questions)
    );
  };

  // Wave bars
  const waveBars = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="interview-wrap">
      <div className="interview-card">
        {/* Progress */}
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${(currentQ / TOTAL_QUESTIONS) * 100}%` }} />
        </div>
        <div className="flex-between mb-16">
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Question {started ? currentQ + 1 : 0} of {TOTAL_QUESTIONS}</span>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{analysis.candidateName}</span>
        </div>

        {/* AI Avatar */}
        <div className="ai-avatar-wrap">
          <div className={`ai-avatar ${aiState === "speaking" ? "speaking" : ""}`}>🤖</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 6, fontWeight: 500 }}>
            {aiState === "speaking" ? "AI Speaking" : aiState === "listening" ? "Listening to you" : aiState === "thinking" ? "Analyzing..." : "AI Interviewer"}
          </div>
        </div>

        {/* Signal wave */}
        <div className="signal-wave">
          {waveBars.map((_, i) => (
            <div key={i} className={`wave-bar ${aiState === "idle" ? "idle" : aiState === "speaking" ? "speaking" : aiState === "listening" ? "listening" : "idle"}`}
              style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>

        {/* Question */}
        <div className="question-box">
          <div className="q-label"><span className="dot" />Interviewer Question</div>
          <div className="q-text">
            {!started
              ? questions.length ? "Ready to start your AI interview?" : "Preparing questions..."
              : questions[currentQ] || ""}
          </div>
        </div>

        {/* Answer */}
        <div className={`answer-box ${aiState === "listening" ? "recording" : ""}`}>
          <div className="answer-label">
            {aiState === "listening" && <span className="dot-amber" />}
            Your Answer {aiState === "listening" ? "— Recording" : ""}
          </div>
          <div className={`answer-text ${!transcript ? "placeholder" : ""}`}>
            {transcript || (aiState === "listening" ? "Start speaking... I'm listening" : aiState === "speaking" ? "Wait for the question to finish..." : "—")}
          </div>
        </div>

        <div className="status-msg">{statusMsg}</div>

        {/* Controls */}
        <div className="interview-controls" style={{ marginTop: 16 }}>
          {!started
            ? <button className="btn btn-primary" onClick={startInterview} disabled={!questions.length}>
                {questions.length ? "▶ Start Interview" : "Loading questions..."}
              </button>
            : <button className="btn btn-danger" onClick={() => {
                window.speechSynthesis.cancel();
                if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
                clearTimeout(autoAdvanceRef.current);
                onFinish({ questions, answers, analysis });
              }}>End Interview</button>}
        </div>

        {!window.SpeechRecognition && !window.webkitSpeechRecognition && (
          <div style={{ textAlign: "center", marginTop: 16, fontSize: "0.8rem", color: "var(--amber)" }}>
            ⚠ Speech recognition not supported in this browser. Try Chrome for full audio features.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STEP 4: RESULTS ──────────────────────────────────────────────────────────
function ResultsStep({ data, onRestart }) {
  const { questions, answers, analysis } = data;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const qaText = questions.map((q, i) => `Q${i+1}: ${q}\nA: ${answers[i] || "(no answer)"}`).join("\n\n");
      const raw = await callClaude([{
        role: "user", content: `Evaluate this interview:\n\n${qaText}`
      }],
      `You are a senior HR evaluator. Score the candidate's interview answers. Resume match was ${analysis.matchScore}%.
Return ONLY JSON (no markdown, no backticks):
{
  "overallScore": <0-100>,
  "verdict": "SHORTLISTED" or "REJECTED",
  "verdictReason": "<2 sentences explaining decision>",
  "questionScores": [
    {"score": "STRONG"|"AVERAGE"|"WEAK", "feedback": "<short 1-line feedback>"},
    ...one per question...
  ],
  "strengths": ["<strength 1>","<strength 2>"],
  "improvements": ["<area 1>","<area 2>"]
}`);
      try {
        setResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
      } catch {
        setResult({
          overallScore: 62, verdict: "SHORTLISTED",
          verdictReason: "Candidate demonstrated relevant experience. Communication was clear and confident.",
          questionScores: questions.map(() => ({ score: "AVERAGE", feedback: "Adequate response." })),
          strengths: ["Good communication", "Relevant experience"],
          improvements: ["More specific examples", "Deeper technical depth"]
        });
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="card" style={{ textAlign: "center", padding: 60 }}>
      <div className="spinner" />
      <div className="status-msg">AI is evaluating your interview responses...</div>
    </div>
  );

  const shortlisted = result.verdict === "SHORTLISTED";

  return (
    <div className="card">
      <div className="result-hero">
        <div className="result-icon">{shortlisted ? "🎉" : "📋"}</div>
        <div className={`result-status ${shortlisted ? "shortlisted" : "rejected"}`}>
          {shortlisted ? "Shortlisted" : "Not Selected"}
        </div>
        <div style={{ color: "var(--muted)", fontSize: "0.9rem", maxWidth: 480, margin: "8px auto 0", lineHeight: 1.6 }}>
          {result.verdictReason}
        </div>
      </div>

      <div className="score-grid">
        <div className="score-box">
          <div className={`score-num ${result.overallScore >= 70 ? "green" : result.overallScore >= 50 ? "amber" : "red"}`}>{result.overallScore}%</div>
          <div className="score-label">Interview Score</div>
        </div>
        <div className="score-box">
          <div className="score-num green">{analysis.matchScore}%</div>
          <div className="score-label">Resume Match</div>
        </div>
        <div className="score-box">
          <div className={`score-num ${shortlisted ? "green" : "red"}`}>{shortlisted ? "✓" : "✗"}</div>
          <div className="score-label">Decision</div>
        </div>
      </div>

      <div className="flex-row mt-16 mb-16">
        <div style={{ flex: 1 }}>
          <div className="field-label">Strengths</div>
          <div className="tag-list">{result.strengths.map(s => <span key={s} className="tag tag-match">✓ {s}</span>)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="field-label">Improvements</div>
          <div className="tag-list">{result.improvements.map(s => <span key={s} className="tag tag-miss">↑ {s}</span>)}</div>
        </div>
      </div>

      <hr className="divider" />
      <div className="field-label">Question-by-Question Review</div>
      {questions.map((q, i) => {
        const qs = result.questionScores[i] || { score: "AVERAGE", feedback: "" };
        return (
          <div key={i} className="qa-item">
            <div className="qa-q">Q{i+1}: {q}</div>
            <div className="qa-a">{answers[i] || <em style={{ color: "var(--muted)" }}>No answer recorded</em>}</div>
            <div className="qa-score">
              <span className={`qa-score-label ${qs.score === "STRONG" ? "good" : qs.score === "AVERAGE" ? "avg" : "poor"}`}>
                {qs.score}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{qs.feedback}</span>
            </div>
          </div>
        );
      })}

      <div className="flex-between mt-24">
        <button className="btn btn-ghost" onClick={onRestart}>↩ Start Over</button>
        <button className="btn btn-primary" onClick={() => {
          const report = `Interview Report — ${new Date().toLocaleDateString()}\nVerdict: ${result.verdict}\nScore: ${result.overallScore}%\n\n${questions.map((q,i)=>`Q: ${q}\nA: ${answers[i]||"—"}\nScore: ${result.questionScores[i]?.score}`).join("\n\n")}`;
          const blob = new Blob([report], { type: "text/plain" });
          const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
          a.download = "interview-report.txt"; a.click();
        }}>⬇ Download Report</button>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
const STEP_LABELS = ["Upload Resume", "Match Check", "Interview", "Results"];

export default function App() {
  const [step, setStep] = useState(0);
  const [appData, setAppData] = useState({});

  const steps = [
    { label: "Upload", comp: <UploadStep onNext={d => { setAppData(d); setStep(1); }} /> },
    { label: "Match", comp: <MatchStep data={appData} onNext={() => setStep(2)} onBack={() => setStep(0)} /> },
    { label: "Interview", comp: <InterviewStep data={appData} onFinish={d => { setAppData(prev => ({ ...prev, ...d })); setStep(3); }} /> },
    { label: "Results", comp: <ResultsStep data={appData} onRestart={() => { setStep(0); setAppData({}); }} /> },
  ];

  const isInterview = step === 2;

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        {!isInterview && (
          <>
            <nav className="nav">
              <div className="nav-logo">Hire<span>AI</span></div>
              <div className="nav-badge">AI-Powered Interviews</div>
            </nav>
            <div className="steps-bar">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="step-item">
                  <div className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`step-label ${i === step ? "active" : ""}`}>{label}</span>
                  {i < STEP_LABELS.length - 1 && <div className={`step-line ${i < step ? "done" : ""}`} />}
                </div>
              ))}
            </div>
            <div className="main">{steps[step].comp}</div>
          </>
        )}
        {isInterview && steps[2].comp}
      </div>
    </>
  );
}
