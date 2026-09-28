
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const quizzes = [
  {
    id: "javascript",
    title: "JavaScript Fundamentals",
    description: "Test your JavaScript basics.",
    questions: [
      {
        question: "Which keyword declares a block-scoped variable?",
        options: ["var", "let", "define", "static"],
        answer: 1,
        explanation:
          "let declares a block-scoped variable that can be reassigned.",
      },
      {
        question: "What does === compare?",
        options: [
          "Only value",
          "Only type",
          "Value and type",
          "Nothing",
        ],
        answer: 2,
        explanation:
          "Strict equality compares both value and data type.",
      },
      {
        question: "Which method transforms every array element?",
        options: ["forEach()", "map()", "find()", "push()"],
        answer: 1,
        explanation:
          "map() creates a new array using the result of a callback.",
      },
      {
        question: 'What is typeof null?',
        options: ["null", "undefined", "object", "number"],
        answer: 2,
        explanation:
          'typeof null returns "object" due to a historical JavaScript quirk.',
      },
      {
        question: "Which method parses a JSON string?",
        options: [
          "JSON.stringify()",
          "JSON.parse()",
          "JSON.convert()",
          "JSON.object()",
        ],
        answer: 1,
        explanation:
          "JSON.parse() converts a JSON string into a JavaScript value.",
      },
    ],
  },
  {
    id: "react",
    title: "React Essentials",
    description: "Practice React components and hooks.",
    questions: [
      {
        question: "What are React components used for?",
        options: [
          "Reusable UI",
          "Database management",
          "Compiling CSS",
          "Creating servers",
        ],
        answer: 0,
        explanation:
          "Components are reusable building blocks of a React UI.",
      },
      {
        question: "Which hook adds state to a function component?",
        options: ["useFetch()", "useState()", "useRoute()", "useStyle()"],
        answer: 1,
        explanation:
          "useState() allows function components to manage state.",
      },
      {
        question: "How does a parent pass data to a child?",
        options: ["Props", "CSS", "SQL", "HTML"],
        answer: 0,
        explanation:
          "Props pass data from a parent component to its child.",
      },
      {
        question: "Why are keys used in React lists?",
        options: [
          "To add styles",
          "To identify items between renders",
          "To encrypt data",
          "To create routes",
        ],
        answer: 1,
        explanation:
          "Keys help React identify list items when the list changes.",
      },
      {
        question: "Which hook is used for side effects?",
        options: ["useMemo()", "useEffect()", "useId()", "useState()"],
        answer: 1,
        explanation:
          "useEffect() synchronizes a component with external systems.",
      },
    ],
  },
  {
    id: "web",
    title: "Web Development Basics",
    description: "Practice HTML, CSS, HTTP and SQL.",
    questions: [
      {
        question: "Which HTML tag creates a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        answer: 1,
        explanation:
          "The anchor element <a> creates hyperlinks.",
      },
      {
        question: "Which HTTP method retrieves a resource?",
        options: ["POST", "PATCH", "GET", "DELETE"],
        answer: 2,
        explanation: "GET is used to retrieve a resource.",
      },
      {
        question: "Which CSS layout is one-dimensional?",
        options: ["Grid", "Flexbox", "Float", "Position"],
        answer: 1,
        explanation:
          "Flexbox arranges elements in a row or a column.",
      },
      {
        question: "What does SQL stand for?",
        options: [
          "Structured Query Language",
          "Simple Question Logic",
          "System Queue Link",
          "Standard Quick Language",
        ],
        answer: 0,
        explanation:
          "SQL stands for Structured Query Language.",
      },
      {
        question: "Which data structure follows LIFO?",
        options: ["Queue", "Tree", "Stack", "Graph"],
        answer: 2,
        explanation:
          "A stack follows Last In, First Out.",
      },
    ],
  },
];

type QuizType = (typeof quizzes)[number];

