
import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Image, FlatList, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as weatherActions from "../../store/weatheractions";

import CitiesView from './CitiesView';


export default function CitiesScreen({ navigation }) {


  


   useEffect(() => {
    const unsubscribe = navigation
      .dangerouslyGetParent()
      .addListener("tabPress", (e) => {
        e.preventDefault();

        pTRHandler();
        navigation.navigate("Cities");
      });

    return unsubscribe;
  }, [navigation]);

  const [searchText, setSeacrhText] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useDispatch();
  const Cities = useSelector((state) => state.weather.cities);
  var Citiy = useSelector((state) => state.weather.city);
  const loading = useSelector((state)=> state.weather.isLoading);
  const loaded = useSelector((state)=> state.weather.isLoaded);

  const timerRef = useRef(null);
  const changeTextHandler = (text) => {
    setSeacrhText(text);
  };

  const ClearText = () => {
    dispatch(weatherActions.setIsLoaded(false));
    setSeacrhText("");
    Citiy = null;
  };

  function isSymbols(input) {
    return input.replace(/\[.,?:;$!@#$%^&*()+_~`±§]*/g,'').length < 1;
  }

  function isNullOrWhitespace(input) {
    if (typeof input === "undefined" || input == null) return true;
    if(!isSymbols(input)){
      if(!input.replace(/\s/g, "").length < 1){
        return input.replace(/\d/g, "").length < 1;
      }
    }   
  }

  useEffect(() => {
    setIsEmpty(searchText === "" ? false : true);

    if (!isNullOrWhitespace(searchText)) {
      clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(async () => {
        try {
          setSeacrhText(searchText.trim());
          await dispatch(weatherActions.fetchCity(searchText));
        } catch (error) {
          Alert.alert("Error", "Something went wrong during network call", [
            { text: "Okay" },
          ]);
        } finally {
          
        }
        Citiy = console.log(Citiy);
      }, 500);
      if (searchText.length<2) {
        clearTimeout(timerRef.current);
      }
      if(isNullOrWhitespace(searchText)){
        clearTimeout(timerRef.current);
      }
    }
    else{
      clearTimeout(timerRef.current);
    }
  }, [searchText]);

  const pTRHandler = async () => {
    try {
      await dispatch(weatherActions.fetchCities());
    } catch (error) {
      Alert.alert("Error", "Something went wrong during network call", [
        { text: "Okay" },
      ]);
    } finally {
    }
  };

  const SelectCityHandler = async (City) => {
    navigation.navigate("SelectedCity", { City: City });
  };
  return(
    <CitiesView 
    pTRHandler={pTRHandler}
    SelectCityHandler={SelectCityHandler}
    ClearText={ClearText}
    Cities={Cities}
    Citiy={Citiy}
    loading={loading}
    loaded = {loaded}
    searchText={searchText}
    isRefreshing={isRefreshing}
    changeTextHandler={changeTextHandler}
    isEmpty={isEmpty}
    />
  )
}
export const screenOptions = (navData) => {
    return {
      headerShown: false,
    };
  };