import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated } from 'react-native';

export default function App() {
  const [text, setText] = useState('');
  const [letters, setLetters] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState(false);
  const [letterOrder, setLetterOrder] = useState<number[]>([]);
  const animatedValues = useRef<Animated.Value[]>([]);
  const previousPositions = useRef<{x: number, y: number}[]>([]);

  // Initialize or update animated values when letters change
  useEffect(() => {
    if (letters.length > 0) {
      // Reset or create animated values for each letter
      animatedValues.current = letters.map((_, i) => 
        animatedValues.current[i] || new Animated.Value(0)
      );
      
      // Calculate initial positions
      const positions = letters.map((_, index) => {
        const angle = (index / letters.length) * 2 * Math.PI;
        const radius = 100;
        return {
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle)
        };
      });
      previousPositions.current = positions;
    }
  }, [letters]);

  // Capture current positions before changing order
  const captureCurrentPositions = () => {
    return letterOrder.map((letterIndex, positionIndex) => {
      const angle = (positionIndex / letterOrder.length) * 2 * Math.PI;
      const radius = 100;
      return {
        letterIndex,
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };
    });
  };

  // Update letter order when letters change or shuffle state changes
  useEffect(() => {
    if (letters.length > 0) {
      if (shuffled) {
        // Capture current positions before shuffling
        const currentPositions = captureCurrentPositions();
        
        // Create shuffled order of indices
        const indices = [...Array(letters.length).keys()];
        // Fisher-Yates shuffle
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        // Update positions reference for each letter
        currentPositions.forEach(pos => {
          previousPositions.current[pos.letterIndex] = {
            x: pos.x,
            y: pos.y
          };
        });
        
        setLetterOrder(indices);
        
        // Animate the transition
        animateLetterMovement();
      } else {
        // Capture current positions before resetting
        if (letterOrder.length > 0) {
          const currentPositions = captureCurrentPositions();
          currentPositions.forEach(pos => {
            previousPositions.current[pos.letterIndex] = {
              x: pos.x,
              y: pos.y
            };
          });
        }
        
        // Normal sequential order
        setLetterOrder([...Array(letters.length).keys()]);
        
        // Animate the transition (if not the initial render)
        if (animatedValues.current.length > 0 && letterOrder.length > 0) {
          animateLetterMovement();
        }
      }
    }
  }, [letters, shuffled]);

  const animateLetterMovement = () => {
    // Reset all animations to starting position
    animatedValues.current.forEach(anim => {
      anim.setValue(0);
    });

    // Create animations for all letters
    const animations = animatedValues.current.map(anim => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      });
    });

    // Start all animations together
    Animated.parallel(animations).start();
  };

  const handleSubmit = () => {
    if (text.trim()) {
      // Convert the input text to an array of individual characters
      const letterArray = text.split('');
      setLetters(letterArray);
      setText('');
      setShuffled(false); // Reset shuffle state on new input
    }
  };

  const handleShuffle = () => {
    setShuffled(!shuffled);
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
      
      {letters.length > 0 && (
        <TouchableOpacity 
          style={[styles.shuffleButton, shuffled ? styles.shuffleActive : {}]} 
          onPress={handleShuffle}
        >
          <Text style={styles.shuffleButtonText}>
            {shuffled ? 'Reset' : 'Shuffle'}
          </Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.circleContainer}>
        {letters.length > 0 && letterOrder.length > 0 && (
          <View style={styles.circle}>
            {letterOrder.map((letterIndex, positionIndex) => {
              // Calculate new position on the circle
              const angle = (positionIndex / letterOrder.length) * 2 * Math.PI;
              const radius = 100; // Radius of the circle
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              
              // Get previous position from ref (or use current if not available)
              const prevPos = previousPositions.current[letterIndex] || {x, y};
              
              // Interpolate between old and new positions
              const animatedX = animatedValues.current[letterIndex]?.interpolate({
                inputRange: [0, 1],
                outputRange: [prevPos.x, x],
              }) || x;
              
              const animatedY = animatedValues.current[letterIndex]?.interpolate({
                inputRange: [0, 1],
                outputRange: [prevPos.y, y],
              }) || y;
              
              return (
                <Animated.View
                  key={letterIndex}
                  style={[
                    styles.letter,
                    {
                      transform: [
                        { translateX: animatedX },
                        { translateY: animatedY }
                      ]
                    }
                  ]}
                >
                  <Text style={styles.letterText}>{letters[letterIndex]}</Text>
                </Animated.View>
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
    marginBottom: 20,
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
  shuffleButton: {
    backgroundColor: '#5AC8FA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  shuffleActive: {
    backgroundColor: '#FF9500',
  },
  shuffleButtonText: {
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
