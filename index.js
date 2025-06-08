import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get('/getCryptoPrices', async (req, res) => {
  const symbols = req.query.symbols;
  const fiat = (req.query.fiat || 'USD').toUpperCase();

  if (!symbols) {
    return res.status(400).json({ error: 'Missing symbols param' });
  }

  try {
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
        },
        params: {
          symbol: symbols,
          convert: fiat,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error fetching data from CoinMarketCap' });
  }
});

// Nuove rotte per wallet info via Moralis (proxy server-safe)
app.get('/wallet/native', async (req, res) => {
  const { address, chain } = req.query;
  if (!address || !chain) {
    return res.status(400).json({ error: 'Missing address or chain' });
  }

  try {
    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=${chain}`,
      {
        headers: {
          'X-API-Key': process.env.MORALIS_API_KEY,
        },
      }
    );

    res.json({ balance: response.data.balance });
  } catch (err) {
    console.error(`[GET /wallet/native] Error:`, err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch native balance' });
  }
});


app.get('/wallet/erc20', async (req, res) => {
  const { address, chain } = req.query;
  if (!address || !chain) {
    return res.status(400).json({ error: 'Missing address or chain' });
  }

  try {
    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=${chain}`,
      {
        headers: {
          'X-API-Key': process.env.MORALIS_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(`[GET /wallet/erc20] Error:`, err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch ERC20 tokens' });
  }
});


app.get('/wallet/nfts', async (req, res) => {
  const { address, chain } = req.query;
  if (!address || !chain) {
    return res.status(400).json({ error: 'Missing address or chain' });
  }

  try {
    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=${chain}`,
      {
        headers: { 'X-API-Key': process.env.MORALIS_API_KEY },
      }
    );
    res.json(response.data.result || []);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error fetching NFTs' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
