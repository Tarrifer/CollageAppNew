import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

export default function FacedetectionAttendance() {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedFace, setDetectedFace] = useState([]);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);

  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Handle face detection
  const handleFaceDetected = ({ faces }) => {
    if (faces.length > 0) {
      console.log("Faces Detected:", faces.length);
      setDetectedFace(faces);
    } else {
      console.log("No faces detected!!");
    }
  };

  // Toggle face detection
  const toggleFaceDetected = async () => {
    if (isDetecting) {
      if (cameraRef.current) {
        await cameraRef.current.pausePreview();
      }
    } else {
      if (cameraRef.current) {
        await cameraRef.current.resumePreview();
      }
    }
    setIsDetecting((prev) => !prev);
  };

  // Toggle camera type
  const toggleCameraType = () => {
    setCameraType((prev) =>
      prev === Camera.Constants.Type.front
        ? Camera.Constants.Type.back
        : Camera.Constants.Type.front
    );
  };

  // Render face bounding boxes
  const renderFaceBoxes = () => {
    return detectedFace.map((face, index) => (
      <View
        key={index}
        style={[
          styles.faceBox,
          {
            left: face.bounds.origin.x,
            top: face.bounds.origin.y,
            width: face.bounds.size.width,
            height: face.bounds.size.height,
          },
        ]}
      />
    ));
  };

  // Check for permissions and render accordingly
  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to Camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        {isDetecting && (
          <Camera
            style={styles.camera}
            type={cameraType}
            onFacesDetected={handleFaceDetected}
            faceDetectorSettings={{
              mode: FaceDetector.FaceDetectorMode.fast,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
              runClassifications: FaceDetector.FaceDetectorClassifications.none,
              minDetectionInterval: 300,
              tracking: true,
            }}
            ref={cameraRef}
          >
            {renderFaceBoxes()}
          </Camera>
        )}
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleFaceDetected}>
          <Text style={styles.buttonText}>
            {isDetecting ? "Stop Detecting" : "Start Face Detection"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  faceBox: {
    position: "absolute",
    borderColor: "green",
    borderWidth: 2,
    borderRadius: 5,
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    borderRadius: 10,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    aspectRatio: 1, // Ensure the camera view maintains a proper aspect ratio
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});
