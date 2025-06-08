app.get('/getCryptoPrices', async (req, res) => {
  const symbols = req.query.symbols;
  const fiat = req.query.fiat || 'USD';

  if (!symbols) {
    return res.status(400).json({ error: 'Missing symbols parameter' });
  }

  const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());

  try {
    // Call CoinMarketCap
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
      params: {
        symbol: symbolList.join(','),
        convert: fiat,
      },
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
      },
    });

    // Filter out only those that returned data
    const result = {};
    for (const symbol of symbolList) {
      if (response.data.data[symbol]) {
        result[symbol] = response.data.data[symbol];
      }
    }

    res.json({ data: result });
  } catch (error) {
    console.error('CoinMarketCap error:', error.message || error);
    res.status(500).json({ error: 'Error fetching data from CoinMarketCap' });
  }
});
