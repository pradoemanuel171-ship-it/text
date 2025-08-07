const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.use('/proxy', (req, res, next) => {
  const targetUrl = decodeURIComponent(req.url.replace(/^\/proxy\//, ''));

  if (!targetUrl.startsWith('http')) {
    return res.status(400).send('URL inválida');
  }

  // Crea el middleware dinámicamente con target correcto
  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: () => '',
    onProxyReq: (proxyReq) => {
      const origin = new URL(targetUrl).origin;
      proxyReq.setHeader('referer', origin);
      proxyReq.setHeader('origin', origin);
    },
    onProxyRes: (proxyRes) => {
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
    }
  });

  return proxy(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
