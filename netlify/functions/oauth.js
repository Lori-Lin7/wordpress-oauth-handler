const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const { code, error } = event.queryStringParameters || {};
  
  if (error) {
    return {
      statusCode: 302,
      headers: { 'Location': `https://mapsai9.wordpress.com/oauth-success/?error=${error}` }
    };
  }
  
  if (!code) {
    return {
      statusCode: 302,
      headers: { 'Location': 'https://mapsai9.wordpress.com/oauth-success/?error=no_code' }
    };
  }
  
  try {
    const response = await fetch('https://public-api.wordpress.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: '120438',
        client_secret: process.env.WORDPRESS_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `https://${event.headers.host}/.netlify/functions/oauth`
      })
    });
    
    const tokens = await response.json();
    
    return {
      statusCode: 302,
      headers: { 'Location': `https://mapsai9.wordpress.com/oauth-success/?token=${tokens.access_token}` }
    };
  } catch (error) {
    return {
      statusCode: 302,
      headers: { 'Location': `https://mapsai9.wordpress.com/oauth-success/?error=server_error` }
    };
  }
};
