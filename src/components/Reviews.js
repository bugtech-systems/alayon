//import liraries
import React, { Component, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, FlatList, ScrollView} from 'react-native';
import { COLORS, SIZES, icons, images, styles } from '../constants';
import { useSelector, useDispatch } from 'react-redux';
import LabeledText from './LabeledText';





// create a component
export default function Reviews() {
    const { selectedShop } = useSelector(({ data }) => data);



    function renderReviews() {
        const renderItem = ({item}) => {
            return(
                <View
            style={styles.container}>

            <View style={{ flexDirection: 'column', alignItems: 'flex-start', borderWidth: 1, borderColor: COLORS.lightGray, margin: SIZES.padding2 }}>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={item.imgUrl}
                        resizeMode="contain"
                        style={{
                            height: 40,
                            width: 40,
                            borderRadius: 200,
                            marginRight: 10,

                        }}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '80%' }}>
                        <View style={{ flexDirection: 'column', flex: 1, }}>
                            <Text style={{
                                fontSize: SIZES.base * 2,
                                fontWeight: 'bold',
                                color: COLORS.black
                            }}
                            >
                                {item.name}
                            </Text>

                            <Image
                                source={icons.stars}
                                resizeMode='contain'
                                style={{
                                    height: 20,
                                    width: 80
                                }}
                            />

                        </View>

                        <Image
                            source={icons.likes}
                            resizeMode='contain'
                            style={{

                                height: 25,
                                width: 25
                            }}
                        />
                        <Image
                            source={icons.dotsetting}
                            resizeMode='contain'
                            style={{

                                height: 25,
                                width: 25
                            }}
                        />

                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', margin: SIZES.padding2 }}>
                    <View style={{ flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                        <Text style={{
                            fontSize: SIZES.base * 2,
                            fontWeight: '600',
                            color: COLORS.black
                        }}
                        >
                            {item.message}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', margin: SIZES.padding2, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Image
                            source={images.shop4}
                            resizeMode='contain'
                            style={{
                                height: 100,
                                width: 100
                            }}
                        />
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'flex-start', borderWidth: 1, borderColor: COLORS.lightGray, margin: SIZES.padding2 }}>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={item.imageUrl}
                        resizeMode="contain"
                        style={{
                            height: 40,
                            width: 40,
                            borderRadius: 200,
                            marginRight: 10,

                        }}
                    />
                </View>
            </View>
        </View>
            )
        }
        return (
          
            <FlatList
                keyExtractor={(item, index) => `${index}`}
                data={selectedShop.reviews}
                vertical
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
            />
        )
    }


    return (
        <SafeAreaView>
            <ScrollView>
                {renderReviews()}
            </ScrollView>
        </SafeAreaView>
    );
};



// define your styles


//make this component available to the app

