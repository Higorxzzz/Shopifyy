import { LoginForm } from "@/components/login-form"
import { SiteHeader } from "@/components/site-header"
import Plasma from "@/components/plasma"

export default function LoginPage() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-black">
        <Plasma color="#9ae600" speed={0.8} direction="forward" scale={1.5} opacity={0.4} mouseInteractive={true} />
      </div>
      <div className="relative z-10 min-h-screen text-white">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <LoginForm />
        </div>
      </div>
    </>
  )
}
