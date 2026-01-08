import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api";

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [productId, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await api.getProductReviews(productId, { page, limit: 10 });
      setReviews(response.reviews);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await api.markReviewHelpful(reviewId);
      loadReviews();
    } catch (error) {
      console.error("Failed to mark review as helpful:", error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color={star <= rating ? "#facc15" : "#d1d5db"}
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item: review }: { item: Review }) => (
    <View className="bg-card p-4 rounded-lg mb-4 border border-border">
      <View className="flex-row gap-3">
        <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
          <Ionicons name="person" size={20} color="#9ca3af" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-text-primary font-medium">{review.userName}</Text>
            {review.isVerified && (
              <View className="bg-secondary px-2 py-0.5 rounded">
                <Text className="text-xs text-secondary-foreground">Verified</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-2 mb-2">
            {renderStars(review.rating)}
            <Text className="text-sm text-text-secondary">
              {new Date(review.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {review.title && (
            <Text className="text-text-primary font-semibold mb-2">{review.title}</Text>
          )}

          {review.comment && (
            <Text className="text-text-secondary mb-3">{review.comment}</Text>
          )}

          <TouchableOpacity
            onPress={() => handleMarkHelpful(review.id)}
            className="flex-row items-center gap-1"
          >
            <Ionicons name="thumbs-up-outline" size={16} color="#9ca3af" />
            <Text className="text-sm text-text-secondary">
              Helpful ({review.helpfulCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && page === 1) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View className="bg-card p-8 rounded-lg items-center border border-border">
        <Text className="text-text-secondary text-center">
          No reviews yet. Be the first to review this product!
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-text-primary">
          Customer Reviews ({total})
        </Text>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListFooterComponent={
          totalPages > 1 ? (
            <View className="flex-row items-center justify-center gap-2 mt-4">
              <TouchableOpacity
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg border ${
                  page === 1 ? "bg-muted border-muted" : "bg-card border-border"
                }`}
              >
                <Text className={page === 1 ? "text-text-secondary" : "text-text-primary"}>
                  Previous
                </Text>
              </TouchableOpacity>
              <Text className="text-sm text-text-secondary">
                Page {page} of {totalPages}
              </Text>
              <TouchableOpacity
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg border ${
                  page === totalPages ? "bg-muted border-muted" : "bg-card border-border"
                }`}
              >
                <Text
                  className={page === totalPages ? "text-text-secondary" : "text-text-primary"}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}
