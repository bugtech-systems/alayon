import React, { useState, useEffect, useRef } from 'react';
import { View, Text, PermissionsAndroid, Image, Animated, useWindowDimensions } from 'react-native';

import { constants, images, FONTS, SIZES, COLORS } from '../constants';
import { TextButton } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkNotifications, requestNotifications, openSettings } from 'react-native-permissions';


const permission_process = [
    {
      id: 1,
      name: 'Please enable notifications',
      description: 'This is required for getting notifications about your laundry order.',
      image: images.notification
    },
    { 
      id: 2,
      name: 'Please allow access to geolocation',
      description: 'It will make the address search more precise. This will help you save time and speed up the order process.',
      image: images.locationIcon
    }
  ];



const OnBoarding = ({ navigation }) => {
  // const scrollX = new Animated.Value(0)
  // const scrollX = new Animated.Value(0);
  const scrollX = useRef(new Animated.Value(0)).current
  const flatListRef = useRef();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [requestStatus, setRequestStatus] = useState(null);

  const onViewChangeRef = useRef(({ viewableItems, changed }) => {
  console.log('WAWAWA', viewableItems[0])
    setCurrentIndex(viewableItems[0].index);
  });


  const requestLocationPermission = async () => {
    try {
      

        if (granted === 'granted') {
            dispatch({ type: SET_ALLOW_LOCATION, payload: true })
            dispatch({ type: CLOSE_ALLOW_LOCATION_MODAL })
            navigation.navigate('SelectRegion', { navType: 'current' })

            console.log('You can use Geolocation');
            // return true;
        } else {
            dispatch({ type: SET_ALLOW_LOCATION, payload: false })
            dispatch({ type: CLOSE_ALLOW_LOCATION_MODAL })
            console.log('You cannot use Geolocation');
            // return false;
        }
    } catch (err) {
        return false;
    }
};



  const handleBack = () => {
    if(currentIndex === 0){
      setCurrentIndex(currentIndex + 1)
      flatListRef?.current?.scrollToIndex({
        index: currentIndex + 1,
        Animated: true,
      });
    } else {
    navigation.push('OnBoarding', {})
    }
  }

  const handleContinue = async () => {
      console.log("CCONT")
      console.log(currentIndex)

    if(currentIndex === 0){
        console.log('CONTINUEEING')
      requestNotifications(['alert', 'sound']).then(({status, settings}) => {
          console.log(status, settings, 'REQUEST NOTIF')
          setRequestStatus(status);
          
          if(requestStatus === 'blocked'){
            setRequestStatus(null);
                   openSettings().catch(() => console.warn('cannot open settings'));
              return;
            }
          if(status === 'granted'){
            setRequestStatus(null);
          setCurrentIndex(currentIndex + 1)
          flatListRef?.current?.scrollToIndex({
            index: currentIndex + 1,
            Animated: true,
          });
        }
      });
      
    }
     
    
    if(currentIndex ===  1){
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
    if(granted === 'granted'){
        navigation.push('OnBoarding', {})
    }
    } 
  
  
    // await AsyncStorage.setItem('onBoarded', 'onboarded')
  }








  async function checkNotifPermissions () {
    let {status} = await checkNotifications();
    console.log(status, 'NOTIFICATION', requestStatus, currentIndex)
        // setRequestStatus(status);
        if(status === 'granted' && currentIndex === 0){
          setCurrentIndex(1)
          flatListRef?.current?.scrollToIndex({
           index:  1,
           Animated: true,
         });
        }
    }
  
    async function checkLocationPermission () {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
  console.log(granted, 'LOCATION PERMISSION')
        // if()
          
      }
  
  useEffect(() => {
    if(currentIndex === 0 && requestStatus === null){
      checkNotifPermissions();
    }
    if(currentIndex === 1 && requestStatus === null){
      checkLocationPermission()
    }
  })
  
  // useEffect(() => {
  //   if(requestStatus === 'granted'){
  //     setCurrentIndex(currentIndex + 1)
  //     // flatListRef?.current?.scrollToIndex({
  //     //   index: 1,
  //     //   Animated: true,
  //     // });
  //   }    
  
  // }, [requestStatus])


  function Dots () {
    const dotPosition = Animated.divide(scrollX, SIZES.width);

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {permission_process.map((item, index) => {
           const dotColor = dotPosition.interpolate({

            inputRange: [index - 1, index, index + 1],
            // inputRange: [
            //   windowWidth * (index - 1), 
            //   windowWidth * index, 
            //   windowWidth * (index + 1)],
            outputRange: [
              COLORS.transparentBlue,
              COLORS.primary,
              COLORS.primary
            ],
            extraPolate: 'clamp',
          });


          return (
            <Animated.View
              key={item.id}
              style={{
                // borderRadius: 5,
                // marginHorizontal: 6,
                // width: width,
                // height: 10,
                // backgroundColor: dotColor,
                height: 5,
                width: 30,
                borderRadius: 4,
                borderColor: COLORS.primary,
                borderWidth: .4,
                backgroundColor: dotColor,
                marginHorizontal: 4,
              }}
            >
            </Animated.View>
          );
        })}
      </View>
    );
  };
  
  
  
  function renderFooter() {
    return (
      <View
        style={{
          // flex: 1,
        }}>
        <Dots />
        {/* Button */}
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: "center",
              paddingHorizontal: SIZES.padding,
              margin: SIZES.padding * 2,
              borderColor: COLORS.lightGray3
            }}>
            <TextButton
              label="Skip"
              labelStyle={{
                ...FONTS.body2,
                color: COLORS.primaryDisabled
              }}
              buttonContainerStyle={{
                backgroundColor: null,
                margin: SIZES.padding
              }}
              onPress={() => handleBack()}
            />
            <TextButton
              label={requestStatus === 'blocked' ? "OPEN SETTINGS" : requestStatus === "denied" ? "REQUEST AGAIN" : "CONTINUE"}
              labelStyle={{
                ...FONTS.body2,
                color: COLORS.white
              }}
              buttonContainerStyle={{
                height: 50,
                width: 200,
                borderRadius: SIZES.radius,
                margin: SIZES.padding
              }}
              onPress={() => handleContinue()}
            />
          </View>

      </View>
    );
  }

  
  

  return (
    <View
      style={{
        flex: 1,
        flexGrow: 1,
        // padding: SIZES.padding,
        alignItems: 'center',
        // paddingBottom: SIZES.padding * 2,
        justifyContent: 'center',
        backgroundColor: COLORS.white,
      }}
    >
    <View
      style={{width: '100%', flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}
    >
      <Image
        resizeMode='cover'
        source={images.logo}
        style={{height: 80, width: 250}}
      />
    </View>
      {/* {renderHeaderLogo()} */}
      <Animated.FlatList
        ref={flatListRef}
        horizontal
        scrollEnabled={false}
        // pagingEnabled
        data={permission_process}
        scrollEventThrottle={1}
        snapToAlignment='center'
        showsHorizontalScrollIndicator={false}
        // onScroll={Animated.event(
        //   [{nativeEvent: {contentOffset: {x: scrollX}}}],
        //   {useNativeDriver: false},
        // )}
        onScroll={Animated.event([
          {
            nativeEvent: {
              contentOffset: {
                x: scrollX,
              },
            },
          },
        ],
          { useNativeDriver: false })}
        onViewableItemsChanged={onViewChangeRef.current}
        keyExtractor={(item, index) => `${index}`}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                // flex: 1,
                width: SIZES.width,
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: SIZES.padding * 2
                // height: '100%',
                // flex: 1
              }}>
              {/* Header */}
                <Image 
                  source={item.image}
                  style={{
                    // flex: 1,
                    width: 125,
                    height: 125,
                    tintColor: COLORS.primary
                    // opacity: .9,
                  }}
                />

              {/* Details */}
              <View
                style={{ paddingVertical: SIZES.padding * 3, paddingHorizontal: SIZES.padding * 3}}
                >
                <Text style={{
                  ...FONTS.body2,
                  textAlign: 'center',
                  color: COLORS.black                  
                }}>
                  {item.name}
                </Text>
                <Text style={{
                  ...FONTS.body4,
                  textAlign: 'center',
                  marginTop: SIZES.padding
                }}>
                  {item.description}
                </Text>
              </View>
           
            </View>
          );
        }}
      />
      {renderFooter()}
    </View>
  );
};

export default OnBoarding;
