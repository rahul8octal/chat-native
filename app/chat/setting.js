import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, TouchableOpacity, Image, FlatList,ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';

const DATA = [
  {
    id: 1,
    name: "Tina",
    message: "Be happy....",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpe30_YsS6a4vvaz2setu-IEBWpPsfH935KA&s",
  },
];

export default function Setting() {
  const Item = ({ data }) => (
    <View className=" flex-row items-center  gap-3">
      <View>
        <Image
          source={{
            uri: data.url,
          }}
          className="w-16 h-16 rounded-full "
        />
      </View>
      <View className="">
        <Text className="font-semibold text-2xl">{data.name}</Text>
        <Text className="text-xl">{data.message}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="  ">
      
      <View className="flex-row  px-4 py-3  justify-between bg-white border-b border-gray-200 ">
        <View className="flex-row mt-2 ">
          
          <TouchableOpacity
            onPress={() => router.back()}
            className=""
          >
            <Ionicons name="chevron-back" size={28} color="#16a34a" />
            
          </TouchableOpacity>
          <Text className="text-2xl ml-4">Setting
     </Text>
         </View>
         
  
        <View className="mt-2">
          <TouchableOpacity>
            <Text>

            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="black"
            />
            </Text>
          </TouchableOpacity>
        </View>
      </View>


      <ScrollView>

      <View className="bg-white pl-8 pb-3  mt-2 flex-row border-b border-gray-200 pt-3">
        <FlatList
          data={DATA}
          renderItem={({ item }) => <Item data={item} />}
          keyExtractor={(item) => item.id}
        />
        <View className="flex-row mt-3">
           <TouchableOpacity className=" mr-3">
           <Ionicons name="qr-code" size={22} color="#16a34a" />
           </TouchableOpacity>
           <TouchableOpacity
         
          className=" mr-3"
        >
          <Ionicons name="add-circle-outline" size={22} color="#16a34a" />
        </TouchableOpacity>
        </View>
       
      </View>
     
     
     
   
      <View className="bg-white">
        <View className="mt-2 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <MaterialCommunityIcons name="key-outline" size={22} color="black" />
              </Text>
            </View>
            <View className="">
              <Text className="text-xl">Account</Text>
              <Text className="text-gray-700">Security notification,change number</Text>
            </View>
          </View>
        </View>

        <View className="mt-2 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <MaterialCommunityIcons
                  name="lock-outline"
                  size={24}
                  color="black"
                />
            
              </Text>
            </View>
            <View>
            <Text className="text-xl">Privacy</Text>
            <Text className="text-gray-700">Block contact</Text>
            </View>
          </View>
        </View>

        <View className="mt-2 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <MaterialCommunityIcons name="face-woman-shimmer" size={24} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">Avatar</Text>
            <Text className="text-gray-700">Create,adit,profile photo</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="bg-white">
        <View className="mt-2 mr-4 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <FontAwesome5 name="users" size={24} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">Lists</Text>
            <Text className="text-gray-700">Manage people and groups</Text>
            </View>
          </View>
        </View>
    
        <View className="  ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">Chats</Text>
            <Text className="text-gray-700"> Chat history </Text>
            </View>
          </View>
        </View>

        <View className=" ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <MaterialIcons name="broadcast-on-home" size={24} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">Broadcasts</Text>
            <Text className="text-gray-700">Manage lists and broadcasts</Text>
            </View>
          </View>
        </View>
        <View className=" ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <Ionicons name="notifications-outline" size={24} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">Notifications</Text>
            <Text className="text-gray-700">Manage groups and call tones</Text>
            </View>
          </View>
        </View>
        </View>
        <View className="bg-white mb-10">
        <View className=" mr-4 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <MaterialIcons name="settings-backup-restore" size={24} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">Storage and date</Text>
            <Text className="text-gray-700">Network usage</Text>
            </View>
          </View>
        </View>

        <View className="  ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <Ionicons name="accessibility" size={24} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">Accasibility</Text>
            <Text className="text-gray-700">Encrease contrast,animation</Text>
            </View>
          </View>
        </View>
        <View className="  ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <MaterialIcons name="language" size={24} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">App language</Text>
            <Text className="text-gray-700">English</Text>
            </View>
          </View>
        </View>
        <View className="">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <Ionicons name="help-circle-outline" size={24} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">Help and feedback</Text>
            <Text className="text-gray-700">Help center,contact us,privacy policy</Text>
            </View>
          </View>
      </View>
      <View className=" ">
          <View className=" pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <Feather name="users" size={21} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">Invite friend</Text>
            
            </View>
          </View>
      </View>
      <View className="mb-10 ">
          <View className=" pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
              <MaterialIcons name="security-update-good" size={22} color="black" />
              </Text>
            </View>
            <View>
            <Text className="text-xl text-gray-800">App updates</Text>
            
            </View>
          </View>
      </View>
      {/* <TouchableOpacity
            accessibilityRole="button"
            onPress={handleLogout}
            className="ml-2 bg-red-50 border border-red-100 px-3 py-1 rounded-full"
          >
            <Text className="text-red-600 text-sm font-semibold">Logout</Text>
          </TouchableOpacity> */}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
