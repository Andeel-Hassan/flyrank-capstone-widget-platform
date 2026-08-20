const axios = require('axios');

// Provider A — ip-api.com (free, no key, 45 req/min)
async function fetchFromProviderA(ip) {
  const response = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 3000 });
  if (response.data.status === 'fail') {
    throw new Error('Provider A failed to resolve IP');
  }
  return {
    country: response.data.country,
    city: response.data.city,
  };
}

// Provider B — ipapi.co (fallback, free tier ~1000/day)
async function fetchFromProviderB(ip) {
  const response = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 3000 });
  if (response.data.error) {
    throw new Error('Provider B failed to resolve IP');
  }
  return {
    country: response.data.country_name,
    city: response.data.city,
  };
}

async function enrichWithGeo(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.')) {
    return { country: null, city: null };
  }

  const forceFailA = process.env.FORCE_FAIL_GEO_A === 'true';

  try {
    if (forceFailA) throw new Error('Provider A forcibly disabled for testing');
    return await fetchFromProviderA(ip);
  } catch (errA) {
    console.warn('Geo provider A failed, trying provider B:', errA.message);
    try {
      return await fetchFromProviderB(ip);
    } catch (errB) {
      console.warn('Geo provider B also failed, continuing without geo data:', errB.message);
      return { country: null, city: null };
    }
  }
}

module.exports = { enrichWithGeo, fetchFromProviderA, fetchFromProviderB };