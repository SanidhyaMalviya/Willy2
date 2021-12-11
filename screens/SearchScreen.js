import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import TranscationScreen from './BookTranscationScreen';

export default class SearchScreen extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            allTransactions: [],
            lastVisisbleTransaction: null,
            search: "",
        }
    }
    componentDidMount = async()=>{
        const query = await db.collection("transactions").limit(10).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions: [...this.state.allTransactions,doc.data()],
                lastVisisbleTransaction: doc
            })
        })
    }

    searchTransactions = async(text)=>{
        var enterText = text.split("")
        if(enterText[0].toUpperCase()==="B"){
            const query = await db.collection("transactions").where("bookId","==",text).get()
            query.docs.map((doc)=>{
            this.setState({
                allTransactions: [...this.state.allTransactions,doc.data()],
                lastVisisbleTransaction: doc
            })
        })
        }
        else if(enterText[0].toUpperCase()==="S"){
            const query = await db.collection("transactions").where("studentId","==",text).get()
            query.docs.map((doc)=>{
            this.setState({
                allTransactions: [...this.state.allTransactions,doc.data()],
                lastVisisbleTransaction: doc
            })
        })
        }
    }

    fetchMoreTransactions = async(text)=>{
        var enterText = text.split("")
        if(enterText[0].toUpperCase()==="B"){
            const query = await db.collection("transactions").where("bookId","==",text).startAfter(this.state.lastVisisbleTransaction).limit(10).get()
            query.docs.map((doc)=>{
            this.setState({
                allTransactions: [...this.state.allTransactions,doc.data()],
                lastVisisbleTransaction: doc
            })
        })
        }
        else if(enterText[0].toUpperCase()==="S"){
            const query = await db.collection("transactions").where("studentId","==",text).startAfter(this.state.lastVisisbleTransaction).limit(10).get()
            query.docs.map((doc)=>{
            this.setState({
                allTransactions: [...this.state.allTransactions,doc.data()],
                lastVisisbleTransaction: doc
            })
        })
        }
    }

    render(){
        return(
            <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
                <View style={styles.searchBar}>
                    <TextInput style={styles.bar}
                    placeholder="Enter Book ID or Student ID"
                    onChangeText={(
                        text
                    )=>{
                        this.setState({
                            search: text
                        })
                    }}
                    />

                    <TouchableOpacity style={styles.searchButton}
                    onPress = {()=>{
                        this.searchTransactions(this.state.search)
                    }}>
                        <Text>Search</Text>
                    </TouchableOpacity>
                </View>

                <FlatList 
                data = {this.state.allTransactions}
                renderItem = {({item})=>(
                    <View style ={{borderBottomWidth:2}}>

                        <Text>{"bookID:"+item.bookId}</Text>
                        <Text>{"studentID:"+item.studentId}</Text>
                        <Text>{"transactionType:"+item.transactionType}</Text>
                        <Text>{"Date:"+item.date.toDate()}</Text>
                    </View>
                )}
                keyExtractor = {(item,index)=>index.toString()}
                onEndReached = {this.fetchMoreTransactions}
                onEndReachedThreshold = {0.7} />
            </View>
        )
    }
}

const styles = StyleSheet.create({ container: { flex: 1, marginTop: 20 }, searchBar:{ flexDirection:'row', height:40, width:'auto', borderWidth:0.5, alignItems:'center', backgroundColor:'grey', }, bar:{ borderWidth:2, height:30, width:300, paddingLeft:10, }, searchButton:{ borderWidth:1, height:30, width:50, alignItems:'center', justifyContent:'center', backgroundColor:'green' } })