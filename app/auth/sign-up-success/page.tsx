import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Conta criada com sucesso!</CardTitle>
              <CardDescription>Confirme seu email para ativar sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enviamos um email de confirmação para o endereço fornecido. Clique no link do email para ativar sua
                conta e acessar a área de membros.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Ir para Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
