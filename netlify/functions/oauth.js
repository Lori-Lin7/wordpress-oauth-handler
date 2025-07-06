const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('=== OAuth函數開始執行 ===');
  console.log('請求方法:', event.httpMethod);
  console.log('查詢參數:', event.queryStringParameters);
  console.log('Headers:', event.headers);

  const { code, error } = event.queryStringParameters || {};
  
  console.log('接收到的code:', code);
  console.log('接收到的error:', error);

  if (error) {
    console.log('OAuth錯誤，重定向到錯誤頁面');
    return {
      statusCode: 302,
      headers: { 'Location': `https://mapsai9.wordpress.com/oauth-success/?error=${error}` }
    };
  }
  
  if (!code) {
    console.log('沒有收到授權碼，重定向到錯誤頁面');
    return {
      statusCode: 302,
      headers: { 'Location': 'https://mapsai9.wordpress.com/oauth-success/?error=no_code' }
    };
  }
  
  try {
    console.log('開始調用WordPress.com token API');
    console.log('Client Secret (前6字符):', process.env.WORDPRESS_CLIENT_SECRET ? process.env.WORDPRESS_CLIENT_SECRET.substring(0, 6) + '...' : '未設置');
    
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
    
    console.log('WordPress API回應狀態:', response.status);
    console.log('WordPress API回應headers:', Object.fromEntries(response.headers.entries()));
    
    const tokens = await response.json();
    console.log('WordPress API回應內容:', tokens);
    
    if (tokens.access_token) {
      console.log('成功獲得access token，重定向到成功頁面');
      return {
        statusCode: 302,
        headers: { 'Location': `https://mapsai9.wordpress.com/oauth-success/?token=${tokens.access_token}` }
      };
    } else {
      console.log('沒有獲得access token，可能有錯誤');
      return {
        statusCode: 302,
        headers: { 'Location': `https://mapsai9.wordpress.com/oauth-success/?error=no_token&details=${encodeURIComponent(JSON.stringify(tokens))}` }
      };
    }
  } catch (error) {
    console.log('調用WordPress API時發生錯誤:', error.message);
    console.log('錯誤詳情:', error);
    return {
      statusCode: 302,
      headers: { 'Location': `https://mapsai9.wordpress.com/oauth-success/?error=api_error&message=${encodeURIComponent(error.message)}` }
    };
  }
};
