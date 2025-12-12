import { Tabs } from 'expo-router';
import { useCartStore } from '../../store/cart-store';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';

export default function TabLayout() {
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Collection',
        }}
      />
      <Tabs.Screen
        name="exclusive"
        options={{
          title: 'Exclusive',
        }}
      />
      <Tabs.Screen
        name="reward"
        options={{
          title: 'Reward',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
        }}
      />
    </Tabs>
  );
}
