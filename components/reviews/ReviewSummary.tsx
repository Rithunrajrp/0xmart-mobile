import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ReviewSummary({
  averageRating,
  totalReviews,
  ratingDistribution,
}: ReviewSummaryProps) {
  // Convert to number in case it's a Decimal from Prisma
  const rating = typeof averageRating === 'number' ? averageRating : Number(averageRating);

  const renderStars = (ratingValue: number) => {
    return (
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.round(ratingValue) ? "star" : "star-outline"}
            size={20}
            color={star <= Math.round(ratingValue) ? "#facc15" : "#d1d5db"}
          />
        ))}
      </View>
    );
  };

  return (
    <View className="bg-card p-4 rounded-lg border border-border">
      <View className="flex-row gap-6">
        <View className="items-center">
          <Text className="text-5xl font-bold text-text-primary mb-2">
            {rating.toFixed(1)}
          </Text>
          {renderStars(rating)}
          <Text className="text-sm text-text-secondary mt-2">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </Text>
        </View>

        {ratingDistribution && (
          <View className="flex-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars as keyof typeof ratingDistribution] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <View key={stars} className="flex-row items-center gap-2 mb-2">
                  <View className="flex-row items-center gap-1 w-12">
                    <Text className="text-sm font-medium text-text-primary">{stars}</Text>
                    <Ionicons name="star" size={12} color="#facc15" />
                  </View>
                  <View className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <View
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text className="text-sm text-text-secondary w-8 text-right">
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
