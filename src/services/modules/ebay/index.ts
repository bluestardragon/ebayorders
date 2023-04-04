import axios, { AxiosResponse } from 'axios'
import PARAMS from './consts'
var base64 = require('base-64');

const getTokens = async (authorizeCode: string | (string | null)[] | null) => {
    try {
      const base64_encoded = base64.encode(`${PARAMS.CLIENT_ID}:${PARAMS.CLIENT_SECRET}`)
      const response = await axios.post(PARAMS.getTokenEndpoint, 
        {
          grant_type: 'authorization_code',
          code: authorizeCode,
          redirect_uri: PARAMS.REDIRECT_URI,
        }, {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${base64_encoded}`
          },
      });
      const { access_token, refresh_token } = response.data;
      return { access_token, refresh_token, error: null }
    } catch (error: any) {    
      return { error: error.message }    
    }
}

export { getTokens  }