import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    try {
      setLoading(true);
      await api.createReview({
        productId,
        rating,
        title: title || undefined,
        comment: comment || undefined,
      });

      // Reset form
      setRating(0);
      setTitle("");
      setComment("");

      Alert.alert("Success", "Your review has been submitted!");
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to create review:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-card p-4 rounded-lg border border-border">
      <Text className="text-lg font-semibold text-text-primary mb-4">Write a Review</Text>

      <View className="mb-4">
        <Text className="text-text-primary mb-2">Rating *</Text>
        <View className="flex-row gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setRating(value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={value <= rating ? "star" : "star-outline"}
                size={32}
                color={value <= rating ? "#facc15" : "#d1d5db"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-text-primary mb-2">Review Title (Optional)</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Sum up your experience in a few words"
          placeholderTextColor="#6b7280"
          className="bg-background border border-border rounded-lg px-4 py-3 text-text-primary"
        />
      </View>

      <View className="mb-4">
        <Text className="text-text-primary mb-2">Your Review (Optional)</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Share your thoughts about this product..."
          placeholderTextColor="#6b7280"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="bg-background border border-border rounded-lg px-4 py-3 text-text-primary min-h-24"
        />
      </View>

      <View className="flex-row gap-2 justify-end">
        <TouchableOpacity
          onPress={() => {
            setRating(0);
            setTitle("");
            setComment("");
          }}
          className="px-4 py-2 rounded-lg border border-border"
        >
          <Text className="text-text-primary">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 rounded-lg ${loading ? "bg-primary/50" : "bg-primary"}`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-primary-foreground font-semibold">Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
