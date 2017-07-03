import {
  Dimensions,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
export const initDistance = 2500;
export const deltasByDistance = {
  200: 0.0055,
  1000: 0.031,
  2500: 0.07,
};


export const LATITUDE_DELTA = deltasByDistance[initDistance];
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default Constants = {
  apiUrl: 'https://murmuring-escarpment-43610.herokuapp.com/events',
}