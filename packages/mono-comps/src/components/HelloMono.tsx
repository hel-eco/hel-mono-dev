import React from 'react';

export function HelloMono() {
  const [num, setNum] = React.useState(0);

  return (
    <div>
      <h1>hello hel mono</h1>
      <h3>num: {num}</h3>
      <button onClick={() => setNum(Date.now())}>change num</button>
    </div>
  );
}
