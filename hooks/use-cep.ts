// hooks/use-cep.ts
import { useState } from "react"

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export function useCep() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")
    
    if (cleanCep.length !== 8) {
      setError("CEP inválido")
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data: ViaCepResponse = await response.json()

      if (data.erro) {
        setError("CEP não encontrado")
        return null
      }

      return {
        street: data.logradouro,
        city: data.localidade,
        state: data.uf,
        complement: data.complemento,
        neighborhood: data.bairro,
      }
    } catch (err) {
      setError("Erro ao buscar CEP")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { fetchCep, loading, error }
}
