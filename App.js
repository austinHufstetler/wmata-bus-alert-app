import React from 'react';
import { StyleSheet, Text, View, Picker, Button, TextInput, Alert  } from 'react-native';

import Autocomplete from 'react-native-autocomplete-input';

const customStyles = StyleSheet.create({
  blueBackground:{
    backgroundColor: 'lightblue',
  },
  numberInputBox:{
    backgroundColor: 'ivory',
    width: 45,
    margin: 5,
  },
  dropDownBox:{
    backgroundColor: 'ivory',
    width: 300,
    margin: 5,
  }
});

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { stops: [{value: '', display: ''}], routes: [{value: '', display: ''}], selectedStop: '', selectedRoute: '', minutes: 5,
                   latitude: 38.833770, longitude: -77.115140};
  }

  componentWillMount(){
    
    navigator.geolocation.getCurrentPosition(

      (position) => {

        console.log(position.coords.latitude);
        console.log(position.coords.longitude);

        this.setState({

          latitude: position.coords.latitude,

          longitude: position.coords.longitude,

          error: null,

        });

        this.updateStops(position.coords.latitude, position.coords.longitude);

      },

      (error) => {
        
        console.log(error.message);

        this.updateStops(this.state.latitude, this.state.longitude);
      
      },

      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },

    );

  }

  startAlert(){
    fetch("https://api.wmata.com/NextBusService.svc/json/jPredictions?RouteID=25B&StopID=" + this.state.selectedStop, {headers:{'api_key': 'e13626d03d8e4c03ac07f95541b3091b'}})
    .then((response) => {
      let predictionList = JSON.parse(response._bodyText).Predictions
      var alertString = "";
      for(var i in predictionList){
        if(predictionList[i].RouteID === this.state.selectedRoute && predictionList[i].Minutes >= this.state.minutes ){
          alertString += ( "\n" + predictionList[i].RouteID +  " is coming in " + predictionList[i].Minutes + " minutes")
        }
      }
      Alert.alert(
        //title
        'Bus Predictions',
        //body
        alertString,
        [
          {text: 'Okay', onPress: () => console.log('No Pressed'), style: 'cancel'},
        ],
        { cancelable: true }
        //clicking out side of alert will cancel
      );
      return response.json();
    })
    .then(data => {

    }).catch(error => {
      console.log(error);
    });  
  }

  updateStops(latitude, logitude) {
    fetch("https://api.wmata.com/Bus.svc/json/jStops?Lat=" + this.state.latitude + "&Lon=" + this.state.longitude + "&Radius=250", {headers:{'api_key': 'e13626d03d8e4c03ac07f95541b3091b'}})
    .then((response) => {
      console.log('updated again', this.state.latitude + " " + this.state.longitude )
      return response.json();
    })
    .then(data => {
      let stopsFromApi = data.Stops.map(stop => { return {value: stop.StopID, display: stop.Name} })
      this.setState({ stops: stopsFromApi});
      let routesFromApi = data.Stops[0].Routes.map(route => { return {value: route, display: route} })
      this.setState({ routes: routesFromApi});
    }).catch(error => {
      console.log(error);
    });
  }

  render() {
  
    return (
      <View style={[styles.container, customStyles.blueBackground]}>
        <Text>Bus Alert App</Text>
        <Picker id="stopList" style={customStyles.dropDownBox}
          onValueChange={(itemValue, itemIndex) =>
            this.setState({selectedStop: itemValue})
          }
          selectedValue={this.state.selectedStop}
        >
        {this.state.stops.map((item, index) => {
                return <Picker.Item key={index} label={item.display} value={item.value} />
            })}
        </Picker>

        <Picker id="routeList" style={customStyles.dropDownBox}
           onValueChange={(itemValue, itemIndex) =>
              this.setState({selectedRoute: itemValue})
           }
           selectedValue={this.state.selectedRoute}
        >
        {this.state.routes.map((item, index) => {
                return <Picker.Item key={index} label={item.display} value={item.value} />
            })}
        </Picker>

        <TextInput 
          style={[styles.textInput, customStyles.numberInputBox]}
          keyboardType='numeric'
          maxLength={10}  //setting limit of input
          onChangeText = {(minutes) => this.setState({ minutes: Number.parseInt(minutes, 10) })}
        />

      <Text>Minutes</Text>


        <Button
          title="Submit"
          color="#841584"
          onPress={() => {
              this.startAlert();
         }}
          accessibilityLabel="...."
        />

        <Text>Lat: {this.state.latitude}, Lon: {this.state.longitude}</Text>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
