import {View, Text, StyleSheet} from 'react-native'

export default function Post(post) {
    return (
        <View>
            <Text>{post.username}</Text>
        </View>
    );
}



const styles = StyleSheet.create({
  container: {
    
  },
})
