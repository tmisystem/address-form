import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import geolocationAutoCompleteAddress from './geolocationAutoCompleteAddress'

class Map extends Component {
  constructor(props) {
    super(props)

    this.mapMounted = this.mapMounted.bind(this)
  }

  shouldComponentUpdate(prevProps) {
    const rulesChanged = prevProps.rules.country !== this.props.rules.country
    const geoCoordsChanged = this.isDifferentGeoCoords(
      prevProps.geoCoordinates,
      this.props.geoCoordinates
    )

    return geoCoordsChanged || rulesChanged
  }

  componentDidUpdate() {
    const location = this.getLocation(this.props.geoCoordinates)
    this.changeMarkerPosition(location)
    this.recenterMap(location)
  }

  mapMounted = mapElement => {
    if (!mapElement) {
      this.map = null
      this.marker.setMap(null)
      this.marker = null
      return
    }

    const location = this.getLocation(this.props.geoCoordinates)
    this.createMap(mapElement, location)
    this.changeMarkerPosition(location)
  };

  createMap = (mapElement, location) => {
    this._mapElement = mapElement

    const mapOptions = {
      zoom: 15,
      center: location,
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: this.props.googleMaps.ControlPosition.TOP_RIGHT,
        style: this.props.googleMaps.ZoomControlStyle.SMALL,
      },
    }

    this.map = new this.props.googleMaps.Map(this._mapElement, mapOptions)
  };

  changeMarkerPosition = location => {
    if (!this.map) return
    if (this.marker) {
      this.marker.setMap(null)
      this.marker = null
    }

    const markerOptions = {
      position: location,
      draggable: true,
      map: this.map,
    }

    this.marker = new this.props.googleMaps.Marker(markerOptions)

    this.markerListener = this.props.googleMaps.event.addListener(
      this.marker,
      'position_changed',
      debounce(() => {
        const newPosition = this.marker.getPosition()
        this.handleMarkerPositionChange(newPosition)
      }, 1500)
    )
  };

  getLocation = geoCoordinates => {
    const [lng, lat] = this.props.geoCoordinates
    const location = new this.props.googleMaps.LatLng(lat, lng)
    return location
  };

  recenterMap = location => {
    if (!this.map) return

    this.map.panTo(location)
  };

  isDifferentGeoCoords(a, b) {
    return a[0] !== b[0] || a[1] !== b[1]
  }

  handleMarkerPositionChange = newPosition => {
    if (!this.geocoder) {
      this.geocoder = new this.props.googleMaps.Geocoder()
    }

    this.geocoder.geocode(
      { location: newPosition },
      this.handleNewMarkerPosition
    )
  };

  handleNewMarkerPosition = (results, status) => {
    const { googleMaps, onChangeAddress, rules } = this.props

    if (status === googleMaps.GeocoderStatus.OK) {
      if (results[0]) {
        const googleAddress = results[0]
        const address = geolocationAutoCompleteAddress(
          googleAddress,
          rules.geolocation,
          rules.country
        )
        const possibleChangedFields = {
          geoCoordinates: address.geoCoordinates,
          postalCode: address.postalCode,
        }
        onChangeAddress(possibleChangedFields)
      }
    } else {
      console.warn('Google Maps Error: ' + status)
    }
  };

  render() {
    return this.props.loadingGoogle
      ? this.props.loadingElement
      : this.props.children(this.mapMounted)
  }
}

Map.defaultProps = {
  loadingElement: <div>Loading...</div>,
}

Map.propTypes = {
  loadingElement: PropTypes.node,
  children: PropTypes.func.isRequired,
  geoCoordinates: PropTypes.array.isRequired,
  rules: PropTypes.object.isRequired,
  onChangeAddress: PropTypes.func.isRequired,
  loadingGoogle: PropTypes.bool,
  googleMaps: PropTypes.object,
}

export default Map