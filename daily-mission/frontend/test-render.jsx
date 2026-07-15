import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import Login from './src/pages/Login.jsx';

try {
  const html = renderToString(
    <StaticRouter>
      <Login />
    </StaticRouter>
  );
  console.log('Render successful!');
} catch (e) {
  console.error('Render failed:', e);
}
