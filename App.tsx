import CluesOnPathPage from "./Pages/viewPathPage";
import SelectGroupPathPage from "./Pages/selectGroupPath";
import CreateGroupPathPage from "./Pages/createGroupPath";
import ModifyPathPage from "./Pages/modifyPathPage";

import React, { Component } from "react";
import { View, StyleSheet, Dimensions, Text, Button } from "react-native";
import API from "./utils/API";
import Axios, { AxiosResponse } from "axios";

import { Clue, Group, Path, screenHeight, screenWidth } from "./utils/data";
enum Pages {
  SELECTPAGE,
  VIEWPAGE,
  CREATEPAGE,
  MODIFYPAGE,
}

interface AppProps {}

interface AppState {
  allClues: Clue[];
  incompleteCluesOnPath: Clue[];
  completeCluesOnPath: Clue[];
  cluesNotOnPath: Clue[];
  groups: Map<number, Group>;
  selectedGroupID: number;
  paths: Map<number, Path>;
  pageDisplayed: Pages;
}
// react-native expects an export from this file, so this main page app will probably manage the state of the app and pass it down to the actual
// pages as props, and display the correct page based off some navigation structure.
export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      allClues: [],
      incompleteCluesOnPath: [],
      completeCluesOnPath: [],
      cluesNotOnPath: [],
      groups: new Map(),
      selectedGroupID: 0,
      paths: new Map(),
      pageDisplayed: Pages.SELECTPAGE,
    };
    this.updateInfo = this.updateInfo.bind(this);
    this.setSelectedGroupID = this.setSelectedGroupID.bind(this);
    setInterval(this.updateInfo, 1000);
  }

  /**
   * Sorts clues according first to their list, then their number.
   * @param clue1 comes first if < 0
   * @param clue2 comes first if > 0
   */
  clueCompare(clue1: Clue, clue2: Clue): number {
    if (clue1.listID === clue2.listID) {
      return clue1.clueNumber - clue2.clueNumber;
    } else {
      return clue1.listID.localeCompare(clue2.listID);
    }
  }

  // updates the selectedGroupID state of the app from the select group page
  setSelectedGroupID(selectedGroupID: number) {
    this.setState({ selectedGroupID });
  }

  // calls the api to update the state of the app
  private updateInfo() {
    // Gets all the unfinished clues into the state of the app
    const allClues: Clue[] = [];
    let allIDs: number[] = [];
    API.get("/clues/incomplete")
      .then((res) => {
        allIDs = res.data.clueIDs;
        return allIDs.map((id: number) => {
          return API.get<AxiosResponse>("/clues/" + id, {});
        });
      })
      .then((routes) => Axios.all<AxiosResponse>(routes))
      .then((res: AxiosResponse[]) => {
        res.forEach((res: AxiosResponse, index: number) => {
          const clue = res.data;
          allClues.push({
            id: allIDs[index],
            listID: (clue.listID as string).toUpperCase(),
            clueNumber: clue.clueNumber,
            name: clue.name,
            description: clue.description,
            lat: clue.lat,
            long: clue.long,
          });
        });
        allClues.sort(this.clueCompare);
      })
      .then(() => this.setState({ allClues: allClues }))
      .catch((error) => console.error(error))

    // gets all the unfinished clues on the selected group's path onto the state of the app
    if (this.state.groups.get(this.state.selectedGroupID)?.pathID) {
      const incompleteCluesOnPath: Clue[] = [];
      let incompleteIdsOnPath: number[] = [];
      API.get(
        `/paths/${
          this.state.groups.get(this.state.selectedGroupID)?.pathID
        }/incomplete`
      )
        .then((res) => {
          incompleteIdsOnPath = res.data.clueIDs;
          return incompleteIdsOnPath.map((id: number) => {
            return API.get<AxiosResponse>("/clues/" + id, {});
          });
        })
        .then((routes) => Axios.all<AxiosResponse>(routes))
        .then((res: AxiosResponse[]) => {
          res.forEach((res: AxiosResponse, index: number) => {
            const clue = res.data;
            incompleteCluesOnPath.push({
              id: incompleteIdsOnPath[index],
              listID: (clue.listID as string).toUpperCase(),
              clueNumber: clue.clueNumber,
              name: clue.name,
              description: clue.description,
              lat: clue.lat,
              long: clue.long,
            });
          });
          incompleteCluesOnPath.sort(this.clueCompare);
        })
        .then(() =>
          this.setState({ incompleteCluesOnPath: incompleteCluesOnPath })
        )
        .catch((error) => console.error(error))

      const completeCluesOnPath: Clue[] = [];
      let completeIdsOnPath: number[] = [];
      API.get(
        `/paths/${
          this.state.groups.get(this.state.selectedGroupID)?.pathID
        }/complete`
      )
        .then((res) => {
          completeIdsOnPath = res.data.clueIDs;
          return completeIdsOnPath.map((id: number) => {
            return API.get<AxiosResponse>("/clues/" + id, {});
          });
        })
        .then((routes) => Axios.all<AxiosResponse>(routes))
        .then((res: AxiosResponse[]) => {
          res.forEach((res: AxiosResponse, index: number) => {
            const clue = res.data;
            completeCluesOnPath.push({
              id: completeIdsOnPath[index],
              listID: (clue.listID as string).toUpperCase(),
              clueNumber: clue.clueNumber,
              name: clue.name,
              description: clue.description,
              lat: clue.lat,
              long: clue.long,
            });
          });
          completeCluesOnPath.sort(this.clueCompare);
        })
        .then(() =>
          this.setState({ completeCluesOnPath: completeCluesOnPath })
        )
        .catch((error) => console.error(error))

      // makes a state field with only the clues which are not on the selected group's path for separate display
      const cluesNotOnPath = this.state.allClues.filter((clue) => {
        const foundClueIncomplete = this.state.incompleteCluesOnPath.find(
          (other_clue) => clue.id === other_clue.id
        );
        const foundClueComplete = this.state.completeCluesOnPath.find(
          (other_clue) => clue.id === other_clue.id
        );

        if (
          foundClueIncomplete === undefined &&
          foundClueComplete === undefined
        ) {
          return true;
        } else {
          return false;
        }
      });
      this.setState({ cluesNotOnPath: cluesNotOnPath });
    }
    // Group API calls
    API.get("/groups", {})
      .then(async (res) => {
        const groups = new Map<number, Group>();
        for (let groupID of res.data.allGroups) {
          await API.get("/groups/" + groupID, {}).then((group) =>
            groups.set(groupID, {
              groupID: groupID,
              name: group.data.name,
              pathID: group.data.pathID,
            })
          );
        }
        return groups;
      })
      .then((groups) => this.setState({ groups }))
      .catch((error) => console.error(error))

    // Path API calls
    API.get("/paths", {})
      .then(async (res) => {
        const paths = new Map<number, Path>();
        for (let pathID of res.data.allPaths) {
          await API.get("/paths/" + pathID, {}).then((path) => {
            if (path.data.name) {
              paths.set(pathID, { name: path.data.name, pathID });
            } else {
              paths.set(pathID, this.state.paths.get(pathID)!);
            }
          });
        }
        return paths;
      })
      .then((paths) => this.setState({ paths }))
      .catch((error) => console.error(error))
  }

  // returns the page component based off what is supposed to
  // be displayed
  displayPage() {
    let page;
    switch (this.state.pageDisplayed) {
      case Pages.SELECTPAGE:
        page = (
          <SelectGroupPathPage
            groups={this.state.groups}
            selectedGroupID={this.state.selectedGroupID}
            updateGroup={this.setSelectedGroupID}
            paths={this.state.paths}
          />
        );
        break;
      case Pages.VIEWPAGE:
        page = (
          <CluesOnPathPage
            incompleteCluesOnPath={this.state.incompleteCluesOnPath}
            completeCluesOnPath={this.state.completeCluesOnPath}
            pathID={this.state.groups.get(this.state.selectedGroupID)?.pathID}
          />
        );
        break;
      case Pages.CREATEPAGE:
        page = <CreateGroupPathPage />;
        break;
      case Pages.MODIFYPAGE:
        page = (
          <ModifyPathPage
            allClues={this.state.allClues}
            cluesOnPath={this.state.incompleteCluesOnPath.concat(
              this.state.completeCluesOnPath
            )}
            cluesNotOnPath={this.state.cluesNotOnPath}
            pathID={this.state.groups.get(this.state.selectedGroupID)?.pathID}
          />
        );
        break;
    }
    return page;
  }

  styles = StyleSheet.create({
    app: {},
    navbar: {
      position: "absolute",
      top: 0,
      left: 0,
      width: screenWidth,
      height: screenHeight * 0.1,
      backgroundColor: "#a85858",
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    imagepagebutton: {
      marginTop: 10,
      marginHorizontal: 3,
    },
    selectpagebutton: {
      marginTop: 10,
      marginHorizontal: 3,
    },
    createpagebutton: {
      marginTop: 10,
      marginHorizontal: 3,
    },
    displayedPage: {
      position: "absolute",
      top: screenHeight * 0.1,
      left: 0,
    },
  });
  render() {
    return (
      <View style={this.styles.app}>
        <View style={this.styles.navbar}>
          <View style={this.styles.selectpagebutton}>
            <Button
              title={"Select Group/\nPath"}
              onPress={() => this.setState({ pageDisplayed: Pages.SELECTPAGE })}
              color="black"
            />
          </View>
          <View style={this.styles.createpagebutton}>
            <Button
              title={"Create Group/\nPath"}
              onPress={() => this.setState({ pageDisplayed: Pages.CREATEPAGE })}
              color="black"
            />
          </View>
          <View style={this.styles.imagepagebutton}>
            <Button
              title={"View\nPath"}
              onPress={() => this.setState({ pageDisplayed: Pages.VIEWPAGE })}
              color="black"
            />
          </View>
          <View style={this.styles.createpagebutton}>
            <Button
              title={"Modify\nPath"}
              onPress={() => this.setState({ pageDisplayed: Pages.MODIFYPAGE })}
              color="black"
            />
          </View>
        </View>
        <View style={this.styles.displayedPage}>{this.displayPage()}</View>
      </View>
    );
  }
}
