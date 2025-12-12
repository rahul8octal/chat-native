import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, TouchableOpacity, Image, FlatList,ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";


const DATA = [
  {
    id: 1,
    name: "Rahul",
    message: "Be happy",
    contact: "95745 15762",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU0c3V2uvL-cJ1mHLYvzcol2EJWw8DxMiJIw&s",
  },
];

export default function Profile() {
  const Item = ({ data }) => (
    <View className="items-center  gap-3">
      <View>
        <Image
          source={{
            uri: data.url,
          }}
          className="w-28 h-28 rounded-full bg-gray-200"
        />
      </View>
      <View className="items-center">
        <Text className="font-semibold text-2xl">{data.name}</Text>
        <Text className="text-xl">{data.contact}</Text>
        <Text className="text-xl">{data.message}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="  ">
      
      <View className="flex-row  px-4 py-3  justify-between bg-white">
        <View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 flex-row"
          >
            <Ionicons name="chevron-back" size={28} color="#16a34a" />
          </TouchableOpacity>
        </View>

        <View className="flex-row ">
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

     
      <View className="bg-white items-center pb-4">
        <FlatList
          data={DATA}
          renderItem={({ item }) => <Item data={item} />}
          keyExtractor={(item) => item.id}
        />

        <View className="flex-row mt-2 gap-3 items-center   ">
          <View className="border border-gray-300 pt-3 pb-3 pr-6 pl-6 rounded-xl items-center">
            <View>
              <Text>
                <Ionicons name="call-outline" size={25} color="#16a34a" />
              </Text>
            </View>
            <View>
              <Text>Audio</Text>
            </View>
          </View>
          <View className="border border-gray-300 pt-3 pb-3 pr-6 pl-6 rounded-xl items-center ">
            <View>
              <Text>
                <MaterialCommunityIcons
                  name="video-outline"
                  size={26}
                  color="#16a34a"
                />
              </Text>
            </View>
            <View>
              <Text>Video</Text>
            </View>
          </View>

          <View className="border border-gray-300 pt-3 pb-3 pr-6 pl-6 rounded-xl items-center">
            <View>
              <Text>
                <FontAwesome name="rupee" size={22} color="#16a34a" />
              </Text>
            </View>
            <View>
              <Text>Pay</Text>
            </View>
          </View>
          <View className="border border-gray-300 pt-3 pb-3 pr-6 pl-6 rounded-xl items-center">
            <View>
              <Text>
                <Ionicons name="search" size={25} color="#16a34a" />
              </Text>
            </View>
            <View>
              <Text>Search</Text>
            </View>
          </View>
        </View>
      </View>
     
     
     
   
      <View className="bg-white mt-4">
        <View className="mt-2 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="black"
                />
              </Text>
            </View>
            <View className="flex-row">
              <Text>Notifications</Text>
              {/* <Text>2</Text> */}
            </View>
          </View>
        </View>

        <View className="mt-2 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
                <MaterialCommunityIcons
                  name="image-outline"
                  size={24}
                  color="black"
                />
              </Text>
            </View>
            <View>
              <Text>Media Visibility</Text>
            </View>
          </View>
        </View>

        <View className="mt-2 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
                <MaterialCommunityIcons
                  name="star-outline"
                  size={24}
                  color="black"
                />
              </Text>
            </View>
            <View>
              <Text>Starred Messages</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="bg-white mt-4 mb-5">
        <View className="mt-2 mr-4 ">
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
              <Text>Encryption</Text>
              <Text>Messages and calls are end-to-end encrypted.Tap to varify.</Text>
            </View>
          </View>
        </View>
    
        <View className="mt-2  ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
                <MaterialCommunityIcons
                  name="progress-clock"
                  size={24}
                  color="black"
                />
              </Text>
            </View>
            <View>
              <Text>Disapearing messages</Text>
              <Text>Off</Text>
            </View>
          </View>
        </View>

        <View className="mt-2 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
                <MaterialCommunityIcons
                  name="message-text-lock-outline"
                  size={24}
                  color="black"
                />
              </Text>
            </View>
            <View>
              <Text>Chat Lock</Text>
              <Text>Lock and hide theschat on thesdevice.</Text>
            </View>
          </View>
        </View>
        <View className="mt-2 ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
                <MaterialIcons name="privacy-tip" size={24} color="black" />
              </Text>
            </View>
            <View>
              <Text>Advanced Chat privacy</Text>
              <Text>
                Off
              </Text>
            </View>
          </View>
        </View>
        </View>
        <View className="bg-white mt-4 mb-5">
        <View className="mt-2 mr-4 ">
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
              <Text>Add to favourite</Text>
            </View>
          </View>
        </View>

        <View className="mt-2  ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
                <MaterialCommunityIcons
                  name="progress-clock"
                  size={24}
                  color="black"
                />
              </Text>
            </View>
            <View>
              <Text>Add to list </Text>
            </View>
          </View>
        </View>
        <View className="mt-2  ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
                <MaterialCommunityIcons
                  name="progress-clock"
                  size={24}
                  color="black"
                />
              </Text>
            </View>
            <View>
              <Text>Block </Text>
            </View>
          </View>
        </View>
        <View className="mt-2  ">
          <View className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4">
            <View>
              <Text>
                <MaterialCommunityIcons
                  name="progress-clock"
                  size={24}
                  color="black"
                />
              </Text>
            </View>
            <View>
              <Text>Report</Text>
            </View>
          </View>
      </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
