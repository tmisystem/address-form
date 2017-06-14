import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AddressShape from '../propTypes/AddressShape'
import find from 'lodash/find'
import map from 'lodash/map'

class Neighborhood extends Component {
  handleStateChange = e => {
    const state = e.target.value

    this.props.onChangeAddress({
      ...this.props.address,
      state,
    })
  };

  handleCityChange = e => {
    const city = e.target.value

    this.props.onChangeAddress({
      ...this.props.address,
      city,
    })
  };

  handleNeighborhoodChange = e => {
    const value = e.target.value

    this.props.onChangeAddress({
      ...this.props.address,
      ...this.deComposeValue(value),
    })
  };

  composeValue = address =>
    (address.neighborhood && address.postalCode
      ? `${address.neighborhood}___${address.postalCode}`
      : '');

  deComposeValue = value => {
    const [neighborhood, postalCode] = value.split('___')
    return { neighborhood, postalCode }
  };

  render() {
    const { address, rules } = this.props

    const stateField = find(rules.fields, ({ name }) => name === 'state')
    const cityField = find(rules.fields, ({ name }) => name === 'city')
    const neighborhoodField = find(
      rules.fields,
      ({ name }) => name === 'neighborhood'
    )

    return (
      <div>
        <label>
          {stateField.label}
          <select
            name="state"
            value={address.state || ''}
            onChange={this.handleStateChange}
          >
            <option value="" />
            {stateField.options.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label>
          {cityField.label}
          <select
            name="city"
            value={address.city || ''}
            onChange={this.handleCityChange}
          >
            <option value="" />
            {address.state && cityField.optionsMap[address.state]
              ? map(cityField.optionsMap[address.state], city => (
                <option key={city} value={city}>
                  {city}
                </option>
                ))
              : null}
          </select>
        </label>

        <label>
          {neighborhoodField.label}
          <select
            name="neighborhood"
            value={this.composeValue(address)}
            onChange={this.handleNeighborhoodChange}
          >
            <option value="" />
            {address.state &&
              address.city &&
              rules.neighborhoodPostalCodes[address.state] &&
              rules.neighborhoodPostalCodes[address.state][address.city]
              ? map(
                  rules.neighborhoodPostalCodes[address.state][address.city],
                  ({ postalCode, neighborhood }) => (
                    <option
                      key={neighborhood}
                      value={this.composeValue({ neighborhood, postalCode })}
                    >
                      {neighborhood}
                    </option>
                  )
                )
              : null}
          </select>
        </label>
      </div>
    )
  }
}

Neighborhood.propTypes = {
  address: PropTypes.shape(AddressShape),
  rules: PropTypes.object.isRequired,
  onChangeAddress: PropTypes.func.isRequired,
}

export default Neighborhood
