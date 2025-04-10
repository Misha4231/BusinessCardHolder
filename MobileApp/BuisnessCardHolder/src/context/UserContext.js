/*import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from "react";

import { apiHost } from "../../ApiConfig";

export const UserContext = createContext();

export const UserProvider = (props) => {
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            const jwtToken = await AsyncStorage.getItem("@jwtToken");
            setToken(jwtToken);
        };
        
        fetchToken();
    }, []);

    useEffect(() => {
  
        const fetchUser = async () => {
            if (!token) {
                setUserData(null);
                await AsyncStorage.setItem("@jwtToken", '');
                return; 
            }

            const requestOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            };

            const response = await fetch(`${apiHost}/api/users/me`, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                setToken(null);
                setUserData(null);
                await AsyncStorage.setItem("@jwtToken", '');
            } else {
            
                setUserData(data);
                await AsyncStorage.setItem("@jwtToken", token);
            }
        };

        fetchUser();
    }, [token]);

    return (
        <UserContext.Provider value={[token, setToken, userData, setUserData]}>
            {props.children}
        </UserContext.Provider>
    )
}
*/

import { storage } from "../../MMKVStorage";
import { createContext, useEffect, useState } from "react";

import { apiHost } from "../../ApiConfig";

export const UserContext = createContext();

export const UserProvider = (props) => {
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const jwtToken = storage.getString("jwtToken");
       
        setToken(jwtToken);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setUserData(null);
                storage.delete('jwtToken');

                return;
            }

            const requestOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            };

            const response = await fetch(`${apiHost}/api/users/me`, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                setToken(null);
                setUserData(null);
                storage.delete('jwtToken');
            } else {
                setUserData(data);
                storage.set('jwtToken', token);
            }
        };

        fetchUser();
    }, [token]);

    return (
        <UserContext.Provider value={[token, setToken, userData, setUserData]}>
            {props.children}
        </UserContext.Provider>
    )
}