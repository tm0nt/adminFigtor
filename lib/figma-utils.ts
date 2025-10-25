// lib/figma-utils.ts
export function extractFigmaData(url: string): { fileKey: string; title: string } | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    
    // Padrão: /design/FILE_KEY/TITLE
    const designIndex = pathParts.indexOf('design')
    if (designIndex === -1 || pathParts.length < designIndex + 3) {
      return null
    }
    
    const fileKey = pathParts[designIndex + 1]
    const rawTitle = pathParts[designIndex + 2]
    
    // Transformar URL-encoded title em texto normal
    const title = decodeURIComponent(rawTitle.replace(/-/g, ' '))
    
    return { fileKey, title }
  } catch (error) {
    console.error('Erro ao extrair dados do Figma:', error)
    return null
  }
}
