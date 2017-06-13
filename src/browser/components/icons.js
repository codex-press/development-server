import React from 'react';

import Check from 'react-icons/lib/fa/check';
export const IconValid = props => <Check {...addClass(props, 'valid')} />;

import Times from 'react-icons/lib/ti/times';
export const IconInvalid = props => <Times {...addClass(props, 'invalid')} />;

import Info from 'react-icons/lib/fa/info';
export const IconInfo = props => <Info {...addClass(props, 'info')} />;

import Pencil from 'react-icons/lib/fa/pencil';
export const IconEdit = props => <Pencil {...addClass(props, 'edit')} />;

import Search from 'react-icons/lib/fa/search';
export const IconSearch = props => <Search {...addClass(props, 'search')} />;

import Cog from 'react-icons/lib/fa/cog';
export const IconConfig = props => <Cog {...addClass(props, 'config')} />;

import Plus from 'react-icons/lib/fa/plus';
export const IconPlus = props => <Plus {...addClass(props, 'plus')} />;

function addClass(props, klass) {
  let p = {className: '', ...props};
  p.className += ' icon ' + klass;
  return p;
}


