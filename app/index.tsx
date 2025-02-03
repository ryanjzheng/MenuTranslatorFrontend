import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { Platform } from 'react-native';

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

    setIsUploading(true);
    try {
      const formData = new FormData();

      // Mobile photo handling - just append the file URI
      formData.append('file', {
        uri: Platform.OS === 'ios' ? photo.replace('file://', '') : photo,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      console.log('Uploading photo:', photo);

      const response = await fetch('http://10.6.223.44:8000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        Alert.alert('Success', 'Image uploaded successfully');
        console.log('Translated text:', result.translated_text);
      } else {
        Alert.alert('Error', result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to connect to the server');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.preview} />
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
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.buttonText}>↻ Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
          </View>
        </CameraView>
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
    width: '90%',
    height: '70%',
    borderRadius: 10,
    marginBottom: 20,
  },
  previewButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
});