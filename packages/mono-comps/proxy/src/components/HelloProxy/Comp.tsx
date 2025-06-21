import React from 'react';
import { LIB_NAME } from '../../configs/subApp';

function Comp() {
  return <h1 data-testid="hel-proxy-wrap">Hello, this is {LIB_NAME} package proxy</h1>;
}

export default Comp;
