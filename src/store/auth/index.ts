import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
    name: 'auth',
    initialState: { access_token: null, refresh_token:null } ,
    reducers: {
        setAuthTokens: (state, { payload: { access_token, refresh_token } }) => {
            if (typeof access_token !== 'undefined') {
                state.access_token = access_token;
            }
            if (typeof refresh_token !== 'undefined') {
                state.refresh_token = refresh_token;
            }
        },
    },
});
export const { setAuthTokens } = slice.actions;

export default slice.reducer;
  

export type AuthTokenState = {
    access_token: string | null;
    refresh_token: string | null;
}; 