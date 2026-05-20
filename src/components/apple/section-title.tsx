interface SectionTitleProps {
  title: string
  subtitle?: string
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Left accent bar */}
        <div
          style={{
            width: '3px',
            alignSelf: 'stretch',
            background: 'linear-gradient(180deg, #1D1D1F 0%, #6E3FFB 50%, #0071E3 100%)',
            borderRadius: '2px',
            flexShrink: 0,
            minHeight: '36px',
          }}
        />
        <div>
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 600,
              color: '#1D1D1F',
              letterSpacing: '-0.022em',
              lineHeight: 1.14,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: '17px',
                color: '#6E6E73',
                letterSpacing: '-0.01em',
                marginTop: '6px',
                lineHeight: 1.47,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
