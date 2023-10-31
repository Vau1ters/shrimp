export type Layer = 'bg' | 'chrBack' | 'chr' | 'ui'

  export const layerToZIndex = (layer: Layer, offset = 0): number => {
    switch (layer) {
      case 'bg':
        return 0 + offset
      case 'chrBack':
        return 1 + offset
      case 'chr':
        return 2 + offset
      case 'ui':
        return 3 + offset
    }
  }


