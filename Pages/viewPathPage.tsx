import React, { Component } from "react";

import API from "../utils/API";
import { StyleSheet, View, Button, Alert, Linking } from "react-native";
import ImagePicker from "react-native-image-picker";
import { Clue, screenHeight, screenWidth } from "../utils/data";
import MapView, { Marker } from "react-native-maps";

//asks permission from the phone to access camera
// const askForPermission = async () => {
//   const permissionResult = await Permissions.askAsync(Permissions.CAMERA);

//   if (permissionResult.status !== "granted") {
//     Alert.alert("no permissions to access camera");
//     return false;
//   }
//   return true;
// };

interface ViewPathPageProps {
  incompleteCluesOnPath: Clue[];
  completeCluesOnPath: Clue[];
  pathID: number | undefined;
}

interface ViewPathPageState {
  selectedClue?: number;
}

export default class ViewPathPage extends Component<
  ViewPathPageProps,
  ViewPathPageState
> {
  constructor(props: ViewPathPageProps) {
    super(props);

    this.state = {};

    this.addImageToClue = this.addImageToClue.bind(this);
    this.takeImage = this.takeImage.bind(this);
    this.openDirectionsToClue = this.openDirectionsToClue.bind(this);
  }

  // adds the given image string as base64 to the selected clue on the server
  addImageToClue(image: string) {
    API.put(`/clues/image/${this.state.selectedClue}`, {
      image: image,
    }).catch((error) => console.log(error));
  }

  //@ts-ignore
  componentDidMount() {}

  // takes the image with the camera and sends it to the server
  takeImage = async () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
      quality: 0.5,
    };
    ImagePicker.launchCamera(options, (response: any) => {
      //console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
        alert(response.customButton);
      } else {
        const source = { uri: response.uri };
        //console.log("response", JSON.stringify(response));
        const imageString = response.data;
        this.addImageToClue(imageString);
      }
    });
  };

  // opens google maps with the coordinates loaded of the selected clue.
  openDirectionsToClue() {
    if (this.state.selectedClue) {
      const selectedClue = this.props.incompleteCluesOnPath.find((clue) => {
        return clue.id === Number(this.state.selectedClue);
      });

      if (selectedClue) {
        const url: string = `http://maps.google.com/maps?q=${
          selectedClue!.lat
        },${selectedClue!.long}`;
        Linking.openURL(url);
      }
    }
  }

  styles = StyleSheet.create({
    cluespage: {
      position: "absolute",
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      width: screenWidth,
      height: screenHeight * 0.9,
      left: 0,
      backgroundColor: "#121212",
    },
    image: {
      padding: 5,
    },
    picturebutton: { margin: 10, borderColor: "#a85858", borderWidth: 2 },
    directionsbutton: { margin: 10, borderColor: "#a85858", borderWidth: 2 },
    cluelist: {},
    map: {
      width: screenWidth,
      height: screenHeight / 2,
    },
    button: { margin: 10, borderColor: "#a85858", borderWidth: 2 },
  });

  render() {
    return (
      <View style={this.styles.cluespage}>
        <MapView
          style={this.styles.map}
          showsUserLocation={true}
          initialRegion={{
            latitude: 42.3406995,
            longitude: -71.0897018,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {this.props.incompleteCluesOnPath.map((clue) => (
            <Marker
              coordinate={{ latitude: clue.lat, longitude: clue.long }}
              title={`${clue.listID}${clue.clueNumber}`}
              description={`${clue.name}, ${clue.id}`}
              key={clue.id}
              onPress={(ev) => this.setState({ selectedClue: clue.id })}
              pinColor="blue"
            />
          ))}
          {this.props.completeCluesOnPath.map((clue) => (
            <Marker
              coordinate={{ latitude: clue.lat, longitude: clue.long }}
              title={`${clue.listID}${clue.clueNumber}`}
              description={`${clue.name}, ${clue.id}`}
              key={clue.id}
              onPress={(ev) => this.setState({ selectedClue: clue.id })}
              pinColor="green"
            />
          ))}
        </MapView>
        <View style={this.styles.picturebutton}>
          <Button
            title="Take a Photo of the Selected Clue"
            onPress={this.takeImage}
            color="#a85858"
          />
        </View>
        <View style={this.styles.directionsbutton}>
          <Button
            title="Get Directions To Selected clue"
            onPress={this.openDirectionsToClue}
            color="#a85858"
          />
        </View>
      </View>
    );
  }
}