const Quiz = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const startQuiz = (quiz: QuizType) => {
    setSelectedQuiz(quiz);
    setQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
  };

  const score =
    selectedQuiz?.questions.reduce(
      (total, question, index) =>
        total + (answers[index] === question.answer ? 1 : 0),
      0
    ) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <DashboardSidebar />

      <main className="ml-20 lg:ml-[280px] pt-24 pb-12 transition-all">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {!selectedQuiz ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-primary">
                    Practice Quizzes
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Test your knowledge and improve your skills.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="glass-card-hover p-6 flex flex-col"
                  >
                    <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center mb-4">
                      <BookOpen className="w-5 h-5 text-secondary" />
                    </div>
                    <h2 className="text-lg font-semibold text-primary">
                      {quiz.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 mb-5 flex-1">
                      {quiz.description}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      5 questions · Beginner
                    </p>
                    <button
                      onClick={() => startQuiz(quiz)}
                      className="btn-primary w-full inline-flex items-center justify-center gap-2"
                    >
                      Start Quiz <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> All quizzes
              </button>

              {!submitted ? (
                <div className="glass-card p-6 md:p-8">
                  <p className="text-sm text-secondary font-medium">
                    {selectedQuiz.title}
                  </p>
                  <div className="flex justify-between items-center mt-1 mb-5">
                    <h2 className="text-xl font-bold text-primary">
                      Question {questionIndex + 1} of{" "}
                      {selectedQuiz.questions.length}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(
                        ((questionIndex + 1) /
                          selectedQuiz.questions.length) *
                          100
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-7">
                    <div
                      className="h-full gradient-bg rounded-full transition-all"
                      style={{
                        width: `${
                          ((questionIndex + 1) /
                            selectedQuiz.questions.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-primary mb-5">
                    {selectedQuiz.questions[questionIndex].question}
                  </h3>

                  <div className="space-y-3">
                    {selectedQuiz.questions[questionIndex].options.map(
                      (option, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [questionIndex]: index,
                            }))
                          }
                          className={`w-full text-left rounded-xl border p-4 transition-all ${
                            answers[questionIndex] === index
                              ? "border-secondary bg-secondary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-secondary/60"
                          }`}
                        >
                          <span className="font-medium text-sm">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex justify-between gap-3 mt-8">
                    <button
                      onClick={() =>
                        setQuestionIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={questionIndex === 0}
                      className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40"
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous
                    </button>

                    {questionIndex < selectedQuiz.questions.length - 1 ? (
                      <button
                        onClick={() => setQuestionIndex((prev) => prev + 1)}
                        disabled={answers[questionIndex] === undefined}
                        className="btn-primary inline-flex items-center gap-2 disabled:opacity-40"
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setSubmitted(true)}
                        disabled={
                          Object.keys(answers).length !==
                          selectedQuiz.questions.length
                        }
                        className="btn-primary inline-flex items-center gap-2 disabled:opacity-40"
                      >
                        Submit Quiz <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="glass-card p-7 text-center">
                    <Award className="w-12 h-12 text-secondary mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-primary">
                      Quiz completed!
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your score
                    </p>
                    <p className="text-4xl font-bold text-primary mt-2">
                      {score} / {selectedQuiz.questions.length}
                    </p>
                    <p className="text-sm text-secondary mt-1">
                      {Math.round(
                        (score / selectedQuiz.questions.length) * 100
                      )}
                      % score
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                      <button
                        onClick={() => startQuiz(selectedQuiz)}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> Retake Quiz
                      </button>
                      <button
                        onClick={() => setSelectedQuiz(null)}
                        className="btn-secondary"
                      >
                        All Quizzes
                      </button>
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-primary mb-5">
                      Answer Review
                    </h3>
                    <div className="space-y-5">
                      {selectedQuiz.questions.map((question, index) => {
                        const correct = answers[index] === question.answer;
                        return (
                          <div
                            key={index}
                            className="border-b border-border/70 last:border-0 pb-5 last:pb-0"
                          >
                            <div className="flex gap-2">
                              {correct ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-destructive shrink-0" />
                              )}
                              <div>
                                <p className="font-medium text-primary">
                                  {index + 1}. {question.question}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Your answer: {question.options[answers[index]]}
                                </p>
                                {!correct && (
                                  <p className="text-sm text-green-600 mt-1">
                                    Correct answer:{" "}
                                    {question.options[question.answer]}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground mt-2">
                                  {question.explanation}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;