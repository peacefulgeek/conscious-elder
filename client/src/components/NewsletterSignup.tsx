import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        setStatus('duplicate');
      } else {
        setStatus('success');
        setEmail('');
      }
    },
    onError: (err) => {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    subscribe.mutate({ email: email.trim() });
  };

  return (
    <section
      style={{
        background: 'oklch(0.30 0.025 60)',
        padding: '4rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'oklch(0.75 0.10 65)',
            marginBottom: '0.875rem',
          }}
        >
          From the Journal
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: 'oklch(0.96 0.008 85)',
            lineHeight: 1.25,
            marginBottom: '0.875rem',
            letterSpacing: '-0.01em',
          }}
        >
          New articles, when they're ready.
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'oklch(0.78 0.015 80)',
            lineHeight: 1.65,
            marginBottom: '2rem',
          }}
        >
          No schedule, no algorithm. Just a quiet note when The Editorial Team has written something worth reading.
        </p>

        {status === 'success' ? (
          <div
            style={{
              padding: '1.25rem 2rem',
              background: 'oklch(0.22 0.02 60)',
              borderRadius: '0.5rem',
              border: '1px solid oklch(0.62 0.12 65 / 0.4)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                color: 'oklch(0.75 0.10 65)',
                fontWeight: 600,
              }}
            >
              You're in. Thank you.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'oklch(0.68 0.015 80)',
                marginTop: '0.375rem',
              }}
            >
              You'll hear from us when there's something worth saying.
            </p>
          </div>
        ) : status === 'duplicate' ? (
          <div
            style={{
              padding: '1.25rem 2rem',
              background: 'oklch(0.22 0.02 60)',
              borderRadius: '0.5rem',
              border: '1px solid oklch(0.62 0.12 65 / 0.4)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                color: 'oklch(0.75 0.10 65)',
              }}
            >
              You're already on the list.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === 'loading'}
              style={{
                flex: '1 1 240px',
                maxWidth: '320px',
                padding: '0.75rem 1rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                background: 'oklch(0.22 0.02 60)',
                border: '1px solid oklch(0.45 0.02 60)',
                borderRadius: '0.375rem',
                color: 'oklch(0.92 0.008 85)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'oklch(0.62 0.12 65)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'oklch(0.45 0.02 60)')}
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              style={{
                padding: '0.75rem 1.75rem',
                background: status === 'loading' ? 'oklch(0.52 0.10 65)' : 'oklch(0.62 0.12 65)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (status !== 'loading') e.currentTarget.style.background = 'oklch(0.52 0.12 65)';
              }}
              onMouseLeave={e => {
                if (status !== 'loading') e.currentTarget.style.background = 'oklch(0.62 0.12 65)';
              }}
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              color: 'oklch(0.65 0.15 25)',
              marginTop: '0.75rem',
            }}
          >
            {errorMsg}
          </p>
        )}

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.75rem',
            color: 'oklch(0.52 0.015 80)',
            marginTop: '1.25rem',
          }}
        >
          No spam. Unsubscribe any time by replying to any email.
        </p>
      </div>
    </section>
  );
}
