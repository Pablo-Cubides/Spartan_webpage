export type HairLength = 'short' | 'medium' | 'long'
export type Density = 'low' | 'medium' | 'high'

export type RecommendedChanges = {
  hairStyle: string
  beardStyle: string
  hairLength: 'short' | 'medium' | 'long'
  hairColor?: string | null
}

export type FaceAnalysis = {
  faceOk: boolean
  pose: 'frontal' | 'ladeado' | 'incompleto'
  hair: { length: HairLength; color: string; density: Density }
  beard: { present: boolean; style?: string; density?: Density }
  accessories: Record<string, boolean>
  lighting: 'good' | 'fair' | 'poor'
  suggestedText: string
  advisoryText?: string
  recommendedChanges?: RecommendedChanges
}

export type EditChange = { type: string; value: string }

export type EditIntent = {
  locale: 'es' | 'en'
  change: EditChange[]
  instruction: string
  preserveIdentity: boolean
  outputSize?: number
  watermark?: boolean
  analysisType?: 'face' | 'clothing'  // Determines which tool is calling - face advisor or clothing advisor
}

export type IteratePayload = {
  sessionId?: string | null
  originalImageUrl: string
  userText: string
  prevPublicId?: string | null
  analysis?: FaceAnalysis
  analysisType?: 'face' | 'clothing'  // Determines which tool is calling
}
