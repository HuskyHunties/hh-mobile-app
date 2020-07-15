import { screenHeight, screenWidth, Clue } from "../utils/data";
import React, { Component } from "react";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  useWindowDimensions,
  Linking,
} from "react-native";
import API from "../utils/API";

interface ModifyPathPageProps {
  allClues: Clue[];
  cluesOnPath: Clue[];
  cluesNotOnPath: Clue[];
  pathID: number | undefined;
}

interface ModifyPathPageState {
  selectedClueID?: number;
}
export default class ModifyPathPage extends Component<
  ModifyPathPageProps,
  ModifyPathPageState
> {
  constructor(props: ModifyPathPageProps) {
    super(props);

    this.state = {};
  }

  // sends an API request to add the selected clue to the selected path in the app's state
  addClueToPath(clueID?: number) {
    if (this.props.pathID && clueID) {
      console.log(`/paths/${this.props.pathID}/clue/override`);
      API.put(`/paths/${this.props.pathID}/clue/override`, {
        clueID: clueID,
      }).catch((error) => console.log(error));
    }
  }

  // sends an API request to remove the selected clue from the selected path in the app's state
  removeClueFromPath(clueID?: number) {
    if (this.props.pathID && clueID) {
      console.log(`/paths/${this.props.pathID}/clue/${clueID}`);
      API.delete(`/paths/${this.props.pathID}/clue/${clueID}`).catch((error) =>
        console.log(error)
      );
    }
  }

  styles = StyleSheet.create({
    mappage: {
      position: "relative",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      width: screenWidth,
      height: screenHeight * 0.9,
      left: 0,
      backgroundColor: "#121212",
      color: "white",
    },
    map: {
      width: screenWidth,
      height: screenHeight / 2,
    },
    button: { margin: 10, borderColor: "#a85858", borderWidth: 2 },
  });
  render() {
    //console.log(this.props.cluesOnPath);
    return (
      <View style={this.styles.mappage}>
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
          {this.props.cluesNotOnPath.map((clue) => (
            <Marker
              coordinate={{ latitude: clue.lat, longitude: clue.long }}
              title={`${clue.listID}${clue.clueNumber}`}
              description={`${clue.name}, ${clue.id}`}
              key={clue.id}
              onPress={(ev) => this.setState({ selectedClueID: clue.id })}
              pinColor="red"
            />
          ))}
          {this.props.cluesOnPath.map((clue) => (
            <Marker
              coordinate={{ latitude: clue.lat, longitude: clue.long }}
              title={`${clue.listID}${clue.clueNumber}`}
              description={`${clue.name}, ${clue.id}`}
              key={clue.id}
              onPress={(ev) => this.setState({ selectedClueID: clue.id })}
              pinColor="blue"
            />
          ))}
        </MapView>
        <View style={this.styles.button}>
          <Button
            title="Add Selected Clue to Path"
            onPress={() => this.addClueToPath(this.state.selectedClueID)}
            color="#a85858"
          />
        </View>
        <View style={this.styles.button}>
          <Button
            title="Remove Selected Clue From Path"
            onPress={() => this.removeClueFromPath(this.state.selectedClueID)}
            color="#a85858"
          />
        </View>
      </View>
    );
  }
}
