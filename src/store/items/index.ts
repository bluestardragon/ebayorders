import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
    name: 'items',
    initialState: { inventories:[], addings:[] } as ThemeState ,
    reducers: {
        appendInventory: (state, { payload: { items } }) => {
            var ids = new Set(state.inventories.map(d => d.itemID));
            var merged = [...state.inventories, ...items.filter(d => !ids.has(d.itemID))];
            state.inventories = merged
        },
        updateAddingItems:(state, { payload:{ items }}) =>{
            state.addings = items.concat();
        }
    },
});

export const { appendInventory, updateAddingItems } = slice.actions;

export default slice.reducer;

export type ThemeState = {
    inventories: any[],
    addings: any[]
};

type ThemePayload = {
    payload: Partial<ThemeState>;
};