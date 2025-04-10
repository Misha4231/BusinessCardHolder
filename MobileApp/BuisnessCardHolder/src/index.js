import { SafeAreaView, StyleSheet, View, Text, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { useContext, useEffect } from 'react';

import { UserContext } from './context/UserContext';
import HomeScreen from './appPages/home';
import LoginPage from './auth/loginPage';
import RegisterForm from './auth/registerForm';
import GlobalStyles, { Colors } from '../globalStyles/GlobalStyles';
import Profile from './appPages/Profile';
import QRScanner from './appPages/QRScanner';
import EditProfile from './appPages/EditProfile';
import UpdatePassword from './auth/UpdatePassword';
import ForgotPassword from './auth/ForgotPassword';
import CardForm from './appPages/CardForm';
import CardDetail from '../components/CardDetail';
import Search from './appPages/Search';
import { apiHost } from '../ApiConfig';
import ChooseLanguageMenu from '../components/ChooseLanguageMenu';
import DeleteProfile from './appPages/DeleteProfile';
import TemplateFormPage from '../components/CardTemplate/TemplateFormPage';
import ConfirmEmailPage from './auth/ConfirmEmailPage';
import EditTemplatePage from '../components/CardTemplate/EditTemplatePage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const prefix = Linking.createURL('/');

function ProfilePages() {
  const {t} = useTranslation();

  return (
    <ProfileStack.Navigator screenOptions={{ headerStyle: {backgroundColor: Colors.dark}, headerTintColor: Colors.white,}}>

      <ProfileStack.Screen name='Profile' component={Profile} options={{
        title: t("my-profile"), 
        headerShown: false
      }} />


      <ProfileStack.Screen name='EditProfile' component={EditProfile} options={{
        title: t("edit-profile"), 
        headerShown: true,
      }} />
      
      <ProfileStack.Screen name='ChooseLanguage' component={ChooseLanguageMenu} options={{
        title: t("choose-language"), 
        headerShown: true,
      }} />

      <ProfileStack.Screen name='DeleteProfile' component={DeleteProfile} options={{
        title: t("delete-profile"),
        headerShown: true,
      }} />

      <ProfileStack.Screen name='CreateCard' component={CardForm} options={{
        title: t('add-buisness-card'), 
        headerShown: true,
      }} />

      <ProfileStack.Screen name='UserCardDetail' component={CardDetail} options={({route}) => ({
        title: t('buisness-card-details'),
        headerShown: true
      })} />

      <ProfileStack.Screen name='UserEditCard' component={CardForm} options={({route}) => ({
        title: route.params?.ownerRelation.fullName,
        headerShown: true
      })} />

      <ProfileStack.Screen name='CreateCardFromTemplate' component={TemplateFormPage} options={{
        title: t('create-using-template'),
        headerShown: true
      }} />

      <ProfileStack.Screen name='EditTemplate' component={EditTemplatePage} options={{
        title: t('edit-business-card-from-template'),
        headerShown: true
      }} />

      <ProfileStack.Screen name='OtherProfile' component={Profile} options={({route}) => ({
        title: route.params.username, 
        headerShown: true
      })} />

    </ProfileStack.Navigator>
  )
}

function HomePages() {
  const {t} = useTranslation();

  return (
    <ProfileStack.Navigator screenOptions={{ headerStyle: {backgroundColor: Colors.dark}, headerTintColor: Colors.white,}}>

      <ProfileStack.Screen name='HomeScreen' component={HomeScreen} options={{
        title: t("saved-buisness-cards"),
        headerShown: false
      }} />

      <ProfileStack.Screen name='CardDetail' component={CardDetail} options={({route}) => ({
        title: route.params.ownerRelation.fullName,
        headerShown: true
      })} />


      <ProfileStack.Screen name='UserCardDetail' component={CardDetail} options={({route}) => ({
        title: t('buisness-card-details'),
        headerShown: true
      })} />


    </ProfileStack.Navigator>
  )
}

function SearchPages() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <ProfileStack.Navigator screenOptions={{ headerStyle: {backgroundColor: Colors.dark}, headerTintColor: Colors.white,}}>

      <ProfileStack.Screen name='SearchPage' component={Search} options={{
        title: t("search"), 
        headerShown: false
      }} />

      <ProfileStack.Screen name='SearchOtherProfile' component={Profile} options={({route}) => ({
        title: route.params.username,
        headerShown: true,
        headerRight: () => {
          if (!route.params.setCards) {
            return (
              <Pressable onPress={() => { navigation.reset({
                index: 0,
                routes: [{ name: 'SearchPage' }],
              }); }}>
                <AntDesign name="close" size={24} color={Colors.white} />
              </Pressable>
            )
          }

        }
      })} />

      <ProfileStack.Screen name='UserCardDetail' component={CardDetail} options={({ route }) => ({
        title: t('buisness-card-details'),
        headerShown: true,
        headerRight: () => {
          if (!route.params.setCards) {
            return (
              <Pressable onPress={() => { navigation.reset({
                index: 0,
                routes: [{ name: 'SearchPage' }],
              }); }}>
                <AntDesign name="close" size={24} color={Colors.white} />
              </Pressable>
            )
          }

        }

      })
      } />

    </ProfileStack.Navigator>
  )
}

