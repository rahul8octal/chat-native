import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { View, Text, FlatList,TouchableOpacity } from "react-native";





const DATA = [
  {
    id: "1",
    message: "Call",
    icon: <Ionicons name="call-outline" size={24} color="black" />,
  },
  {
    id: "2",
    message: "Schedule",
    icon: <FontAwesome5 name="calendar-alt" size={24} color="black" />,
  },
  {
    id: "3",
    message: "Feypad",
    icon: <Ionicons name="keypad" size={24} color="black" />,
  },
  {
    id: "4",
    message: "Favorites",
    icon: <MaterialIcons name="favorite-border" size={24} color="black" />,
  },

];

export default function Calls() {
  
  const Item = ({ data }) => (
    <TouchableOpacity>
    <View className="items-center mr-6 ml-5">
      <View className=" bg-gray-100 p-5 rounded-full mt-4">
        {data.icon}
      </View>
      <Text className="text-base mt-2">{data.message}</Text>
    </View>
    </TouchableOpacity>

  );

  return (
    <View className="bg-white mt-10">
      <View>
      <View className="flex-row items-center px-4 py-3 justify-between">
        <View>
          
            <Text className="text-2xl">Calls</Text>
         
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
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
      {/* <View className="mt-5">
        <Text className="text-2xl">Recent</Text>
      </View> */}
    </View>
  );
}
