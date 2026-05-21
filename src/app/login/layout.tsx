import { AuroraBackground } from '@/components/apple/aurora-background'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuroraBackground />
      <main>{children}</main>
    </>
  )
}
