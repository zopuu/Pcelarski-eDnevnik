import { Image } from 'expo-image';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { View } from 'react-native';

import { environment } from '@/shared/config/environment';
import { colors } from '@/shared/theme/colors';

type ApiaryHeaderImageProps = {
  imageUrl: string | null;
};

export function ApiaryHeaderImage({ imageUrl }: ApiaryHeaderImageProps) {
  return (
    <View
      accessible
      accessibilityLabel={imageUrl ? 'Fotografija pčelinjaka' : 'Ilustracija pčelinjaka'}
      className="h-36 w-36 items-center justify-center overflow-hidden rounded-3xl bg-primary/15"
    >
      {imageUrl ? (
        <Image
          source={`${environment.apiUrl}${imageUrl}`}
          contentFit="cover"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      ) : (
        <MaterialDesignIcons name="beehive-outline" size={68} color={colors.primaryDark} />
      )}
    </View>
  );
}
