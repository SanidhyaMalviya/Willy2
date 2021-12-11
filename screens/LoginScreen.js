import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, Alert, ToastAndroid} from 'react-native';
import firebase from 'firebase';

export default class LoginScreen extends React.Component{
    constructor(){
        super()
        this.state = {
            emailId: "",
            password: ""
        }
    }

    login = async(email,password)=>{
        if(email && password){
            console.log("hello")
            try {
                const response = await firebase.auth().signInWithEmailAndPassword(email,password)
                if(response){
                    this.props.navigation.navigate("Transaction")
                }
            } catch (error) {
                switch(error.code){
                    case "auth/user-not-found":
                        Alert.alert("User does not exist in the database")
                        break;
                    case "auth/invalid-email":
                        Alert.alert("Incorrect email or password")
                        break;

                }
            }
        } else {
            Alert.alert("Emter proper email or password")
        }
    }
    
    render(){
        return(
            <View 
                style={{
                    flex:1, 
                    justifyContent:'center', 
                    alignItems:'center' }}>
                        
                        <View>
                            <Image 
                                source={require("../assets/booklogo.jpg")} 
                                style={{width:200,height:200}}/>
                            <Text
                            style={{textAlign:'center',fontSize:30}}>Willy</Text>

                        </View>
                        <View>
                            <TextInput style={styles.inputBox} placeholder="abc@example.com" keyboardType = "email-address" 
                            onChangeText={text=>this.setState({
                                emailId:text
                            })}/>
                            <TextInput style=
                                {styles.inputBox} 
                                placeholder="password" 
                                secureTextEntry = {true}
                            onChangeText={text=>this.setState({
                                password:text
                            })}/>
                        </View>
                <View>
                    <TouchableOpacity 
                        styles = {styles.submitButton} 
                        onPress={()=>{
                            this.login(this.state.emailId,this.state.password)
                        }}>
                        <Text styles ={styles.submitButtonText}>
                            Login
                        </Text> 
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, displayText:{ fontSize: 15, textDecorationLine: 'underline' }, scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 }, buttonText:{ fontSize: 15, textAlign: 'center', marginTop: 10 }, inputView:{ flexDirection: 'row', margin: 20 }, inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20, margin:20 }, submitButton:{ backgroundColor: '#FBC02D', width: 100, height:50 }, submitButtonText:{ padding: 10, textAlign: 'center', fontSize: 20, fontWeight:"bold", color: 'white' }, });