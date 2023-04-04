import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ApplicationScreenProps } from '../../../@types/navigation';

import { WebView, WebViewNavigation } from 'react-native-webview'
import queryString from 'query-string';
import { getTokens } from '../../services/modules/ebay'
import { setAuthTokens } from '../../store/auth';
import PARAMS from '../../services/modules/ebay/consts'
const url = `${PARAMS.authorizeUrl}?client_id=${PARAMS.CLIENT_ID}&redirect_uri=${PARAMS.REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(PARAMS.scope)}`;

const Startup = ({ navigation }: ApplicationScreenProps) => {
  const dispatch = useDispatch();
  const authorzed = useRef(false);

  const handleNavigationStateChange = (navState:WebViewNavigation) => {
    const redirectUrlPrefix = 'https://signin.ebay.com/ws/eBayISAPI.dll';
    if (navState.url.startsWith(redirectUrlPrefix) && !authorzed.current) {
      const params = queryString.parse(navState.url.split('?')[1])
      const authorizationCode = params.code;
      authorzed.current = true;
      getTokens(authorizationCode).then(({access_token, refresh_token, error})=>{
        if(error){
          
        }else{
          dispatch(setAuthTokens({access_token, refresh_token}))
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      });      
    }
  };

  return (
    <WebView
      source={{ uri: url }}
      onNavigationStateChange={handleNavigationStateChange}
      style={{ flex:1 }}
    />
  );
};

export default Startup;
