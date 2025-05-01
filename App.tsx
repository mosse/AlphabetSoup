import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function App() {
  const [text, setText] = useState('');
  const [letters, setLetters] = useState<string[]>([]);

  const handleSubmit = () => {
    if (text.trim()) {
      // Convert the input text to an array of individual characters
      const letterArray = text.split('');
      setLetters(letterArray);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alphabet Soup</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Enter letters..."
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Arrange</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.circleContainer}>
        {letters.length > 0 && (
          <View style={styles.circle}>
            {letters.map((letter, index) => {
              // Calculate position on the circle
              const angle = (index / letters.length) * 2 * Math.PI;
              const radius = 100; // Radius of the circle
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              
              return (
                <View
                  key={index}
                  style={[
                    styles.letter,
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y }
                      ]
                    }
                  ]}
                >
                  <Text style={styles.letterText}>{letter}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '90%',
    marginBottom: 40,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  circleContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  letter: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    left: 80, // Half of circle width minus half of letter width
    top: 80, // Half of circle height minus half of letter height
  },
  letterText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
