import { View, Image, StyleSheet, Dimensions, Text, ViewStyle } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

interface Translation {
    chinese: string;
    english: string;
    position: number[][];
}

interface ImageInfo {
    width: number;
    height: number;
    filename: string;
    format: string;
}

interface ResultData {
    status: string;
    translations: Translation[];
    image_info: ImageInfo;
}

export default function ResultScreen() {
    const { imageUri, resultData } = useLocalSearchParams();
    const parsedData: ResultData = JSON.parse(resultData as string);
    const screenWidth = Dimensions.get('window').width;

    // Calculate initial scaling factor based on image width and screen width
    const imageScale = screenWidth / parsedData.image_info.width;

    // Simply use the URI as is - it should now be in a permanent location
    const formattedUri = imageUri;

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: formattedUri as string }}
                    style={[
                        styles.image,
                        {
                            aspectRatio: parsedData.image_info.width / parsedData.image_info.height,
                            backgroundColor: 'blue'
                        }
                    ]}
                    resizeMode="contain"
                    onError={(error) => {
                        console.error('Image loading error:', error.nativeEvent.error);
                        console.error('Failed URI:', formattedUri);
                    }}
                />

                {/* Bounding Box Overlays */}
                {parsedData.translations.map((translation, index) => {
                    const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = translation.position;
                    const boxStyle: ViewStyle = {
                        position: 'absolute',
                        left: x1 * imageScale,
                        top: y1 * imageScale,
                        width: (x2 - x1) * imageScale,
                        height: (y4 - y1) * imageScale,
                        borderWidth: 1,
                        borderColor: 'red',
                    };

                    return (
                        <View key={index} style={[styles.boundingBox, boxStyle]}>
                            <View style={styles.textContainer}>
                                <Text 
                                    style={styles.englishText}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >{translation.english}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: undefined,
        backgroundColor: '#e0e0e0',
    },
    image: {
        width: '100%',
        height: undefined,  // Let height be determined by aspectRatio
    },
    boundingBox: {
        position: 'absolute',
    },
    textContainer: {
        position: 'absolute',
        left: '100%',
        top: -5,
        maxWidth: 200,
        minWidth: 100,
        flexDirection: 'row',
    },
    englishText: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: 2,
        borderRadius: 4,
        fontSize: 8,
        color: 'black',
        marginLeft: 5,
        zIndex: 2,
        flexShrink: 1,
    }
}); 