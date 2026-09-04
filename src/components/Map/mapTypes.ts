export type MapPoint = {
  lat: number
  lng: number
}

export type MapMarker = MapPoint & {
  id: string
}
