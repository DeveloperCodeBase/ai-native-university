/**
 * AI Native University — Client-Side SPA
 * Hash-based routing, API integration, dynamic rendering.
 */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const navLinks = document.querySelectorAll(".nav-link");
  const navToggle = document.getElementById("nav-toggle");
  const navLinksContainer = document.getElementById("nav-links");

  // --- Mobile nav toggle ---
  navToggle.addEventListener("click", () => {
    navLinksContainer.classList.toggle("open");
  });

  // --- API Helper ---
  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    return res.json();
  }

  // --- Markdown Renderer ---
  function md(text) {
    if (typeof marked !== "undefined" && marked.parse) {
      return marked.parse(text);
    }
    // Fallback: escape HTML and convert newlines
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }

  // --- Router ---
  function getRoute() {
    const hash = window.location.hash || "#/";
    return hash.slice(1);
  }

  function updateActiveNav(route) {
    navLinks.forEach((link) => {
      link.classList.remove("active");
      const r = link.dataset.route;
      if (
        (r === "home" && (route === "/" || route === "")) ||
        (r === "courses" && route.startsWith("/courses")) ||
        (r === "tutor" && route.startsWith("/tutor"))
      ) {
        link.classList.add("active");
      }
    });
  }

  async function router() {
    const route = getRoute();
    updateActiveNav(route);
    navLinksContainer.classList.remove("open");

    if (route === "/" || route === "") {
      renderHome();
    } else if (route === "/courses") {
      await renderCourses();
    } else if (route.match(/^\/courses\/([^/]+)\/lessons\/([^/]+)$/)) {
      const m = route.match(/^\/courses\/([^/]+)\/lessons\/([^/]+)$/);
      await renderLesson(m[1], m[2]);
    } else if (route.match(/^\/courses\/([^/]+)$/)) {
      const m = route.match(/^\/courses\/([^/]+)$/);
      await renderCourseDetail(m[1]);
    } else if (route === "/tutor") {
      await renderTutor();
    } else {
      render404();
    }
  }

  // --- PAGES ---

  function renderHome() {
    app.innerHTML = `
      <section class="hero">
        <div class="hero-badge">✨ AI-Powered Learning Platform</div>
        <h1>Learn AI the <span class="hero-gradient-text">AI-Native</span> Way</h1>
        <p>Master artificial intelligence, prompt engineering, and machine learning with an AI tutor that adapts to your learning pace.</p>
        <div class="hero-actions">
          <a href="#/courses" class="btn btn-primary" id="hero-browse-btn">Browse Courses</a>
          <a href="#/tutor" class="btn btn-secondary" id="hero-tutor-btn">💬 Talk to AI Tutor</a>
        </div>
      </section>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">3</div>
          <div class="stat-label">Expert Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">9</div>
          <div class="stat-label">In-Depth Lessons</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">∞</div>
          <div class="stat-label">AI Tutor Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">24/7</div>
          <div class="stat-label">Always Available</div>
        </div>
      </div>

      <div class="section-header">
        <h2>Featured Courses</h2>
        <p>Start your AI journey with expert-crafted content</p>
      </div>
      <div class="course-grid" id="featured-courses">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    `;

    loadFeaturedCourses();
  }

  async function loadFeaturedCourses() {
    const data = await api("/api/courses");
    const container = document.getElementById("featured-courses");
    if (!data.ok) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Failed to load courses.</p>';
      return;
    }
    container.innerHTML = data.courses.map((c) => courseCard(c)).join("");
  }

  function courseCard(c) {
    return `
      <div class="course-card" style="--card-accent:${c.color}" onclick="location.hash='#/courses/${c.id}'" id="course-card-${c.id}">
        <span class="course-icon">${c.icon}</span>
        <h3>${c.title}</h3>
        <p>${c.description}</p>
        <div class="course-meta">
          <span class="meta-tag">📂 ${c.category}</span>
          <span class="meta-tag">📊 ${c.difficulty}</span>
          <span class="meta-tag">📖 ${c.lessonCount} lessons</span>
          <span class="meta-tag">⏱ ${c.estimatedHours}h</span>
        </div>
      </div>
    `;
  }

  async function renderCourses() {
    app.innerHTML = `
      <div class="section-header">
        <h2>All Courses</h2>
        <p>Explore our AI curriculum</p>
      </div>
      <div class="course-grid" id="all-courses">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    `;

    const data = await api("/api/courses");
    const container = document.getElementById("all-courses");
    if (!data.ok) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Failed to load courses.</p>';
      return;
    }
    container.innerHTML = data.courses.map((c) => courseCard(c)).join("");
  }

  async function renderCourseDetail(courseId) {
    app.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    const data = await api(`/api/courses/${courseId}`);
    if (!data.ok) {
      render404();
      return;
    }

    const c = data.course;
    app.innerHTML = `
      <div class="course-detail">
        <div class="course-detail-header">
          <a href="#/courses" class="back-link" id="back-to-courses">← Back to Courses</a>
          <div style="font-size:3rem;margin-bottom:16px;">${c.icon}</div>
          <h1>${c.title}</h1>
          <p>${c.description}</p>
          <div class="course-meta" style="margin-top:16px;">
            <span class="meta-tag">📂 ${c.category}</span>
            <span class="meta-tag">📊 ${c.difficulty}</span>
            <span class="meta-tag">⏱ ${c.estimatedHours}h</span>
          </div>
        </div>

        <div class="section-header" style="padding-left:0;text-align:left;">
          <h2>Lessons</h2>
        </div>

        <div class="lesson-list">
          ${c.lessons
            .map(
              (l, i) => `
            <div class="lesson-item" onclick="location.hash='#/courses/${c.id}/lessons/${l.id}'" id="lesson-${l.id}">
              <div class="lesson-number">${i + 1}</div>
              <div class="lesson-info">
                <h3>${l.title}</h3>
                <p>${l.keyConcepts.join(" · ")}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  async function renderLesson(courseId, lessonId) {
    app.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    const [lessonData, courseData, quizData] = await Promise.all([
      api(`/api/courses/${courseId}/lessons/${lessonId}`),
      api(`/api/courses/${courseId}`),
      api(`/api/courses/${courseId}/lessons/${lessonId}/quiz`),
    ]);

    if (!lessonData.ok) {
      render404();
      return;
    }

    const lesson = lessonData.lesson;
    const course = courseData.ok ? courseData.course : null;

    // Determine prev/next lessons
    let prevLesson = null, nextLesson = null;
    if (course) {
      const idx = course.lessons.findIndex((l) => l.id === lessonId);
      if (idx > 0) prevLesson = course.lessons[idx - 1];
      if (idx < course.lessons.length - 1) nextLesson = course.lessons[idx + 1];
    }

    let quizHtml = "";
    if (quizData.ok && quizData.quiz.length > 0) {
      quizHtml = `
        <div class="quiz-section" id="quiz-section">
          <h2>📝 Knowledge Check</h2>
          ${quizData.quiz
            .map(
              (q, i) => `
            <div class="quiz-question" data-qid="${q.id}" data-type="${q.type}">
              <h4>${i + 1}. ${q.question}</h4>
              ${
                q.type === "multiple-choice"
                  ? q.options
                      .map(
                        (opt, oi) => `
                  <label class="quiz-option" id="opt-${q.id}-${oi}">
                    <input type="radio" name="q-${q.id}" value="${oi}">
                    <span>${opt}</span>
                  </label>
                `
                      )
                      .join("")
                  : `<textarea class="quiz-textarea" id="answer-${q.id}" placeholder="Type your answer..."></textarea>`
              }
            </div>
          `
            )
            .join("")}
          <button class="btn btn-primary" id="submit-quiz" style="margin-top:16px;">Submit Answers</button>
          <div id="quiz-results"></div>
        </div>
      `;
    }

    app.innerHTML = `
      <div class="lesson-viewer">
        <a href="#/courses/${courseId}" class="back-link" id="back-to-course">← Back to ${lesson.courseTitle}</a>
        <div class="lesson-content" id="lesson-text">
          ${md(lesson.content)}
        </div>

        <div class="lesson-nav">
          ${
            prevLesson
              ? `<a href="#/courses/${courseId}/lessons/${prevLesson.id}" class="btn btn-secondary btn-sm" id="prev-lesson">← ${prevLesson.title}</a>`
              : '<span></span>'
          }
          ${
            nextLesson
              ? `<a href="#/courses/${courseId}/lessons/${nextLesson.id}" class="btn btn-primary btn-sm" id="next-lesson">${nextLesson.title} →</a>`
              : '<span></span>'
          }
        </div>

        ${quizHtml}
      </div>
    `;

    // Quiz submission handler
    const submitBtn = document.getElementById("submit-quiz");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => submitQuiz(courseId, lessonId, quizData.quiz));
    }
  }

  async function submitQuiz(courseId, lessonId, quizQuestions) {
    const answers = [];
    for (const q of quizQuestions) {
      if (q.type === "multiple-choice") {
        const selected = document.querySelector(`input[name="q-${q.id}"]:checked`);
        answers.push({ id: q.id, answer: selected ? parseInt(selected.value) : -1 });
      } else {
        const textarea = document.getElementById(`answer-${q.id}`);
        answers.push({ id: q.id, answer: textarea ? textarea.value : "" });
      }
    }

    const resultsDiv = document.getElementById("quiz-results");
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    const data = await api("/api/quiz/evaluate", {
      method: "POST",
      body: JSON.stringify({ courseId, lessonId, answers }),
    });

    if (!data.ok) {
      resultsDiv.innerHTML = `<div class="quiz-feedback">Error: ${data.error}</div>`;
      return;
    }

    // Show results
    let scoreColor = data.score >= 70 ? "var(--accent-success)" : data.score >= 40 ? "var(--accent-warning)" : "var(--accent-danger)";
    resultsDiv.innerHTML = `
      <div class="quiz-results">
        <div class="quiz-score" style="color:${scoreColor}">${data.score}%</div>
        <p style="text-align:center;color:var(--text-secondary);">${data.totalCorrect} of ${data.totalQuestions} correct</p>
        ${data.results
          .map((r) => {
            let detail = "";
            if (r.correctAnswer) detail = `Correct answer: ${r.correctAnswer}`;
            if (r.feedback) detail = r.feedback;
            return r.correct
              ? ""
              : `<div class="quiz-feedback">❌ Q${r.id}: ${detail}</div>`;
          })
          .join("")}
      </div>
    `;

    // Highlight correct/incorrect options
    for (const r of data.results) {
      const q = quizQuestions.find((q2) => q2.id === r.id);
      if (q && q.type === "multiple-choice") {
        const options = document.querySelectorAll(`input[name="q-${q.id}"]`);
        options.forEach((opt) => {
          const label = opt.closest(".quiz-option");
          if (r.correct && opt.checked) {
            label.classList.add("correct");
          } else if (!r.correct && opt.checked) {
            label.classList.add("incorrect");
          }
        });
      }
    }
  }

  // --- AI Tutor Page ---
  let chatHistory = [];

  async function renderTutor() {
    const coursesData = await api("/api/courses");
    const courses = coursesData.ok ? coursesData.courses : [];

    app.innerHTML = `
      <div class="tutor-page">
        <div class="tutor-header">
          <h1>🤖 AI Tutor</h1>
          <p style="color:var(--text-secondary);">Ask me anything about your courses. I'll adapt my answers to your current lesson.</p>
        </div>

        <div class="tutor-context-selector">
          <select id="tutor-course" aria-label="Select course context">
            <option value="">General (no course context)</option>
            ${courses.map((c) => `<option value="${c.id}">${c.icon} ${c.title}</option>`).join("")}
          </select>
        </div>

        <div class="chat-container">
          <div class="chat-messages" id="chat-messages">
            <div class="chat-message assistant">
              <div class="chat-avatar">🎓</div>
              <div class="chat-bubble">
                <p>Hello! I'm your AI tutor. Select a course for context, or ask me anything about AI, prompt engineering, or machine learning.</p>
              </div>
            </div>
          </div>
          <div class="chat-input-area">
            <input type="text" class="chat-input" id="chat-input" placeholder="Ask a question..." autocomplete="off">
            <button class="chat-send" id="chat-send">Send</button>
          </div>
        </div>
      </div>
    `;

    chatHistory = [];

    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send");

    sendBtn.addEventListener("click", () => sendChat());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChat();
      }
    });
  }

  async function sendChat() {
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send");
    const messagesDiv = document.getElementById("chat-messages");
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    chatHistory.push({ role: "user", content: message });
    messagesDiv.innerHTML += `
      <div class="chat-message user">
        <div class="chat-avatar">👤</div>
        <div class="chat-bubble"><p>${escapeHtml(message)}</p></div>
      </div>
    `;

    input.value = "";
    sendBtn.disabled = true;

    // Show typing indicator
    messagesDiv.innerHTML += `
      <div class="chat-message assistant" id="typing-msg">
        <div class="chat-avatar">🎓</div>
        <div class="chat-bubble">
          <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
      </div>
    `;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    const courseId = document.getElementById("tutor-course").value || undefined;

    try {
      const data = await api("/api/tutor/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          courseId,
          history: chatHistory.slice(0, -1),
        }),
      });

      // Remove typing indicator
      const typingMsg = document.getElementById("typing-msg");
      if (typingMsg) typingMsg.remove();

      const reply = data.ok ? data.message : `Error: ${data.error}`;
      chatHistory.push({ role: "assistant", content: reply });

      messagesDiv.innerHTML += `
        <div class="chat-message assistant">
          <div class="chat-avatar">🎓</div>
          <div class="chat-bubble">${md(reply)}</div>
        </div>
      `;
    } catch (err) {
      const typingMsg = document.getElementById("typing-msg");
      if (typingMsg) typingMsg.remove();

      messagesDiv.innerHTML += `
        <div class="chat-message assistant">
          <div class="chat-avatar">🎓</div>
          <div class="chat-bubble"><p style="color:var(--accent-danger);">Connection error. Please try again.</p></div>
        </div>
      `;
    }

    sendBtn.disabled = false;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    input.focus();
  }

  function render404() {
    app.innerHTML = `
      <div style="text-align:center;padding:80px 24px;">
        <h1 style="font-size:4rem;margin-bottom:16px;">404</h1>
        <p style="color:var(--text-secondary);margin-bottom:24px;">Page not found</p>
        <a href="#/" class="btn btn-primary">Go Home</a>
      </div>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Init ---
  window.addEventListener("hashchange", router);
  router();
})();
