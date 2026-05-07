/**
 * Course catalog data for AI Native University.
 * Static data layer — no database required for Phase 1.
 */

const courses = [
  {
    id: "intro-to-ai",
    title: "Introduction to Artificial Intelligence",
    description: "Explore the foundations of AI — from its history and core concepts to modern applications.",
    category: "Foundations",
    difficulty: "Beginner",
    icon: "🤖",
    color: "#6C63FF",
    estimatedHours: 6,
    lessons: [
      {
        id: "what-is-ai",
        title: "What Is Artificial Intelligence?",
        objectives: ["Define AI and its subfields", "Distinguish narrow AI from AGI", "Identify real-world AI applications"],
        keyConcepts: ["Narrow AI vs. AGI", "Turing Test", "Machine perception", "Autonomous agents"],
        content: "# What Is Artificial Intelligence?\n\nArtificial Intelligence (AI) is the field of computer science focused on building systems that perform tasks typically requiring human intelligence — understanding language, recognizing images, making decisions, and learning from experience.\n\n## Narrow AI vs. General AI\n\n**Narrow AI** (weak AI) is designed for a specific task. Every AI you use today — voice assistants, recommendation engines, spam filters — is narrow AI.\n\n**Artificial General Intelligence (AGI)** would have human-level reasoning across any domain. AGI does not yet exist.\n\n## A Brief History\n\n| Era | Milestone |\n|-----|----------|\n| 1950 | Alan Turing proposes the Turing Test |\n| 1956 | \"Artificial Intelligence\" coined at Dartmouth |\n| 1997 | Deep Blue defeats world chess champion |\n| 2012 | Deep learning breakthrough in image recognition |\n| 2022+ | Large Language Models achieve broad fluency |\n\n## Key Takeaway\n\nAI is not magic. It is mathematics, data, and engineering — applied at scale to solve problems that previously required human cognition."
      },
      {
        id: "history-of-ai",
        title: "History and Evolution of AI",
        objectives: ["Trace major AI milestones", "Understand AI winters", "Recognize factors behind the current boom"],
        keyConcepts: ["Dartmouth Conference", "AI winters", "Expert systems", "Deep learning revolution"],
        content: "# History and Evolution of AI\n\n## The Birth of AI (1950s)\n\nThe field was formally born at the 1956 Dartmouth Conference, where researchers proposed that every aspect of learning can be precisely described so a machine can simulate it.\n\n## Early Optimism (1960s-1970s)\n\nEarly programs solved algebra, proved theorems, and played checkers. Many predicted human-level AI within 20 years.\n\n## The First AI Winter (1974-1980)\n\nPromises went unfulfilled; funding dried up. Computers were too slow, data too scarce, algorithms too simple.\n\n## Expert Systems Era (1980s)\n\nRule-based expert systems like MYCIN (medical diagnosis) brought AI back. But they were brittle and expensive.\n\n## The Second AI Winter (1987-1993)\n\nExpert systems failed to scale. The industry contracted again.\n\n## The Modern Renaissance (2012-Present)\n\nThree factors converged:\n1. **Big Data** — The internet generated massive datasets\n2. **GPU Computing** — Graphics cards enabled parallel training\n3. **Algorithmic Breakthroughs** — Deep learning achieved superhuman performance\n\n## Key Takeaway\n\nAI progress is not linear. Understanding its history helps set realistic expectations."
      },
      {
        id: "types-of-ai",
        title: "Types and Categories of AI Systems",
        objectives: ["Classify AI systems by capability", "Understand supervised, unsupervised, and reinforcement learning", "Match AI types to problems"],
        keyConcepts: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Classification vs. regression"],
        content: "# Types and Categories of AI Systems\n\n## By Capability\n\n- **Reactive Machines** — Respond to inputs without memory (e.g., Deep Blue)\n- **Limited Memory** — Use recent data for decisions (e.g., self-driving cars)\n- **Theory of Mind** — Would understand emotions (research frontier)\n- **Self-Aware AI** — Hypothetical conscious AI\n\n## By Learning Approach\n\n### Supervised Learning\nLearn from labeled examples. Used for spam detection, medical imaging, price prediction.\n\n### Unsupervised Learning\nFind patterns in unlabeled data. Used for customer segmentation, anomaly detection.\n\n### Reinforcement Learning\nLearn by trial and error with rewards. Used for game playing, robotics.\n\n## Choosing the Right Approach\n\n| Problem | Best Approach |\n|---------|---------------|\n| Predict prices | Supervised (regression) |\n| Group customers | Unsupervised (clustering) |\n| Train a robot | Reinforcement learning |\n| Classify emails | Supervised (classification) |\n\n## Key Takeaway\n\nThere is no single AI algorithm. The right approach depends on your data, labels, and problem."
      }
    ]
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering Mastery",
    description: "Master the art of communicating with large language models. Get precise, reliable, and creative outputs from AI.",
    category: "Applied AI",
    difficulty: "Intermediate",
    icon: "✍️",
    color: "#FF6B6B",
    estimatedHours: 5,
    lessons: [
      {
        id: "prompt-basics",
        title: "Fundamentals of Prompt Engineering",
        objectives: ["Understand what a prompt is", "Write clear, effective prompts", "Avoid common prompting mistakes"],
        keyConcepts: ["System prompts", "User prompts", "Context window", "Token limits"],
        content: "# Fundamentals of Prompt Engineering\n\n## What Is a Prompt?\n\nA prompt is the input text you provide to a language model. Output quality is directly proportional to prompt quality.\n\n## The Anatomy of a Prompt\n\n- **System message**: Sets the AI's role and constraints\n- **User message**: The actual question or instruction\n- **Assistant message**: Previous AI responses (for context)\n\n## Five Rules for Better Prompts\n\n1. **Be specific** — \"Summarize in 3 bullet points\" beats \"Summarize this\"\n2. **Provide context** — Give the AI the background it needs\n3. **Set the format** — Tell the AI how to structure the output\n4. **Set constraints** — Specify length, tone, style\n5. **Iterate** — Refine based on the output you get\n\n## Common Mistakes\n\n- Being too vague\n- Overloading a single prompt with unrelated tasks\n- Not specifying output format\n- Forgetting the system role\n\n## Key Takeaway\n\nPrompt engineering is about clear communication. The better you communicate intent, the better the AI performs."
      },
      {
        id: "advanced-techniques",
        title: "Advanced Prompting Techniques",
        objectives: ["Apply chain-of-thought prompting", "Use few-shot examples", "Implement structured output formatting"],
        keyConcepts: ["Chain-of-thought", "Few-shot learning", "Zero-shot learning", "Output parsing"],
        content: "# Advanced Prompting Techniques\n\n## Chain-of-Thought (CoT)\n\nAsk the model to reason step by step. This dramatically improves accuracy on math, logic, and multi-step reasoning.\n\n## Few-Shot Prompting\n\nProvide examples of the desired input-output pattern. The model learns the pattern and generalizes.\n\n## Structured Output\n\nRequest specific formats like JSON for machine-readable outputs.\n\n## Role-Based Prompting\n\nAssign expert roles for domain-specific responses: \"You are a senior security engineer.\"\n\n## Self-Consistency\n\nAsk the model to solve the same problem multiple ways and pick the most common answer.\n\n## Key Takeaway\n\nAdvanced prompting transforms AI from a chatbot into a precision tool."
      },
      {
        id: "prompt-patterns",
        title: "Prompt Design Patterns",
        objectives: ["Apply reusable prompt patterns", "Build prompt templates", "Evaluate prompt effectiveness"],
        keyConcepts: ["Template patterns", "Persona pattern", "Audience adaptation", "Evaluation criteria"],
        content: "# Prompt Design Patterns\n\n## The Persona Pattern\nDefine who the AI should be. Controls vocabulary, tone, depth, and assumptions.\n\n## The Template Pattern\nCreate reusable templates with variables for consistent results.\n\n## The Refinement Pattern\nIteratively improve output: generate draft → improve → add examples → format.\n\n## The Evaluation Pattern\nAsk the AI to evaluate its own output and provide an improved version.\n\n## The Audience Adaptation Pattern\nSpecify the target reader to control complexity level.\n\n## Key Takeaway\n\nPrompt patterns are reusable blueprints. Build a personal library for common tasks."
      }
    ]
  },
  {
    id: "ml-fundamentals",
    title: "Machine Learning Fundamentals",
    description: "Understand core ML algorithms and mathematics. From linear regression to neural networks, build real intuition.",
    category: "Core ML",
    difficulty: "Intermediate",
    icon: "🧠",
    color: "#4ECDC4",
    estimatedHours: 8,
    lessons: [
      {
        id: "what-is-ml",
        title: "What Is Machine Learning?",
        objectives: ["Define ML vs. traditional programming", "Understand the ML pipeline", "Identify when ML is right"],
        keyConcepts: ["Training data", "Features", "Labels", "Model", "Prediction"],
        content: "# What Is Machine Learning?\n\n## Traditional Programming vs. ML\n\n**Traditional:** Rules + Data → Output\n**ML:** Data + Output → Rules (Model)\n\nIn ML, the computer discovers rules from data.\n\n## The ML Pipeline\n\n1. Collect data\n2. Prepare data (clean, normalize, split)\n3. Choose a model\n4. Train\n5. Evaluate\n6. Deploy\n7. Monitor\n\n## When to Use ML\n\n- Clear patterns in historical data\n- Writing explicit rules is impractical\n- Task requires adaptation to new data\n\n## When NOT to Use ML\n\n- Simple rules suffice\n- No training data available\n- Errors are completely unacceptable\n\n## Key Takeaway\n\nML is a powerful tool for pattern recognition — not a universal solution."
      },
      {
        id: "linear-regression",
        title: "Linear Regression — Your First Algorithm",
        objectives: ["Understand linear regression intuitively", "Grasp loss functions and optimization", "Know when to apply it"],
        keyConcepts: ["Slope and intercept", "Mean squared error", "Gradient descent", "Overfitting"],
        content: "# Linear Regression\n\nLinear regression finds the line that best fits your data: **y = mx + b**\n\n## How It Learns\n\nThe model adjusts slope (m) and intercept (b) to minimize error.\n\n### Mean Squared Error\nMSE = (1/n) × Σ(actual - predicted)²\n\n### Gradient Descent\n1. Start with random weights\n2. Calculate MSE\n3. Compute gradient (direction of steepest increase)\n4. Move weights downhill\n5. Repeat\n\n## Multiple Features\n\ny = w₁x₁ + w₂x₂ + ... + wₙxₙ + b\n\n## When to Use It\n\n- Predicting continuous values\n- Approximately linear relationships\n- Need interpretable models\n\n## Key Takeaway\n\nLinear regression is simple, interpretable, and the foundation for more complex algorithms."
      },
      {
        id: "neural-networks",
        title: "Introduction to Neural Networks",
        objectives: ["Understand neurons, layers, and activations", "Trace forward propagation", "Grasp backpropagation intuition"],
        keyConcepts: ["Neurons", "Layers", "Activation functions", "Backpropagation"],
        content: "# Introduction to Neural Networks\n\n## The Artificial Neuron\n\noutput = activation(w₁x₁ + w₂x₂ + ... + wₙxₙ + bias)\n\n## Activation Functions\n\n| Function | Use Case |\n|----------|----------|\n| ReLU | Hidden layers (most common) |\n| Sigmoid | Binary classification |\n| Softmax | Multi-class classification |\n\n## Network Architecture\n\n1. **Input layer** — Receives raw data\n2. **Hidden layers** — Learn abstract features\n3. **Output layer** — Produces predictions\n\n## Forward Propagation\n\nData flows layer by layer, each transforming the data.\n\n## Backpropagation\n\n1. Make prediction (forward pass)\n2. Compute error (loss)\n3. Propagate error backward\n4. Update weights\n5. Repeat\n\n## Key Takeaway\n\nNeural networks are powerful function approximators that learn any pattern given enough data and compute."
      }
    ]
  }
];

function getAllCourses() {
  return courses.map(c => ({
    id: c.id, title: c.title, description: c.description,
    category: c.category, difficulty: c.difficulty, icon: c.icon,
    color: c.color, estimatedHours: c.estimatedHours, lessonCount: c.lessons.length
  }));
}

function getCourseById(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;
  return { ...course, lessons: course.lessons.map(l => ({ id: l.id, title: l.title, objectives: l.objectives, keyConcepts: l.keyConcepts })) };
}

function getLesson(courseId, lessonId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;
  const lesson = course.lessons.find(l => l.id === lessonId);
  if (!lesson) return null;
  return { ...lesson, courseId: course.id, courseTitle: course.title };
}

function getCourseContext(courseId, lessonId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;
  let ctx = `Course: ${course.title}\n${course.description}\n\nLessons:\n`;
  course.lessons.forEach((l, i) => { ctx += `${i+1}. ${l.title}\n`; });
  if (lessonId) {
    const lesson = course.lessons.find(l => l.id === lessonId);
    if (lesson) ctx += `\nCurrent Lesson: ${lesson.title}\n\n${lesson.content}`;
  }
  return ctx;
}

module.exports = { getAllCourses, getCourseById, getLesson, getCourseContext, courses };
