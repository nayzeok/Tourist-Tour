export type Guest = {
  type: 'adult' | 'child'
  age?: number
}

export type Adult = {
  room: number
  guests: Guest[]
}
