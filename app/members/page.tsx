import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserSubscription } from "@/lib/subscription"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function MembersPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const subscription = await getUserSubscription(data.user.id)

  if (!subscription) {
    redirect("/renovar-assinatura")
  }

  const isActive = subscription.status === "active" && new Date(subscription.valid_until) > new Date()

  if (!isActive) {
    redirect("/renovar-assinatura")
  }

  const validUntilDate = new Date(subscription.valid_until)
  const daysRemaining = Math.ceil((validUntilDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Área de Membros</h1>
          <p className="text-muted-foreground">Bem-vindo à sua área exclusiva de membros</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Status da Assinatura
                <Badge variant={isActive ? "default" : "destructive"}>
                  {subscription.status === "active" ? "Ativa" : "Inativa"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Válida até: {validUntilDate.toLocaleDateString("pt-BR")}</p>
              <p className="text-sm text-muted-foreground">
                {daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Expirada"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Email: {data.user.email}</p>
              <p className="text-sm text-muted-foreground">ID: {data.user.id.slice(0, 8)}...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm" type="submit">
                  Sair
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo Exclusivo</CardTitle>
              <CardDescription>Acesse todo o conteúdo disponível para membros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Módulo 1</h3>
                  <p className="text-sm text-muted-foreground mb-3">Introdução aos conceitos fundamentais</p>
                  <Button size="sm">Acessar</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Módulo 2</h3>
                  <p className="text-sm text-muted-foreground mb-3">Técnicas avançadas e estratégias</p>
                  <Button size="sm">Acessar</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Downloads</h3>
                  <p className="text-sm text-muted-foreground mb-3">Materiais complementares e recursos</p>
                  <Button size="sm">Acessar</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Comunidade</h3>
                  <p className="text-sm text-muted-foreground mb-3">Fórum exclusivo para membros</p>
                  <Button size="sm">Acessar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
