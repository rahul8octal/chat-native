import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { View, Text, FlatList,TouchableOpacity } from "react-native";
import { useEffect } from "react"; 

import { useState } from "react";





const DATA = [
  {
    id: "1",
    message: "New community",
    icon:  <FontAwesome5 name="users" size={24} color="white" />,
  },
  // {
  //   id: "2",
  //   message: "Schedule",
  //   icon: <FontAwesome5 name="calendar-alt" size={24} color="black" />,
  // },
  // {
  //   id: "3",
  //   message: "Feypad",
  //   icon: <Ionicons name="keypad" size={24} color="black" />,
  // },
  // {
  //   id: "4",
  //   message: "Favorites",
  //   icon: <MaterialIcons name="favorite-border" size={24} color="black" />,
  // },

];


export default function Calls() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Select");

  // const options = ["Call", "Schedule", "Favorites"];
  
  const Item = ({ data }) => (
    <TouchableOpacity>
    <View className="flex-row items-center gap-4 mb-4 mr-6 ml-5">
      <View className=" bg-gray-200 p-4 rounded-xl  mt-4">
        {data.icon}
      </View>
      <Text className="text-xl  mt-2">{data.message}</Text>
    </View>
    </TouchableOpacity>

  );

  return (
    <View className="flex-1 bg-white mt-10">
      
      <View>
      <View className="flex-row items-center px-4 py-3 justify-between ml-2">
        <View>
          
            <Text className="text-2xl">Comminities</Text>
         
        </View>

        <View className="flex-row gap-4">
          
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="black"
            />
          </TouchableOpacity>

        </View>
        
      </View>
      </View>
      <FlatList
        data={DATA}
        renderItem={({ item }) => <Item data={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
       <View className="p-6 ">
                <TouchableOpacity
                
                  className="bg-green-600 border border-green-500 p-2 rounded-full flex-row justify-center items-center gap-2"
                >
                 
                  <Text className="text-white  font-semibold">+ Add group</Text>
                </TouchableOpacity>
              </View>

    </View>
    
  );
}