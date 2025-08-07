const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.use('/proxy', createProxyMiddleware({
  target: '',
  changeOrigin: true,
  selfHandleResponse: true,
  pathRewrite: {
    '^/proxy/': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    const target = decodeURIComponent(req.url.split('/proxy/')[1]);
    proxyReq.path = new URL(target).pathname + new URL(target).search;
    proxyReq.setHeader('referer', new URL(target).origin);
    proxyReq.setHeader('origin', new URL(target).origin);
  },
  onProxyRes: (proxyRes) => {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
  }
}));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});