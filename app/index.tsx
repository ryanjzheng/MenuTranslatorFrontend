import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Check if API is running
  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://10.6.223.44:8000/');
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error checking API status:', error);
    }
  };

  // Call checkApiStatus when component mounts
  useEffect(() => {
    checkApiStatus();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need access to your camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setPhoto(photo.uri);
      }
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return;

    console.log('Original photo URI:', photo);
    setIsUploading(true);
    try {
      // Use a fixed filename to always override the previous photo
      const filename = 'current_menu.jpg';
      const newPath = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.copyAsync({
        from: photo,
        to: newPath
      });

      console.log('Saved photo to:', newPath);

      const formData = new FormData();
      const photoUri = Platform.OS === 'ios' ? newPath.replace('file://', '') : newPath;
      
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: filename,
      } as any);

      const response = await fetch('http://10.6.223.44:8000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resultData = await response.json();

      console.log('Result data:', resultData);
      
      console.log('URI being passed to result screen:', newPath);

      router.push({
        pathname: '/result',
        params: {
          imageUri: newPath,
          resultData: JSON.stringify(resultData)
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Error',
        'Failed to process the image. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <View style={{ width: '90%', height: '70%' }}>
            <Image source={{ uri: photo }} style={styles.preview} />
          </View>
          <View style={styles.previewButtonsContainer}>
            <Button
              title="Retake"
              onPress={() => setPhoto(null)}
              disabled={isUploading}
            />
            <Button
              title={isUploading ? "Sending..." : "Send"}
              onPress={uploadPhoto}
              disabled={isUploading}
            />
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <CameraView 
            style={styles.camera} 
            facing={facing} 
            ref={cameraRef}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                <Text style={styles.buttonText}>↻ Flip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
            </View>
          </CameraView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  flipButton: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  previewButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
});