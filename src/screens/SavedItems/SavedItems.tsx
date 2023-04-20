import React, { useRef } from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '../../hooks';
import { Appbar } from 'react-native-paper';
import { ScrollView } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { SavedItem } from '../../components'
import { updateAddingItems } from '../../store/items'
export const SavedItems = ({navigation}) =>{
    const { Layout } = useTheme();
    const savedItems = useSelector((state) => state.items.inventories);  
    ///const addingItems = useRef(new Set());
    const [addingItems, setAddingItems]=React.useState(new Set());
    const dispatch = useDispatch();
    
    const onChanged = (index, checked)=>{
      if(checked){
        addingItems.add(index)        
      }else{
        addingItems.delete(index)
      }
      const updatedSet = new Set(addingItems);
      setAddingItems(updatedSet)
    }

    const addUnsoldItemsManually = () =>{      
      if(addingItems.size>0){
        const addings = [];
        for (const item of addingItems) {
          addings.push({...savedItems[item], type:'UnsoldListItem'})
        }
        dispatch( updateAddingItems({ items:addings }) );
      }
      navigation.goBack();
    }

    return(
        <View style={[Layout.fill]}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => { navigation.goBack() }} />
            <Appbar.Content title="Saved Items" />
            <Appbar.Action icon="plus" onPress={() => { addUnsoldItemsManually() }} disabled={addingItems.size==0}/>
          </Appbar.Header>
          <ScrollView>
          {
            savedItems.map((item, index)=>(<SavedItem item={ item } key={`${index}`} onChanged={(checked)=>onChanged(index, checked) } />))
          }
          </ScrollView>
      </View>
    )
}

export default SavedItems
