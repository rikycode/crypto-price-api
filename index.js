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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
