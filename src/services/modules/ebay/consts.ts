const env:string = 'Prod'

const sandboxParams = {
    CLIENT_ID:'',
    CLIENT_SECRET:'',
    REDIRECT_URI:'', ///RU name in ebay    
    authorizeUrl:'https://auth.sandbox.ebay.com/oauth2/authorize',
    ///scope:'https://api.ebay.com/oauth/api_scope',  ///'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly';
    scope:['https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
            'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
            'https://api.ebay.com/oauth/api_scope',
            'https://api.ebay.com/oauth/api_scope/sell.finances',
            'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
            'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
            'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly'].join(' '),
    getTokenEndpoint: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
}

const prodParams = {
    CLIENT_ID:'',
    CLIENT_SECRET:'',
    REDIRECT_URI:'', ///RU name in ebay    
    authorizeUrl:'https://auth.ebay.com/oauth2/authorize',
    ////scope:'https://api.ebay.com/oauth/api_scope',  ///'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly';
    scope:['https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
            'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
            'https://api.ebay.com/oauth/api_scope',
            'https://api.ebay.com/oauth/api_scope/sell.finances',
            'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
            'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
            'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly'].join(' '),
    getTokenEndpoint: 'https://api.ebay.com/identity/v1/oauth2/token'
}

///const AUTHORIZATION_CODE = 'your_authorization_code';
///const url = `${authorizeUrl}?client_id=${clientId}&redirect_uri=${ru_name}&response_type=code&scope=${encodeURIComponent(scope)}`;
const params = (env === 'Sandbox')?{...sandboxParams}:{...prodParams}
export default params;
