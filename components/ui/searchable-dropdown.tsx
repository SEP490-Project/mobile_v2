import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface SearchableDropdownProps {
  label: string;
  placeholder: string;
  data: { id: string | number; name: string }[];
  selectedValue: string | number | null;
  onSelect: (value: { id: string | number; name: string }) => void;
  error?: string;
  disabled?: boolean;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  placeholder,
  data,
  selectedValue,
  onSelect,
  error,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedItem = data.find((item) => item.id === selectedValue);

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (item: { id: string | number; name: string }) => {
    onSelect(item);
    setModalVisible(false);
    setSearchQuery("");
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        className={`border ${error ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 flex-row justify-between items-center ${disabled ? "bg-gray-100" : "bg-white"}`}
        activeOpacity={0.7}
      >
        <Text className={selectedItem ? "text-gray-800" : "text-gray-400"}>
          {selectedItem ? selectedItem.name : placeholder}
        </Text>
        <MaterialIcons
          name={disabled ? "lock" : "arrow-drop-down"}
          size={24}
          color={disabled ? "#9CA3AF" : "#6B7280"}
        />
      </TouchableOpacity>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl max-h-[70%]">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                  <Text className="text-lg font-semibold text-gray-800">{label}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-6 py-3 border-b border-gray-100">
                  <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
                    <MaterialIcons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-2 text-gray-800"
                      placeholder={`Search ${label.toLowerCase()}...`}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholderTextColor="#9CA3AF"
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <MaterialIcons name="clear" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* List */}
                <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      className={`px-6 py-4 border-b border-gray-100 ${
                        item.id === selectedValue ? "bg-rose-50" : ""
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-base ${
                          item.id === selectedValue
                            ? "text-rose-600 font-semibold"
                            : "text-gray-800"
                        }`}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View className="py-8 items-center">
                      <MaterialIcons name="search-off" size={48} color="#D1D5DB" />
                      <Text className="text-gray-500 mt-2">No results found</Text>
                    </View>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
