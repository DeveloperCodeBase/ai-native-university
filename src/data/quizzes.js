/**
 * Quiz data linked to course lessons.
 */

const quizzes = {
  "intro-to-ai": {
    "what-is-ai": [
      { id: "q1", type: "multiple-choice", question: "What is Narrow AI?", options: ["AI designed for a specific task", "AI with human-level reasoning", "AI that is self-aware", "AI that can learn anything"], answer: 0 },
      { id: "q2", type: "multiple-choice", question: "When was the term 'Artificial Intelligence' coined?", options: ["1943", "1950", "1956", "1969"], answer: 2 },
      { id: "q3", type: "free-text", question: "In your own words, explain the difference between Narrow AI and AGI.", answer: "Narrow AI is designed for specific tasks while AGI would have human-level reasoning across all domains." }
    ],
    "history-of-ai": [
      { id: "q1", type: "multiple-choice", question: "What caused the first AI winter?", options: ["Lack of funding due to unfulfilled promises", "A global recession", "Computers became too expensive", "AI was banned"], answer: 0 },
      { id: "q2", type: "multiple-choice", question: "Which factor did NOT contribute to the modern AI renaissance?", options: ["Big Data", "GPU Computing", "Quantum Computing", "Algorithmic Breakthroughs"], answer: 2 },
      { id: "q3", type: "free-text", question: "Why did expert systems fail to scale in the 1980s?", answer: "Expert systems were brittle, hard to maintain, and could not handle situations outside their predefined rules." }
    ],
    "types-of-ai": [
      { id: "q1", type: "multiple-choice", question: "Which learning approach uses labeled examples?", options: ["Unsupervised learning", "Reinforcement learning", "Supervised learning", "Transfer learning"], answer: 2 },
      { id: "q2", type: "multiple-choice", question: "What is the best approach for training a robot to walk?", options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Rule-based system"], answer: 2 }
    ]
  },
  "prompt-engineering": {
    "prompt-basics": [
      { id: "q1", type: "multiple-choice", question: "What does the system message do?", options: ["Sets the AI's role and constraints", "Provides the user's question", "Contains the AI's response", "Stores chat history"], answer: 0 },
      { id: "q2", type: "free-text", question: "List three rules for writing better prompts.", answer: "Be specific, provide context, set the output format." }
    ],
    "advanced-techniques": [
      { id: "q1", type: "multiple-choice", question: "What is Chain-of-Thought prompting?", options: ["Asking the model to reason step by step", "Chaining multiple API calls", "Using multiple models", "Training a custom model"], answer: 0 },
      { id: "q2", type: "multiple-choice", question: "What is few-shot prompting?", options: ["Using very few tokens", "Providing examples of desired input-output", "Limiting response length", "Using a small model"], answer: 1 }
    ],
    "prompt-patterns": [
      { id: "q1", type: "multiple-choice", question: "What does the Persona Pattern do?", options: ["Define who the AI should be", "Create a user profile", "Train a custom model", "Filter outputs"], answer: 0 }
    ]
  },
  "ml-fundamentals": {
    "what-is-ml": [
      { id: "q1", type: "multiple-choice", question: "How does ML differ from traditional programming?", options: ["ML discovers rules from data", "ML uses faster hardware", "ML doesn't need data", "ML only works for math"], answer: 0 },
      { id: "q2", type: "free-text", question: "Name two situations where ML is NOT the right approach.", answer: "When simple rules suffice and when no training data is available." }
    ],
    "linear-regression": [
      { id: "q1", type: "multiple-choice", question: "What does gradient descent minimize?", options: ["The loss function", "The learning rate", "The number of features", "The dataset size"], answer: 0 },
      { id: "q2", type: "multiple-choice", question: "Linear regression is best for predicting:", options: ["Categories", "Continuous values", "Images", "Audio"], answer: 1 }
    ],
    "neural-networks": [
      { id: "q1", type: "multiple-choice", question: "What is the most common activation function for hidden layers?", options: ["Sigmoid", "Softmax", "ReLU", "Tanh"], answer: 2 },
      { id: "q2", type: "multiple-choice", question: "What does backpropagation do?", options: ["Feeds data forward", "Updates weights to reduce error", "Adds more layers", "Removes neurons"], answer: 1 }
    ]
  }
};

function getQuiz(courseId, lessonId) {
  const courseQuizzes = quizzes[courseId];
  if (!courseQuizzes) return null;
  const lessonQuiz = courseQuizzes[lessonId];
  if (!lessonQuiz) return null;
  return lessonQuiz;
}

module.exports = { getQuiz, quizzes };
