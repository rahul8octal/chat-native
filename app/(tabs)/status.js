import { View, Text,Image,FlatList } from "react-native";
import logo1 from "@/assets/logo1.jpeg";

export default function Status() {

  const Image = [
      {
        id: 1,
        name: "Urvisha",
        message: "Hello..",
        time: "Yesterday",
        url: logo1,
      },
  ]
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl">Status Screen</Text>
      {/* <FlatList
                  data={Image}
                  renderItem={({ item, index }) => {
                    return (
       <Image
                              source={item.url}
                              style={{ width: 40, height: 40 }}
                              className="rounded-full"
                            />
                          );
                        }}
                            /> */}
    </View>
  );
}
