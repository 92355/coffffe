declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void

    class Map {
      constructor(container: HTMLElement, options: MapOptions)
      getBounds(): LatLngBounds
      getLevel(): number
      setCenter(latlng: LatLng): void
      panTo(latlng: LatLng): void
      setLevel(level: number, options?: SetLevelOptions): void
      setMapTypeId(mapTypeId: number): void
    }

    class LatLng {
      constructor(lat: number, lng: number)
      getLat(): number
      getLng(): number
    }

    class LatLngBounds {
      contain(latlng: LatLng): boolean
      getNorthEast(): LatLng
      getSouthWest(): LatLng
    }

    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions)
      setMap(map: Map | null): void
    }

    namespace event {
      function addListener(
        target: Map | Marker,
        type: string,
        handler: () => void
      ): void
    }

    namespace MapTypeId {
      const ROADMAP: number
      const SKYVIEW: number
    }

    interface MapOptions {
      center: LatLng
      level: number
    }

    interface SetLevelOptions {
      animate?: boolean | { duration: number }
      anchor?: LatLng
    }

    interface MarkerOptions {
      position: LatLng
      map?: Map
      title?: string
      clickable?: boolean
      image?: MarkerImage
    }

    type MarkerImage = object

    interface CustomOverlayOptions {
      position: LatLng
      content: string | HTMLElement
      map?: Map
      zIndex?: number
      yAnchor?: number
      xAnchor?: number
    }
  }
}

interface Window {
  kakao: typeof kakao
}
