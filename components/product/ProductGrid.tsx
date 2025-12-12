import React from "react";
import { FlatList, View, Text, StyleSheet, RefreshControl } from "react-native";
import { Product, StablecoinType } from "../../types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  stablecoin?: StablecoinType;
  numColumns?: number;
  loading?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductPress,
  stablecoin = "USDT",
  numColumns = 2,
  loading = false,
  onRefresh,
  onEndReached,
  ListEmptyComponent,
  ListHeaderComponent,
}) => {
  const renderItem = ({ item }: { item: Product }) => (
    <View style={[styles.itemContainer, { width: `${100 / numColumns}%` }]}>
      <ProductCard
        product={item}
        onPress={() => onProductPress(item)}
        stablecoin={stablecoin}
      />
    </View>
  );

  const defaultEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No products found</Text>
    </View>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={ListEmptyComponent || defaultEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  itemContainer: {
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#a0a0a0",
  },
});
