import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, AlertCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { api } from '../../services/api';
import { telemetry } from '../../services/telemetry';
import { useCognitive } from '../../context/CognitiveContext';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty?: string;
}

export interface InLessonQuizProps {
  topicId: string;
  initialQuestions?: QuizQuestion[];
}

export const InLessonQuiz: React.FC<InLessonQuizProps> = ({
  topicId,
  initialQuestions
}) => {
  const { updateFromFeedback } = useCognitive();
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions || []);
  const [loading, setLoading] = useState<boolean>(!initialQuestions || initialQuestions.length === 0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    let isMounted = true;
    if (!initialQuestions || initialQuestions.length === 0) {
      setLoading(true);
      api.getTopicQuiz(topicId)
        .then(data => {
          if (isMounted && data && Array.isArray(data) && data.length > 0) {
            setQuestions(data);
          } else if (isMounted) {
            // Default fallback question for the topic
            setQuestions([
              {
                id: 'default-q1',
                question: 'Which of the following Python data types is strictly IMMUTABLE?',
                options: ['List', 'Dictionary', 'Tuple', 'Set'],
                correct_index: 2,
                explanation: 'Tuples cannot be modified after creation. Lists, Dictionaries, and Sets are all mutable data structures in Python.',
                difficulty: 'easy'
              },
              {
                id: 'default-q2',
                question: 'What does the expression `a is b` test in Python?',
                options: [
                  'Whether a and b have the exact same value',
                  'Whether a and b reference the exact same object in memory',
                  'Whether a and b have the same data type',
                  'Whether a is greater than b'
                ],
                correct_index: 1,
                explanation: 'The `is` keyword tests identity (memory address reference), whereas `==` checks value equality.',
                difficulty: 'medium'
              }
            ]);
          }
          setLoading(false);
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [topicId, initialQuestions]);

  const currentQ = questions[currentIndex];
  const isAnswered = selectedAnswers[currentIndex] !== undefined;
  const isSubmitted = submittedQuestions[currentIndex] === true;
  const isCorrect = isSubmitted && selectedAnswers[currentIndex] === currentQ?.correct_index;

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleSubmitAnswer = () => {
    if (!isAnswered || isSubmitted) return;

    setSubmittedQuestions(prev => ({ ...prev, [currentIndex]: true }));
    const wasRight = selectedAnswers[currentIndex] === currentQ.correct_index;
    const newScore = wasRight ? score + 1 : score;
    if (wasRight) setScore(newScore);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    // Telemetry and Adaptive Feedback
    telemetry.logEvent('IN_LESSON_QUIZ_ANSWER', timeSpent, {
      topic_id: topicId,
      question_id: currentQ.id,
      is_correct: wasRight,
      difficulty: currentQ.difficulty
    });

    // Feed signal into adaptive engine
    if (!wasRight) {
      updateFromFeedback({
        confidence: 0.82,
        cognitive_level: 'MEDIUM',
        reason: 'Learner answered a checkpoint question incorrectly. Detailed explanation is readily accessible.',
        suggested_adaptation: 'Detailed explanation may clarify this concept.',
        contributing_factors: ['Quiz question checkpoint attempt needing revision']
      });
    } else {
      updateFromFeedback({
        confidence: 0.92,
        cognitive_level: 'LOW',
        reason: 'Demonstrated solid grasp on topic checkpoint.',
        suggested_adaptation: 'Standard or accelerated pace is appropriate.',
        contributing_factors: ['Correct quiz answer validation on first attempt']
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setScore(0);
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/40 text-center text-xs text-slate-500 animate-pulse">
        Loading topic quiz questions...
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  const allSubmitted = questions.every((_, idx) => submittedQuestions[idx]);

  return (
    <div
      id="section-mini-quiz"
      className="rounded-2xl border border-slate-800 light-theme:border-slate-300 bg-slate-900/60 light-theme:bg-white p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 light-theme:border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 light-theme:bg-purple-100 light-theme:text-purple-700 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white light-theme:text-slate-900 flex items-center gap-2">
              <span>Mini Quiz</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 light-theme:bg-purple-100 light-theme:text-purple-700 border border-purple-500/20">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              {questions.map((_, idx) => {
                const isCurrent = idx === currentIndex;
                const isSub = submittedQuestions[idx];
                const wasCorrect = isSub && selectedAnswers[idx] === questions[idx].correct_index;
                return (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'w-5 bg-purple-400'
                        : isSub
                        ? wasCorrect
                          ? 'w-2 bg-emerald-400'
                          : 'w-2 bg-rose-400'
                        : 'w-1.5 bg-slate-700 light-theme:bg-slate-300'
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 light-theme:text-slate-600 mt-0.5">
              Test your understanding and receive instant adaptive feedback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 light-theme:text-slate-700">
            Score: {score}/{questions.length}
          </span>
          <button
            onClick={handleRestart}
            className="p-1 rounded-lg hover:bg-slate-800 light-theme:hover:bg-slate-100 text-slate-400"
            title="Restart Quiz"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-100 light-theme:text-slate-900 leading-relaxed">
          {currentQ.question}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentIndex] === optIdx;
            const isCorrectOption = currentQ.correct_index === optIdx;

            let optionStyle = 'border-slate-800 light-theme:border-slate-300 bg-slate-950/70 light-theme:bg-slate-50 text-slate-300 light-theme:text-slate-800 hover:border-slate-700';

            if (isSubmitted) {
              if (isCorrectOption) {
                optionStyle = 'border-emerald-500 bg-emerald-950/40 light-theme:bg-emerald-50 text-emerald-300 light-theme:text-emerald-900 font-bold animate-pop-in';
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'border-rose-500 bg-rose-950/40 light-theme:bg-rose-50 text-rose-300 light-theme:text-rose-900 line-through opacity-80 animate-shake';
              }
            } else if (isSelected) {
              optionStyle = 'border-cyan-500 bg-cyan-950/40 light-theme:bg-blue-50 text-cyan-300 light-theme:text-blue-800 font-bold';
            }

            return (
              <button
                key={optIdx}
                disabled={isSubmitted}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 light-theme:bg-slate-200 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{opt}</span>
                </div>

                {isSubmitted && isCorrectOption && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {isSubmitted && isSelected && !isCorrectOption && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Validation and Explanation Feedback */}
        {isSubmitted && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              isCorrect
                ? 'bg-emerald-950/20 light-theme:bg-emerald-50 border-emerald-500/30 text-emerald-300 light-theme:text-emerald-900 animate-pop-in'
                : 'bg-rose-950/20 light-theme:bg-rose-50 border-rose-500/30 text-rose-300 light-theme:text-rose-900 animate-shake'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Not quite.</span>
                </>
              )}
            </div>
            <p className="text-slate-300 light-theme:text-slate-700">
              <strong>Why:</strong> {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Action Button Row */}
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="px-3 py-1.5 rounded-lg border border-slate-800 light-theme:border-slate-300 hover:bg-slate-800 light-theme:hover:bg-slate-100 disabled:opacity-40 text-xs text-slate-300 light-theme:text-slate-700 font-medium"
          >
            Previous
          </button>

          {!isSubmitted ? (
            <button
              disabled={!isAnswered}
              onClick={handleSubmitAnswer}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
            >
              Submit Answer
            </button>
          ) : currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono">
              <Award className="w-4 h-4" />
              <span>Quiz Completed!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
