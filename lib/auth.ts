"use client"

// Simple auth context for demo purposes
export interface User {
  id: string
  email: string
  name: string
}

export const AUTH_STORAGE_KEY = "shopify_mining_auth"

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  const auth = localStorage.getItem(AUTH_STORAGE_KEY)
  return !!auth
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const auth = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!auth) return null

  try {
    return JSON.parse(auth)
  } catch {
    return null
  }
}

export function login(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        const user: User = {
          id: "1",
          email,
          name: email.split("@")[0],
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
        resolve(user)
      } else {
        reject(new Error("Credenciais inválidas"))
      }
    }, 1000)
  })
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}
