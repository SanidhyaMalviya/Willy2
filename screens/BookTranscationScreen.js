import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, Alert, ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class TranscationScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            scannedBookId: "",
            scannedStudentId: "",
            buttonState: "normal",
            transactionMessage: "",
        }
    }
    getCameraPermissions = async(Id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions: status === "granted",
            buttonState: Id,
            scanned: false
        })
    }
    handleBarCodeScan = async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==="BookId"){
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:'normal'
            })
        } else if(buttonState==="StudentId"){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
            })
        }
    }

    handleTransaction = async()=>{
        var transactionType = await this.checkBookEligibility()
            if(!transactionType){
                transactionMessage = "Book Issued"
                Alert.alert("Book does not exist in the database");
                this.setState({
                    scannedStudentId:"",
                    scannedBookId:""
                })
            } else if(transactionType === "Issue"){
                var isStudentEligible = await this.checkStudentEligibilityForBookIssue()
                if (isStudentEligible){
                    this.initiateBookIssued()
                    Alert.alert("Book Issued to the student")
                }
            } else{
                var isStudentEligible = await this.checkStudentEligibilityForReturn()
                if (isStudentEligible){
                    this.initiateBookReturn()
                    Alert.alert("Book returned to the library");
                }
            }
        }
        // this.setState({
        //     scannedStudentId:"",
        //     scannedBookId:""
        // })

    checkBookEligibility = async()=>{
        const bookRef = await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
        var transactionType = ""
        if(bookRef.docs.length == 0){
            transactionType = false
        } else{
            bookRef.docs.map(doc=>{
                var book = doc.data()
                if(book.bookAvailability){
                    transactionType = "Issue"
                } else{
                    transactionType = "Return"
                }
            })
        }
        return transactionType
    }

    checkStudentEligibilityForBookIssue = async()=>{
        const studentRef = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
        var isStudentEligible = ""
        if(studentRef.docs.length == 0){
            this.setState({
                scannedStudentId:"",
                scannedBookId:""
            })
            isStudentEligible = false
            Alert.alert("Student ID does not exist in the database");
        } else{
            studentRef.docs.map(doc=>{
                var student = doc.data()
                if(student.numberOfBooksIssued<2){
                    isStudentEligible = true
                } else{
                    isStudentEligible = false
                    this.setState({
                        scannedStudentId:"",
                        scannedBookId:""
                    })
                    Alert.alert("Student has already issued 2 books");
                }
            })
        }
        return isStudentEligible
    }

    checkStudentEligibilityForReturn = async()=>{
        const transactionRef = await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
        var isStudentEligible = ""
            transactionRef.docs.map(doc=>{
            var lastBookTransaction = doc.data()
            if(lastBookTransaction.studentId = this.state.scannedBookId){
                isStudentEligible = true
            } else{
                isStudentEligible = false
                this.setState({
                    scannedStudentId:"",
                    scannedBookId:""
                })
                Alert.alert("Book wasn't issued the student");
            }
        })
        return isStudentEligible
    }

    initiateBookIssued = async()=>{
        db.collection("transactions").add({
            "studentId":this.state.scannedStudentId,
            "bookId":this.state.scannedBookId,
            "date":firebase.firestore.Timestamp.now().toDate(),
            "transactionType":"Issue"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            "bookAvailability":false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            "numberOfBooksIssued":firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
            scannedStudentId:"",
            scannedBookId:""
        })
    }

    initiateBookReturn = async()=>{
        db.collection("transactions").add({
            "studentId":this.state.scannedStudentId,
            "bookId":this.state.scannedBookId,
            "date":firebase.firestore.Timestamp.now().toDate(),
            "transactionType":"Return"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            "bookAvailability":true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            "numberOfBooksIssued":firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
            scannedStudentId:"",
            scannedBookId:""
        })
    }

    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;

        if(buttonState !== 'normal' && hasCameraPermissions){
            return(
                <BarCodeScanner 
                    onBarCodeScanned = {scanned?undefined:this.handleBarCodeScan}
                    style = {StyleSheet.absoluteFillObject}
                />
            )
        } else if(buttonState === 'normal'){

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
                            <View style={styles.inputView}>
                                <TextInput style={styles.inputBox} placeholder="book Id" value={this.state.scannedBookId} 
                                onChangeText={text=>this.setState({
                                    scannedBookId:text
                                })}/>
                                <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermissions("BookId")}}>
                                    <Text>Scan</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputView}>
                                <TextInput style={styles.inputBox} placeholder="student Id" value={this.state.scannedStudentId}
                                onChangeText={text=>this.setState({
                                    scannedStudentId:text
                                })}/>
                                <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermissions("StudentId")}}>
                                    <Text>Scan</Text>
                                </TouchableOpacity>
                            </View>
                    
                    <TouchableOpacity 
                        styles = {styles.submitButton} 
                        onPress={async()=>{
                            this.handleTransaction()
                        }}>
                        <Text styles ={styles.submitButtonText}>
                            Submit
                        </Text> 
                    </TouchableOpacity>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, displayText:{ fontSize: 15, textDecorationLine: 'underline' }, scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 }, buttonText:{ fontSize: 15, textAlign: 'center', marginTop: 10 }, inputView:{ flexDirection: 'row', margin: 20 }, inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 }, scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 }, submitButton:{ backgroundColor: '#FBC02D', width: 100, height:50 }, submitButtonText:{ padding: 10, textAlign: 'center', fontSize: 20, fontWeight:"bold", color: 'white' }, });
