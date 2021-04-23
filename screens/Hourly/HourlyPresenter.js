import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import moment from "moment";
import {
    Alert
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as dailyhourlyactions from "../../store/dailyhourlyactions";
import HourlyView from './HourlyView';


const HourlyPresenter = ({ navigation }) => {
  
  const [location, setLocation] = useState(null);
  const [ps, setPs] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const dispatch = useDispatch();
  const Cities2 = useSelector((state) => state.dailyhoutly.Yesterday);
  const Cities = useSelector((state) => state.dailyhoutly.Hourly);
  const SelectedDay = useSelector((state)=> state.dailyhoutly.SelectedDay)
  const np = useSelector((state) => state.weather.error);
  var Cities1 = Cities;
  const getPerm = async () => {
    const { status, permissions } = await Permissions.askAsync(
      Permissions.LOCATION
    );
    if (status === "granted") {
      setPs(true);
      getLoc();
    } else {
      setPs(false);
    }
  }; 

  const getPermStatus = async () => {
    const { status, expires, permissions } = await Permissions.getAsync(
      Permissions.LOCATION
    );
    console.log(status);
    console.log(ps);
    if (status === "granted") {
      setPs(true);
      getLoc();
    }
  };

  

  const tit = useSelector((state) => state.dailyhoutly.City.name);
  const City = useSelector((state) => state.dailyhoutly.dt);
  const date = moment(Date.now()).format("MMMM, Do");
  useEffect(() => {
    const unsubscribe = navigation
      .addListener('focus', () => {  
        navigation.dangerouslyGetParent().setOptions({
            headerTitle: tit + " - " + date,
            headerTitleAlign: "left",
        });
    });

    return unsubscribe;
  }, [navigation]);

  const getLoc = async () => {
    setisLoading(true);
    try {
      var loca = await Location.getCurrentPositionAsync({});
      setLocation(loca);
    } catch {
      setPs(false);
      Cities1 = [];
      console.log(Cities1);
      setisLoading(false);
      return;
    }
    try {
      await dispatch(
        dailyhourlyactions.getCityName(loca.coords.latitude, loca.coords.longitude)
      );
      console.log(SelectedDay);
      if(SelectedDay==="Today"){
        await dispatch(
          dailyhourlyactions.selectDH(loca.coords.latitude, loca.coords.longitude)
        );
      }
      else{
        await dispatch(
          dailyhourlyactions.getYesterday(loca.coords.latitude, loca.coords.longitude)
        );
      }
      
      setisLoading(false);
      return;
    } catch (error) {
      Alert.alert("Error", "Something went wrong during network call", [
        { text: "Okay" },
      ]);
    } finally {
      setisLoading(false);
    }
  };

  const pTRHandler = async () => {
    getLoc();
  };

  useEffect(() => {
    let f = async () => {
      await getPermStatus();
      getLoc();
    };
    f();
  }, []);
  
  return (
    <HourlyView 
    location={location}
    ps={ps}
    isLoading={isLoading}
    pTRHandler={pTRHandler}
    getLoc={getLoc}
    Cities={Cities}
    Cities1={Cities1}
    getPerm={getPerm}
    np = {np}
    Cities2={Cities2}
    />
    )
};

export const screenOptions = (navData) => {
    const tit = useSelector((state) => state.dailyhoutly.CityName);
    const date = moment(new Date()).format("MMMM, Do");
    return {
      title: tit + " - " + date,
      headerTitleAlign: "left",
    };
  };

export default HourlyPresenter;
