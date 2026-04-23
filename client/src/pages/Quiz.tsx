import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';

const LIKERT_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

export default function Quiz() {
  const [, params] = useRoute('/assessments/:quizId');
  const [, navigate] = useLocation();
  const quizId = params?.quizId ?? '';

  const { data: quiz, isLoading, error } = trpc.assessments.getQuiz.useQuery(
    { quizId },
    { enabled: !!quizId }
  );

  const scoreMutation = trpc.assessments.score.useMutation({
    onSuccess: (result) => {
      // Store result in sessionStorage and navigate to results page
      sessionStorage.setItem(`quiz-result-${quizId}`, JSON.stringify(result));
      navigate(`/assessments/${quizId}/results`);
    },
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const questions = quiz?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Pre-fill selected value if already answered
  useEffect(() => {
    if (currentQuestion) {
      setSelectedValue(answers[currentQuestion.id] ?? null);
    }
  }, [currentIndex, currentQuestion?.id]);

  function handleAnswer(value: number) {
    setSelectedValue(value);
  }

  function handleNext() {
    if (!currentQuestion || selectedValue === null) return;
    const newAnswers = { ...answers, [currentQuestion.id]: selectedValue };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Submit
      const answerArray = questions.map(q => ({
        questionId: q.id,
        value: newAnswers[q.id] ?? 3,
      }));
      scoreMutation.mutate({ quizId, answers: answerArray });
      return;
    }

    setDirection('forward');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(i => i + 1);
      setAnimating(false);
    }, 180);
  }

  function handleBack() {
    if (currentIndex === 0) return;
    if (currentQuestion && selectedValue !== null) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedValue }));
    }
    setDirection('back');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(i => i - 1);
      setAnimating(false);
    }, 180);
  }

  if (isLoading) {
    return (
      <>
        <SiteNav alwaysSolid />
        <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'oklch(0.985 0.008 85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid oklch(0.88 0.015 80)', borderTopColor: 'oklch(0.62 0.12 65)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.45 0.02 240)' }}>Loading assessment...</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (error || !quiz) {
    return (
      <>
        <SiteNav alwaysSolid />
        <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'oklch(0.985 0.008 85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'oklch(0.35 0.02 240)' }}>Assessment not found.</p>
            <a href="/assessments" style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.62 0.12 65)', marginTop: '1rem', display: 'inline-block' }}>Back to Assessments</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={`${quiz.title} | The Conscious Elder`}
        description={quiz.subtitle}
        canonicalPath={`/assessments/${quizId}`}
        type="website"
      />
      <SiteNav alwaysSolid />

      <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'oklch(0.985 0.008 85)' }}>
        {/* Quiz hero strip */}
        <div style={{ position: 'relative', width: '100%', height: '28vh', minHeight: '200px', overflow: 'hidden' }}>
          <img
            src={quiz.heroImage}
            alt={quiz.heroAlt}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
            loading="eager"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(20,16,12,0.72) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 2rem 1.75rem', maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'oklch(0.75 0.10 65)', marginBottom: '0.4rem' }}>
              {quiz.icon} {quiz.domain}
            </p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'oklch(0.97 0.006 85)', borderBottom: '1px solid oklch(0.88 0.015 80)', padding: '0.875rem 2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'oklch(0.55 0.02 240)' }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 600, color: 'oklch(0.62 0.12 65)' }}>
                {Math.round(progress)}% complete
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'oklch(0.88 0.015 80)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'oklch(0.62 0.12 65)',
                borderRadius: '3px',
                transition: 'width 0.35s ease',
              }} />
            </div>
          </div>
        </div>

        {/* Question card */}
        <main style={{ padding: '3rem 2rem 5rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="ce-quiz-card" style={{
              background: '#fff',
              border: '1px solid oklch(0.88 0.015 80)',
              borderRadius: '1rem',
              padding: 'clamp(2rem, 4vw, 3rem)',
              boxShadow: '0 4px 24px oklch(0.18 0.015 240 / 0.06)',
              opacity: animating ? 0 : 1,
              transform: animating
                ? (direction === 'forward' ? 'translateX(20px)' : 'translateX(-20px)')
                : 'translateX(0)',
              transition: 'opacity 0.18s ease, transform 0.18s ease',
            }}>
              {currentQuestion && (
                <>
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)',
                    fontWeight: 600,
                    color: 'oklch(0.18 0.015 240)',
                    lineHeight: 1.5,
                    marginBottom: '2.5rem',
                  }}>
                    {currentQuestion.text}
                  </p>

                  {/* Likert scale */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    {/* Labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'oklch(0.55 0.02 240)' }}>
                        {currentQuestion.lowLabel}
                      </span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'oklch(0.55 0.02 240)' }}>
                        {currentQuestion.highLabel}
                      </span>
                    </div>

                    {/* 5 buttons */}
                    <div className="ce-likert-row" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map(value => {
                        const isSelected = selectedValue === value;
                        return (
                          <button
                            key={value}
                            onClick={() => handleAnswer(value)}
                            style={{
                              flex: 1,
                              maxWidth: '80px',
                              aspectRatio: '1',
                              borderRadius: '0.75rem',
                              border: `2px solid ${isSelected ? 'oklch(0.62 0.12 65)' : 'oklch(0.88 0.015 80)'}`,
                              background: isSelected ? 'oklch(0.62 0.12 65)' : '#fff',
                              color: isSelected ? '#fff' : 'oklch(0.35 0.02 240)',
                              fontFamily: 'var(--font-sans)',
                              fontSize: 'clamp(1rem, 2vw, 1.35rem)',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.2rem',
                              padding: '0.5rem',
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'oklch(0.62 0.12 65)';
                                (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.96 0.01 80)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'oklch(0.88 0.015 80)';
                                (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                              }
                            }}
                          >
                            <span>{value}</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 400, opacity: 0.75, textAlign: 'center', lineHeight: 1.2 }}>
                              {LIKERT_LABELS[value - 1]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={handleBack}
                      disabled={currentIndex === 0}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        padding: '0.75rem 1.5rem',
                        border: '1px solid oklch(0.88 0.015 80)',
                        borderRadius: '0.5rem',
                        background: 'transparent',
                        color: currentIndex === 0 ? 'oklch(0.75 0.01 240)' : 'oklch(0.35 0.02 240)',
                        cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      Back
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={selectedValue === null || scoreMutation.isPending}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        padding: '0.875rem 2.25rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        background: selectedValue !== null ? 'oklch(0.62 0.12 65)' : 'oklch(0.88 0.015 80)',
                        color: selectedValue !== null ? '#fff' : 'oklch(0.65 0.01 240)',
                        cursor: selectedValue !== null ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {scoreMutation.isPending ? (
                        <>
                          <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                          Scoring...
                        </>
                      ) : isLastQuestion ? (
                        <>
                          See My Results
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Next
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Reassurance note */}
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              color: 'oklch(0.62 0.02 240)',
              textAlign: 'center',
              marginTop: '1.5rem',
              lineHeight: 1.6,
            }}>
              There are no right or wrong answers. Answer honestly for the most useful results.
            </p>
          </div>
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