function Home(navigation) {
  const { t } = useTranslation();

  return (
    <Tab.Navigator initialRouteName='ProfilePage' screenOptions={{
      tabBarShowLabel: false,
      headerShown: false,
      tabBarStyle: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        elevation: 0,
        height: 80,
        backgroundColor: Colors.dark
      },
    }}>
  {/* =================================================================== */}
      <Tab.Screen name='HomeScreenPages' component={HomePages} options={{
        title: t("saved-buisness-cards"),
        tabBarIcon: ({focused}) => {
          return ( <View style={styles.bottomIconContainer} >
            <Entypo name="home" size={24} color={focused ? Colors.orange : Colors.white } />
          </View> )
        }
      }} />
  {/* =================================================================== */}
    <Tab.Screen name='Search' component={SearchPages} options={{
        title: t("search"),
        tabBarIcon: ({focused}) => {
          return ( <View style={styles.bottomIconContainer}>
            <FontAwesome name="search" size={24} color={focused ? Colors.orange : Colors.white } />
          </View> )
        }
      }} />
  {/* =================================================================== */}
      <Tab.Screen name='QR-Scanner' component={QRScanner} options={{
        title: t("scanner"),
        tabBarIcon: ({focused}) => {
          return ( <View style={styles.bottomIconContainer}>
            <MaterialIcons name="qr-code-scanner" size={24} color={focused ? Colors.orange : Colors.white } />
          </View> )
        }
      }} />
  {/* =================================================================== */}
      <Tab.Screen name='ProfilePage' component={ProfilePages} options={{
        title: t("my-profile"),
        tabBarIcon: ({focused}) => {
          return ( <View style={styles.bottomIconContainer}>
            <FontAwesome name="user" size={24} color={focused ? Colors.orange : Colors.white } />
          </View> )
        }
      }} />
  {/* =================================================================== */}
    </Tab.Navigator>
  )
}

export default function Index() {
  const { t } = useTranslation();
  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        Home: {
          screens: {
            Search: {
              screens: {
                UserCardDetail: "card/:cardId"
              }
            }
          }
        },
        LoginPage: 'oauthredirect'
      }
    }
  };

  return (
    <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerStyle: {backgroundColor: Colors.dark}, headerTintColor: Colors.white,}}>

            <Stack.Screen name='Home' component={Home} options={{title: t('home'),headerShown: false}}/>
            <Stack.Screen name='LoginPage' component={LoginPage} options={{title: t('sign-in'), headerShown: false, gestureEnabled: false}}/>
            <Stack.Screen name='RegisterForm' component={RegisterForm} options={{title: t('sign-up')}} />
            <Stack.Screen name='ForgotPassword' component={ForgotPassword} options={{title: t('forgot-password')}}/>
            <Stack.Screen name='ChooseLanguage' component={ChooseLanguageMenu} options={{ title: t('choose-language'), headerShown: true }} />
            <Stack.Screen name='ConfirmEmail' component={ConfirmEmailPage} options={{title: t('Confirm email'), headerShown: true}}/>
        </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bottomIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  }
})