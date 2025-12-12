import * as Location from "expo-location";
import { LocationCoordinates, GeocodedAddress } from "../types";

class LocationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Location permission denied");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  }

  async reverseGeocode(
    coordinates: LocationCoordinates
  ): Promise<GeocodedAddress | null> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        return {
          street: result.street || undefined,
          city: result.city || undefined,
          state: result.region || undefined,
          country: result.country || undefined,
          postalCode: result.postalCode || undefined,
          formattedAddress: [
            result.street,
            result.city,
            result.region,
            result.postalCode,
            result.country,
          ]
            .filter(Boolean)
            .join(", "),
        };
      }

      return null;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return null;
    }
  }

  async getCurrentAddress(): Promise<GeocodedAddress | null> {
    try {
      const coordinates = await this.getCurrentLocation();
      if (!coordinates) {
        return null;
      }

      return await this.reverseGeocode(coordinates);
    } catch (error) {
      console.error("Error getting current address:", error);
      return null;
    }
  }

  async searchAddress(query: string): Promise<GeocodedAddress[]> {
    try {
      const results = await Location.geocodeAsync(query);

      const addresses: GeocodedAddress[] = [];

      for (const result of results) {
        const geocoded = await this.reverseGeocode({
          latitude: result.latitude,
          longitude: result.longitude,
        });
        if (geocoded) {
          addresses.push(geocoded);
        }
      }

      return addresses;
    } catch (error) {
      console.error("Error searching address:", error);
      return [];
    }
  }
}

export const locationService = new LocationService();
