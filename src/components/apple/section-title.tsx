interface SectionTitleProps {
  title: string
  subtitle?: string
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2
        style={{
          fontSize: '28px',
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
            marginTop: '8px',
            lineHeight: 1.47,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
