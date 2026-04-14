import { useScrollReveal } from '../hooks/useScrollReveal'

interface Props {
  id: string
  children: React.ReactNode
}

const sectionStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--ds-bg)',
  padding: '6rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const innerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
}

export default function Section({ id, children }: Props) {
  const { ref, revealed } = useScrollReveal(0.1)

  const revealStyle: React.CSSProperties = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
  }

  return (
    <section
      id={id}
      ref={ref as React.RefObject<HTMLElement>}
      style={{ ...sectionStyle, ...revealStyle }}
    >
      <div style={innerStyle}>
        {children}
      </div>
    </section>
  )
}
