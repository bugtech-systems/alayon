import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
// import Geolocation from '@react-native-community/geolocation';
import { COLORS, FONTS, SIZES, icons, images } from '../../../constants';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { useDispatch, useSelector } from 'react-redux';
import { getShops } from '../../../redux/actions/data.actions';
import MapPlaces from './MapPlaces';
import { SET_MAP_LOCATION } from '../../../redux/actions/type';
import { gapikey } from '../../../globals/env';

Geocoder.init(gapikey); // use a valid API key

//Components
export default function Map({ navigation, route }) {
  const { address, navType } = route.params
  const dispatch = useDispatch();
  const { shops } = useSelector(({ data }) => data);
  const { width, height } = Dimensions.get('window');
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.01;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const [region, setRegion] = useState({
    latitude: 11.2317012,
    longitude: 125.0024682,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isDrag, setIsDrag] = useState(false);

  const mapRef = useRef();

  const handleRegion = val => {
  if(!isDrag){
    setIsDrag(true);
  }
  setRegion(val);
  
  
  };

  const handlePlace = ({ lat, lng }) => {
    console.log(lat, lng)
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    })

    onCenter(lat, lng);

  }

  const onCenter = (latitude, longitude) => {
    mapRef.current.animateToRegion({
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  function renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => {
          if (navType === 'pickupDelivery' || navType === 'returnDelivery') {
            navigation.navigate('AddressLocationForm', { address, navType });
          } else {
            navigation.goBack()

          }
        }}>
          <Image
            source={icons.back}
            style={{
              height: 20,
              width: 20,
              margin: SIZES.padding
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
            navigation.navigate('Map2', { address, navType });
        }}>
          <Image
            source={icons.myLocation}
            style={{
              height: 20,
              width: 20,
              margin: SIZES.padding
            }}
          />
        </TouchableOpacity>
        {/* <Image source={icons.back} style={{height: 25, width: 25}} /> */}
      </View>
    );
  }

  function renderSearch() {
    return (
      <View style={styles.searchContainer}>
        {navType === 'pickupDelivery' || navType === 'returnDelivery' ?
          <View
            style={styles.addressContainer}
          >
            <Text
              style={{ ...FONTS.body3, color: COLORS.black }}
            >
              {address.address}
            </Text>
          </View>
          :

          <MapPlaces handlePlace={handlePlace} />
        }
        {/* <View style={styles.SectionStyle}>
            <Image
              source={icons.search} //Change your icon image here
              style={styles.ImageStyle}
          />
          <TextInput
            style={{
              fontSize: 18,
              flexGrow: 1,
              color: COLORS.black
              }}
            placeholder="Search"
            placeholderTextColor={"gray"}
            underlineColorAndroid="transparent"
          />
          </View> */}
      </View>
    );
  }


  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('granted', granted);
      if (granted === 'granted') {
        console.log('You can use Geolocation');
        return true;
      } else {
        console.log('You cannot use Geolocation');
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const handleSave = () => {

    // dispatch({
    //   type: SET_MAP_LOCATION,
    //   payload: newAddress,
    // });
    if (navType === 'pickupDelivery' || navType === 'returnDelivery') {
      let newAddress = { ...address, ...region }
      navigation.navigate('AddressLocationForm', { address: newAddress, navType });
    }
    if (navType === 'findLocation' || navType === 'current') {
      //GEOCODER
      const { latitude, longitude } = region;
      Geocoder.from(latitude, longitude)
        .then(({ results }) => {
          let newAddress = { ...region, address: results[0] ? results[0].formatted_address : address.address }
          dispatch({
            type: SET_MAP_LOCATION,
            payload: newAddress,
          });
          navigation.navigate('CustomerHome', { address: newAddress });
        })
        .catch(error => console.warn(error));
    }
  };

  // function to check permissions and get Location
  const getLocation = () => {
    const result = requestLocationPermission();
    result.then(res => {
      // console.log('res is:', res);
      if (res) {
        Geolocation.getCurrentPosition(
          position => {
            let { coords } = position;
            setRegion({ ...region, ...position.coords });
            onCenter(coords.latitude, coords.longitude);
            if(navType === 'current'){
              Geocoder.from(coords.latitude, coords.longitude)
              .then(({ results }) => {
                let newAddress = { ...coords, address: results[0] ? results[0].formatted_address : address.address }
                dispatch({
                  type: SET_MAP_LOCATION,
                  payload: newAddress,
                });
              })
              .catch(error => console.warn(error));         
            }
          },
          error => {
            // See error code charts below.
            console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      }
    });
  };

  function renderCurrentLocationButton() {
    return (
      <TouchableOpacity
        onPress={() => getLocation()}
        style={styles.currentLocationContainer}>
        <Image
          source={icons.currentLocation} //Change your icon image here
          style={styles.currentLocationImage}
        />
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    dispatch(getShops());
    if(navType === 'current'){
      getLocation();
    }
  }, [dispatch, navType]);

  const renderMarker = shops.map((a, index) => {
    const { latitude, longitude } = a.location;
    return (
      <Marker
        // draggable
        key={index}
        coordinate={{
          latitude: Number(latitude),
          longitude: Number(longitude),
        }}

        description={'This is a description of the marker'}>
        <View style={styles.washing}>
          <Image
            source={icons.washingMachinePin}
            style={{ height: 35, width: 25 }}
          />
        </View>
      </Marker>
    );
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}

      {/*Render our MapView*/}
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={region}
        onRegionChange={handleRegion}
        onRegionChangeComplete={e => {
          setIsDrag(false);
        }}
      // onPress={e => console.log(e)}
      >
        <Marker.Animated
          // draggable
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          // onDragEnd={e => setRegion({...region, ...e.nativeEvent.coordinate})}
          // image={icons.pinIcon} //uses relative file path.
          // title={'Test Marker'}
          description={'This is a description of the marker'}>
          <View style={isDrag ? styles.markerDrag : styles.marker}>
            <Image source={icons.pinIcon} style={{ height: 35, width: 40 }} />
          </View>
        </Marker.Animated>
        {renderMarker}
      </MapView>
      <View style={styles.topContainer}>
        {renderHeader()}
        {renderSearch()}
      </View>
      {renderCurrentLocationButton()}
      <TouchableOpacity style={styles.saveButton} onPress={() => handleSave()}>
        <Text style={{ ...FONTS.h4, color: COLORS.white, fontWeight: 'bold' }}>
          SAVE
        </Text>
      </TouchableOpacity>
      <View
         style={styles.alayonLogo}
      >
      <Image
        resizeMode="contain"
        source={images.logo}
        style={{height: 40, width: 100}}
      />
      </View>
    </View>
  );
}

const mapStyle = [
  {
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
];

//create our styling code:
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1, //the container will fill the whole screen.
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {
    backgroundColor: COLORS.white3,
    padding: SIZES.padding,
    minHeight: 70,
    width: '100%',
    borderBottomColor: COLORS.lightGray3,
    borderBottomWidth: 3
  },
  currentLocationImage: {
    height: 40,
    width: 40,
    padding: 10,
    tintColor: COLORS.primary,
  },
  marker: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    // backgroundColor: "#007bff",
    // borderColor: "#eee",
    // borderRadius: 5,
    elevation: 10,
  },
  markerDrag: {
    paddingVertical: 0,
    paddingHorizontal: 30,
    // backgroundColor: "#007bff",
    // borderColor: "#eee",
    // borderRadius: 5,
    elevation: 10,
  },
  washing: {
    paddingVertical: 5,
    paddingHorizontal: 30,
    // backgroundColor: "#007bff",
    // borderColor: "#eee",
    // borderRadius: 5,
    elevation: 10,
  },
  topContainer: {
    // flex: 1,
    width: '100%',
    position: 'absolute',
    top: 0,
    paddingRight: SIZES.padding,
    paddingLeft: SIZES.padding,
    // backgroundColor: COLORS.black
    // left: 10
  },

  headerContainer: {
    // backgroundColor: 'black',
    // flex: 1,
    // paddingTop: SIZES.padding,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: COLORS.black,
    fontWeight: 'bold',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    // padding: SIZES.padding,
    // marginVertical: SIZES.padding * 1,
    flex: 1,
  },
  searchListContainer: {
    marginVertical: SIZES.padding * 1,
  },
  SectionStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
    borderColor: 'gray',
    borderWidth: 1,
  },
  ImageStyle: {
    padding: 10,
    margin: 5,
    height: 30,
    width: 25,
    resizeMode: 'stretch',
    alignItems: 'center',
  },
  currentLocationContainer: {
    position: 'absolute',
    right: 20,
    // top: 130,
    bottom: 120,
    backgroundColor: COLORS.white3,
    padding: 2,
    borderRadius: 50,
  },
  saveButton: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    height: 40,
    width: 200,
    borderRadius: SIZES.semiRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alayonLogo: {
    height: 50,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    // margin: 50,
    padding: SIZES.padding
  },
  alayonBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 20,
    width: 150,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    opacity: 0.7,
    padding: 20,
  },
});
