import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faCheck } from '@fortawesome/free-solid-svg-icons'
export const IconValid = props => (
  <FontAwesomeIcon icon={ faCheck } { ...addClass(props, 'valid') } />
)

import { faTimes } from '@fortawesome/free-solid-svg-icons'
export const IconInvalid = props => (
  <FontAwesomeIcon icon={ faTimes } { ...addClass(props, 'invalid') } />
)

import { faInfo } from '@fortawesome/free-solid-svg-icons'
export const IconInfo = props => (
  <FontAwesomeIcon icon={ faInfo } { ...addClass(props, 'info') } />
)

import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
export const IconEdit = props => (
  <FontAwesomeIcon icon={ faPencilAlt } { ...addClass(props, 'edit') } />
)

import { faSearch } from '@fortawesome/free-solid-svg-icons'
export const IconSearch = props => (
  <FontAwesomeIcon icon={ faSearch } { ...addClass(props, 'search') } />
)

import { faCog } from '@fortawesome/free-solid-svg-icons'
export const IconConfig = props => (
  <FontAwesomeIcon icon={ faCog } { ...addClass(props, 'config') } />
)

import { faPlus } from '@fortawesome/free-solid-svg-icons'
export const IconPlus = props => (
  <FontAwesomeIcon icon={ faPlus } { ...addClass(props, 'plus') } />
)


function addClass(props, klass) {
  const p = { className: '', ...props }
  p.className += ' icon ' + klass;
  return p;
}


