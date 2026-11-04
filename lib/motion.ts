// StageShow: direct feedback is quick; surfaces travel a little longer.
export const motionEase = {
  travel: [0.45, 0, 0.1, 1] as const,
  arrive: [0.25, 0.8, 0.25, 1] as const,
}
export const motionTime = { feedback: 0.14, content: 0.22, surface: 0.3 }
