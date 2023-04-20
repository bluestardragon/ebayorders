import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native'
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { WebView, WebViewNavigation } from 'react-native-webview'
import queryString from 'query-string';

import { ApplicationScreenProps } from '../../../@types/navigation';
import { useTheme } from '../../hooks';

import { getTokens, getUser } from '../../services/modules/ebay'
import { setAuthTokens } from '../../store/auth';
import PARAMS from '../../services/modules/ebay/consts'

const LOGIN_URL = `${PARAMS.authorizeUrl}?client_id=${PARAMS.CLIENT_ID}&redirect_uri=${PARAMS.REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(PARAMS.scope)}`;
const LOGOUT_URL = 'https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&lgout=1';
///const url = `${PARAMS.authorizeUrl}?client_id=${PARAMS.CLIENT_ID}&redirect_uri=${PARAMS.REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(PARAMS.scope)}`;

const Startup = ({ navigation, route }: ApplicationScreenProps) => {
  const dispatch = useDispatch();
  const authorzed = useRef(false);
  const webviewRef = useRef(null);
  const { Common, Fonts, Gutters, Layout, Images, darkMode: isDark } = useTheme();

  const [url, SetUrl] = useState(LOGIN_URL);
  
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  React.useEffect(() => {
    if ( route.params?.logout) {
      console.log('logout triggered');
      authorzed.current = false;
      SetUrl(LOGOUT_URL)
    }
  }, [route.params?.logout]);

  const handleNavigationStateChange = (navState:WebViewNavigation) => {
    const redirectUrlPrefix = 'https://signin.ebay.com/ws/eBayISAPI.dll';
    const logout_redirected_url = 'https://www.ebay.com/';
    console.log("URL_WebView", navState);
    if (navState.url.startsWith(redirectUrlPrefix) && !navState.loading) {
      const params = queryString.parse(navState.url.split('?')[1])
      console.log("PARAMS", params);
      const { isAuthSuccessful, code:authorizationCode , expires_in} = params;
      if(isAuthSuccessful){
        authorzed.current = true;
        getTokens(authorizationCode).then(({access_token, refresh_token, error})=>{
          if(error){
            
          }else{
            dispatch(setAuthTokens({access_token, refresh_token}))
            getUser(access_token)
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          }
        });
      }
    }

    if(navState.url.startsWith(logout_redirected_url) && navState.loading) {
      SetUrl(LOGIN_URL)
    }
  };

  return (
    <View style={[Layout.fullSize,Layout.fill,]}>
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        style={{ flex:1 }}
        ref={webviewRef}
      />
    </View>
  );
};

export default Startup;
