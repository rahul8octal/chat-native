import { Feather, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { View, Text, FlatList,TouchableOpacity,TextInput,Image } from "react-native";
import { useEffect } from "react"; 
import { router } from "expo-router";
import { useState } from "react";
import { useSocket } from "@/context/SocketContext";





export default function Calls() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Select"); 
  const [search, setSearch] = useState("");
const [showcheck, setShowCheck] = useState(false);

    const { socket, contacts } = useSocket();
  
    useEffect(() => {
      if (socket) {
        socket.emit("get-contacts");
      }
    }, [socket]);

    
  
  const Item = ({ data }) => (
     <TouchableOpacity 
       className="flex-row justify-between border border-gray-100 p-3 rounded-xl  mb-3 items-center"
       onPress={() => {
         console.log("Selected contact:", data);
       }}
     >
     <View  className="flex-row gap-3 mb-3 items-center">
     <View>
     
     <Image
       source={{
         uri: data.profile_image || `https://ui-avatars.com/api/?name=${data.username || "User"}&background=random`,
       }}
       className="w-12 h-12 rounded-full bg-gray-200"
     />
   </View>
   <View>
     <Text className="font-bold text-lg">{data.name || "Unknown"}</Text>
     <Text className="text-gray-500">{data.about || "Available"}</Text>
   </View>
     </View>
      
       <View>
        {/* <TouchableOpacity> <Text><Feather name="circle" size={24} color="black" /></Text></TouchableOpacity> */}
        <TouchableOpacity onPress={() => setShowCheck(!showcheck)}>
                    {showcheck ? (
                   <Feather name="circle" size={24} color="black" />
                    ) : (
                      <FontAwesome5 name="check-circle" size={24} color="black" />
                    )}
                  </TouchableOpacity>
       </View>
      
     </TouchableOpacity>
     
   );

  return (
    <View className="bg-white mt-10">
      
      <View>
      <View className=" py-3 justify-between">
        

           <View className="mx-4 mt-2 mb-2">
           <View>
          
        </View>
                <View className="flex-row items-center justify-between bg-gray-100 rounded-full   pl-4 pr-4">
                
                <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 flex-row items-center "
          >
            <Text>
            <Feather name="arrow-left" size={24} color="black" />
            </Text>
            
            <TextInput
                    placeholder="Search name or number..."
                    placeholderTextColor="#888"
                    className="ml-2  text-gray-800"
                    value={search}
                    onChangeText={setSearch}
                  />
           
          </TouchableOpacity>
                  
                  <Text><Ionicons name="keypad" size={22} color="black" /></Text>
                </View>
              </View>
        
      </View>
      </View>
      <View className="ml-5">
        <Text className="font-semibold text-gray-800">Frequently contacted</Text>
      </View>
      <FlatList
        data={contacts}
        renderItem={({ item }) => <Item data={item} />}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-10">
            <Text className="text-gray-500">No contacts found</Text>
          </View>
        }
      />
      

    </View>
    
  );
}