"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RenovarAssinaturaPage() {
  const handleRenewSubscription = () => {
    // Redirect to Pushinpay checkout
    // Replace with your actual Pushinpay checkout URL
    window.location.href = process.env.NEXT_PUBLIC_PUSHINPAY_CHECKOUT_URL || "#"
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Renovar Assinatura</CardTitle>
            <CardDescription>
              Sua assinatura expirou ou foi cancelada. Renove para continuar acessando a área de membros.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• Acesso completo à área de membros</p>
              <p>• Conteúdo exclusivo atualizado mensalmente</p>
              <p>• Suporte prioritário</p>
            </div>
            <Button onClick={handleRenewSubscription} className="w-full" size="lg">
              Renovar Assinatura
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
